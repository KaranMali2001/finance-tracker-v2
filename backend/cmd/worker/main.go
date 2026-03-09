package main

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/config"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/account"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/investment"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/jobs"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/reconciliation"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/sms"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/static"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/transaction"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/user"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/logger"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/services"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/worker"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/clerk/clerk-sdk-go/v2"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		panic("failed to load config")
	}

	loggerService := logger.NewLoggerService(cfg.Observability)
	defer loggerService.Shutdown()
	log := logger.NewLoggerWithService(cfg.Observability, loggerService)

	clerk.SetKey(cfg.Auth.SecretKey)

	db, err := database.New(cfg, log, loggerService)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to create database")
	}
	defer db.Close()

	queries := generated.New(db.Pool)

	globalSvcs, err := services.NewServices(cfg, log)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to start global services")
	}

	jobModule := jobs.NewModule(jobs.Deps{Queries: queries})

	txnManager := database.NewTxManager(db.Pool)
	balanceUpdater := account.NewBalanceUpdater(queries)

	userModule := user.NewModule(user.Deps{
		Queries:    queries,
		TxnManager: txnManager,
	})

	staticModule := static.NewModule(static.Dependencies{
		Queries: queries,
	})

	investmentModule := investment.NewInvestmentModule(investment.Deps{
		Queries: queries,
		Tm:      txnManager,
	})

	transactionModule := transaction.NewTxnModule(transaction.Deps{
		Queries:        queries,
		UserRepo:       userModule.GetUserRepository(),
		GeminiSvc:      globalSvcs.GeminiService,
		StaticRepo:     staticModule.GetRepository(),
		Tm:             txnManager,
		BalanceUpdater: balanceUpdater,
		AutoLinker:     investmentModule.GetService(),
	})

	reconModule := reconciliation.NewReconiliationModule(reconciliation.Deps{
		Queries:        queries,
		TxnManager:     txnManager,
		BalanceUpdater: balanceUpdater,
		UserService:    userModule.GetUserService(),
	})

	smsLlmService := sms.NewSmsLlmService(queries, globalSvcs.GeminiService, transactionModule.GetService())

	w := worker.New(worker.Deps{
		JobRepo:       jobModule.GetJobRepository(),
		EmailSvc:      globalSvcs.EmailService,
		ReconService:  reconModule.GetService(),
		InvestService: investmentModule.GetService(),
		SmsLlmSvc:     smsLlmService,
		Logger:        log,
	})

	lambda.Start(w.Handle)
}
