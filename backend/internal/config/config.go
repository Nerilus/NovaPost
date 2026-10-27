package config

import (
	"os"
	"strconv"
	"time"
)

// Config holds the complete application configuration
type Config struct {
	Port            string
	Env             string // "development" or "production"
	ReadTimeout     time.Duration
	WriteTimeout    time.Duration
	IdleTimeout     time.Duration
	ShutdownTimeout time.Duration

	// Proxy Security Settings
	AllowLocalProxy bool          // If true, allows proxying to localhost/127.0.0.1 (safe for dev)
	MaxBodySizeBytes int64        // Max payload size (e.g. 10MB)
	ProxyTimeout    time.Duration // Default timeout for outbound proxy requests
	RateLimitPerSec float64       // Max requests per second per IP
	RateLimitBurst  int           // Burst size for rate limiter

	// Data Storage
	DataDir string
}

// LoadConfig loads configuration from environment variables with sensible defaults
func LoadConfig() *Config {
	return &Config{
		Port:            getEnv("PORT", "8080"),
		Env:             getEnv("APP_ENV", "development"),
		ReadTimeout:     getEnvDuration("READ_TIMEOUT", 15*time.Second),
		WriteTimeout:    getEnvDuration("WRITE_TIMEOUT", 30*time.Second),
		IdleTimeout:     getEnvDuration("IDLE_TIMEOUT", 60*time.Second),
		ShutdownTimeout: getEnvDuration("SHUTDOWN_TIMEOUT", 10*time.Second),

		// Security: By default in dev mode we allow local proxy, but in prod mode it should be disabled
		AllowLocalProxy: getEnvBool("ALLOW_LOCAL_PROXY", true),
		MaxBodySizeBytes: getEnvInt64("MAX_BODY_SIZE", 10*1024*1024), // 10MB
		ProxyTimeout:    getEnvDuration("PROXY_TIMEOUT", 20*time.Second),
		RateLimitPerSec: getEnvFloat64("RATE_LIMIT_RPS", 50.0),
		RateLimitBurst:  getEnvInt("RATE_LIMIT_BURST", 100),

		DataDir: getEnv("DATA_DIR", "./data"),
	}
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

func getEnvBool(key string, defaultVal bool) bool {
	if val := os.Getenv(key); val != "" {
		b, err := strconv.ParseBool(val)
		if err == nil {
			return b
		}
	}
	return defaultVal
}

func getEnvInt(key string, defaultVal int) int {
	if val := os.Getenv(key); val != "" {
		i, err := strconv.Atoi(val)
		if err == nil {
			return i
		}
	}
	return defaultVal
}

func getEnvInt64(key string, defaultVal int64) int64 {
	if val := os.Getenv(key); val != "" {
		i, err := strconv.ParseInt(val, 10, 64)
		if err == nil {
			return i
		}
	}
	return defaultVal
}

func getEnvFloat64(key string, defaultVal float64) float64 {
	if val := os.Getenv(key); val != "" {
		f, err := strconv.ParseFloat(val, 64)
		if err == nil {
			return f
		}
	}
	return defaultVal
}

func getEnvDuration(key string, defaultVal time.Duration) time.Duration {
	if val := os.Getenv(key); val != "" {
		d, err := time.ParseDuration(val)
		if err == nil {
			return d
		}
	}
	return defaultVal
}
