package dispatcher

import (
	"context"
	"encoding/json"
)

type JobPayload struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

type Dispatcher interface {
	Dispatch(ctx context.Context, job JobPayload) error
}
