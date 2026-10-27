package security

import (
	"testing"
)

func TestSSRFGuard_ValidateURL(t *testing.T) {
	guardLocal := NewSSRFGuard(true)
	guardStrict := NewSSRFGuard(false)

	tests := []struct {
		name      string
		guard     *SSRFGuard
		url       string
		expectErr bool
	}{
		{
			name:      "Valid HTTPS URL",
			guard:     guardStrict,
			url:       "https://jsonplaceholder.typicode.com/posts/1",
			expectErr: false,
		},
		{
			name:      "Blocked file scheme",
			guard:     guardStrict,
			url:       "file:///etc/passwd",
			expectErr: true,
		},
		{
			name:      "Blocked gopher scheme",
			guard:     guardStrict,
			url:       "gopher://example.com",
			expectErr: true,
		},
		{
			name:      "Blocked AWS/GCP Metadata IP",
			guard:     guardLocal,
			url:       "http://169.254.169.254/latest/meta-data/",
			expectErr: true,
		},
		{
			name:      "Localhost allowed in dev mode",
			guard:     guardLocal,
			url:       "http://localhost:8080/api/health",
			expectErr: false,
		},
		{
			name:      "Localhost blocked in strict mode",
			guard:     guardStrict,
			url:       "http://localhost:8080/api/health",
			expectErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := tt.guard.ValidateURL(tt.url)
			if (err != nil) != tt.expectErr {
				t.Errorf("ValidateURL(%q) err = %v, expectErr = %v", tt.url, err, tt.expectErr)
			}
		})
	}
}
