package migrate

import (
	"database/sql"
	"fmt"
	"path/filepath"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/config"
	_ "github.com/lib/pq"
	"github.com/pressly/goose/v3"
)

func Migrate(config *config.DatabaseConfig) error {
	migrationsDir := filepath.Join("internal", "database", "migrate", "migrations")

	DATABASE_URL := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s", config.Host, config.Port, config.User, config.Password, config.Name, config.SSLMode)
	fmt.Println("Inside Migation", DATABASE_URL)
	db, err := sql.Open("postgres", DATABASE_URL)
	if err != nil {
		fmt.Println("failed to open db", err)
		return err
	}

	if err := goose.Up(db, migrationsDir); err != nil {
		fmt.Println("goose up failed", err)
		return err
	}
	fmt.Println("Migration completed successfully")
	return nil
}
