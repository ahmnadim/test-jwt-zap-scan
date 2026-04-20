package handlers

import (
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"sync"

	"jwt-auth-demo/pkg/database"

	"github.com/gin-gonic/gin"
)

type VulnHandler struct{}

func NewVulnHandler() *VulnHandler {
	return &VulnHandler{}
}

// in-memory comment store for stored XSS demo
var (
	vulnComments   []string
	vulnCommentsMu sync.Mutex
)

// SQLiSearch - INTENTIONALLY VULNERABLE: raw string concat in SQL query
func (h *VulnHandler) SQLiSearch(c *gin.Context) {
	name := c.Query("name")
	db := database.GetDB()

	query := fmt.Sprintf("SELECT id, email, first_name, last_name, role FROM users WHERE first_name = '%s'", name)

	rows, err := db.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error(), "query": query})
		return
	}
	defer rows.Close()

	var results []map[string]interface{}
	for rows.Next() {
		var id, email, firstName, lastName, role string
		if err := rows.Scan(&id, &email, &firstName, &lastName, &role); err != nil {
			continue
		}
		results = append(results, map[string]interface{}{
			"id": id, "email": email,
			"first_name": firstName, "last_name": lastName, "role": role,
		})
	}
	if results == nil {
		results = []map[string]interface{}{}
	}

	c.JSON(http.StatusOK, gin.H{"query": query, "results": results})
}

// IDORGetUser - INTENTIONALLY VULNERABLE: no authentication, exposes password hash
func (h *VulnHandler) IDORGetUser(c *gin.Context) {
	id := c.Param("id")
	db := database.GetDB()

	row := db.QueryRow(
		"SELECT id, email, first_name, last_name, role, password FROM users WHERE id = $1", id,
	)

	var uid, email, firstName, lastName, role, password string
	if err := row.Scan(&uid, &email, &firstName, &lastName, &role, &password); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id": uid, "email": email,
		"first_name": firstName, "last_name": lastName,
		"role": role, "password_hash": password,
	})
}

// ListUsers - INTENTIONALLY VULNERABLE: no auth, lists all users with IDs for IDOR chaining
func (h *VulnHandler) ListUsers(c *gin.Context) {
	db := database.GetDB()
	rows, err := db.Query("SELECT id, email, first_name, last_name, role FROM users")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var users []map[string]interface{}
	for rows.Next() {
		var id, email, firstName, lastName, role string
		if err := rows.Scan(&id, &email, &firstName, &lastName, &role); err != nil {
			continue
		}
		users = append(users, map[string]interface{}{
			"id": id, "email": email,
			"first_name": firstName, "last_name": lastName, "role": role,
		})
	}
	if users == nil {
		users = []map[string]interface{}{}
	}

	c.JSON(http.StatusOK, gin.H{"users": users})
}

// PathTraversal - INTENTIONALLY VULNERABLE: reads arbitrary files, no path sanitization
func (h *VulnHandler) PathTraversal(c *gin.Context) {
	filePath := c.Query("path")
	if filePath == "" {
		filePath = "/etc/hostname"
	}

	content, err := os.ReadFile(filePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error(), "path": filePath})
		return
	}

	c.JSON(http.StatusOK, gin.H{"path": filePath, "content": string(content)})
}

// CmdInjection - INTENTIONALLY VULNERABLE: user input passed directly to shell
func (h *VulnHandler) CmdInjection(c *gin.Context) {
	host := c.Query("host")
	if host == "" {
		host = "localhost"
	}

	cmd := exec.Command("sh", "-c", "ping -c 2 "+host)
	output, _ := cmd.CombinedOutput()

	c.JSON(http.StatusOK, gin.H{
		"command": "ping -c 2 " + host,
		"output":  string(output),
	})
}

// OpenRedirect - INTENTIONALLY VULNERABLE: no URL validation
func (h *VulnHandler) OpenRedirect(c *gin.Context) {
	url := c.Query("url")
	if url == "" {
		url = "/"
	}

	c.Redirect(http.StatusFound, url)
}

// GetComments - returns stored comments as raw HTML (for stored XSS)
func (h *VulnHandler) GetComments(c *gin.Context) {
	vulnCommentsMu.Lock()
	defer vulnCommentsMu.Unlock()

	comments := vulnComments
	if comments == nil {
		comments = []string{}
	}
	c.JSON(http.StatusOK, gin.H{"comments": comments})
}

// PostComment - INTENTIONALLY VULNERABLE: stores raw input without sanitization
func (h *VulnHandler) PostComment(c *gin.Context) {
	var req struct {
		Comment string `json:"comment"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	vulnCommentsMu.Lock()
	vulnComments = append(vulnComments, req.Comment)
	vulnCommentsMu.Unlock()

	c.JSON(http.StatusOK, gin.H{"message": "Comment stored", "total": len(vulnComments)})
}

// ClearComments - clears stored comments
func (h *VulnHandler) ClearComments(c *gin.Context) {
	vulnCommentsMu.Lock()
	vulnComments = []string{}
	vulnCommentsMu.Unlock()

	c.JSON(http.StatusOK, gin.H{"message": "Comments cleared"})
}
