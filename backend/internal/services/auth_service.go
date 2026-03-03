package services

import (
	"context"
	"errors"
	"fmt"
	"jwt-auth-demo/internal/auth"
	"jwt-auth-demo/internal/models"
	"jwt-auth-demo/internal/repository"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	UserRepo    *repository.UserRepository
	RedisClient *redis.Client
}

func NewAuthService(userRepo *repository.UserRepository, redisClient *redis.Client) *AuthService {
	return &AuthService{
		UserRepo:    userRepo,
		RedisClient: redisClient,
	}
}

func (s *AuthService) Register(user *models.User, password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user.ID = uuid.New()
	user.Password = string(hashedPassword)
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()
	// Default values
	if user.Role == "" {
		user.Role = "user"
	}

	return s.UserRepo.CreateUser(user)
}

func (s *AuthService) Login(email, password string) (string, string, error) {

	user, err := s.UserRepo.GetUserByEmail(email)
	fmt.Println("Email: ", email, password, user)
	if err != nil {
		fmt.Println("error: ", err)
		return "", "", errors.New("invalid credentials")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		fmt.Println("error: ", err)

		return "", "", errors.New("invalid credentials")
	}

	accessToken, refreshToken, err := auth.GenerateTokens(user.ID, user.Role)
	if err != nil {
		return "", "", err
	}

	// Store refresh token in Redis
	err = s.RedisClient.Set(context.Background(), "refresh_token:"+user.ID.String(), refreshToken, 7*24*time.Hour).Err()
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}

func (s *AuthService) RefreshToken(oldRefreshToken string) (string, string, error) {
	// Validate old refresh token
	claims, err := auth.ValidateToken(oldRefreshToken, true)
	if err != nil {
		return "", "", err
	}

	// Check if token is blacklisted in Redis
	val, err := s.RedisClient.Get(context.Background(), "blacklist:"+claims.ID).Result()
	if err == nil && val == "revoked" {
		// Token Reuse Detected!
		// In a real scenario, we might want to invalidate the entire token family here
		return "", "", errors.New("token reused")
	}

	// Rotate tokens
	userId, err := uuid.Parse(claims.UserID)
	if err != nil {
		return "", "", err
	}

	newAccessToken, newRefreshToken, err := auth.GenerateTokens(userId, claims.Role)
	if err != nil {
		return "", "", err
	}

	// Blacklist old refresh token
	// Set TTL to the remaining validity of the token (handling that is complex, simple 7 days is safe enough for blacklist)
	err = s.RedisClient.Set(context.Background(), "blacklist:"+claims.ID, "revoked", 7*24*time.Hour).Err()
	if err != nil {
		return "", "", err
	}

	// Update new refresh token in Redis (simple approach, key by JTI or user)
	// For rotation validation, typically we might track family ID, but here detailed requirements said "Refresh Token stored in Redis"
	// We can update the key 'refresh_token:USER_ID' to the new one, effectively invalidating others for this user ONLY IF we only allow 1 session.
	// But requirements said "concurrent session limiting", implies multiple sessions.
	// For this demo, let's just issue new ones and rely on blacklist for old ones.

	return newAccessToken, newRefreshToken, nil
}

func (s *AuthService) Logout(refreshToken string) error {
	claims, err := auth.ValidateToken(refreshToken, true)
	if err != nil {
		return err
	}

	// Blacklist the token
	return s.RedisClient.Set(context.Background(), "blacklist:"+claims.ID, "revoked", 7*24*time.Hour).Err()
}
