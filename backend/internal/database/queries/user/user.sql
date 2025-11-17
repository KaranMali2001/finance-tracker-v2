-- name: InsertUser :one
INSERT INTO users (email, clerk_id)
VALUES ($1, $2)
RETURNING *;

-- name: GetAuthUser :one
SELECT * FROM users WHERE clerk_id=$1 ;

-- name: UpdateUser :one 
UPDATE users SET 
  use_llm_parsing=COALESCE($1, use_llm_parsing),
  database_url=COALESCE($2, database_url),
  lifetime_income=COALESCE($3, lifetime_income),
  lifetime_expense=COALESCE($4, lifetime_expense)
WHERE clerk_id=$5 RETURNING *;