package models

import (
	"time"

	"github.com/google/uuid"
)

type Post struct {
	ID        uuid.UUID `json:"id" db:"id"`
	Title     string    `json:"title" db:"title" validate:"required"`
	Content   string    `json:"content" db:"content" validate:"required"`
	AuthorID  uuid.UUID `json:"author_id" db:"author_id"`
	Published bool      `json:"published" db:"published"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}
