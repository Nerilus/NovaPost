package middleware

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"net/http"
	"time"
)

type contextKey string

const RequestIDKey contextKey = "request_id"

type responseRecorder struct {
	http.ResponseWriter
	statusCode int
	bytesWritten int
}

func (r *responseRecorder) WriteHeader(statusCode int) {
	r.statusCode = statusCode
	r.ResponseWriter.WriteHeader(statusCode)
}

func (r *responseRecorder) Write(b []byte) (int, error) {
	n, err := r.ResponseWriter.Write(b)
	r.bytesWritten += n
	return n, err
}

// StructuredLogger logs HTTP method, path, response code, latency, and client IP
func StructuredLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Generate or extract request ID
		reqID := r.Header.Get("X-Request-ID")
		if reqID == "" {
			buf := make([]byte, 8)
			_, _ = rand.Read(buf)
			reqID = hex.EncodeToString(buf)
		}

		ctx := context.WithValue(r.Context(), RequestIDKey, reqID)
		w.Header().Set("X-Request-ID", reqID)

		rec := &responseRecorder{
			ResponseWriter: w,
			statusCode:     http.StatusOK,
		}

		next.ServeHTTP(rec, r.WithContext(ctx))

		duration := time.Since(start)

		log.Printf("[%s] %s %s -> %d (%s, %d bytes) [ip=%s]",
			reqID,
			r.Method,
			r.URL.Path,
			rec.statusCode,
			duration.Round(time.Millisecond),
			rec.bytesWritten,
			getClientIP(r),
		)
	})
}

// GetRequestID returns the request ID from the request context
func GetRequestID(ctx context.Context) string {
	if val, ok := ctx.Value(RequestIDKey).(string); ok {
		return val
	}
	return fmt.Sprintf("req-%d", time.Now().UnixNano())
}
