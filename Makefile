.PHONY: up down backend frontend

up:
	docker-compose up -d

down:
	docker-compose down

backend:
	cd backend && go run cmd/api/main.go

frontend:
	cd frontend && npm run dev
