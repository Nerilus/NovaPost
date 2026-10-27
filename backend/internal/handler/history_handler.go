package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"novapost-backend/internal/domain"
	"novapost-backend/internal/middleware"
)

type HistoryHandler struct {
	repo domain.HistoryRepository
}

func NewHistoryHandler(repo domain.HistoryRepository) *HistoryHandler {
	return &HistoryHandler{repo: repo}
}

func (h *HistoryHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	limit := 100
	if l := r.URL.Query().Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	entries, err := h.repo.GetAll(r.Context(), limit)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"error":      err.Error(),
			"request_id": middleware.GetRequestID(r.Context()),
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(entries)
}

func (h *HistoryHandler) Clear(w http.ResponseWriter, r *http.Request) {
	if err := h.repo.Clear(r.Context()); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"error":      err.Error(),
			"request_id": middleware.GetRequestID(r.Context()),
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"message": "History cleared successfully",
	})
}
