package security

import (
	"errors"
	"net/http"
	"strings"
)

var (
	ErrInvalidMethod = errors.New("security: unsupported HTTP method")
	ErrCRLFInjection = errors.New("security: header key or value contains CRLF injection attempt")
)

// AllowedMethods defines standard allowed HTTP methods
var AllowedMethods = map[string]bool{
	http.MethodGet:     true,
	http.MethodPost:    true,
	http.MethodPut:     true,
	http.MethodPatch:   true,
	http.MethodDelete:  true,
	http.MethodHead:    true,
	http.MethodOptions: true,
}

// Hop-by-hop headers that must not be forwarded by a proxy (RFC 2616 Section 13.5.1)
var hopByHopHeaders = map[string]bool{
	"connection":          true,
	"keep-alive":          true,
	"proxy-authenticate":  true,
	"proxy-authorization": true,
	"te":                  true,
	"trailers":            true,
	"transfer-encoding":   true,
	"upgrade":             true,
}

// SanitizeMethod validates and returns uppercase method
func SanitizeMethod(method string) (string, error) {
	upper := strings.ToUpper(strings.TrimSpace(method))
	if !AllowedMethods[upper] {
		return "", ErrInvalidMethod
	}
	return upper, nil
}

// SanitizeHeaders validates header pairs and filters hop-by-hop headers
func SanitizeHeaders(headers map[string]string) (http.Header, error) {
	result := make(http.Header)

	for k, v := range headers {
		key := strings.TrimSpace(k)
		val := strings.TrimSpace(v)

		if key == "" {
			continue
		}

		// CRLF injection detection
		if strings.ContainsAny(key, "\r\n") || strings.ContainsAny(val, "\r\n") {
			return nil, ErrCRLFInjection
		}

		// Filter hop-by-hop headers
		if hopByHopHeaders[strings.ToLower(key)] {
			continue
		}

		result.Set(key, val)
	}

	return result, nil
}
