package model

import (
	"time"

	"gorm.io/gorm"
)

type UserCertificate struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	UserID       uint           `gorm:"index;not null" json:"user_id"`
	CertType     string         `gorm:"type:varchar(50);not null" json:"cert_type"`  // 英语证书, 专业资格, 计算机等级
	CertName     string         `gorm:"type:varchar(100);not null" json:"cert_name"` // CET4, CET6, 法律职业资格证
	CertLevel    string         `gorm:"type:varchar(50)" json:"cert_level"`          // 四级, 六级, A证
	ObtainedDate *time.Time     `gorm:"type:date" json:"obtained_date"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

func (UserCertificate) TableName() string {
	return "what_user_certificates"
}

type CertType string

const (
	CertTypeEnglish      CertType = "英语证书"
	CertTypeProfessional CertType = "专业资格"
	CertTypeComputer     CertType = "计算机等级"
	CertTypeOther        CertType = "其他"
)
