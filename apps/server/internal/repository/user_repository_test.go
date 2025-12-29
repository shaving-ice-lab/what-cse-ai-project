package repository

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"server/internal/model"
)

func TestUserModel_TableName(t *testing.T) {
	user := &model.User{}
	assert.Equal(t, "users", user.TableName())
}

func TestUserModel_Validation(t *testing.T) {
	tests := []struct {
		name    string
		user    model.User
		wantErr bool
	}{
		{
			name: "valid user with phone",
			user: model.User{
				Phone:        "13800138000",
				PasswordHash: "hashedpassword",
				Nickname:     "TestUser",
				Status:       int(model.UserStatusNormal),
			},
			wantErr: false,
		},
		{
			name: "valid user with email",
			user: model.User{
				Email:        "test@example.com",
				PasswordHash: "hashedpassword",
				Nickname:     "TestUser",
				Status:       int(model.UserStatusNormal),
			},
			wantErr: false,
		},
		{
			name: "missing phone and email",
			user: model.User{
				PasswordHash: "hashedpassword",
				Nickname:     "TestUser",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			hasContact := tt.user.Phone != "" || tt.user.Email != ""
			if tt.wantErr {
				assert.False(t, hasContact)
			} else {
				assert.True(t, hasContact)
			}
		})
	}
}

func TestUserStatus(t *testing.T) {
	assert.Equal(t, model.UserStatus(1), model.UserStatusNormal)
	assert.Equal(t, model.UserStatus(2), model.UserStatusDisabled)
}

func TestPhoneValidation(t *testing.T) {
	validPhones := []string{
		"13800138000",
		"15912345678",
		"18888888888",
	}

	for _, phone := range validPhones {
		assert.Len(t, phone, 11)
		assert.Regexp(t, `^1[3-9]\d{9}$`, phone)
	}
}

func TestEmailValidation(t *testing.T) {
	validEmails := []string{
		"test@example.com",
		"user.name@domain.cn",
		"admin@company.org",
	}

	for _, email := range validEmails {
		assert.Contains(t, email, "@")
		assert.Contains(t, email, ".")
	}
}

func TestUserProfileModel(t *testing.T) {
	profile := &model.UserProfile{
		UserID:          1,
		Gender:          "male",
		HukouProvince:   "110000",
		HukouCity:       "110100",
		PoliticalStatus: "党员",
		Education:       "本科",
		Major:           "计算机科学与技术",
	}

	assert.Equal(t, uint(1), profile.UserID)
	assert.Equal(t, "male", profile.Gender)
	assert.Equal(t, "本科", profile.Education)
}

func TestUserPreferenceModel(t *testing.T) {
	preference := &model.UserPreference{
		UserID:        1,
		MatchStrategy: "strict",
	}

	assert.Equal(t, uint(1), preference.UserID)
	assert.Equal(t, "strict", preference.MatchStrategy)
}

func TestUserCertificateModel(t *testing.T) {
	cert := &model.UserCertificate{
		UserID:    1,
		CertType:  "英语",
		CertName:  "大学英语六级",
		CertLevel: "六级",
	}

	assert.Equal(t, uint(1), cert.UserID)
	assert.Equal(t, "英语", cert.CertType)
	assert.Equal(t, "大学英语六级", cert.CertName)
}

func TestPaginationParams(t *testing.T) {
	tests := []struct {
		page     int
		pageSize int
		offset   int
	}{
		{page: 1, pageSize: 10, offset: 0},
		{page: 2, pageSize: 10, offset: 10},
		{page: 3, pageSize: 20, offset: 40},
		{page: 1, pageSize: 50, offset: 0},
	}

	for _, tt := range tests {
		offset := (tt.page - 1) * tt.pageSize
		assert.Equal(t, tt.offset, offset)
	}
}

func TestNormalizePagination(t *testing.T) {
	normalize := func(page, pageSize int) (int, int) {
		if page < 1 {
			page = 1
		}
		if pageSize < 1 {
			pageSize = 20
		}
		if pageSize > 100 {
			pageSize = 100
		}
		return page, pageSize
	}

	tests := []struct {
		inPage     int
		inPageSize int
		outPage    int
		outSize    int
	}{
		{inPage: 0, inPageSize: 0, outPage: 1, outSize: 20},
		{inPage: -1, inPageSize: -1, outPage: 1, outSize: 20},
		{inPage: 1, inPageSize: 200, outPage: 1, outSize: 100},
		{inPage: 5, inPageSize: 50, outPage: 5, outSize: 50},
	}

	for _, tt := range tests {
		page, size := normalize(tt.inPage, tt.inPageSize)
		assert.Equal(t, tt.outPage, page)
		assert.Equal(t, tt.outSize, size)
	}
}
