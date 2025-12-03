package utils

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

// NumericToFloat64Ptr converts pgtype.Numeric to *float64
// Returns nil if the value is invalid or conversion fails
func NumericToFloat64Ptr(n pgtype.Numeric) *float64 {
	if !n.Valid {
		return nil
	}
	val, err := n.Float64Value()
	if err != nil || !val.Valid {
		return nil
	}

	return &val.Float64
}

// NumericToFloat64 converts pgtype.Numeric to float64
// Returns 0 if the value is invalid or conversion fails
func NumericToFloat64(n pgtype.Numeric) float64 {
	if !n.Valid {
		return 0
	}
	val, err := n.Float64Value()
	if err != nil || !val.Valid {
		return 0
	}
	return val.Float64
}

// NumericToUintPtr converts pgtype.Numeric to *uint
// Returns nil if the value is invalid or conversion fails
func NumericToUintPtr(n pgtype.Numeric) *uint {
	if !n.Valid {
		return nil
	}
	val, err := n.Float64Value()
	if err != nil || !val.Valid {
		return nil
	}
	uintVal := uint(val.Float64)
	return &uintVal
}

// NumericToUint converts pgtype.Numeric to uint
// Returns 0 if the value is invalid or conversion fails
func NumericToUint(n pgtype.Numeric) uint {
	if !n.Valid {
		return 0
	}
	val, err := n.Float64Value()
	if err != nil || !val.Valid {
		return 0
	}
	return uint(val.Float64)
}

// NumericToIntPtr converts pgtype.Numeric to *int
// Returns nil if the value is invalid or conversion fails
func NumericToIntPtr(n pgtype.Numeric) *int {
	if !n.Valid {
		return nil
	}
	val, err := n.Float64Value()
	if err != nil || !val.Valid {
		return nil
	}
	intVal := int(val.Float64)
	return &intVal
}

// NumericToInt converts pgtype.Numeric to int
// Returns 0 if the value is invalid or conversion fails
func NumericToInt(n pgtype.Numeric) int {
	if !n.Valid {
		return 0
	}
	val, err := n.Float64Value()
	if err != nil || !val.Valid {
		return 0
	}
	return int(val.Float64)
}

// Int4ToIntPtr converts pgtype.Int4 to *int
// Returns nil if the value is invalid
func Int4ToIntPtr(i pgtype.Int4) *int {
	if !i.Valid {
		return nil
	}
	intVal := int(i.Int32)
	return &intVal
}

// Int4ToInt converts pgtype.Int4 to int
// Returns 0 if the value is invalid
func Int4ToInt(i pgtype.Int4) int {
	if !i.Valid {
		return 0
	}
	return int(i.Int32)
}

// Int4ToUintPtr converts pgtype.Int4 to *uint
// Returns nil if the value is invalid
func Int4ToUintPtr(i pgtype.Int4) *uint {
	if !i.Valid {
		return nil
	}
	uintVal := uint(i.Int32)
	return &uintVal
}

// Int4ToUint converts pgtype.Int4 to uint
// Returns 0 if the value is invalid
func Int4ToUint(i pgtype.Int4) uint {
	if !i.Valid {
		return 0
	}
	return uint(i.Int32)
}

// UintPtrToInt4 converts *uint to pgtype.Int4
// Returns invalid Int4 if the pointer is nil
func UintPtrToInt4(u *uint) pgtype.Int4 {
	if u == nil {
		return pgtype.Int4{Valid: false}
	}
	return pgtype.Int4{
		Int32: int32(*u),
		Valid: true,
	}
}

// UintToInt4 converts uint to pgtype.Int4
func UintToInt4(u uint) pgtype.Int4 {
	return pgtype.Int4{
		Int32: int32(u),
		Valid: true,
	}
}

// IntPtrToInt4 converts *int to pgtype.Int4
// Returns invalid Int4 if the pointer is nil
func IntPtrToInt4(i *uint) pgtype.Int4 {
	if i == nil {
		return pgtype.Int4{Valid: false}
	}
	return pgtype.Int4{
		Int32: int32(*i),
		Valid: true,
	}
}

// IntToInt4 converts int to pgtype.Int4
func IntToInt4(i int) pgtype.Int4 {
	return pgtype.Int4{
		Int32: int32(i),
		Valid: true,
	}
}

// TextToStringPtr converts pgtype.Text to *string
// Returns nil if the value is invalid
func TextToStringPtr(t pgtype.Text) *string {
	if !t.Valid {
		return nil
	}
	return &t.String
}

// TextToString converts pgtype.Text to string
// Returns empty string if the value is invalid
func TextToString(t pgtype.Text) string {
	if !t.Valid {
		return ""
	}
	return t.String
}

// UUIDToStringPtr converts pgtype.UUID to *string
// Returns nil if the value is invalid
func UUIDToStringPtr(u pgtype.UUID) *string {
	if !u.Valid {
		return nil
	}
	id := u.String()
	return &id
}

// UUIDToString converts pgtype.UUID to string
// Returns empty string if the value is invalid
func UUIDToString(u pgtype.UUID) string {
	if !u.Valid {
		return ""
	}
	return u.String()
}

// UUIDToUUIDPtr converts pgtype.UUID to *uuid.UUID
// Returns nil if the value is invalid
func UUIDToUUIDPtr(u pgtype.UUID) *uuid.UUID {
	if !u.Valid {
		return nil
	}
	id := uuid.UUID(u.Bytes)
	return &id
}

// UUIDToUUID converts pgtype.UUID to uuid.UUID
// Returns zero UUID if the value is invalid
func UUIDToUUID(u pgtype.UUID) uuid.UUID {
	if !u.Valid {
		return uuid.Nil
	}
	return uuid.UUID(u.Bytes)
}

// BoolToBoolPtr converts pgtype.Bool to *bool
// Returns nil if the value is invalid
func BoolToBoolPtr(b pgtype.Bool) *bool {
	if !b.Valid {
		return nil
	}
	return &b.Bool
}

// BoolToBool converts pgtype.Bool to bool
// Returns false if the value is invalid
func BoolToBool(b pgtype.Bool) bool {
	if !b.Valid {
		return false
	}
	return b.Bool
}

// TimestampToTimePtr converts pgtype.Timestamp to *time.Time
// Returns nil if the value is invalid
func TimestampToTimePtr(t pgtype.Timestamp) *time.Time {
	if !t.Valid {
		return nil
	}
	return &t.Time
}

// TimestampToTime converts pgtype.Timestamp to time.Time
// Returns zero time if the value is invalid
func TimestampToTime(t pgtype.Timestamp) time.Time {
	if !t.Valid {
		return time.Time{}
	}
	return t.Time
}

// TimestampToPgtype converts time.Time to pgtype.Timestamp
func TimestampToPgtype(t time.Time) pgtype.Timestamp {
	return pgtype.Timestamp{
		Time:  t,
		Valid: true,
	}
}

// TimestampPtrToPgtype converts *time.Time to pgtype.Timestamp
// Returns invalid Timestamp if the pointer is nil
func TimestampPtrToPgtype(t *time.Time) pgtype.Timestamp {
	if t == nil {
		return pgtype.Timestamp{Valid: false}
	}
	return pgtype.Timestamp{
		Time:  *t,
		Valid: true,
	}
}

// DateToTimePtr converts pgtype.Date to *time.Time
// Returns nil if the value is invalid
func DateToTimePtr(d pgtype.Date) *time.Time {
	if !d.Valid {
		return nil
	}
	return &d.Time
}

// DateToTime converts pgtype.Date to time.Time
// Returns zero time if the value is invalid
func DateToTime(d pgtype.Date) time.Time {
	if !d.Valid {
		return time.Time{}
	}
	return d.Time
}
func StringPtrToText(s *string) pgtype.Text {
	if s == nil {
		return pgtype.Text{Valid: false}
	}
	return pgtype.Text{String: *s, Valid: true}
}
func BoolPtrToBool(b *bool) pgtype.Bool {
	if b == nil {
		return pgtype.Bool{Valid: false}
	}
	return pgtype.Bool{Bool: *b, Valid: true}
}
func Float64PtrToNum(f *float64) pgtype.Numeric {
	if f == nil {
		return pgtype.Numeric{Valid: false}
	}
	var n pgtype.Numeric
	// Convert float64 to string and scan - Numeric.Scan works better with string representation
	str := fmt.Sprintf("%.2f", *f)
	if err := n.Scan(str); err != nil {
		return pgtype.Numeric{Valid: false}
	}
	// Explicitly set Valid to true - Scan should set it, but ensure it's set
	n.Valid = true
	return n
}
func UUIDToPgtype(id uuid.UUID) pgtype.UUID {
	if id == uuid.Nil {
		return pgtype.UUID{Valid: false}
	}
	return pgtype.UUID{
		Bytes: id,
		Valid: true,
	}
}
func StringToPgtypeText(s string) pgtype.Text {
	if s == "" {
		return pgtype.Text{
			Valid: false,
		}
	}
	return pgtype.Text{
		String: s,
		Valid:  true,
	}
}

func ToPgBool(v *bool) pgtype.Bool {
	if v == nil {
		return pgtype.Bool{Valid: false} // uses DB default
	}
	return pgtype.Bool{
		Bool:  *v,
		Valid: true,
	}
}

func UUIDPtrToPgtype(id *uuid.UUID) pgtype.UUID {
	if id == nil {
		return pgtype.UUID{Valid: false}
	}
	return pgtype.UUID{
		Bytes: *id,
		Valid: true,
	}
}
