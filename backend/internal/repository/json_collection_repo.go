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

type JSONCollectionRepo struct {
	mu       sync.RWMutex
	filePath string
	items    map[string]domain.Collection
}

func NewJSONCollectionRepo(dataDir string) (*JSONCollectionRepo, error) {
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create data dir: %w", err)
	}

	filePath := filepath.Join(dataDir, "collections.json")
	repo := &JSONCollectionRepo{
		filePath: filePath,
		items:    make(map[string]domain.Collection),
	}

	if err := repo.load(); err != nil {
		// Initialize with default collections if file doesn't exist or is empty
		repo.seedDefaults()
		_ = repo.persist()
	}

	return repo, nil
}

func (r *JSONCollectionRepo) load() error {
	data, err := os.ReadFile(r.filePath)
	if err != nil {
		return err
	}

	var list []domain.Collection
	if err := json.Unmarshal(data, &list); err != nil {
		return err
	}

	r.mu.Lock()
	defer r.mu.Unlock()
	for _, c := range list {
		r.items[c.ID] = c
	}
	return nil
}

func (r *JSONCollectionRepo) persist() error {
	list := make([]domain.Collection, 0, len(r.items))
	for _, c := range r.items {
		list = append(list, c)
	}

	bytes, err := json.MarshalIndent(list, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(r.filePath, bytes, 0644)
}

func (r *JSONCollectionRepo) seedDefaults() {
	r.items["col-default-1"] = domain.Collection{
		ID:          "col-default-1",
		Name:        "JSONPlaceholder API",
		Description: "Sample collection for testing",
		Items: []domain.CollectionItem{
			{
				ID:        "req-1",
				Name:      "Get Post #1",
				Method:    "GET",
				URL:       "https://jsonplaceholder.typicode.com/posts/1",
				Params:    []domain.RequestParam{},
				Headers:   []domain.RequestHeader{{Key: "Accept", Value: "application/json", Enabled: true}},
				Auth:      domain.RequestAuth{Type: "none"},
				Body:      domain.RequestBody{Type: "none"},
				Tests:     []domain.RequestTest{{Type: "status_code", Expected: "200", Description: "Status code is 200"}},
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
		},
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
}

func (r *JSONCollectionRepo) GetAll(ctx context.Context) ([]domain.Collection, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	result := make([]domain.Collection, 0, len(r.items))
	for _, c := range r.items {
		result = append(result, c)
	}
	return result, nil
}

func (r *JSONCollectionRepo) GetByID(ctx context.Context, id string) (*domain.Collection, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	c, ok := r.items[id]
	if !ok {
		return nil, fmt.Errorf("collection %s not found", id)
	}
	return &c, nil
}

func (r *JSONCollectionRepo) Create(ctx context.Context, col *domain.Collection) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if col.ID == "" {
		col.ID = fmt.Sprintf("col-%d", time.Now().UnixNano())
	}
	col.CreatedAt = time.Now()
	col.UpdatedAt = time.Now()

	r.items[col.ID] = *col
	return r.persist()
}

func (r *JSONCollectionRepo) Update(ctx context.Context, col *domain.Collection) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.items[col.ID]; !exists {
		return fmt.Errorf("collection %s not found", col.ID)
	}

	col.UpdatedAt = time.Now()
	r.items[col.ID] = *col
	return r.persist()
}

func (r *JSONCollectionRepo) Delete(ctx context.Context, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	delete(r.items, id)
	return r.persist()
}

func (r *JSONCollectionRepo) SaveItem(ctx context.Context, collectionID string, item *domain.CollectionItem) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	col, exists := r.items[collectionID]
	if !exists {
		return fmt.Errorf("collection %s not found", collectionID)
	}

	if item.ID == "" {
		item.ID = fmt.Sprintf("req-%d", time.Now().UnixNano())
	}
	item.UpdatedAt = time.Now()

	found := false
	for i, it := range col.Items {
		if it.ID == item.ID {
			col.Items[i] = *item
			found = true
			break
		}
	}
	if !found {
		item.CreatedAt = time.Now()
		col.Items = append(col.Items, *item)
	}

	col.UpdatedAt = time.Now()
	r.items[collectionID] = col
	return r.persist()
}

func (r *JSONCollectionRepo) DeleteItem(ctx context.Context, collectionID, itemID string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	col, exists := r.items[collectionID]
	if !exists {
		return fmt.Errorf("collection %s not found", collectionID)
	}

	newItems := make([]domain.CollectionItem, 0, len(col.Items))
	for _, it := range col.Items {
		if it.ID != itemID {
			newItems = append(newItems, it)
		}
	}

	col.Items = newItems
	col.UpdatedAt = time.Now()
	r.items[collectionID] = col
	return r.persist()
}
