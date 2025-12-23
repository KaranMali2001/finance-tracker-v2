-- name: CreateNewJob :one
INSERT INTO jobs (
user_id,job_type,job_id,payload,attempts,queue_name,metadata,status
)VALUES (
$1,$2,$3,$4,$5,$6,$7,$8)
RETURNING *;

-- name: UpdateJob :one
UPDATE jobs j
SET
  status = COALESCE(sqlc.narg(status), j.status),
  attempts = COALESCE(sqlc.narg(attempts), j.attempts),
  result = COALESCE(sqlc.narg(result), j.result),
last_error = COALESCE(sqlc.narg(last_error), j.last_error),
finished_at=COALESCE(sqlc.narg(finished_at),j.finished_at)

WHERE j.id=$1
RETURNING *;

-- name: GetJobById :one
SELECT * from jobs WHERE job_id=$1;
