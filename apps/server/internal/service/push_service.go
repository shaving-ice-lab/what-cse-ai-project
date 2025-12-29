package service

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type PushService struct {
	jpushAppKey string
	jpushSecret string
	wxAppID     string
	wxAppSecret string
	httpClient  *http.Client
}

type PushConfig struct {
	JPushAppKey string
	JPushSecret string
	WxAppID     string
	WxAppSecret string
}

func NewPushService(config *PushConfig) *PushService {
	return &PushService{
		jpushAppKey: config.JPushAppKey,
		jpushSecret: config.JPushSecret,
		wxAppID:     config.WxAppID,
		wxAppSecret: config.WxAppSecret,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

type JPushPayload struct {
	Platform     interface{}            `json:"platform"`
	Audience     interface{}            `json:"audience"`
	Notification map[string]interface{} `json:"notification,omitempty"`
	Message      *JPushMessage          `json:"message,omitempty"`
	Options      *JPushOptions          `json:"options,omitempty"`
}

type JPushMessage struct {
	MsgContent  string                 `json:"msg_content"`
	Title       string                 `json:"title,omitempty"`
	ContentType string                 `json:"content_type,omitempty"`
	Extras      map[string]interface{} `json:"extras,omitempty"`
}

type JPushOptions struct {
	TimeToLive     int  `json:"time_to_live,omitempty"`
	ApnsProduction bool `json:"apns_production,omitempty"`
}

func (s *PushService) SendToAlias(aliases []string, title, content string, extras map[string]interface{}) error {
	if len(aliases) == 0 {
		return nil
	}

	payload := JPushPayload{
		Platform: "all",
		Audience: map[string]interface{}{
			"alias": aliases,
		},
		Notification: map[string]interface{}{
			"android": map[string]interface{}{
				"alert":  content,
				"title":  title,
				"extras": extras,
			},
			"ios": map[string]interface{}{
				"alert":  content,
				"sound":  "default",
				"extras": extras,
			},
		},
		Options: &JPushOptions{
			TimeToLive:     86400,
			ApnsProduction: true,
		},
	}

	return s.sendJPush(payload)
}

func (s *PushService) SendToAll(title, content string, extras map[string]interface{}) error {
	payload := JPushPayload{
		Platform: "all",
		Audience: "all",
		Notification: map[string]interface{}{
			"android": map[string]interface{}{
				"alert":  content,
				"title":  title,
				"extras": extras,
			},
			"ios": map[string]interface{}{
				"alert":  content,
				"sound":  "default",
				"extras": extras,
			},
		},
		Options: &JPushOptions{
			TimeToLive:     86400,
			ApnsProduction: true,
		},
	}

	return s.sendJPush(payload)
}

func (s *PushService) SendToTags(tags []string, title, content string, extras map[string]interface{}) error {
	if len(tags) == 0 {
		return nil
	}

	payload := JPushPayload{
		Platform: "all",
		Audience: map[string]interface{}{
			"tag": tags,
		},
		Notification: map[string]interface{}{
			"android": map[string]interface{}{
				"alert":  content,
				"title":  title,
				"extras": extras,
			},
			"ios": map[string]interface{}{
				"alert":  content,
				"sound":  "default",
				"extras": extras,
			},
		},
		Options: &JPushOptions{
			TimeToLive:     86400,
			ApnsProduction: true,
		},
	}

	return s.sendJPush(payload)
}

func (s *PushService) sendJPush(payload JPushPayload) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", "https://api.jpush.cn/v3/push", bytes.NewReader(data))
	if err != nil {
		return err
	}

	auth := base64.StdEncoding.EncodeToString([]byte(s.jpushAppKey + ":" + s.jpushSecret))
	req.Header.Set("Authorization", "Basic "+auth)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("jpush request failed with status: %d", resp.StatusCode)
	}

	return nil
}

type WxSubscribeMessage struct {
	ToUser           string                      `json:"touser"`
	TemplateID       string                      `json:"template_id"`
	Page             string                      `json:"page,omitempty"`
	MiniprogramState string                      `json:"miniprogram_state,omitempty"`
	Lang             string                      `json:"lang,omitempty"`
	Data             map[string]WxSubscribeValue `json:"data"`
}

type WxSubscribeValue struct {
	Value string `json:"value"`
}

func (s *PushService) SendWxSubscribeMessage(openID, templateID, page string, data map[string]string) error {
	accessToken, err := s.getWxAccessToken()
	if err != nil {
		return err
	}

	msgData := make(map[string]WxSubscribeValue)
	for k, v := range data {
		msgData[k] = WxSubscribeValue{Value: v}
	}

	msg := WxSubscribeMessage{
		ToUser:           openID,
		TemplateID:       templateID,
		Page:             page,
		MiniprogramState: "formal",
		Lang:             "zh_CN",
		Data:             msgData,
	}

	msgBytes, err := json.Marshal(msg)
	if err != nil {
		return err
	}

	url := fmt.Sprintf("https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=%s", accessToken)
	resp, err := s.httpClient.Post(url, "application/json", bytes.NewReader(msgBytes))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	var result struct {
		ErrCode int    `json:"errcode"`
		ErrMsg  string `json:"errmsg"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return err
	}

	if result.ErrCode != 0 {
		return fmt.Errorf("wx subscribe message failed: %s", result.ErrMsg)
	}

	return nil
}

func (s *PushService) getWxAccessToken() (string, error) {
	url := fmt.Sprintf(
		"https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s",
		s.wxAppID, s.wxAppSecret,
	)

	resp, err := s.httpClient.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var result struct {
		AccessToken string `json:"access_token"`
		ExpiresIn   int    `json:"expires_in"`
		ErrCode     int    `json:"errcode"`
		ErrMsg      string `json:"errmsg"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	if result.ErrCode != 0 {
		return "", fmt.Errorf("get wx access token failed: %s", result.ErrMsg)
	}

	return result.AccessToken, nil
}

func (s *PushService) NotifyNewPosition(userAliases []string, positionName, department string, positionID int) error {
	extras := map[string]interface{}{
		"type":       "position",
		"positionId": positionID,
	}
	title := "新职位推荐"
	content := fmt.Sprintf("%s - %s 有新职位发布，快来查看！", department, positionName)

	return s.SendToAlias(userAliases, title, content, extras)
}

func (s *PushService) NotifyDeadlineReminder(userAliases []string, positionName string, deadline string, positionID int) error {
	extras := map[string]interface{}{
		"type":       "deadline",
		"positionId": positionID,
	}
	title := "报名截止提醒"
	content := fmt.Sprintf("您关注的职位「%s」将于 %s 截止报名，请尽快报名！", positionName, deadline)

	return s.SendToAlias(userAliases, title, content, extras)
}

func (s *PushService) NotifyExamReminder(userAliases []string, examType, examDate string) error {
	extras := map[string]interface{}{
		"type": "exam",
	}
	title := "考试提醒"
	content := fmt.Sprintf("%s 将于 %s 举行，请做好准备！", examType, examDate)

	return s.SendToAlias(userAliases, title, content, extras)
}
