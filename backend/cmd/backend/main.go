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
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/migrate"
	docs "github.com/KaranMali2001/finance-tracker-v2-backend/internal/docs"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/auth"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/system"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/logger"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/router"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
)

const DefaultContextTimeout = 30

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		panic("failed to load config")
	}

	docs.SwaggerInfo.Title = "Finance Tracker API"
	docs.SwaggerInfo.Description = "API documentation for Finance Tracker services."
	docs.SwaggerInfo.Version = "1.0.0"
	docs.SwaggerInfo.Host = fmt.Sprintf("localhost:%s", cfg.Server.Port)
	docs.SwaggerInfo.BasePath = ""
	docs.SwaggerInfo.Schemes = []string{"http"}

	loggerService := logger.NewLoggerService(cfg.Observability)
	defer loggerService.Shutdown()
	log := logger.NewLoggerWithService(cfg.Observability, loggerService)
	if err := migrate.Migrate(&cfg.Database); err != nil {
		panic("failed to migrate database")
	}
	server, err := server.New(cfg, &log, loggerService)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to create server")
	}
	db, err := database.New(cfg, &log, loggerService)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to create database")
	}
	log.Info().Msg("database created successfully")
	defer db.Close()
	systemModule := system.NewModule(system.Dependencies{Server: server})
	authModule := auth.NewModule(auth.Dependencies{Server: server})
	r := router.NewRouter(server, systemModule, authModule)
	log.Info().
		Str("swagger_ui", fmt.Sprintf("http://localhost:%s/swagger/index.html", cfg.Server.Port)).
		Str("swagger_json", fmt.Sprintf("http://localhost:%s/swagger/doc.json", cfg.Server.Port)).
		Msg("Swagger docs available")
	server.SetupHTTPServer(r)
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)

	// Start server
	go func() {
		if err = server.Start(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatal().Err(err).Msg("failed to start server")
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	<-ctx.Done()
	ctx, cancel := context.WithTimeout(context.Background(), DefaultContextTimeout*time.Second)

	if err = server.Shutdown(ctx); err != nil {
		log.Fatal().Err(err).Msg("server forced to shutdown")
	}
	stop()
	cancel()

	log.Info().Msg("server exited properly")
}
