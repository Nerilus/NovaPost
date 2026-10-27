package security

import (
	"testing"
)

func TestSanitizeHeaders_CRLFInjection(t *testing.T) {
	maliciousHeaders := map[string]string{
		"X-Custom-Header": "valid-value\r\nInjected-Header: evil",
	}

	_, err := SanitizeHeaders(maliciousHeaders)
	if err != ErrCRLFInjection {
		t.Fatalf("Expected ErrCRLFInjection, got %v", err)
	}
}

func TestSanitizeHeaders_HopByHopFilter(t *testing.T) {
	headers := map[string]string{
		"Connection":        "keep-alive",
		"Keep-Alive":        "timeout=5",
		"Content-Type":      "application/json",
		"X-Custom-Header":   "valid-header",
		"Transfer-Encoding": "chunked",
	}

	sanitized, err := SanitizeHeaders(headers)
	if err != nil {
		t.Fatalf("Unexpected error: %v", err)
	}

	if sanitized.Get("Connection") != "" {
		t.Errorf("Expected Connection header to be filtered")
	}
	if sanitized.Get("Transfer-Encoding") != "" {
		t.Errorf("Expected Transfer-Encoding header to be filtered")
	}
	if sanitized.Get("Content-Type") != "application/json" {
		t.Errorf("Expected Content-Type to be preserved")
	}
	if sanitized.Get("X-Custom-Header") != "valid-header" {
		t.Errorf("Expected X-Custom-Header to be preserved")
	}
}
