package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"novapost-backend/internal/config"
	"novapost-backend/internal/handler"
	"novapost-backend/internal/middleware"
	"novapost-backend/internal/repository"
	"novapost-backend/internal/service"
)

const AppVersion = "1.0.0"

func main() {
	log.Println("Initializing NovaPost Secure API Backend...")

	// 1. Load typed configuration
	cfg := config.LoadConfig()
	log.Printf("Configuration loaded: env=%s, port=%s, allow_local_proxy=%t", cfg.Env, cfg.Port, cfg.AllowLocalProxy)

	// 2. Initialize Repositories
	collectionRepo, err := repository.NewJSONCollectionRepo(cfg.DataDir)
	if err != nil {
		log.Fatalf("Fatal: failed to initialize collection repository: %v", err)
	}

	historyRepo, err := repository.NewJSONHistoryRepo(cfg.DataDir, 200)
	if err != nil {
		log.Fatalf("Fatal: failed to initialize history repository: %v", err)
	}

	// 3. Initialize Services
	proxyService := service.NewProxyService(cfg)

	// 4. Initialize Handlers
	healthHandler := handler.NewHealthHandler(AppVersion)
	echoHandler := handler.NewEchoHandler()
	proxyHandler := handler.NewProxyHandler(proxyService, historyRepo)
	collectionHandler := handler.NewCollectionHandler(collectionRepo)
	historyHandler := handler.NewHistoryHandler(historyRepo)

	// 5. Build Router & Middleware Pipeline
	r := chi.NewRouter()

	// Base defensive middlewares
	r.Use(middleware.Recovery)
	r.Use(middleware.StructuredLogger)
	r.Use(middleware.SecurityHeaders)
	r.Use(chimiddleware.Compress(5))
	r.Use(middleware.MaxBytes(cfg.MaxBodySizeBytes))

	// CORS configuration for frontend dev
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Request-ID", "X-Api-Key"},
		ExposedHeaders:   []string{"Link", "X-Request-ID"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Rate Limiting per IP
	rateLimiter := middleware.NewIPRateLimiter(cfg.RateLimitPerSec, cfg.RateLimitBurst)
	r.Use(middleware.RateLimit(rateLimiter))

	// 6. Register API Routes
	r.Route("/api", func(api chi.Router) {
		// Health & diagnostic endpoints
		api.Method(http.MethodGet, "/health", healthHandler)
		api.HandleFunc("/echo", echoHandler.ServeHTTP)

		// Outbound Proxy executor
		api.Method(http.MethodPost, "/proxy", proxyHandler)

		// Collections CRUD
		api.Route("/collections", func(cr chi.Router) {
			cr.Get("/", collectionHandler.GetAll)
			cr.Post("/", collectionHandler.Create)
			cr.Get("/{id}", collectionHandler.GetByID)
			cr.Put("/{id}", collectionHandler.Update)
			cr.Delete("/{id}", collectionHandler.Delete)
			cr.Post("/{id}/items", collectionHandler.SaveItem)
			cr.Delete("/{id}/items/{itemId}", collectionHandler.DeleteItem)
		})

		// History logs
		api.Route("/history", func(hr chi.Router) {
			hr.Get("/", historyHandler.GetAll)
			hr.Delete("/", historyHandler.Clear)
		})
	})

	// 7. Start HTTP Server with Graceful Shutdown
	addr := fmt.Sprintf(":%s", cfg.Port)
	srv := &http.Server{
		Addr:         addr,
		Handler:      r,
		ReadTimeout:  cfg.ReadTimeout,
		WriteTimeout: cfg.WriteTimeout,
		IdleTimeout:  cfg.IdleTimeout,
	}

	// Server runner goroutine
	serverErrors := make(chan error, 1)
	go func() {
		log.Printf("NovaPost Backend server listening on http://localhost%s", addr)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			serverErrors <- err
		}
	}()

	// Graceful shutdown channel
	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, os.Interrupt, syscall.SIGTERM)

	select {
	case err := <-serverErrors:
		log.Fatalf("Fatal: server startup error: %v", err)

	case sig := <-shutdown:
		log.Printf("Received signal %v: initiating graceful shutdown...", sig)

		ctx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
		defer cancel()

		if err := srv.Shutdown(ctx); err != nil {
			log.Printf("Graceful shutdown failed: forcing close: %v", err)
			_ = srv.Close()
		}
		log.Println("NovaPost Backend server stopped cleanly.")
	}
}
