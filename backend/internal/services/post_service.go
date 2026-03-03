package services

import (
	"jwt-auth-demo/internal/models"
	"jwt-auth-demo/internal/repository"
	"time"

	"github.com/google/uuid"
)

type PostService struct {
	PostRepo *repository.PostRepository
}

func NewPostService(postRepo *repository.PostRepository) *PostService {
	return &PostService{PostRepo: postRepo}
}

func (s *PostService) CreatePost(post *models.Post) error {
	post.ID = uuid.New()
	post.CreatedAt = time.Now()
	post.UpdatedAt = time.Now()
	// Validation could go here
	return s.PostRepo.CreatePost(post)
}

func (s *PostService) GetPostByID(id uuid.UUID) (*models.Post, error) {
	return s.PostRepo.GetPostByID(id)
}

func (s *PostService) UpdatePost(id uuid.UUID, title, content string, published bool) error {
	post, err := s.PostRepo.GetPostByID(id)
	if err != nil {
		return err
	}

	post.Title = title
	post.Content = content
	post.Published = published
	post.UpdatedAt = time.Now()

	return s.PostRepo.UpdatePost(post)
}

func (s *PostService) DeletePost(id uuid.UUID) error {
	return s.PostRepo.DeletePost(id)
}

func (s *PostService) GetAllPosts() ([]models.Post, error) {
	return s.PostRepo.GetAllPosts()
}
