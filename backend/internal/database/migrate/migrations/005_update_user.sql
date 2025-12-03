-- +goose Up
ALTER TABLE users
ADD COLUMN transaction_image_parse_attempts INT DEFAULT 0,
ADD COLUMN transaction_image_parse_successes INT DEFAULT 0;

-- +goose Down
ALTER TABLE users
DROP COLUMN transaction_image_parse_attempts,
DROP COLUMN transaction_image_parse_successes;