package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
)

// DB holds the database connection pool
var DB *sql.DB

// InitDB initializes the database connection
func InitDB() {
	var err error
	dsn := os.Getenv("DB_CONNECTION_URL")
	if dsn == "" {
		host := os.Getenv("DB_HOST")
		port := os.Getenv("DB_PORT")
		user := os.Getenv("DB_USER")
		password := os.Getenv("DB_PASSWORD")
		dbname := os.Getenv("DB_NAME")

		if host == "" {
			host = "localhost"
		}
		if port == "" {
			port = "5432"
		}
		if user == "" {
			user = "postgres"
		}
		if password == "" {
			password = "postgres"
		}
		if dbname == "" {
			dbname = "jwt_auth_db"
		}

		dsn = "host=" + host + " port=" + port + " user=" + user + " password=" + password + " dbname=" + dbname + " sslmode=disable"
	}
	fmt.Println("dsn: ", dsn)

	DB, err = sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	for i := 1; i <= 10; i++ {
		if err = DB.Ping(); err == nil {
			break
		}
		log.Printf("Attempt %d: Failed to ping database: %v. Retrying in 2 seconds...", i, err)
		time.Sleep(2 * time.Second)
	}

	if err != nil {
		log.Fatalf("Failed to establish database connection after multiple attempts: %v", err)
	}

	log.Println("Successfully connected to PostgreSQL database")
}

// GetDB returns the database instance
func GetDB() *sql.DB {
	return DB
}
