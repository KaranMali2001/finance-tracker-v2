# Stage 1: Build
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/backend/*.go

# Stage 2: Run
FROM alpine:latest

WORKDIR /app

# Copy the binary from builder
COPY --from=builder /app/main .

# Build argument to specify which env file to use
ARG ENV_FILE=.env.dev
COPY ${ENV_FILE} .env

EXPOSE 8080

CMD ["./main"]
