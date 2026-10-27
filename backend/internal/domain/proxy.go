package domain

import (
	"context"
)

// ProxyRequest represents an incoming request payload to be forwarded
type ProxyRequest struct {
	Method    string            `json:"method"`
	URL       string            `json:"url"`
	Headers   map[string]string `json:"headers"`
	Body      string            `json:"body"`
	TimeoutMs int64             `json:"timeoutMs,omitempty"`
}

// ProxyResponse represents the forwarded response returned to the client
type ProxyResponse struct {
	Status     int               `json:"status"`
	StatusText string            `json:"statusText"`
	Headers    map[string]string `json:"headers"`
	Body       string            `json:"body"`
	TimeMs     int64             `json:"timeMs"`
	Size       int64             `json:"size"`
	Cookies    []string          `json:"cookies,omitempty"`
}

// ProxyService defines the interface for outbound HTTP request execution
type ProxyService interface {
	Execute(ctx context.Context, req *ProxyRequest) (*ProxyResponse, error)
}
