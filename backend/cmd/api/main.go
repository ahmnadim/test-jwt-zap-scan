package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"jwt-auth-demo/internal/auth"
	"jwt-auth-demo/internal/handlers"
	"jwt-auth-demo/internal/repository"
	"jwt-auth-demo/internal/services"
	"jwt-auth-demo/pkg/database"
	"jwt-auth-demo/pkg/redis"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	err := godotenv.Load(".env")
	if err != nil {
		// Fallback for local development running from cmd/api/
		err = godotenv.Load("../../.env")
	}

	if err != nil {
		// Don't log.Fatal if the file is missing in production/Docker
		// because you likely passed variables via docker-compose instead.
		log.Println("Note: .env file not found, using system environment variables")
	}

	// Log all relevant environment variables for debugging
	log.Println("DB_HOST:", os.Getenv("DB_HOST"))
	log.Println("DB_PORT:", os.Getenv("DB_PORT"))
	log.Println("DB_USER:", os.Getenv("DB_USER"))
	log.Println("DB_NAME:", os.Getenv("DB_NAME"))
	log.Println("REDIS_HOST:", os.Getenv("REDIS_HOST"))
	// if err := godotenv.Load("./.env"); err != nil {
	// 	log.Println("Main.go line no. 24: No .env file found, using system environment variables")
	// }

	// Initialize Database and Redis
	database.InitDB()
	redis.InitRedis()

	// Run Migrations (Simple)

	runMigrations()

	// Initialize Dependencies
	userRepo := repository.NewUserRepository(database.GetDB())
	authService := services.NewAuthService(userRepo, redis.GetClient())
	authHandler := handlers.NewAuthHandler(authService)

	// Setup Router
	r := gin.Default()

	// CORS Middleware (Basic)
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Routes
	api := r.Group("/api/v1")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"status": "ok"})
		})

		authGroup := api.Group("/auth")
		{
			authGroup.POST("/register", authHandler.Register)
			authGroup.POST("/login", authHandler.Login)
			authGroup.POST("/refresh", authHandler.Refresh)
			authGroup.POST("/logout", authHandler.Logout)
		}

		userGroup := api.Group("/user")
		userGroup.Use(auth.AuthMiddleware())
		{
			userGroup.GET("/profile", func(c *gin.Context) {
				userID, exists := c.Get("user_id")
				if !exists {
					c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
					return
				}

				uid, err := uuid.Parse(userID.(string))
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
					return
				}

				user, err := userRepo.GetUserByID(uid)
				if err != nil {
					c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
					return
				}

				c.JSON(http.StatusOK, gin.H{"user": user})
			})
		}

		adminGroup := api.Group("/admin")
		adminGroup.Use(auth.AuthMiddleware()) // Logic for role checking should be added
		{
			adminGroup.GET("/users", func(c *gin.Context) {
				role, _ := c.Get("role")
				if role != "admin" {
					c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
					return
				}
				c.JSON(http.StatusOK, gin.H{"message": "Admin users list"})
			})
		}

		// Blog Routes
		postRepo := repository.NewPostRepository(database.GetDB())
		postService := services.NewPostService(postRepo)
		postHandler := handlers.NewPostHandler(postService)

		publicPosts := api.Group("/posts")
		{
			publicPosts.GET("", postHandler.GetAllPosts)
		}

		protectedPosts := api.Group("/admin/posts")
		protectedPosts.Use(auth.AuthMiddleware())
		{
			protectedPosts.POST("", postHandler.CreatePost)
			protectedPosts.PUT("/:id", postHandler.UpdatePost)
			protectedPosts.DELETE("/:id", postHandler.DeletePost)
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}

func runMigrations() {
	content, err := os.ReadFile("../../backend/migrations/001_initial_schema.sql")
	if err != nil {
		// Try relative path if running from cmd/api
		content, err = os.ReadFile("../../migrations/001_initial_schema.sql")
		if err != nil {
			// Try current directory (Docker)
			content, err = os.ReadFile("./migrations/001_initial_schema.sql")
			if err != nil {
				log.Printf("Warning: Could not read migration file: %v", err)
				return
			}
		}
	}

	sql := string(content)
	// Split by semicolon to execute one by one if needed, or just execute block
	// basic split for demo (not robust for all SQL)
	statements := strings.Split(sql, ";")
	for _, stmt := range statements {
		stmt = strings.TrimSpace(stmt)
		if stmt == "" {
			continue
		}
		if _, err := database.GetDB().Exec(stmt); err != nil {
			log.Printf("Error executing migration statement: %v\nStatement: %s", err, stmt)
		}
	}
	log.Println("Migrations executed successfully")
}
