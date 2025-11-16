-- name: InsertUser :one
INSERT INTO users (email, clerk_id)
VALUES ($1, $2)
RETURNING *;