package model

import (
	"time"
)

// WechatMPAuthStatus represents the authentication status
type WechatMPAuthStatus string

const (
	WechatMPAuthStatusActive   WechatMPAuthStatus = "active"   // 正常可用
	WechatMPAuthStatusExpiring WechatMPAuthStatus = "expiring" // 即将过期
	WechatMPAuthStatusExpired  WechatMPAuthStatus = "expired"  // 已过期
	WechatMPAuthStatusInvalid  WechatMPAuthStatus = "invalid"  // 无效
)

// WechatMPAuth represents WeChat MP platform authentication info (singleton for admin)
type WechatMPAuth struct {
	ID          uint               `gorm:"primaryKey" json:"id"`
	Token       string             `gorm:"type:varchar(100)" json:"token"`            // 登录token
	Cookies     string             `gorm:"type:text" json:"-"`                        // JSON格式cookies (不返回给前端)
	Fingerprint string             `gorm:"type:varchar(100)" json:"-"`                // 设备指纹 (不返回给前端)
	AccountName string             `gorm:"type:varchar(255)" json:"account_name"`     // 授权的公众号名称
	AccountID   string             `gorm:"type:varchar(100)" json:"account_id"`       // 公众号原始ID
	ExpiresAt   *time.Time         `gorm:"type:datetime" json:"expires_at,omitempty"` // 过期时间
	Status      WechatMPAuthStatus `gorm:"type:varchar(20);default:'active'" json:"status"`
	LastUsedAt  *time.Time         `gorm:"type:datetime" json:"last_used_at,omitempty"` // 最后使用时间
	CreatedAt   time.Time          `json:"created_at"`
	UpdatedAt   time.Time          `json:"updated_at"`
}

func (WechatMPAuth) TableName() string {
	return "what_wechat_mp_auth"
}

// WechatMPAuthResponse is the response for auth status API
type WechatMPAuthResponse struct {
	ID          uint               `json:"id"`
	AccountName string             `json:"account_name"`
	AccountID   string             `json:"account_id"`
	Status      WechatMPAuthStatus `json:"status"`
	StatusText  string             `json:"status_text"`
	ExpiresAt   *time.Time         `json:"expires_at,omitempty"`
	ExpiresIn   int                `json:"expires_in"` // 预计剩余有效时间(小时)
	LastUsedAt  *time.Time         `json:"last_used_at,omitempty"`
	CreatedAt   time.Time          `json:"created_at"`
	Message     string             `json:"message"` // 状态提示信息
}

// ToResponse converts WechatMPAuth to WechatMPAuthResponse
func (a *WechatMPAuth) ToResponse() *WechatMPAuthResponse {
	statusText := "未知"
	message := ""

	switch a.Status {
	case WechatMPAuthStatusActive:
		statusText = "已授权"
		message = "授权正常，可以使用微信API功能"
	case WechatMPAuthStatusExpiring:
		statusText = "即将过期"
		message = "授权即将过期，建议重新扫码授权"
	case WechatMPAuthStatusExpired:
		statusText = "已过期"
		message = "授权已失效，请重新扫码授权"
	case WechatMPAuthStatusInvalid:
		statusText = "无效"
		message = "授权无效，请重新扫码授权"
	}

	// 计算剩余时间（从创建时间算起，假设24小时有效）
	expiresIn := 0
	if a.Status == WechatMPAuthStatusActive || a.Status == WechatMPAuthStatusExpiring {
		elapsed := time.Since(a.CreatedAt)
		remaining := 24*time.Hour - elapsed
		if remaining > 0 {
			expiresIn = int(remaining.Hours())
		}
	}

	return &WechatMPAuthResponse{
		ID:          a.ID,
		AccountName: a.AccountName,
		AccountID:   a.AccountID,
		Status:      a.Status,
		StatusText:  statusText,
		ExpiresAt:   a.ExpiresAt,
		ExpiresIn:   expiresIn,
		LastUsedAt:  a.LastUsedAt,
		CreatedAt:   a.CreatedAt,
		Message:     message,
	}
}

// WechatMPQRCodeResponse is the response for QR code API
type WechatMPQRCodeResponse struct {
	QRCodeURL string `json:"qrcode_url"` // 二维码图片URL或base64
	UUID      string `json:"uuid"`       // 用于轮询登录状态的UUID
	ExpiresIn int    `json:"expires_in"` // 二维码有效期(秒)
}

// WechatMPLoginStatusResponse is the response for login status check
type WechatMPLoginStatusResponse struct {
	Status  string `json:"status"`  // waiting/scanned/confirmed/expired
	Message string `json:"message"` // 状态描述
}
