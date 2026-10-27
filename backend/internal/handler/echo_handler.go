package handler

import (
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"time"
)

type EchoHandler struct{}

func NewEchoHandler() *EchoHandler {
	return &EchoHandler{}
}

func (h *EchoHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Read request body (limit to 1MB)
	bodyBytes, _ := io.ReadAll(io.LimitReader(r.Body, 1024*1024))

	// Format headers
	headers := make(map[string]string)
	for k, v := range r.Header {
		headers[k] = strings.Join(v, ", ")
	}

	// Format query params
	queryParams := make(map[string]string)
	for k, v := range r.URL.Query() {
		queryParams[k] = strings.Join(v, ", ")
	}

	// Try parsing body as JSON if possible
	var parsedBody interface{}
	if err := json.Unmarshal(bodyBytes, &parsedBody); err != nil {
		parsedBody = string(bodyBytes)
	}

	payload := map[string]interface{}{
		"message":   "Echo response from NovaPost Go Backend",
		"method":    r.Method,
		"url":       r.URL.String(),
		"path":      r.URL.Path,
		"headers":   headers,
		"query":     queryParams,
		"body":      parsedBody,
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(payload)
}
