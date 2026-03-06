-- name: GetSmses :many
SELECT * FROM sms_logs 
WHERE user_id=$1;

-- name: GetSmsById :one
SELECT * FROM sms_logs
WHERE user_id=$1 AND id=$2;

-- name: CreateSms :one
INSERT INTO sms_logs (
    user_id,
    sender,
    raw_message,
    received_at
) VALUES (
    $1,$2,$3,$4
) 
RETURNING *;

-- name: DeleteSms :exec
DELETE FROM sms_logs WHERE user_id=$1 AND id=$2;

-- name: UpdateSmsParsingStatus :one
UPDATE sms_logs
SET parsing_status = $2,
    error_message  = $3,
    updated_at     = NOW()
WHERE id = $1
RETURNING *;

-- name: UpdateSmsLlmResult :one
UPDATE sms_logs
SET llm_parse_attempted = $2,
    llm_parsed          = $3,
    llm_response        = $4,
    parsing_status      = $5,
    error_message       = $6,
    updated_at          = NOW()
WHERE id = $1
RETURNING *;