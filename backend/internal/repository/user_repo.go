package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"jwt-auth-demo/internal/models"

	"github.com/google/uuid"
)

type UserRepository struct {
	DB *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{DB: db}
}

func (r *UserRepository) CreateUser(user *models.User) error {
	query := `
		INSERT INTO users (id, email, password, first_name, last_name, role, is_verified, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id
	`
	return r.DB.QueryRow(
		query,
		user.ID,
		user.Email,
		user.Password,
		user.FirstName,
		user.LastName,
		user.Role,
		user.IsVerified,
		user.CreatedAt,
		user.UpdatedAt,
	).Scan(&user.ID)
}

func (r *UserRepository) GetUserByEmail(email string) (*models.User, error) {
	// email = "superadmin@fusion.com"
	fmt.Println("Db connection: ", r.DB)
	user := &models.User{}
	query := `SELECT id, email, password, first_name, last_name, role, is_verified, created_at, updated_at FROM users WHERE email = $1`
	err := r.DB.QueryRow(query, email).Scan(
		&user.ID,
		&user.Email,
		&user.Password,
		&user.FirstName,
		&user.LastName,
		&user.Role,
		&user.IsVerified,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return user, nil
}

func (r *UserRepository) GetUserByID(id uuid.UUID) (*models.User, error) {
	user := &models.User{}
	query := `SELECT id, email, password, first_name, last_name, role, is_verified, created_at, updated_at FROM users WHERE id = $1`
	err := r.DB.QueryRow(query, id).Scan(
		&user.ID,
		&user.Email,
		&user.Password,
		&user.FirstName,
		&user.LastName,
		&user.Role,
		&user.IsVerified,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return user, nil
}
