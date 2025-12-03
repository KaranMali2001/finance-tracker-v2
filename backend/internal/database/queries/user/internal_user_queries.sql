-- name: UpdateUserInternal :one
UPDATE users SET 
 transaction_image_parse_attempts=COALESCE($1,transaction_image_parse_attempts),
 transaction_image_parse_successes=COALESCE($2,transaction_image_parse_successes)
WHERE clerk_id=$3
RETURNING *;
