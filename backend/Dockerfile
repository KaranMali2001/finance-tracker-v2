FROM --platform=linux/amd64 golang:1.25-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -trimpath -ldflags="-s -w" -o bootstrap ./cmd/backend/*.go

FROM public.ecr.aws/lambda/provided:al2023-arm64

COPY --from=builder /app/bootstrap /var/runtime/bootstrap
COPY --from=builder /app/internal/database/migrate/migrations /var/task/internal/database/migrate/migrations

CMD ["bootstrap"]
