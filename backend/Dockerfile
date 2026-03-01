# Stage 1: Build
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Download dependencies — separate layer so it is reused by Docker layer cache
# as long as go.mod/go.sum are unchanged.
COPY go.mod go.sum ./
RUN go mod download

# Copy source and build. CGO is disabled so the binary is fully static.
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o main ./cmd/backend/*.go

# Stage 2: Run
# distroless/static: no shell, no package manager, no busybox — only CA certs + tzdata.
# :nonroot runs as uid 65532 (nonroot) out of the box — no adduser needed.
FROM gcr.io/distroless/static-debian12:nonroot

WORKDIR /app

# Copy binary and migrations.
# goose resolves "internal/database/migrate/migrations" relative to the process
# working directory (/app), so we replicate the same relative path here.
COPY --from=builder /app/main .
COPY --from=builder /app/internal/database/migrate/migrations ./internal/database/migrate/migrations

EXPOSE 8080

# exec-form is required — distroless has no shell to interpret shell-form.
ENTRYPOINT ["/app/main"]
