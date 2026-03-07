// @title           Finance Tracker API
// @version         1.0.0
// @description     API documentation for Finance Tracker services.

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token from Clerk.

// @host      localhost:8081
// @BasePath  /api/v1

package main

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/config"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/migrate"
	docs "github.com/KaranMali2001/finance-tracker-v2-backend/internal/docs"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/account"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/auth"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/dashboard"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/investment"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/jobs"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/reconciliation"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/sms"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/static"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/system"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/transaction"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/user"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/logger"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/queue"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/router"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/services"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/tasks"
	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/hibiken/asynq"
)

const DefaultContextTimeout = 30

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		panic("failed to load config")
	}

	loggerService := logger.NewLoggerService(cfg.Observability)
	defer loggerService.Shutdown()
	log := logger.NewLoggerWithService(cfg.Observability, loggerService)

	clerk.SetKey(cfg.Auth.SecretKey)
	log.Info().Msg("Clerk SDK initialized")
	server, err := server.New(cfg, log, loggerService)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to create server")
	}

	db, err := database.New(cfg, log, loggerService)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to create database")
	}

	defer db.Close()
	queries := generated.New(server.DB.Pool)
	globalSvcs, err := services.NewServices(cfg, log)
	if err != nil {
		log.Error().Err(err).Msg("failed to start global services")
	}
	jobModule := jobs.NewModule(jobs.Deps{
		Queries: queries,
	})
	qClient := asynq.NewClient(asynq.RedisClientOpt{
		Addr: cfg.Redis.Address,
	})
	taskService := tasks.NewTaskService(globalSvcs, jobModule.GetJobRepository(), qClient)

	databaseTxnManager := database.NewTxManager(server.DB.Pool)
	balanceUpdater := account.NewBalanceUpdater(queries)

	userModule := user.NewModule(user.Deps{
		Server:     server,
		Queries:    queries,
		TxnManager: databaseTxnManager,
	})

	reconciliationModule := reconciliation.NewReconiliationModule(reconciliation.Deps{
		Server:         server,
		Queries:        queries,
		TxnManager:     databaseTxnManager,
		TaskService:    taskService,
		BalanceUpdater: balanceUpdater,
		UserService:    userModule.GetUserService(),
	})

	investmentModule := investment.NewInvestmentModule(investment.Deps{
		Server:      server,
		Queries:     queries,
		Tm:          databaseTxnManager,
		TaskService: taskService,
	})

	if err := migrate.MigrateAndSeed(&cfg.Database); err != nil {
		log.Fatal().Err(err).Msg("failed to migrate database")
	}

	systemModule := system.NewModule(system.Dependencies{Server: server})
	authModule := auth.NewModule(auth.Dependencies{
		Server:      server,
		Queries:     queries,
		TaskService: taskService,
	})
	accountModule := account.NewAccountModule(account.Deps{
		Server:  server,
		Queries: queries,
	})
	staticModule := static.NewModule(static.Dependencies{
		Server:  server,
		Queries: queries,
	})
	transactionModule := transaction.NewTxnModule(transaction.Deps{
		Server:         server,
		Queries:        queries,
		UserRepo:       userModule.GetUserRepository(),
		GeminiSvc:      globalSvcs.GeminiService,
		StaticRepo:     staticModule.GetRepository(),
		Tm:             databaseTxnManager,
		BalanceUpdater: balanceUpdater,
		AutoLinker:     investmentModule.GetService(),
	})

	dashboardModule := dashboard.NewDashboardModule(dashboard.Deps{
		Server:  server,
		Queries: queries,
	})

	smsLlmService := sms.NewSmsLlmService(queries, globalSvcs.GeminiService, transactionModule.GetService())

	q := queue.NewJobService(log, cfg, taskService, qClient, jobModule.GetJobRepository(), reconciliationModule.GetService(), investmentModule.GetService(), smsLlmService)

	if err := q.Start(); err != nil {
		log.Error().Err(err).Msg("failed to start Queue services")
	}

	smsModule := sms.NewSmsModule(sms.Deps{
		Server:     server,
		Queries:    queries,
		AccQueries: queries,
		UserSvc:    userModule.GetUserService(),

		TxnSvc:     transactionModule.GetService(),
		LlmTaskSvc: taskService,
	})

	log.Info().
		Strs("cors_origins", cfg.Server.CORSAllowedOrigins).
		Msg("CORS configuration loaded")
	r := router.NewRouter(server,
		[]router.RouteRegistrar{systemModule},
		[]router.RouteRegistrar{authModule, userModule, accountModule, staticModule, transactionModule, smsModule, investmentModule, reconciliationModule, dashboardModule},
	)
	docs.SwaggerInfo.Title = "Finance Tracker API"
	docs.SwaggerInfo.Description = "API documentation for Finance Tracker services."
	docs.SwaggerInfo.Version = "1.0.0"
	docs.SwaggerInfo.Host = fmt.Sprintf("localhost:%s", cfg.Server.Port)
	docs.SwaggerInfo.BasePath = "/api/v1"
	docs.SwaggerInfo.Schemes = []string{"http"}
	log.Info().
		Str("swagger_ui", fmt.Sprintf("http://localhost:%s/swagger/index.html", cfg.Server.Port)).
		Str("swagger_json", fmt.Sprintf("http://localhost:%s/swagger/doc.json", cfg.Server.Port)).
		Msg("Swagger docs available")
	server.SetupHTTPServer(r)
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)

	go func() {
		if err = server.Start(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatal().Err(err).Msg("failed to start server")
		}
	}()

	<-ctx.Done()
	ctx, cancel := context.WithTimeout(context.Background(), DefaultContextTimeout*time.Second)

	if err = server.Shutdown(ctx, qClient); err != nil {
		log.Fatal().Err(err).Msg("server forced to shutdown")
	}
	stop()
	cancel()

	log.Info().Msg("server exited properly")
}
