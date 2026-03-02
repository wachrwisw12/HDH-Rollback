package db

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"hdh-rollback/internal/config"

	_ "github.com/go-sql-driver/mysql"
	_ "github.com/lib/pq"
)

func Connect(cfg *config.Config, password string) (*sql.DB, error) {
	var driver string
	var dsn string

	switch cfg.DBType {

	case "mysql":
		driver = "mysql"
		dsn = fmt.Sprintf(
			"%s:%s@tcp(%s:%d)/%s?parseTime=true&charset=utf8mb4&loc=Local&timeout=5s&readTimeout=5s&writeTimeout=5s&tls=false",
			cfg.Username,
			password,
			cfg.Host,
			cfg.Port,
			cfg.Database,
		)

	case "postgres":
		driver = "postgres"
		dsn = fmt.Sprintf(
			"host=%s port=%d user=%s password=%s dbname=%s sslmode=disable connect_timeout=5",
			cfg.Host,
			cfg.Port,
			cfg.Username,
			password,
			cfg.Database,
		)

	default:
		return nil, fmt.Errorf("unsupported db type")
	}

	dbConn, err := sql.Open(driver, dsn)
	if err != nil {
		return nil, err
	}

	// ⚙️ Pool config
	dbConn.SetMaxOpenConns(5)
	dbConn.SetMaxIdleConns(2)
	dbConn.SetConnMaxLifetime(10 * time.Minute)

	// 🔥 ใช้ PingContext พร้อม timeout
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := dbConn.PingContext(ctx); err != nil {
		dbConn.Close() // ✅ ป้องกัน leak
		return nil, fmt.Errorf("cannot connect to database: %w", err)
	}

	return dbConn, nil
}
