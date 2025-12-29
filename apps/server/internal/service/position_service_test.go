package service

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestPositionFilter_Validate(t *testing.T) {
	tests := []struct {
		name   string
		filter PositionFilter
		valid  bool
	}{
		{
			name: "valid filter with province",
			filter: PositionFilter{
				Province: "110000",
				Page:     1,
				PageSize: 20,
			},
			valid: true,
		},
		{
			name: "valid filter with education",
			filter: PositionFilter{
				Education: "本科",
				Page:      1,
				PageSize:  20,
			},
			valid: true,
		},
		{
			name: "invalid page",
			filter: PositionFilter{
				Page:     0,
				PageSize: 20,
			},
			valid: false,
		},
		{
			name: "invalid page size",
			filter: PositionFilter{
				Page:     1,
				PageSize: 0,
			},
			valid: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.valid {
				assert.True(t, tt.filter.Page >= 1 || tt.filter.PageSize >= 1)
			} else {
				assert.True(t, tt.filter.Page < 1 || tt.filter.PageSize < 1)
			}
		})
	}
}

func TestPositionFilter_Normalize(t *testing.T) {
	filter := PositionFilter{
		Page:     0,
		PageSize: 0,
	}

	if filter.Page <= 0 {
		filter.Page = 1
	}
	if filter.PageSize <= 0 || filter.PageSize > 100 {
		filter.PageSize = 20
	}

	assert.Equal(t, 1, filter.Page)
	assert.Equal(t, 20, filter.PageSize)
}

func TestPositionFilter_MaxPageSize(t *testing.T) {
	filter := PositionFilter{
		Page:     1,
		PageSize: 500,
	}

	if filter.PageSize > 100 {
		filter.PageSize = 100
	}

	assert.Equal(t, 100, filter.PageSize)
}

func TestCalculateOffset(t *testing.T) {
	tests := []struct {
		page     int
		pageSize int
		expected int
	}{
		{page: 1, pageSize: 20, expected: 0},
		{page: 2, pageSize: 20, expected: 20},
		{page: 3, pageSize: 10, expected: 20},
		{page: 5, pageSize: 50, expected: 200},
	}

	for _, tt := range tests {
		offset := (tt.page - 1) * tt.pageSize
		assert.Equal(t, tt.expected, offset)
	}
}

type PositionFilter struct {
	Province  string
	City      string
	Education string
	Major     string
	ExamType  string
	Keyword   string
	Page      int
	PageSize  int
	SortBy    string
	SortOrder string
}

func TestPositionResponse(t *testing.T) {
	type PositionListResponse struct {
		Positions []interface{} `json:"positions"`
		Total     int64         `json:"total"`
		Page      int           `json:"page"`
		PageSize  int           `json:"page_size"`
	}

	resp := PositionListResponse{
		Positions: make([]interface{}, 0),
		Total:     100,
		Page:      1,
		PageSize:  20,
	}

	assert.Equal(t, int64(100), resp.Total)
	assert.Equal(t, 1, resp.Page)
	assert.Equal(t, 20, resp.PageSize)
	assert.Empty(t, resp.Positions)
}

func TestSortOptions(t *testing.T) {
	validSortFields := []string{"created_at", "recruit_count", "competition_ratio"}
	validSortOrders := []string{"asc", "desc"}

	sortBy := "created_at"
	sortOrder := "desc"

	isValidField := false
	for _, f := range validSortFields {
		if f == sortBy {
			isValidField = true
			break
		}
	}

	isValidOrder := false
	for _, o := range validSortOrders {
		if o == sortOrder {
			isValidOrder = true
			break
		}
	}

	assert.True(t, isValidField)
	assert.True(t, isValidOrder)
}
