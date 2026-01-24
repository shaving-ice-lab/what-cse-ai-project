package scheduler

import (
	"encoding/json"

	"github.com/hibiken/asynq"
)

// Task type constants
const (
	TypeListMonitor       = "crawler:list_monitor"
	TypeListDiscovery     = "crawler:list_discovery"
	TypeAnnouncementCrawl = "crawler:announcement"
	TypePositionExtract   = "crawler:positions"
	TypeScheduledMonitor  = "crawler:scheduled_monitor"
)

// ListMonitorPayload holds the payload for list monitor task
type ListMonitorPayload struct {
	ListPageIDs []uint `json:"list_page_ids,omitempty"`
}

// NewListMonitorTask creates a new list monitor task
func NewListMonitorTask(listPageIDs []uint) (*asynq.Task, error) {
	payload, err := json.Marshal(ListMonitorPayload{ListPageIDs: listPageIDs})
	if err != nil {
		return nil, err
	}
	return asynq.NewTask(TypeListMonitor, payload), nil
}

// ListDiscoveryPayload holds the payload for list discovery task
type ListDiscoveryPayload struct {
	AggregatorURLs []string `json:"aggregator_urls"`
}

// NewListDiscoveryTask creates a new list discovery task
func NewListDiscoveryTask(urls []string) (*asynq.Task, error) {
	payload, err := json.Marshal(ListDiscoveryPayload{AggregatorURLs: urls})
	if err != nil {
		return nil, err
	}
	return asynq.NewTask(TypeListDiscovery, payload), nil
}

// AnnouncementCrawlPayload holds the payload for announcement crawl task
type AnnouncementCrawlPayload struct {
	URL          string `json:"url"`
	Title        string `json:"title"`
	SourceListID uint   `json:"source_list_id"`
	SourceName   string `json:"source_name"`
	Category     string `json:"category,omitempty"`
}

// NewAnnouncementCrawlTask creates a new announcement crawl task
func NewAnnouncementCrawlTask(payload *AnnouncementCrawlPayload) (*asynq.Task, error) {
	data, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}
	return asynq.NewTask(TypeAnnouncementCrawl, data), nil
}

// PositionExtractPayload holds the payload for position extract task
type PositionExtractPayload struct {
	AnnouncementID uint `json:"announcement_id"`
}

// NewPositionExtractTask creates a new position extract task
func NewPositionExtractTask(announcementID uint) (*asynq.Task, error) {
	payload, err := json.Marshal(PositionExtractPayload{AnnouncementID: announcementID})
	if err != nil {
		return nil, err
	}
	return asynq.NewTask(TypePositionExtract, payload), nil
}

// ScheduledMonitorPayload holds the payload for scheduled monitor task
type ScheduledMonitorPayload struct {
	Frequency string `json:"frequency"` // hourly, daily, weekly
}

// NewScheduledMonitorTask creates a new scheduled monitor task
func NewScheduledMonitorTask(frequency string) (*asynq.Task, error) {
	payload, err := json.Marshal(ScheduledMonitorPayload{Frequency: frequency})
	if err != nil {
		return nil, err
	}
	return asynq.NewTask(TypeScheduledMonitor, payload), nil
}

// ParseListMonitorPayload parses the list monitor task payload
func ParseListMonitorPayload(task *asynq.Task) (*ListMonitorPayload, error) {
	var payload ListMonitorPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		return nil, err
	}
	return &payload, nil
}

// ParseListDiscoveryPayload parses the list discovery task payload
func ParseListDiscoveryPayload(task *asynq.Task) (*ListDiscoveryPayload, error) {
	var payload ListDiscoveryPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		return nil, err
	}
	return &payload, nil
}

// ParseAnnouncementCrawlPayload parses the announcement crawl task payload
func ParseAnnouncementCrawlPayload(task *asynq.Task) (*AnnouncementCrawlPayload, error) {
	var payload AnnouncementCrawlPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		return nil, err
	}
	return &payload, nil
}

// ParsePositionExtractPayload parses the position extract task payload
func ParsePositionExtractPayload(task *asynq.Task) (*PositionExtractPayload, error) {
	var payload PositionExtractPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		return nil, err
	}
	return &payload, nil
}

// ParseScheduledMonitorPayload parses the scheduled monitor task payload
func ParseScheduledMonitorPayload(task *asynq.Task) (*ScheduledMonitorPayload, error) {
	var payload ScheduledMonitorPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		return nil, err
	}
	return &payload, nil
}
