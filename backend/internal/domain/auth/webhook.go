package auth

import (
	"net/http"

	svix "github.com/svix/svix-webhooks/go"
)

func VerifyClerkWebhook(body []byte, headers http.Header, signingSecret string) error {
	wh, err := svix.NewWebhook(signingSecret)
	if err != nil {
		return err
	}

	return wh.Verify(body, headers)
}
