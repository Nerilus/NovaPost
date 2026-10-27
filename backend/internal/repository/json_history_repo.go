package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"

	"novapost-backend/internal/domain"
)

type JSONHistoryRepo struct {
	mu       sync.RWMutex
	filePath string
	entries  []domain.HistoryEntry
	maxSize  int
}

func NewJSONHistoryRepo(dataDir string, maxSize int) (*JSONHistoryRepo, error) {
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create data dir: %w", err)
	}

	filePath := filepath.Join(dataDir, "history.json")
	repo := &JSONHistoryRepo{
		filePath: filePath,
		entries:  make([]domain.HistoryEntry, 0),
		maxSize:  maxSize,
	}

	_ = repo.load()
	return repo, nil
}

func (r *JSONHistoryRepo) load() error {
	data, err := os.ReadFile(r.filePath)
	if err != nil {
		return err
	}

	var list []domain.HistoryEntry
	if err := json.Unmarshal(data, &list); err != nil {
		return err
	}

	r.mu.Lock()
	defer r.mu.Unlock()
	r.entries = list
	return nil
}

func (r *JSONHistoryRepo) persist() error {
	bytes, err := json.MarshalIndent(r.entries, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(r.filePath, bytes, 0644)
}

func (r *JSONHistoryRepo) GetAll(ctx context.Context, limit int) ([]domain.HistoryEntry, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	if limit <= 0 || limit > len(r.entries) {
		limit = len(r.entries)
	}

	result := make([]domain.HistoryEntry, limit)
	copy(result, r.entries[:limit])
	return result, nil
}

func (r *JSONHistoryRepo) Add(ctx context.Context, entry *domain.HistoryEntry) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if entry.ID == "" {
		entry.ID = fmt.Sprintf("hist-%d", time.Now().UnixNano())
	}
	if entry.Timestamp.IsZero() {
		entry.Timestamp = time.Now()
	}

	// Prepend
	r.entries = append([]domain.HistoryEntry{*entry}, r.entries...)
	if len(r.entries) > r.maxSize {
		r.entries = r.entries[:r.maxSize]
	}

	return r.persist()
}

func (r *JSONHistoryRepo) Clear(ctx context.Context) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.entries = make([]domain.HistoryEntry, 0)
	return r.persist()
}
