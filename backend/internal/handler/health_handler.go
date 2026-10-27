package handler

import (
	"encoding/json"
	"net/http"
	"runtime"
	"time"
)

type HealthHandler struct {
	startTime time.Time
	version   string
}

func NewHealthHandler(version string) *HealthHandler {
	return &HealthHandler{
		startTime: time.Now(),
		version:   version,
	}
}

func (h *HealthHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	uptime := time.Since(h.startTime).Round(time.Second)

	payload := map[string]interface{}{
		"status":      "ok",
		"service":     "NovaPost Backend",
		"version":     h.version,
		"uptime":      uptime.String(),
		"uptime_sec":  int64(uptime.Seconds()),
		"go_version":  runtime.Version(),
		"num_cpu":     runtime.NumCPU(),
		"goroutines":  runtime.NumGoroutine(),
		"memory": map[string]interface{}{
			"alloc_bytes":       m.Alloc,
			"alloc_mb":          float64(m.Alloc) / 1024 / 1024,
			"total_alloc_bytes": m.TotalAlloc,
			"sys_bytes":         m.Sys,
		},
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(payload)
}
