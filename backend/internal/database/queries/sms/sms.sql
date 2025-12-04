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