package domain

import (
	"context"
	"time"
)

// HistoryEntry represents an executed request entry in the history log
type HistoryEntry struct {
	ID         string            `json:"id"`
	Method     string            `json:"method"`
	URL        string            `json:"url"`
	Status     int               `json:"status"`
	StatusText string            `json:"statusText"`
	TimeMs     int64             `json:"timeMs"`
	Timestamp  time.Time         `json:"timestamp"`
	Headers    map[string]string `json:"headers,omitempty"`
	Body       string            `json:"body,omitempty"`
}

// HistoryRepository defines storage operations for request history
type HistoryRepository interface {
	GetAll(ctx context.Context, limit int) ([]HistoryEntry, error)
	Add(ctx context.Context, entry *HistoryEntry) error
	Clear(ctx context.Context) error
}
