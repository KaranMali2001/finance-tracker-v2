package handler

import (
	"mime"
	"path/filepath"
	"strings"
	"time"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/errs"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/validation"
	"github.com/labstack/echo/v4"
	"github.com/newrelic/go-agent/v3/integrations/nrpkgerrors"
	"github.com/newrelic/go-agent/v3/newrelic"
)

// Handler provides base functionality for all handlers
type Handler struct {
	server *server.Server
}

// NewHandler creates a new base handler
func NewHandler(s *server.Server) Handler {
	return Handler{server: s}
}

// HandlerFunc represents a typed handler function that processes a request and returns a response
type HandlerFunc[Req validation.Validatable, Res any] func(c echo.Context, req Req) (Res, error)

// HandlerFuncNoContent represents a typed handler function that processes a request without returning content
type HandlerFuncNoContent[Req validation.Validatable] func(c echo.Context, req Req) error

// HandlerFuncUpload represents a typed handler function that processes a file upload request and returns a response
type HandlerFuncUpload[Req validation.Validatable, Res any] func(c echo.Context, req Req) (Res, error)

// ResponseHandler defines the interface for handling different response types
type ResponseHandler interface {
	Handle(c echo.Context, result interface{}) error
	GetOperation() string
	AddAttributes(txn *newrelic.Transaction, result interface{})
}

// JSONResponseHandler handles JSON responses
type JSONResponseHandler struct {
	status int
}

func (h JSONResponseHandler) Handle(c echo.Context, result interface{}) error {
	return c.JSON(h.status, result)
}

func (h JSONResponseHandler) GetOperation() string {
	return "handler"
}

func (h JSONResponseHandler) AddAttributes(txn *newrelic.Transaction, result interface{}) {
	// http.status_code is already set by tracing middleware
}

// NoContentResponseHandler handles no-content responses
type NoContentResponseHandler struct {
	status int
}

func (h NoContentResponseHandler) Handle(c echo.Context, result interface{}) error {
	return c.NoContent(h.status)
}

func (h NoContentResponseHandler) GetOperation() string {
	return "handler_no_content"
}

func (h NoContentResponseHandler) AddAttributes(txn *newrelic.Transaction, result interface{}) {
	// http.status_code is already set by tracing middleware
}

// FileResponseHandler handles file responses
type FileResponseHandler struct {
	status      int
	filename    string
	contentType string
}

func (h FileResponseHandler) Handle(c echo.Context, result interface{}) error {
	data := result.([]byte)
	c.Response().Header().Set("Content-Disposition", "attachment; filename="+h.filename)
	return c.Blob(h.status, h.contentType, data)
}

func (h FileResponseHandler) GetOperation() string {
	return "handler_file"
}

func (h FileResponseHandler) AddAttributes(txn *newrelic.Transaction, result interface{}) {
	if txn != nil {
		// http.status_code is already set by tracing middleware
		txn.AddAttribute("file.name", h.filename)
		txn.AddAttribute("file.content_type", h.contentType)
		if data, ok := result.([]byte); ok {
			txn.AddAttribute("file.size_bytes", len(data))
		}
	}
}

// handleRequest is the unified handler function that eliminates code duplication
func handleRequest[Req validation.Validatable](
	c echo.Context,
	req Req,
	handler func(c echo.Context, req Req) (interface{}, error),
	responseHandler ResponseHandler,
) error {
	start := time.Now()
	method := c.Request().Method
	path := c.Path()
	route := path

	// Get New Relic transaction from context
	txn := newrelic.FromContext(c.Request().Context())
	if txn != nil {
		txn.AddAttribute("handler.name", route)
		// http.method and http.route are already set by nrecho middleware
		responseHandler.AddAttributes(txn, nil)
	}

	// Get context-enhanced logger
	loggerBuilder := middleware.GetLogger(c).With().
		Str("operation", responseHandler.GetOperation()).
		Str("method", method).
		Str("path", path).
		Str("route", route)

	// Add file-specific fields to logger if it's a file handler
	if fileHandler, ok := responseHandler.(FileResponseHandler); ok {
		loggerBuilder = loggerBuilder.
			Str("filename", fileHandler.filename).
			Str("content_type", fileHandler.contentType)
	}

	logger := loggerBuilder.Logger()

	// user.id is already set by tracing middleware

	logger.Info().Msg("handling request")

	// Validation with observability
	validationStart := time.Now()
	if err := validation.BindAndValidate(c, req); err != nil {
		validationDuration := time.Since(validationStart)

		logger.Error().
			Err(err).
			Dur("validation_duration", validationDuration).
			Msg("request validation failed")

		if txn != nil {
			txn.NoticeError(nrpkgerrors.Wrap(err))
			txn.AddAttribute("validation.status", "failed")
			txn.AddAttribute("validation.duration_ms", validationDuration.Milliseconds())
		}
		return err
	}

	validationDuration := time.Since(validationStart)
	if txn != nil {
		txn.AddAttribute("validation.status", "success")
		txn.AddAttribute("validation.duration_ms", validationDuration.Milliseconds())
	}

	logger.Debug().
		Dur("validation_duration", validationDuration).
		Msg("request validation successful")

	// Execute handler with observability
	handlerStart := time.Now()
	result, err := handler(c, req)
	handlerDuration := time.Since(handlerStart)

	if err != nil {
		totalDuration := time.Since(start)

		logger.Error().
			Err(err).
			Dur("handler_duration", handlerDuration).
			Dur("total_duration", totalDuration).
			Msg("handler execution failed")

		if txn != nil {
			txn.NoticeError(nrpkgerrors.Wrap(err))
			txn.AddAttribute("handler.status", "error")
			txn.AddAttribute("handler.duration_ms", handlerDuration.Milliseconds())
			txn.AddAttribute("total.duration_ms", totalDuration.Milliseconds())
		}
		return err
	}

	totalDuration := time.Since(start)

	// Record success metrics and tracing
	if txn != nil {
		txn.AddAttribute("handler.status", "success")
		txn.AddAttribute("handler.duration_ms", handlerDuration.Milliseconds())
		txn.AddAttribute("total.duration_ms", totalDuration.Milliseconds())
		responseHandler.AddAttributes(txn, result)
	}

	logger.Info().
		Dur("handler_duration", handlerDuration).
		Dur("validation_duration", validationDuration).
		Dur("total_duration", totalDuration).
		Msg("request completed successfully")

	return responseHandler.Handle(c, result)
}

// Handle wraps a handler with validation, error handling, logging, metrics, and tracing
func Handle[Req validation.Validatable, Res any](
	h Handler,
	handler HandlerFunc[Req, Res],
	status int,
	req Req,
) echo.HandlerFunc {
	return func(c echo.Context) error {
		return handleRequest(c, req, func(c echo.Context, req Req) (interface{}, error) {
			return handler(c, req)
		}, JSONResponseHandler{status: status})
	}
}

func HandleFile[Req validation.Validatable](
	h Handler,
	handler HandlerFunc[Req, []byte],
	status int,
	req Req,
	filename string,
	contentType string,
) echo.HandlerFunc {
	return func(c echo.Context) error {
		return handleRequest(c, req, func(c echo.Context, req Req) (interface{}, error) {
			return handler(c, req)
		}, FileResponseHandler{
			status:      status,
			filename:    filename,
			contentType: contentType,
		})
	}
}

// HandleNoContent wraps a handler with validation, error handling, logging, metrics, and tracing for endpoints that don't return content
func HandleNoContent[Req validation.Validatable](
	h Handler,
	handler HandlerFuncNoContent[Req],
	status int,
	req Req,
) echo.HandlerFunc {
	return func(c echo.Context) error {
		return handleRequest(c, req, func(c echo.Context, req Req) (interface{}, error) {
			err := handler(c, req)
			return nil, err
		}, NoContentResponseHandler{status: status})
	}
}

const (
	// DefaultMaxFileSize is the default maximum file size for uploads (10MB)
	DefaultMaxFileSize int64 = 10 << 20 // 10MB
	// ImageContextKey is the key used to store uploaded image in request context
	ImageContextKey = "image"
	// StatementContextKey is the key used to store uploaded statement in request context
	StatementContextKey = "statement"
)

var (
	// AllowedImageTypes contains the allowed MIME types for image uploads
	AllowedImageTypes = map[string]bool{
		"image/jpeg": true,
		"image/jpg":  true,
		"image/png":  true,
		"image/gif":  true,
		"image/webp": true,
	}
	// AllowedImageExtensions contains the allowed file extensions for image uploads
	AllowedImageExtensions = map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".gif":  true,
		".webp": true,
	}

	// AllowedExcelTypes contains the allowed MIME types for Excel uploads
	AllowedExcelTypes = map[string]bool{
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": true, // .xlsx
		"application/vnd.ms-excel": true, // .xls
		// Some clients may upload Excel with a generic content type.
		"application/octet-stream": true,
	}
	// AllowedExcelExtensions contains the allowed file extensions for Excel uploads
	AllowedExcelExtensions = map[string]bool{
		".xlsx": true,
		".xls":  true,
	}
)

// UploadValidationConfig defines validation rules for file uploads.
type UploadValidationConfig struct {
	FormField         string
	ContextKey        string
	MaxFileSize       int64
	AllowedExtensions map[string]bool
	AllowedMIMETypes  map[string]bool
	RequiredLabel     string // used in error messages (e.g. "Image", "Statement")
}

// handleUploadRequest is the unified handler function for file uploads that eliminates code duplication
func handleUploadRequest[Req validation.Validatable, Res any](
	c echo.Context,
	req Req,
	handler HandlerFuncUpload[Req, Res],
	responseHandler ResponseHandler,
	maxFileSize int64,
) error {
	return handleUploadRequestWithConfig(c, req, handler, responseHandler, UploadValidationConfig{
		FormField:         "image",
		ContextKey:        ImageContextKey,
		MaxFileSize:       maxFileSize,
		AllowedExtensions: AllowedImageExtensions,
		AllowedMIMETypes:  AllowedImageTypes,
		RequiredLabel:     "Image",
	})
}

func handleUploadRequestWithConfig[Req validation.Validatable, Res any](
	c echo.Context,
	req Req,
	handler HandlerFuncUpload[Req, Res],
	responseHandler ResponseHandler,
	cfg UploadValidationConfig,
) error {
	start := time.Now()
	method := c.Request().Method
	path := c.Path()
	route := path

	// Get New Relic transaction from context
	txn := newrelic.FromContext(c.Request().Context())
	if txn != nil {
		txn.AddAttribute("handler.name", route)
		// http.method and http.route are already set by nrecho middleware
		responseHandler.AddAttributes(txn, nil)
	}

	// Get context-enhanced logger
	loggerBuilder := middleware.GetLogger(c).With().
		Str("operation", responseHandler.GetOperation()).
		Str("method", method).
		Str("path", path).
		Str("route", route)

	logger := loggerBuilder.Logger()

	logger.Info().Msg("handling file upload request")

	// Parse and validate file upload
	fileValidationStart := time.Now()
	fileHeader, err := c.FormFile(cfg.FormField)
	if err != nil {
		fileValidationDuration := time.Since(fileValidationStart)

		logger.Error().
			Err(err).
			Dur("file_validation_duration", fileValidationDuration).
			Msg("file upload parsing failed")

		if txn != nil {
			txn.NoticeError(nrpkgerrors.Wrap(err))
			txn.AddAttribute("file_validation.status", "failed")
			txn.AddAttribute("file_validation.duration_ms", fileValidationDuration.Milliseconds())
		}

		// Check if it's a "no such file" error
		if strings.Contains(err.Error(), "no such file") {
			requiredLabel := cfg.RequiredLabel
			if requiredLabel == "" {
				requiredLabel = "File"
			}
			return errs.NewBadRequestError(requiredLabel+" file is required", false, nil, []errs.FieldError{
				{Field: cfg.FormField, Error: "is required"},
			}, nil)
		}

		return errs.NewBadRequestError("Failed to parse uploaded file", false, nil, nil, nil)
	}

	// Validate file size
	if fileHeader.Size > cfg.MaxFileSize {
		fileValidationDuration := time.Since(fileValidationStart)

		logger.Error().
			Int64("file_size", fileHeader.Size).
			Int64("max_size", cfg.MaxFileSize).
			Dur("file_validation_duration", fileValidationDuration).
			Msg("file size validation failed")

		if txn != nil {
			txn.NoticeError(errs.NewBadRequestError("File size exceeds maximum allowed size", false, nil, nil, nil))
			txn.AddAttribute("file_validation.status", "failed")
			txn.AddAttribute("file.size_bytes", fileHeader.Size)
			txn.AddAttribute("file.max_size_bytes", cfg.MaxFileSize)
			txn.AddAttribute("file_validation.duration_ms", fileValidationDuration.Milliseconds())
		}

		return errs.NewBadRequestError("File size exceeds maximum allowed size", false, nil, []errs.FieldError{
			{Field: cfg.FormField, Error: "file size exceeds maximum allowed size"},
		}, nil)
	}

	// Validate file type by extension
	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
	if cfg.AllowedExtensions != nil && !cfg.AllowedExtensions[ext] {
		fileValidationDuration := time.Since(fileValidationStart)

		logger.Error().
			Str("filename", fileHeader.Filename).
			Str("extension", ext).
			Dur("file_validation_duration", fileValidationDuration).
			Msg("file extension validation failed")

		if txn != nil {
			txn.NoticeError(errs.NewBadRequestError("Invalid file type", false, nil, nil, nil))
			txn.AddAttribute("file_validation.status", "failed")
			txn.AddAttribute("file.filename", fileHeader.Filename)
			txn.AddAttribute("file.extension", ext)
			txn.AddAttribute("file_validation.duration_ms", fileValidationDuration.Milliseconds())
		}

		return errs.NewBadRequestError("Invalid file type", false, nil, []errs.FieldError{
			{Field: cfg.FormField, Error: "invalid file type"},
		}, nil)
	}

	// Validate MIME type
	contentType := fileHeader.Header.Get("Content-Type")
	if contentType == "" {
		// Try to detect MIME type from extension if Content-Type is not provided
		detectedType := mime.TypeByExtension(ext)
		if detectedType != "" {
			contentType = detectedType
		}
	}

	if contentType != "" {
		// Normalize content type (remove parameters like charset)
		mediaType, _, err := mime.ParseMediaType(contentType)
		if err == nil {
			contentType = mediaType
		}

		if cfg.AllowedMIMETypes != nil && !cfg.AllowedMIMETypes[contentType] {
			fileValidationDuration := time.Since(fileValidationStart)

			logger.Error().
				Str("filename", fileHeader.Filename).
				Str("content_type", contentType).
				Dur("file_validation_duration", fileValidationDuration).
				Msg("file MIME type validation failed")

			if txn != nil {
				txn.NoticeError(errs.NewBadRequestError("Invalid file type", false, nil, nil, nil))
				txn.AddAttribute("file_validation.status", "failed")
				txn.AddAttribute("file.filename", fileHeader.Filename)
				txn.AddAttribute("file.content_type", contentType)
				txn.AddAttribute("file_validation.duration_ms", fileValidationDuration.Milliseconds())
			}

			return errs.NewBadRequestError("Invalid file type", false, nil, []errs.FieldError{
				{Field: cfg.FormField, Error: "invalid file type"},
			}, nil)
		}
	}

	// Store file in context
	c.Set(cfg.ContextKey, fileHeader)

	fileValidationDuration := time.Since(fileValidationStart)
	if txn != nil {
		txn.AddAttribute("file_validation.status", "success")
		txn.AddAttribute("file.filename", fileHeader.Filename)
		txn.AddAttribute("file.size_bytes", fileHeader.Size)
		txn.AddAttribute("file.content_type", contentType)
		txn.AddAttribute("file_validation.duration_ms", fileValidationDuration.Milliseconds())
	}

	logger.Debug().
		Str("filename", fileHeader.Filename).
		Int64("file_size", fileHeader.Size).
		Str("content_type", contentType).
		Dur("file_validation_duration", fileValidationDuration).
		Msg("file validation successful")

	// Validation with observability (for request struct)
	validationStart := time.Now()
	if err := validation.BindAndValidate(c, req); err != nil {
		validationDuration := time.Since(validationStart)

		logger.Error().
			Err(err).
			Dur("validation_duration", validationDuration).
			Msg("request validation failed")

		if txn != nil {
			txn.NoticeError(nrpkgerrors.Wrap(err))
			txn.AddAttribute("validation.status", "failed")
			txn.AddAttribute("validation.duration_ms", validationDuration.Milliseconds())
		}
		return err
	}

	validationDuration := time.Since(validationStart)
	if txn != nil {
		txn.AddAttribute("validation.status", "success")
		txn.AddAttribute("validation.duration_ms", validationDuration.Milliseconds())
	}

	logger.Debug().
		Dur("validation_duration", validationDuration).
		Msg("request validation successful")

	// Execute handler with observability
	handlerStart := time.Now()
	result, err := handler(c, req)
	handlerDuration := time.Since(handlerStart)

	if err != nil {
		totalDuration := time.Since(start)

		logger.Error().
			Err(err).
			Dur("handler_duration", handlerDuration).
			Dur("total_duration", totalDuration).
			Msg("handler execution failed")

		if txn != nil {
			txn.NoticeError(nrpkgerrors.Wrap(err))
			txn.AddAttribute("handler.status", "error")
			txn.AddAttribute("handler.duration_ms", handlerDuration.Milliseconds())
			txn.AddAttribute("total.duration_ms", totalDuration.Milliseconds())
		}
		return err
	}

	totalDuration := time.Since(start)

	// Record success metrics and tracing
	if txn != nil {
		txn.AddAttribute("handler.status", "success")
		txn.AddAttribute("handler.duration_ms", handlerDuration.Milliseconds())
		txn.AddAttribute("total.duration_ms", totalDuration.Milliseconds())
		responseHandler.AddAttributes(txn, result)
	}

	logger.Info().
		Dur("handler_duration", handlerDuration).
		Dur("validation_duration", validationDuration).
		Dur("file_validation_duration", fileValidationDuration).
		Dur("total_duration", totalDuration).
		Msg("file upload request completed successfully")

	return responseHandler.Handle(c, result)
}

// HandleUpload wraps a file upload handler with validation, error handling, logging, metrics, and tracing
func HandleUpload[Req validation.Validatable, Res any](
	h Handler,
	handler HandlerFuncUpload[Req, Res],
	status int,
	req Req,
) echo.HandlerFunc {
	return HandleUploadWithMaxSize(h, handler, status, req, DefaultMaxFileSize)
}

// HandleUploadWithMaxSize wraps a file upload handler with validation, error handling, logging, metrics, and tracing
// and allows specifying a custom maximum file size
func HandleUploadWithMaxSize[Req validation.Validatable, Res any](
	h Handler,
	handler HandlerFuncUpload[Req, Res],
	status int,
	req Req,
	maxFileSize int64,
) echo.HandlerFunc {
	return func(c echo.Context) error {
		return handleUploadRequest(c, req, handler, JSONResponseHandler{status: status}, maxFileSize)
	}
}

// HandleUploadStatementExcel wraps an Excel statement upload handler.
// It expects the multipart form file field to be named "statement" and stores it in context under StatementContextKey.
func HandleUploadStatementExcel[Req validation.Validatable, Res any](
	h Handler,
	handler HandlerFuncUpload[Req, Res],
	status int,
	req Req,
) echo.HandlerFunc {
	return HandleUploadStatementExcelWithMaxSize(h, handler, status, req, DefaultMaxFileSize)
}

func HandleUploadStatementExcelWithMaxSize[Req validation.Validatable, Res any](
	h Handler,
	handler HandlerFuncUpload[Req, Res],
	status int,
	req Req,
	maxFileSize int64,
) echo.HandlerFunc {
	return func(c echo.Context) error {
		return handleUploadRequestWithConfig(c, req, handler, JSONResponseHandler{status: status}, UploadValidationConfig{
			FormField:         "statement",
			ContextKey:        StatementContextKey,
			MaxFileSize:       maxFileSize,
			AllowedExtensions: AllowedExcelExtensions,
			AllowedMIMETypes:  AllowedExcelTypes,
			RequiredLabel:     "Statement",
		})
	}
}
