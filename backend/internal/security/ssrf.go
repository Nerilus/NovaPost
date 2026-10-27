package security

import (
	"errors"
	"fmt"
	"net"
	"net/http"
	"net/url"
	"strings"
	"syscall"
	"time"
)

var (
	ErrInvalidScheme   = errors.New("security: only http and https protocols are allowed")
	ErrSSRFBlocked     = errors.New("security: target address is blocked by SSRF protection policy")
	ErrMetadataBlocked = errors.New("security: access to cloud instance metadata service is prohibited")
)

// SSRFGuard provides IP verification and safe socket dialing
type SSRFGuard struct {
	allowLocal bool
	blockedNets []*net.IPNet
}

// NewSSRFGuard creates a new SSRF validator
func NewSSRFGuard(allowLocal bool) *SSRFGuard {
	// Standard blocked CIDRs (link-local / cloud metadata / multicast)
	blockedCIDRs := []string{
		"169.254.0.0/16", // IPv4 Link-Local (AWS/GCP/Azure metadata 169.254.169.254)
		"fe80::/10",      // IPv6 Link-Local
		"224.0.0.0/4",    // Multicast
		"ff00::/8",       // IPv6 Multicast
		"0.0.0.0/8",      // Broadcast / this host
	}

	if !allowLocal {
		blockedCIDRs = append(blockedCIDRs,
			"127.0.0.0/8",     // IPv4 Loopback
			"::1/128",         // IPv6 Loopback
			"10.0.0.0/8",      // RFC1918 Private
			"172.16.0.0/12",   // RFC1918 Private
			"192.168.0.0/16",  // RFC1918 Private
			"fc00::/7",        // IPv6 Unique Local Address
		)
	}

	var nets []*net.IPNet
	for _, cidr := range blockedCIDRs {
		_, ipNet, err := net.ParseCIDR(cidr)
		if err == nil {
			nets = append(nets, ipNet)
		}
	}

	return &SSRFGuard{
		allowLocal: allowLocal,
		blockedNets: nets,
	}
}

// ValidateURL performs scheme and initial host validation
func (g *SSRFGuard) ValidateURL(rawURL string) (*url.URL, error) {
	parsed, err := url.Parse(rawURL)
	if err != nil {
		return nil, fmt.Errorf("invalid URL: %w", err)
	}

	scheme := strings.ToLower(parsed.Scheme)
	if scheme != "http" && scheme != "https" {
		return nil, ErrInvalidScheme
	}

	hostname := parsed.Hostname()
	if hostname == "" {
		return nil, errors.New("URL missing hostname")
	}

	// Explicit metadata service check
	if hostname == "169.254.169.254" || strings.Contains(hostname, "metadata.google.internal") {
		return nil, ErrMetadataBlocked
	}

	if !g.allowLocal {
		if strings.EqualFold(hostname, "localhost") || strings.HasSuffix(strings.ToLower(hostname), ".localhost") {
			return nil, ErrSSRFBlocked
		}
	}

	return parsed, nil
}

// SafeDialer returns a net.Dialer equipped with DNS rebinding and socket IP validation
func (g *SSRFGuard) SafeDialer(timeout time.Duration) *net.Dialer {
	return &net.Dialer{
		Timeout:   timeout,
		KeepAlive: 30 * time.Second,
		Control: func(network, address string, c syscall.RawConn) error {
			host, _, err := net.SplitHostPort(address)
			if err != nil {
				host = address
			}

			ip := net.ParseIP(host)
			if ip == nil {
				return nil
			}

			// Validate IP against blocked ranges
			for _, blocked := range g.blockedNets {
				if blocked.Contains(ip) {
					return fmt.Errorf("%w: IP %s falls into blocked subnet %s", ErrSSRFBlocked, ip.String(), blocked.String())
				}
			}

			// If local is not allowed, check loopbacks & private
			if !g.allowLocal {
				if ip.IsLoopback() || ip.IsPrivate() || ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() {
					return fmt.Errorf("%w: IP %s is a private or loopback address", ErrSSRFBlocked, ip.String())
				}
			}

			return nil
		},
	}
}

// SafeTransport creates an http.Transport guarded against SSRF and connection leakage
func (g *SSRFGuard) SafeTransport(timeout time.Duration) *http.Transport {
	dialer := g.SafeDialer(timeout)

	return &http.Transport{
		Proxy:                 nil, // Prevent ambient proxy hijack
		DialContext:           dialer.DialContext,
		ForceAttemptHTTP2:     true,
		MaxIdleConns:          100,
		MaxIdleConnsPerHost:   10,
		IdleConnTimeout:       90 * time.Second,
		TLSHandshakeTimeout:   10 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
		ResponseHeaderTimeout: timeout,
	}
}
