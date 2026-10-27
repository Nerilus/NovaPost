package middleware

import (
	"encoding/json"
	"log"
	"net/http"
	"runtime/debug"
)

// Recovery handles uncaught panics and returns safe sanitized JSON responses
func Recovery(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if rec := recover(); rec != nil {
				reqID := GetRequestID(r.Context())
				log.Printf("PANIC RECOVERED [%s]: %v\nStack trace:\n%s", reqID, rec, string(debug.Stack()))

				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusInternalServerError)
				_ = json.NewEncoder(w).Encode(map[string]interface{}{
					"error":      "An unexpected internal error occurred",
					"request_id": reqID,
					"status":     http.StatusInternalServerError,
				})
			}
		}()

		next.ServeHTTP(w, r)
	})
}
