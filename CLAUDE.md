# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Finance Tracker V2 is a full-stack personal finance management application with a Go backend and Next.js frontend. The system uses domain-driven design principles with separate modules for accounts, transactions, investments, SMS parsing, authentication, and background job processing.

## Development Commands

### Quick Start
```bash
# Install all dependencies
task install

# Start services (PostgreSQL, Redis, ChartDB)
task services:up

# Run both backend and frontend in dev mode
task dev

# Stop services
task services:down
```

### Backend Commands
```bash
# Run backend in development (with hot-reload via Air)
task dev:backend
# Or: cd backend && ENV_FILE=.env.dev air

# Run backend in production
task prod:backend

# Generate Swagger documentation
task docs:generate:backend
# Or: cd backend && swag init -g cmd/backend/main.go -o internal/docs --parseDependency --parseInternal
```

### Frontend Commands
```bash
# Run Next.js dev server
task dev:frontend
# Or: cd finance-tracker-web && pnpm dev

# Build for production
task frontend:build

# Type check
task frontend:type-check

# Lint with Biome
task frontend:lint

# Format code
task frontend:format

# Generate TypeScript API types from Swagger
task docs:generate:frontend
# Or: cd finance-tracker-web && pnpm run generate:api
```

### Database Commands
```bash
# View service logs
task services:logs

# Restart services
task services:restart

# Database migrations run automatically on backend startup
# Migration files: backend/internal/database/migrate/migrations/
```

### Code Quality
```bash
# Lint (frontend only - Biome)
task lint

# Format (frontend only - Prettier + Biome)
task format

# Type check
task type-check

# Clean build artifacts
task clean
```

## Architecture

### Backend (`backend/`)

**Framework:** Echo (Go web framework)

**Structure:** Domain-driven design with modular architecture. Each domain is self-contained with:
- `*.handler.go` - HTTP handlers with Swagger annotations
- `*.service.go` - Business logic
- `*.repository.go` - Database access layer
- `*.router.go` - Route registration (implements `RouteRegistrar` interface)
- `*.dto.go` - Request/response DTOs

**Key Technologies:**
- **Database:** PostgreSQL with SQLC for type-safe queries
- **Migrations:** goose (auto-runs on startup)
- **Authentication:** Clerk (JWT validation via middleware)
- **Caching/Queue:** Redis
- **Background Jobs:** Asynq for async task processing
- **Observability:** New Relic APM with zerolog
- **Hot Reload:** Air (development only)
- **API Docs:** Swagger (auto-generated)

**Domain Modules** (`backend/internal/domain/`):
- `account/` - Financial account management
- `auth/` - Authentication (Clerk integration)
- `investment/` - Investment tracking and goals
- `jobs/` - Background job management
- `sms/` - SMS transaction parsing
- `transaction/` - Transaction management
- `user/` - User profile management
- `static/` - Static data (categories, etc.)
- `system/` - System utilities

**Important Patterns:**

1. **Module Registration:** Each domain module implements `RouteRegistrar` interface and registers routes in `RegisterRoutes(g *echo.Group)`. Modules are registered in [backend/cmd/backend/main.go](backend/cmd/backend/main.go) and passed to the router.

2. **Middleware Chain:** Global middlewares in [backend/internal/router/base.router.go](backend/internal/router/base.router.go):
   - Rate limiting (20 req/s)
   - CORS, security headers
   - Request ID tracking
   - New Relic tracing
   - Request logging
   - Recovery

3. **Authentication:** Use `middleware.NewAuthMiddleware().RequireAuth` for protected routes. Clerk user ID extracted via `middleware.GetUserID(c)`.

4. **Database Queries:** Write SQL in `backend/internal/database/queries/<domain>/*.sql`, then run SQLC to generate type-safe Go code. Generated code is in `backend/internal/database/generated/`.

5. **Transactions:** Use `database.TxManager` for atomic operations across multiple queries. See [backend/internal/database/tx.manager.go](backend/internal/database/tx.manager.go).

6. **Background Jobs:** Task definitions in `backend/internal/tasks/`, enqueued via `queue.JobService`, processed by Asynq workers.

### Frontend (`finance-tracker-web/`)

**Framework:** Next.js 16 (App Router) with React 19

**Structure:** Feature-based routing with route groups
- `app/(auth)/` - Public authentication pages
- `app/(protected)/dashboard/` - Protected dashboard routes
  - `accounts/` - Account management
  - `transactions/` - Transaction views
  - `investments/` - Investment tracking
  - `profile/` - User settings
  - `sms/` - SMS parsing interface

**Key Technologies:**
- **Auth:** Clerk (@clerk/nextjs)
- **Data Fetching:** TanStack Query (React Query) with axios
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Styling:** Tailwind CSS 4
- **Forms:** react-hook-form + zod validation
- **Linting:** Biome (replaces ESLint)
- **Formatting:** Prettier
- **Git Hooks:** Husky + lint-staged

**Component Organization:**
- `src/components/ui/` - shadcn/ui base components
- `src/components/<feature>Components/` - Feature-specific components
- `src/components/shared/` - Shared reusable components
- `src/generated/api/` - Auto-generated TypeScript API client (from Swagger)

**Important Patterns:**

1. **API Client:** Auto-generated from backend Swagger docs. Regenerate with `task docs:generate:frontend` after backend API changes.

2. **Protected Routes:** Wrap pages/layouts with Clerk's `<SignedIn>` component or use middleware.

3. **Data Fetching:** Use TanStack Query hooks. API proxy configured in [finance-tracker-web/src/proxy.ts](finance-tracker-web/src/proxy.ts).

4. **Form Validation:** Use react-hook-form with zod schemas. See `@hookform/resolvers` integration.

### Database Schema

**Location:** `backend/internal/database/migrate/migrations/`

**Migration Workflow:**
1. Create new migration file: `<number>_description.sql`
2. Migrations run automatically on backend startup
3. Update corresponding SQLC queries in `backend/internal/database/queries/`
4. Run `sqlc generate` (happens automatically with Air during dev)

**Key Tables:**
- User management (users, auth tokens)
- Financial accounts
- Transactions with categorization
- Investment tracking and goals
- SMS parsing templates
- Background job tracking

### Services

**Docker Compose** (`backend/dev.docker-compose.yml`):
- **PostgreSQL** (port 5432) - Main database
- **Redis** (port 6379) - Cache and job queue
- **ChartDB** (port 8080) - Database schema visualization

**Backend Server** (port 8081) - Echo API server
**Frontend Server** (port 3000) - Next.js dev server

## Common Workflows

### Adding a New API Endpoint

1. Add SQL query in `backend/internal/database/queries/<domain>/`
2. Run `sqlc generate` or let Air auto-generate
3. Add handler method in domain's `*.handler.go` with Swagger annotations
4. Add service method in `*.service.go`
5. Add repository method in `*.repository.go` if needed
6. Register route in `*.router.go`
7. Generate Swagger docs: `task docs:generate:backend`
8. Generate frontend types: `task docs:generate:frontend`

### Adding a New Domain Module

1. Create `backend/internal/domain/<module>/` directory
2. Create files: `<module>.handler.go`, `<module>.service.go`, `<module>.repository.go`, `<module>.router.go`, `<module>.dto.go`
3. Implement `Module` struct with `RegisterRoutes(g *echo.Group)` method
4. Add SQL queries in `backend/internal/database/queries/<module>/`
5. Register module in [backend/cmd/backend/main.go](backend/cmd/backend/main.go)
6. Create frontend page in `finance-tracker-web/src/app/(protected)/dashboard/<module>/`
7. Create components in `finance-tracker-web/src/components/<module>Components/`

### Database Schema Changes

1. Create migration in `backend/internal/database/migrate/migrations/`
2. Update SQLC queries if needed
3. Restart backend (migrations run automatically)
4. Update frontend types with `task docs:generate:frontend`

### Running Tests

Currently no test infrastructure is set up. When adding tests:
- Backend: Use Go's testing package, consider testify for assertions
- Frontend: Use Vitest or Jest with React Testing Library

## Environment Configuration

**Backend** (`backend/.env.dev` or `backend/.env.prod`):
- Database connection (PostgreSQL)
- Redis connection
- Clerk authentication keys
- New Relic license key
- Email service credentials (Resend)
- AI service credentials (Google GenAI)

**Frontend** (`finance-tracker-web/.env.local`):
- Clerk publishable key
- Next.js API URLs

See `backend/.env.example` for required variables.

## Tech Stack Summary

**Backend:**
- Go 1.25 with Echo framework
- PostgreSQL + SQLC for type-safe queries
- Redis for caching/queues
- Asynq for background jobs
- Clerk for authentication
- New Relic for observability
- Swagger for API documentation

**Frontend:**
- Next.js 16 (App Router)
- TypeScript 5
- TanStack Query for data fetching
- Clerk for authentication
- shadcn/ui + Radix UI components
- Tailwind CSS 4
- Biome for linting
- Husky for git hooks

**DevOps:**
- Task for build automation
- Docker Compose for local services
- Air for backend hot-reload
- pnpm for frontend package management
