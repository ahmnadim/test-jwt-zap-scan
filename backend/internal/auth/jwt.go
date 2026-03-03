package auth

import (
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type TokenClaims struct {
	jwt.RegisteredClaims
	UserID string `json:"user_id"`
	Role   string `json:"role"`
	Type   string `json:"type"` // "access" or "refresh"
}

func GenerateTokens(userID uuid.UUID, role string) (string, string, error) {
	accessSecret := []byte(os.Getenv("JWT_ACCESS_SECRET"))
	refreshSecret := []byte(os.Getenv("JWT_REFRESH_SECRET"))

	// Access Token
	accessTokenClaims := TokenClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "jwt-auth-demo",
			Subject:   userID.String(),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ID:        uuid.New().String(),
		},
		UserID: userID.String(),
		Role:   role,
		Type:   "access",
	}
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessTokenClaims)
	accessTokenString, err := accessToken.SignedString(accessSecret)
	if err != nil {
		return "", "", err
	}

	// Refresh Token
	refreshTokenClaims := TokenClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "jwt-auth-demo",
			Subject:   userID.String(),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ID:        uuid.New().String(),
		},
		UserID: userID.String(),
		Role:   role,
		Type:   "refresh",
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshTokenClaims)
	refreshTokenString, err := refreshToken.SignedString(refreshSecret)
	if err != nil {
		return "", "", err
	}

	return accessTokenString, refreshTokenString, nil
}

func ValidateToken(tokenString string, isRefresh bool) (*TokenClaims, error) {
	secret := []byte(os.Getenv("JWT_ACCESS_SECRET"))
	if isRefresh {
		secret = []byte(os.Getenv("JWT_REFRESH_SECRET"))
	}

	token, err := jwt.ParseWithClaims(tokenString, &TokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return secret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*TokenClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}
