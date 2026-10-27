.PHONY: all build dev dev-front dev-back test clean

all: build

# Build both frontend and backend
build:
	@echo "==> Building Go Backend..."
	cd backend && go build -o bin/server cmd/server/main.go
	@echo "==> Building React Frontend..."
	cd frontend && npm run build
	@echo "==> Build complete!"

# Run Go backend
dev-back:
	cd backend && go run cmd/server/main.go

# Run React frontend
dev-front:
	cd frontend && npm run dev

# Run unit tests
test:
	@echo "==> Running Go backend security and unit tests..."
	cd backend && go test -v ./...

# Clean artifacts
clean:
	rm -rf backend/bin
	rm -rf frontend/dist
