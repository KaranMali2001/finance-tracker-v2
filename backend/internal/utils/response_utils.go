package utils

// PaginatedResponse represents a paginated response for GET queries
type PaginatedResponse[T any] struct {
	Data       []T `json:"data"`
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	Total      int `json:"total"`
	TotalPages int `json:"totalPages"`
}

// NewPaginatedResponse creates a new PaginatedResponse with calculated TotalPages
func NewPaginatedResponse[T any](data []T, page, limit, total int) *PaginatedResponse[T] {
	totalPages := (total + limit - 1) / limit // Ceiling division
	if totalPages == 0 && total > 0 {
		totalPages = 1
	}

	return &PaginatedResponse[T]{
		Data:       data,
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}
}
