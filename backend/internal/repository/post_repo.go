package repository

import (
	"database/sql"
	"jwt-auth-demo/internal/models"

	"github.com/google/uuid"
)

type PostRepository struct {
	DB *sql.DB
}

func NewPostRepository(db *sql.DB) *PostRepository {
	return &PostRepository{DB: db}
}

func (r *PostRepository) CreatePost(post *models.Post) error {
	query := `
		INSERT INTO posts (id, title, content, author_id, published, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := r.DB.Exec(
		query,
		post.ID,
		post.Title,
		post.Content,
		post.AuthorID,
		post.Published,
		post.CreatedAt,
		post.UpdatedAt,
	)
	return err
}

func (r *PostRepository) GetPostByID(id uuid.UUID) (*models.Post, error) {
	post := &models.Post{}
	query := `SELECT id, title, content, author_id, published, created_at, updated_at FROM posts WHERE id = $1`
	err := r.DB.QueryRow(query, id).Scan(
		&post.ID,
		&post.Title,
		&post.Content,
		&post.AuthorID,
		&post.Published,
		&post.CreatedAt,
		&post.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return post, nil
}

func (r *PostRepository) UpdatePost(post *models.Post) error {
	query := `
		UPDATE posts 
		SET title = $1, content = $2, published = $3, updated_at = $4
		WHERE id = $5
	`
	_, err := r.DB.Exec(
		query,
		post.Title,
		post.Content,
		post.Published,
		post.UpdatedAt,
		post.ID,
	)
	return err
}

func (r *PostRepository) DeletePost(id uuid.UUID) error {
	query := `DELETE FROM posts WHERE id = $1`
	_, err := r.DB.Exec(query, id)
	return err
}

func (r *PostRepository) GetAllPosts() ([]models.Post, error) {
	query := `SELECT id, title, content, author_id, published, created_at, updated_at FROM posts ORDER BY created_at DESC`
	rows, err := r.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []models.Post
	for rows.Next() {
		var post models.Post
		if err := rows.Scan(
			&post.ID,
			&post.Title,
			&post.Content,
			&post.AuthorID,
			&post.Published,
			&post.CreatedAt,
			&post.UpdatedAt,
		); err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}
	return posts, nil
}
