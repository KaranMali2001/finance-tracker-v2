package migrate

import (
	"context"
	"database/sql"
	"fmt"
	"path/filepath"
	"strings"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/config"
	_ "github.com/lib/pq"
	"github.com/pressly/goose/v3"
)

type categorySeed struct {
	Name string
	Type string
}

type merchantSeed struct {
	Name     string
	Category string
}

type bankSeed struct {
	Name string
	Code string
}

func MigrateAndSeed(cfg *config.DatabaseConfig) error {
	dsn := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.Name, cfg.SSLMode,
	)
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return err
	}
	defer db.Close()
	migrationsDir := filepath.Join("internal", "database", "migrate", "migrations")
	if err := goose.Up(db, migrationsDir); err != nil {

		return err
	}

	if err := seedDefaults(db); err != nil {
		return err
	}

	return nil
}

func seedDefaults(db *sql.DB) error {
	ctx := context.Background()
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	categoryIDs, err := seedCategories(ctx, tx)
	if err != nil {
		return err
	}

	if err := seedBanks(ctx, tx); err != nil {
		return err
	}

	if err := seedMerchants(ctx, tx, categoryIDs); err != nil {
		return err
	}

	return tx.Commit()
}

func seedCategories(ctx context.Context, tx *sql.Tx) (map[string]string, error) {
	const countQuery = `
		SELECT COUNT(*)
		FROM categories
		WHERE user_id IS NULL AND is_system = true
	`

	var existingCount int
	if err := tx.QueryRowContext(ctx, countQuery).Scan(&existingCount); err != nil {
		return nil, err
	}

	if existingCount > 1 || existingCount == len(defaultCategories) {
		return loadSystemCategoryIDs(ctx, tx)
	}

	valuePlaceholders := make([]string, 0, len(defaultCategories))
	args := make([]interface{}, 0, len(defaultCategories)*2)
	for i, category := range defaultCategories {
		valuePlaceholders = append(valuePlaceholders, fmt.Sprintf("($%d,$%d,true,NULL)", i*2+1, i*2+2))
		args = append(args, category.Name, category.Type)
	}

	insertStmt := fmt.Sprintf(`
		INSERT INTO categories (name, type, is_system, user_id)
		VALUES %s
	`, strings.Join(valuePlaceholders, ","))

	if _, err := tx.ExecContext(ctx, insertStmt, args...); err != nil {
		return nil, err
	}

	return loadSystemCategoryIDs(ctx, tx)
}

func loadSystemCategoryIDs(ctx context.Context, tx *sql.Tx) (map[string]string, error) {
	rows, err := tx.QueryContext(ctx, `
		SELECT id, name
		FROM categories
		WHERE user_id IS NULL
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	categoryIDs := make(map[string]string)
	for rows.Next() {
		var id, name string
		if err := rows.Scan(&id, &name); err != nil {
			return nil, err
		}
		categoryIDs[name] = id
	}

	return categoryIDs, rows.Err()
}

func seedMerchants(ctx context.Context, tx *sql.Tx, categoryIDs map[string]string) error {
	const countQuery = `
		SELECT COUNT(*)
		FROM merchants
	`

	var existingCount int
	if err := tx.QueryRowContext(ctx, countQuery).Scan(&existingCount); err != nil {
		return err
	}

	if existingCount > 1 || existingCount == len(defaultMerchants) {
		return nil
	}

	valuePlaceholders := make([]string, 0, len(defaultMerchants))
	args := make([]interface{}, 0, len(defaultMerchants)*3)
	for i, merchant := range defaultMerchants {
		categoryID, ok := categoryIDs[merchant.Category]
		if !ok {
			return fmt.Errorf("category %s not found for merchant %s", merchant.Category, merchant.Name)
		}

		valuePlaceholders = append(valuePlaceholders, fmt.Sprintf("($%d,$%d,$%d)", i*3+1, i*3+2, i*3+3))
		args = append(args, merchant.Name, strings.ToUpper(merchant.Name), categoryID)
	}

	insertStmt := fmt.Sprintf(`
		INSERT INTO merchants (name, normalized_name, default_category_id)
		VALUES %s
		ON CONFLICT DO NOTHING
	`, strings.Join(valuePlaceholders, ","))

	_, err := tx.ExecContext(ctx, insertStmt, args...)
	return err
}

func seedBanks(ctx context.Context, tx *sql.Tx) error {
	const countQuery = `
		SELECT COUNT(*)
		FROM banks
	`

	var existingCount int
	if err := tx.QueryRowContext(ctx, countQuery).Scan(&existingCount); err != nil {
		return err
	}

	if existingCount > 1 || existingCount == len(defaultBanks) {
		return nil
	}

	valuePlaceholders := make([]string, 0, len(defaultBanks))
	args := make([]interface{}, 0, len(defaultBanks)*2)
	for i, bank := range defaultBanks {
		valuePlaceholders = append(valuePlaceholders, fmt.Sprintf("($%d,$%d)", i*2+1, i*2+2))
		args = append(args, bank.Name, bank.Code)
	}

	insertStmt := fmt.Sprintf(`
		INSERT INTO banks (name, code)
		VALUES %s
		ON CONFLICT DO NOTHING
	`, strings.Join(valuePlaceholders, ","))

	_, err := tx.ExecContext(ctx, insertStmt, args...)
	return err
}

var defaultCategories = []categorySeed{
	{Name: "FOOD", Type: "EXPENSE"},
	{Name: "SHOPPING", Type: "EXPENSE"},
	{Name: "ENTERTAINMENT", Type: "EXPENSE"},
	{Name: "TRANSPORTATION", Type: "EXPENSE"},
	{Name: "UPI_TRANSFERS", Type: "EXPENSE"},
	{Name: "UTILITIES", Type: "EXPENSE"},
	{Name: "HEALTHCARE", Type: "EXPENSE"},
	{Name: "BILLS_PAYMENTS", Type: "EXPENSE"},
	{Name: "INVESTMENTS", Type: "EXPENSE"},
	{Name: "TRAVEL", Type: "EXPENSE"},
	{Name: "EDUCATION", Type: "EXPENSE"},
	{Name: "PERSONAL_CARE", Type: "EXPENSE"},
	{Name: "RECHARGES", Type: "EXPENSE"},
	{Name: "GOVERNMENT", Type: "EXPENSE"},
	{Name: "MISCELLANEOUS", Type: "EXPENSE"},
	{Name: "UNCATEGORIZED", Type: "EXPENSE"},
	{Name: "INCOME", Type: "INCOME"},
	{Name: "REFUNDS", Type: "INCOME"},
	{Name: "SUBSCRIPTIONS", Type: "EXPENSE"},
}

var defaultMerchants = []merchantSeed{
	{Name: "SWIGGY", Category: "FOOD"},
	{Name: "ZOMATO", Category: "FOOD"},
	{Name: "DOMINOS", Category: "FOOD"},
	{Name: "MCDONALDS", Category: "FOOD"},
	{Name: "KFC", Category: "FOOD"},
	{Name: "BLINKIT", Category: "FOOD"},
	{Name: "BIGBASKET", Category: "FOOD"},
	{Name: "ZEPTO", Category: "FOOD"},
	{Name: "DUNZO", Category: "FOOD"},
	{Name: "AMAZON", Category: "SHOPPING"},
	{Name: "FLIPKART", Category: "SHOPPING"},
	{Name: "MYNTRA", Category: "SHOPPING"},
	{Name: "AJIO", Category: "SHOPPING"},
	{Name: "NYKAA", Category: "SHOPPING"},
	{Name: "MEESHO", Category: "SHOPPING"},
	{Name: "TATA CLIQ", Category: "SHOPPING"},
	{Name: "UBER", Category: "TRANSPORTATION"},
	{Name: "OLA", Category: "TRANSPORTATION"},
	{Name: "RAPIDO", Category: "TRANSPORTATION"},
	{Name: "INDIAN OIL", Category: "TRANSPORTATION"},
	{Name: "BHARAT PETROLEUM", Category: "TRANSPORTATION"},
	{Name: "HINDUSTAN PETROLEUM", Category: "TRANSPORTATION"},
	{Name: "IRCTC", Category: "TRANSPORTATION"},
	{Name: "NETFLIX", Category: "ENTERTAINMENT"},
	{Name: "AMAZON PRIME", Category: "ENTERTAINMENT"},
	{Name: "DISNEY HOTSTAR", Category: "ENTERTAINMENT"},
	{Name: "SPOTIFY", Category: "ENTERTAINMENT"},
	{Name: "BOOKMYSHOW", Category: "ENTERTAINMENT"},
	{Name: "YOUTUBE PREMIUM", Category: "ENTERTAINMENT"},
	{Name: "SONY LIV", Category: "ENTERTAINMENT"},
	{Name: "JIO", Category: "RECHARGES"},
	{Name: "AIRTEL", Category: "RECHARGES"},
	{Name: "VI", Category: "RECHARGES"},
	{Name: "BSNL", Category: "RECHARGES"},
	{Name: "TATA POWER", Category: "UTILITIES"},
	{Name: "BSES", Category: "UTILITIES"},
	{Name: "ADANI ELECTRICITY", Category: "UTILITIES"},
	{Name: "MAKEMYTRIP", Category: "TRAVEL"},
	{Name: "GOIBIBO", Category: "TRAVEL"},
	{Name: "OYO", Category: "TRAVEL"},
	{Name: "REDBUS", Category: "TRAVEL"},
	{Name: "ABHIBUS", Category: "TRAVEL"},
	{Name: "APOLLO PHARMACY", Category: "HEALTHCARE"},
	{Name: "NETMEDS", Category: "HEALTHCARE"},
	{Name: "1MG", Category: "HEALTHCARE"},
	{Name: "PHARMEASY", Category: "HEALTHCARE"},
	{Name: "MEDLIFE", Category: "HEALTHCARE"},
	{Name: "ZERODHA", Category: "INVESTMENTS"},
	{Name: "GROWW", Category: "INVESTMENTS"},
	{Name: "UPSTOX", Category: "INVESTMENTS"},
	{Name: "ANGEL ONE", Category: "INVESTMENTS"},
	{Name: "SBI MUTUAL FUND", Category: "INVESTMENTS"},
	{Name: "BYJUS", Category: "EDUCATION"},
	{Name: "UNACADEMY", Category: "EDUCATION"},
	{Name: "VEDANTU", Category: "EDUCATION"},
	{Name: "PAYTM", Category: "UPI_TRANSFERS"},
	{Name: "PHONEPE", Category: "UPI_TRANSFERS"},
	{Name: "GPAY", Category: "UPI_TRANSFERS"},
	{Name: "PERSONAL_TRANSFER", Category: "UPI_TRANSFERS"},
	{Name: "UNKNOWN_MERCHANT", Category: "UNCATEGORIZED"},
	{Name: "CLAUDE", Category: "SUBSCRIPTIONS"},
	{Name: "CURSOR", Category: "SUBSCRIPTIONS"},
	{Name: "GITHUB", Category: "SUBSCRIPTIONS"},
	{Name: "CHATGPT", Category: "SUBSCRIPTIONS"},
	{Name: "JETBRAINS", Category: "SUBSCRIPTIONS"},
	{Name: "FIGMA", Category: "SUBSCRIPTIONS"},
	{Name: "NOTION", Category: "SUBSCRIPTIONS"},
	{Name: "VERCEL", Category: "SUBSCRIPTIONS"},
	{Name: "CANVA", Category: "SUBSCRIPTIONS"},
}

var defaultBanks = []bankSeed{
	{Name: "State Bank of India", Code: "SBIN"},
	{Name: "HDFC Bank", Code: "HDFC"},
	{Name: "ICICI Bank", Code: "ICIC"},
	{Name: "Axis Bank", Code: "UTIB"},
	{Name: "Punjab National Bank", Code: "PUNB"},
	{Name: "Bank of Baroda", Code: "BARB"},
	{Name: "Canara Bank", Code: "CNRB"},
	{Name: "Bank of India", Code: "BKID"},
	{Name: "Indian Bank", Code: "IDIB"},
	{Name: "Kotak Mahindra Bank", Code: "KKBK"},
	{Name: "Union Bank of India", Code: "UBIN"},
	{Name: "Bank of Maharashtra", Code: "MAHB"},
	{Name: "IndusInd Bank", Code: "INDB"},
	{Name: "Yes Bank", Code: "YESB"},
	{Name: "IDBI Bank", Code: "IBKL"},
	{Name: "Federal Bank", Code: "FDRL"},
	{Name: "Punjab & Sind Bank", Code: "PSIB"},
	{Name: "Tamilnad Mercantile Bank", Code: "TMBL"},
	{Name: "Karur Vysya Bank", Code: "KVBL"},
	{Name: "Karnataka Bank", Code: "KARB"},
	{Name: "Saraswat Bank", Code: "SRCB"},
	{Name: "Nainital Bank", Code: "NTBL"},
	{Name: "RBL Bank", Code: "RATN"},
	{Name: "DCB Bank", Code: "DCBL"},
	{Name: "City Union Bank", Code: "CIUB"},
	{Name: "Indian Overseas Bank", Code: "IOBA"},
	{Name: "Central Bank of India", Code: "CBIN"},
	{Name: "UCO Bank", Code: "UCBA"},
	{Name: "South Indian Bank", Code: "SIBL"},
	{Name: "Jammu & Kashmir Bank", Code: "JAKA"},
}
