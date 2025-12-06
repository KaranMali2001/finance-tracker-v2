-- name: UpdateUserInternal :one
UPDATE users SET 
 transaction_image_parse_attempts=COALESCE($1,transaction_image_parse_attempts),
 transaction_image_parse_successes=COALESCE($2,transaction_image_parse_successes),
 api_key=COALESCE($3,api_key),
 qr_string=COALESCE($4,qr_string)
WHERE clerk_id=$5
RETURNING *;
