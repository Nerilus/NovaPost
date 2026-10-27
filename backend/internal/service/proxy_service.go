package service

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"novapost-backend/internal/config"
	"novapost-backend/internal/domain"
	"novapost-backend/internal/security"
)

// ProxyServiceImpl implements domain.ProxyService with resilient connection pooling and SSRF security
type ProxyServiceImpl struct {
	cfg       *config.Config
	guard     *security.SSRFGuard
	client    *http.Client
	maxSize   int64
}

// NewProxyService creates an authenticated, hardened proxy executor
func NewProxyService(cfg *config.Config) *ProxyServiceImpl {
	guard := security.NewSSRFGuard(cfg.AllowLocalProxy)
	transport := guard.SafeTransport(cfg.ProxyTimeout)

	client := &http.Client{
		Transport: transport,
		Timeout:   cfg.ProxyTimeout,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if len(via) >= 10 {
				return fmt.Errorf("stopped after 10 redirects")
			}
			// Re-validate redirect target with SSRF guard to prevent open redirect -> SSRF attack
			_, err := guard.ValidateURL(req.URL.String())
			if err != nil {
				return fmt.Errorf("redirect target blocked: %w", err)
			}
			return nil
		},
	}

	return &ProxyServiceImpl{
		cfg:     cfg,
		guard:   guard,
		client:  client,
		maxSize: cfg.MaxBodySizeBytes,
	}
}

// Execute validates and dispatches an HTTP request, capturing full telemetry
func (s *ProxyServiceImpl) Execute(ctx context.Context, req *domain.ProxyRequest) (*domain.ProxyResponse, error) {
	if req == nil {
		return nil, fmt.Errorf("request payload cannot be empty")
	}

	// 1. Sanitize Method
	method, err := security.SanitizeMethod(req.Method)
	if err != nil {
		return nil, err
	}

	// 2. Validate URL against SSRF rules
	parsedURL, err := s.guard.ValidateURL(req.URL)
	if err != nil {
		return nil, err
	}

	// 3. Sanitize Headers
	sanitizedHeaders, err := security.SanitizeHeaders(req.Headers)
	if err != nil {
		return nil, err
	}

	// 4. Prepare Body Reader
	var bodyReader io.Reader
	if req.Body != "" && method != http.MethodGet && method != http.MethodHead {
		bodyReader = strings.NewReader(req.Body)
	}

	// 5. Construct Context with Timeout
	timeout := s.cfg.ProxyTimeout
	if req.TimeoutMs > 0 {
		timeout = time.Duration(req.TimeoutMs) * time.Millisecond
	}
	reqCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	httpReq, err := http.NewRequestWithContext(reqCtx, method, parsedURL.String(), bodyReader)
	if err != nil {
		return nil, fmt.Errorf("failed to create outbound request: %w", err)
	}

	// Copy sanitized headers
	httpReq.Header = sanitizedHeaders

	// Set a clean User-Agent if not provided
	if httpReq.Header.Get("User-Agent") == "" {
		httpReq.Header.Set("User-Agent", "NovaPost-GoProxy/1.0")
	}

	// 6. Execute with timing
	startTime := time.Now()
	resp, err := s.client.Do(httpReq)
	if err != nil {
		duration := time.Since(startTime).Milliseconds()
		return &domain.ProxyResponse{
			Status:     0,
			StatusText: "Connection Error",
			Body:       err.Error(),
			TimeMs:     duration,
			Headers:    make(map[string]string),
		}, nil
	}
	defer resp.Body.Close()

	// 7. Read response body with size limit (max 15MB)
	bodyLimit := s.maxSize + (5 * 1024 * 1024)
	limitedReader := io.LimitReader(resp.Body, bodyLimit)
	bodyBytes, err := io.ReadAll(limitedReader)
	if err != nil {
		return nil, fmt.Errorf("failed reading response body: %w", err)
	}

	duration := time.Since(startTime).Milliseconds()

	// 8. Extract Headers and Cookies
	headerMap := make(map[string]string)
	for k, v := range resp.Header {
		headerMap[k] = strings.Join(v, ", ")
	}

	cookies := make([]string, 0)
	for _, cookie := range resp.Cookies() {
		cookies = append(cookies, cookie.String())
	}

	return &domain.ProxyResponse{
		Status:     resp.StatusCode,
		StatusText: http.StatusText(resp.StatusCode),
		Headers:    headerMap,
		Body:       string(bodyBytes),
		TimeMs:     duration,
		Size:       int64(len(bodyBytes)),
		Cookies:    cookies,
	}, nil
}
