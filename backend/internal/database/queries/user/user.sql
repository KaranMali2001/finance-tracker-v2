-- name: InsertUser :one
INSERT INTO users (email, clerk_id)
VALUES ($1, $2)
RETURNING *;

-- name: GetAuthUser :one
SELECT * FROM users WHERE clerk_id=$1 ;