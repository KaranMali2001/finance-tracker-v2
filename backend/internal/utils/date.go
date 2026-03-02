package utils

import (
	"fmt"
	"time"
)

var multiDateFormats = []string{
	"2006-01-02",               // YYYY-MM-DD
	time.RFC3339,               // 2006-01-02T15:04:05Z07:00
	"2006-01-02T15:04:05Z",     // 2006-01-02T15:04:05Z
	"2006-01-02T15:04:05.000Z", // 2006-01-02T15:04:05.000Z
	"2006-01-02 15:04:05",      // 2006-01-02 15:04:05
}

// ParseMultiDate tries each of the common API date formats and returns the first match.
func ParseMultiDate(s string) (time.Time, error) {
	for _, f := range multiDateFormats {
		if t, err := time.Parse(f, s); err == nil {
			return t, nil
		}
	}
	return time.Time{}, fmt.Errorf("unparseable date: %s", s)
}
