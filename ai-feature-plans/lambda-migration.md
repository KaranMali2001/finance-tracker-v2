# Lambda Migration Plan

## Goal

Run the backend on AWS Lambda (free tier) + Neon (Postgres) + Upstash (Redis).

**Core problem:** Asynq requires a persistent `server.Start()` goroutine that polls Redis forever. Lambda freezes all goroutines the moment the handler returns, so Asynq workers never wake up.

**Solution:** Two-Lambda architecture.
- `HttpLambda` — handles all HTTP requests (current `cmd/backend` adapted)
- `WorkerLambda` — handles background jobs (new `cmd/worker`)

When a job needs to run, `HttpLambda` invokes `WorkerLambda` asynchronously (`InvocationType: Event`). No Redis, no Asynq. The worker Lambda wakes up, runs the job, finishes, and goes cold.

Locally: `cmd/backend` runs as a normal Go process (Air hot-reload). `cmd/worker` runs inside a SAM/Docker Lambda container on port 3001. The dispatcher always uses the Lambda SDK — just pointed at `http://localhost:3001` instead of real AWS.

---

## Architecture Diagram

**Production:**
```
HTTP Request
    │
    ▼
┌─────────────┐    async invoke     ┌──────────────────┐
│ HttpLambda  │ ─────────────────►  │  WorkerLambda    │
│ (Echo API)  │   AWS Lambda SDK    │ (job processor)  │
└─────────────┘                     └──────────────────┘
      │                                      │
      ▼                                      ▼
  Neon (Postgres)                    Neon (Postgres)
```

**Local:**
```
HTTP Request
    │
    ▼
┌──────────────────────────┐    Lambda SDK →      ┌───────────────────────────────┐
│  cmd/backend (Air/plain) │   http://localhost:  │  sam local start-lambda :3001 │
│  normal Go process       │        3001          │  (Docker, worker-bootstrap)   │
└──────────────────────────┘                      └───────────────────────────────┘
      │                                                        │
      ▼                                                        ▼
  Local Postgres                                       Local Postgres
```

`cmd/backend` hot-reloads via Air as normal. Worker restarts only when you rebuild and re-run SAM.

---

## What Changes

### Remove
- `github.com/hibiken/asynq` dependency entirely
- `internal/queue/queue.go` — replaced by `cmd/worker`
- `asynq.Client` and `asynq.Server` from `TaskService` and `server.Server`
- Redis from `server.Server` (only used for Asynq)
- `q.Start()` call in `main.go`
- `server.Shutdown(ctx, qClient)` signature — remove `qClient` param

### Add
- `cmd/worker/main.go` — Worker Lambda entry point
- `internal/dispatcher/dispatcher.go` — `Dispatcher` interface + `JobPayload` type
- `internal/dispatcher/lambda.go` — single implementation: Lambda SDK invoke, configurable endpoint URL
- `template.yaml` — SAM template defining WorkerFunction (and optionally HttpFunction for prod)
- `internal/worker/worker.go` — job handler registry used by `cmd/worker`

---

## New Package: `internal/dispatcher`

This replaces `asynq.Client.EnqueueContext`. It has one interface:

```go
// internal/dispatcher/dispatcher.go
package dispatcher

import "context"

type JobPayload struct {
    Type    string          `json:"type"`
    Payload json.RawMessage `json:"payload"`
}

type Dispatcher interface {
    Dispatch(ctx context.Context, job JobPayload) error
}
```

**Single implementation** (`dispatcher/lambda.go`) — used for both local and prod:
```go
type LambdaDispatcher struct {
    client             *lambdasdk.Client
    workerFunctionName string
}

// NewLambdaDispatcher creates a dispatcher.
// endpointURL: "" for real AWS, "http://localhost:3001" for local SAM.
func NewLambdaDispatcher(functionName, endpointURL string) *LambdaDispatcher {
    opts := []func(*awsconfig.LoadOptions) error{}
    if endpointURL != "" {
        opts = append(opts, awsconfig.WithEndpointResolverWithOptions(
            aws.EndpointResolverWithOptionsFunc(func(service, region string, _ ...interface{}) (aws.Endpoint, error) {
                return aws.Endpoint{URL: endpointURL}, nil
            }),
        ))
    }
    awsCfg, _ := awsconfig.LoadDefaultConfig(context.Background(), opts...)
    return &LambdaDispatcher{
        client:             lambdasdk.NewFromConfig(awsCfg),
        workerFunctionName: functionName,
    }
}

func (d *LambdaDispatcher) Dispatch(ctx context.Context, job JobPayload) error {
    body, _ := json.Marshal(job)
    _, err := d.client.Invoke(ctx, &lambdasdk.InvokeInput{
        FunctionName:   aws.String(d.workerFunctionName),
        InvocationType: types.InvocationTypeEvent, // async — returns immediately
        Payload:        body,
    })
    return err
}
```

In `cmd/backend/main.go`:
```go
endpointURL := ""
if cfg.Primary.Env == "local" {
    endpointURL = "http://localhost:3001"
}
disp := dispatcher.NewLambdaDispatcher(cfg.WorkerLambdaName, endpointURL)
```

---

## Refactored `TaskService`

`TaskService` no longer holds `*asynq.Client`. It holds `Dispatcher`.

```go
// internal/tasks/base.task.go
type TaskService struct {
    registry      map[TaskType]TaskConfig
    services      *services.Services
    jobRepository *jobs.JobRepository
    dispatcher    dispatcher.Dispatcher
}

func NewTaskService(
    services *services.Services,
    jobRepository *jobs.JobRepository,
    dispatcher dispatcher.Dispatcher,
) *TaskService { ... }
```

`EnqueueTask` becomes:
```go
func (ts *TaskService) EnqueueTask(ctx context.Context, jobType jobs.JobType, payload any, userId string, logger *zerolog.Logger) error {
    payloadBytes, _ := json.Marshal(payload)
    job, err := ts.jobRepository.CreateNewJob(ctx, &jobs.CreateJob{
        UserId:    userId,
        JobType:   jobType,
        Payload:   payloadBytes,
        Status:    jobs.JobStatusPending,
        // JobId no longer comes from asynq; generate uuid here
        JobId:     uuid.NewString(),
        ...
    })
    if err != nil { return err }
    return ts.dispatcher.Dispatch(ctx, dispatcher.JobPayload{
        Type:    string(jobType),
        Payload: payloadBytes,
    })
}
```

Per-task enqueue methods (`EnqueueLlmSmsParse`, etc.) call `EnqueueTask` with their typed payload — same as today, signature unchanged from callers' perspective.

---

## New File: `cmd/worker/main.go`

Worker Lambda receives a `dispatcher.JobPayload` event and routes to the right handler:

```go
package main

import (
    "context"
    "encoding/json"
    "github.com/aws/aws-lambda-go/lambda"
    "github.com/KaranMali2001/finance-tracker-v2-backend/internal/config"
    "github.com/KaranMali2001/finance-tracker-v2-backend/internal/worker"
    // ... domain imports
)

func main() {
    cfg, _ := config.LoadConfig()
    // build db, queries, services — same DI as main.go but no HTTP server
    w := worker.New(cfg, /* deps */)
    lambda.Start(w.Handle)
}
```

`worker.Handle` signature:
```go
func (w *Worker) Handle(ctx context.Context, event dispatcher.JobPayload) error {
    switch event.Type {
    case string(tasks.TaskWelcomeEmail):
        return w.handleWelcomeEmail(ctx, event.Payload)
    case string(tasks.TaskBankReconciliation):
        return w.handleBankReconciliation(ctx, event.Payload)
    case string(tasks.TaskInvestmentAutoLink):
        return w.handleInvestmentAutoLink(ctx, event.Payload)
    case string(tasks.TaskLlmSmsParse):
        return w.handleLlmSmsParse(ctx, event.Payload)
    }
    return fmt.Errorf("unknown job type: %s", event.Type)
}
```

The handler logic is extracted from `queue/queue.go` methods — same business logic, just no Asynq wrapper.

---

## Refactored `cmd/backend/main.go`

Key changes:
1. Remove `asynq.NewClient(...)` and `qClient`
2. Build dispatcher — single type, env-aware endpoint:
   ```go
   endpointURL := ""
   if cfg.Primary.Env == "local" {
       endpointURL = "http://localhost:3001"
   }
   disp := dispatcher.NewLambdaDispatcher(cfg.WorkerLambdaName, endpointURL)
   ```
3. `tasks.NewTaskService(globalSvcs, jobModule.GetJobRepository(), disp)`
4. Remove `q := queue.NewJobService(...)` and `q.Start()`
5. `server.Shutdown(ctx)` — remove `qClient` param
6. `cmd/backend` stays as a plain HTTP process for both local and prod — **no Lambda adapter needed here**. On prod it runs inside a Lambda container but Echo's `ListenAndServe` still works fine with `aws-lambda-web-adapter` (a sidecar that translates HTTP ↔ Lambda events without code changes). Alternatively, wrap with `echoadapter` only for prod:
   ```go
   if cfg.Primary.Env == "local" {
       // existing signal handling + server.Start()
   } else {
       echoAdapter := echoadapter.New(r)
       lambda.Start(echoAdapter.ProxyWithContext)
   }
   ```

---

## Refactored `internal/server/server.go`

Remove:
- `asynq` import
- `Redis *redis.Client` field (was only used for Asynq)
- `nrredis` hook
- `qClient *asynq.Client` param from `Shutdown`

`server.Shutdown` becomes:
```go
func (s *Server) Shutdown(ctx context.Context) error {
    if err := s.httpServer.Shutdown(ctx); err != nil { ... }
    if err := s.DB.Close(); err != nil { ... }
    return nil
}
```

---

## Config Changes

Add to `Config` struct:
```go
type Config struct {
    ...
    WorkerLambdaName string // set via BACKEND_WORKER_LAMBDA_NAME env var
}
```

Neon requires SSL — set in env:
```
BACKEND_DATABASE.SSL_MODE=require
BACKEND_DATABASE.MAX_OPEN_CONNS=3
BACKEND_DATABASE.MAX_IDLE_CONNS=2
```

---

## New File: `template.yaml` (SAM)

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Runtime: provided.al2023
    Architectures: [arm64]
    Environment:
      Variables:
        BACKEND_PRIMARY.ENV: production
        BACKEND_DATABASE.HOST: !Ref NeonHost
        # ... all env vars

Resources:
  HttpFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: backend/
      Handler: bootstrap
      Timeout: 30
      MemorySize: 256
      Environment:
        Variables:
          BACKEND_WORKER_LAMBDA_NAME: !Ref WorkerFunction
      Events:
        ApiProxy:
          Type: HttpApi
          Properties:
            Path: /{proxy+}
            Method: ANY

  WorkerFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: backend/
      Handler: worker-bootstrap
      Timeout: 300   # jobs can run up to 5 min
      MemorySize: 512
```

---

## New Dockerfile (two binaries)

```dockerfile
FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -trimpath -ldflags="-s -w" -o bootstrap ./cmd/backend/*.go
RUN CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -trimpath -ldflags="-s -w" -o worker-bootstrap ./cmd/worker/*.go

FROM public.ecr.aws/lambda/provided:al2023-arm64
COPY --from=builder /app/bootstrap /var/task/bootstrap
COPY --from=builder /app/worker-bootstrap /var/task/worker-bootstrap
COPY --from=builder /app/internal/database/migrate/migrations /var/task/internal/database/migrate/migrations
```

---

## Local Development Workflow

**Two terminals, one Docker container:**

```bash
# Terminal 1 — build worker binary and start SAM Lambda container
cd backend
GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -o worker-bootstrap ./cmd/worker
sam local start-lambda --port 3001
# Docker pulls the Lambda runtime image on first run, then stays up

# Terminal 2 — run HTTP backend with Air hot-reload (unchanged)
task dev:backend
```

**.env.dev additions:**
```
BACKEND_WORKER_LAMBDA_NAME=WorkerFunction
# No BACKEND_WORKER_ENDPOINT needed — code uses localhost:3001 when env=local
```

**When you change worker code:**
1. Rebuild: `GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -o worker-bootstrap ./cmd/worker`
2. Restart SAM: Ctrl+C + `sam local start-lambda --port 3001`

HTTP backend changes still hot-reload via Air — no restart needed.

**Prerequisites:**
- Docker Desktop running
- SAM CLI: `brew install aws-sam-cli`
- AWS credentials not required for local SAM (can use dummy values)

---

## Go Module Dependencies

Add:
```
github.com/aws/aws-lambda-go              (cmd/worker Lambda runtime)
github.com/awslabs/aws-lambda-go-api-proxy/echo  (echoadapter, only if not using aws-lambda-web-adapter)
github.com/aws/aws-sdk-go-v2/service/lambda      (dispatcher — invoke worker)
github.com/aws/aws-sdk-go-v2/config
```

Remove:
```
github.com/hibiken/asynq
github.com/newrelic/go-agent/v3/integrations/nrredis-v9
github.com/redis/go-redis/v9
```

---

## File-by-File Change Summary

| File | Action | What changes |
|------|--------|-------------|
| `cmd/backend/main.go` | Modify | Remove asynq client, wire LambdaDispatcher (localhost:3001 for local, real AWS for prod), remove `q.Start()` |
| `cmd/worker/main.go` | **Create** | Worker Lambda entry point, builds full DI tree, calls `lambda.Start(worker.Handle)` |
| `internal/tasks/base.task.go` | Modify | Replace `*asynq.Client` with `dispatcher.Dispatcher`; `NewTaskService` takes dispatcher |
| `internal/tasks/sms.task.go` | Modify | `EnqueueLlmSmsParse` calls `EnqueueTask` with `dispatcher.JobPayload` |
| `internal/tasks/reconciliation.task.go` | Modify | `NewBankReconciliationTask` removed (task creation inline); enqueue via dispatcher |
| `internal/tasks/investment.task.go` | Modify | Same as above |
| `internal/tasks/email.task.go` | Modify | `HandleWelcomeEmailTask` moves to `cmd/worker` or `internal/worker` |
| `internal/dispatcher/dispatcher.go` | **Create** | `Dispatcher` interface + `JobPayload` type |
| `internal/dispatcher/lambda.go` | **Create** | Lambda SDK invoke — same code for local (localhost:3001) and prod (real AWS) |
| `internal/worker/worker.go` | **Create** | Job handler registry used by WorkerLambda |
| `internal/queue/queue.go` | **Delete** | Replaced by `cmd/worker` + `internal/worker` |
| `internal/server/server.go` | Modify | Remove Redis field, remove asynq import, remove `qClient` from `Shutdown` |
| `internal/config/config.go` | Modify | Add `WorkerLambdaName string` field |
| `Dockerfile` | Modify | Build two binaries (`bootstrap` + `worker-bootstrap`) |
| `template.yaml` | **Create** | SAM template with HttpFunction + WorkerFunction |
| `go.mod` / `go.sum` | Modify | Add Lambda SDK deps, remove asynq + redis |

---

## Free Tier Cost

| Service | Free tier | Notes |
|---------|-----------|-------|
| AWS Lambda | 1M req/month + 400k GB-sec | More than enough for personal use |
| AWS API Gateway | 1M req/month (HTTP API) | HTTP API is cheaper than REST API |
| Neon Postgres | 0.5 GB storage, 190 compute-hours | Free forever plan |
| Upstash Redis | 10k commands/day | Only needed if you add Redis caching later — not needed at all if you drop Asynq |
| Vercel (frontend) | Free hobby plan | Unlimited personal projects |

**Total: $0/month** for personal project traffic.

---

## Migration Steps (in order)

1. Update `internal/config/config.go` — add `WorkerLambdaName string` field
2. Create `internal/dispatcher/dispatcher.go` — interface + `JobPayload` type
3. Create `internal/dispatcher/lambda.go` — single impl with configurable endpoint URL
4. Create `internal/worker/worker.go` — job handler registry (logic from `queue/queue.go`)
5. Create `cmd/worker/main.go` — Worker Lambda entry point
6. Refactor `internal/tasks/base.task.go` — replace `*asynq.Client` with `dispatcher.Dispatcher`
7. Update all `tasks/*.go` enqueue methods — drop `*asynq.Task` return types
8. Update `internal/server/server.go` — remove Redis field, remove `qClient` from `Shutdown`
9. Update `cmd/backend/main.go` — wire `LambdaDispatcher`, remove `q.Start()`, remove `qClient`
10. Delete `internal/queue/queue.go`
11. Update `go.mod` / `go.sum` — add AWS SDK deps, remove asynq + redis
12. Create `template.yaml` — SAM template for WorkerFunction
13. Update `Dockerfile` — build two binaries
14. **Test locally:**
    - Build: `GOOS=linux GOARCH=arm64 go build -o worker-bootstrap ./cmd/worker`
    - Run SAM: `sam local start-lambda --port 3001`
    - Run backend: `task dev:backend`
    - Trigger a job (e.g. upload a bank statement) — verify worker container logs show job running
15. **Deploy:** `sam build && sam deploy --guided`
