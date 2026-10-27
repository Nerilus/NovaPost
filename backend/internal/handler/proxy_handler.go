package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"novapost-backend/internal/domain"
	"novapost-backend/internal/middleware"
)

type ProxyHandler struct {
	proxyService domain.ProxyService
	historyRepo  domain.HistoryRepository
}

func NewProxyHandler(proxyService domain.ProxyService, historyRepo domain.HistoryRepository) *ProxyHandler {
	return &ProxyHandler{
		proxyService: proxyService,
		historyRepo:  historyRepo,
	}
}

func (h *ProxyHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req domain.ProxyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"error":      "Invalid request body payload: " + err.Error(),
			"request_id": middleware.GetRequestID(r.Context()),
		})
		return
	}

	if req.URL == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"error":      "Target 'url' field cannot be empty",
			"request_id": middleware.GetRequestID(r.Context()),
		})
		return
	}

	// Forward through Proxy Service
	resp, err := h.proxyService.Execute(r.Context(), &req)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadGateway)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"error":      err.Error(),
			"request_id": middleware.GetRequestID(r.Context()),
		})
		return
	}

	// Persist to History repository
	if h.historyRepo != nil {
		_ = h.historyRepo.Add(r.Context(), &domain.HistoryEntry{
			Method:     req.Method,
			URL:        req.URL,
			Status:     resp.Status,
			StatusText: resp.StatusText,
			TimeMs:     resp.TimeMs,
			Timestamp:  time.Now(),
		})
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(resp)
}
