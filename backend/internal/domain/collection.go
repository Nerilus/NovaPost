package domain

import (
	"context"
	"time"
)

// RequestParam represents a query parameter
type RequestParam struct {
	Key         string `json:"key"`
	Value       string `json:"value"`
	Description string `json:"description,omitempty"`
	Enabled     bool   `json:"enabled"`
}

// RequestHeader represents an HTTP header
type RequestHeader struct {
	Key     string `json:"key"`
	Value   string `json:"value"`
	Enabled bool   `json:"enabled"`
}

// RequestAuth represents authorization configuration
type RequestAuth struct {
	Type           string `json:"type"` // "none", "bearer", "basic", "apikey"
	BearerToken    string `json:"bearerToken,omitempty"`
	BasicUser      string `json:"basicUser,omitempty"`
	BasicPass      string `json:"basicPass,omitempty"`
	ApiKeyName     string `json:"apiKeyName,omitempty"`
	ApiKeyValue    string `json:"apiKeyValue,omitempty"`
	ApiKeyLocation string `json:"apiKeyLocation,omitempty"` // "header" or "query"
}

// RequestBody represents the body configuration
type RequestBody struct {
	Type       string         `json:"type"` // "none", "raw", "form-data", "urlencoded"
	RawType    string         `json:"rawType,omitempty"`
	Raw        string         `json:"raw,omitempty"`
	FormData   []RequestParam `json:"formData,omitempty"`
	UrlEncoded []RequestParam `json:"urlEncoded,omitempty"`
}

// RequestTest represents an assertion rule
type RequestTest struct {
	Type        string `json:"type"` // "status_code", "response_time", "has_property"
	Expected    string `json:"expected,omitempty"`
	MaxMs       int64  `json:"maxMs,omitempty"`
	Property    string `json:"property,omitempty"`
	Description string `json:"description,omitempty"`
}

// CollectionItem represents a single saved request
type CollectionItem struct {
	ID          string          `json:"id"`
	Name        string          `json:"name"`
	Method      string          `json:"method"`
	URL         string          `json:"url"`
	Params      []RequestParam  `json:"params"`
	Headers     []RequestHeader `json:"headers"`
	Auth        RequestAuth     `json:"auth"`
	Body        RequestBody     `json:"body"`
	Tests       []RequestTest   `json:"tests"`
	CreatedAt   time.Time       `json:"createdAt"`
	UpdatedAt   time.Time       `json:"updatedAt"`
}

// Collection represents a group of requests
type Collection struct {
	ID          string           `json:"id"`
	Name        string           `json:"name"`
	Description string           `json:"description,omitempty"`
	Items       []CollectionItem `json:"items"`
	CreatedAt   time.Time        `json:"createdAt"`
	UpdatedAt   time.Time        `json:"updatedAt"`
}

// CollectionRepository defines data storage operations for collections
type CollectionRepository interface {
	GetAll(ctx context.Context) ([]Collection, error)
	GetByID(ctx context.Context, id string) (*Collection, error)
	Create(ctx context.Context, col *Collection) error
	Update(ctx context.Context, col *Collection) error
	Delete(ctx context.Context, id string) error
	SaveItem(ctx context.Context, collectionID string, item *CollectionItem) error
	DeleteItem(ctx context.Context, collectionID, itemID string) error
}
