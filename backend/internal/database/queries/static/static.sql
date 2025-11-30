-- name: GetBanks :many

SELECT * from banks WHERE is_active=true;

-- name: GetMerchants :many
SELECT * from merchants;

-- name: GetCategories :many
SELECT * from categories WHERE is_system=true AND user_id IS NULL;