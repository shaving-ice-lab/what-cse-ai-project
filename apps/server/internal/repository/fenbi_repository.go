package repository

import (
	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

// FenbiCredentialRepository handles database operations for Fenbi credentials
type FenbiCredentialRepository struct {
	db *gorm.DB
}

func NewFenbiCredentialRepository(db *gorm.DB) *FenbiCredentialRepository {
	return &FenbiCredentialRepository{db: db}
}

func (r *FenbiCredentialRepository) Create(credential *model.FenbiCredential) error {
	return r.db.Create(credential).Error
}

func (r *FenbiCredentialRepository) FindByID(id uint) (*model.FenbiCredential, error) {
	var credential model.FenbiCredential
	err := r.db.First(&credential, id).Error
	if err != nil {
		return nil, err
	}
	return &credential, nil
}

func (r *FenbiCredentialRepository) FindByPhone(phone string) (*model.FenbiCredential, error) {
	var credential model.FenbiCredential
	err := r.db.Where("phone = ?", phone).First(&credential).Error
	if err != nil {
		return nil, err
	}
	return &credential, nil
}

func (r *FenbiCredentialRepository) FindDefault() (*model.FenbiCredential, error) {
	var credential model.FenbiCredential
	err := r.db.Where("is_default = ?", true).First(&credential).Error
	if err != nil {
		// If no default found, return the first credential
		err = r.db.First(&credential).Error
		if err != nil {
			return nil, err
		}
	}
	return &credential, nil
}

func (r *FenbiCredentialRepository) List() ([]model.FenbiCredential, error) {
	var credentials []model.FenbiCredential
	err := r.db.Order("is_default DESC, created_at DESC").Find(&credentials).Error
	return credentials, err
}

func (r *FenbiCredentialRepository) Update(credential *model.FenbiCredential) error {
	return r.db.Save(credential).Error
}

func (r *FenbiCredentialRepository) UpdateLoginStatus(id uint, status int, cookies string) error {
	updates := map[string]interface{}{
		"login_status": status,
		"cookies":      cookies,
	}
	if status == int(model.FenbiLoginStatusLoggedIn) {
		updates["last_login_at"] = gorm.Expr("NOW()")
	}
	return r.db.Model(&model.FenbiCredential{}).Where("id = ?", id).Updates(updates).Error
}

func (r *FenbiCredentialRepository) UpdateLastCheck(id uint) error {
	return r.db.Model(&model.FenbiCredential{}).Where("id = ?", id).Update("last_check_at", gorm.Expr("NOW()")).Error
}

func (r *FenbiCredentialRepository) SetDefault(id uint) error {
	// First, unset all defaults
	if err := r.db.Model(&model.FenbiCredential{}).Where("is_default = ?", true).Update("is_default", false).Error; err != nil {
		return err
	}
	// Then set the specified one as default
	return r.db.Model(&model.FenbiCredential{}).Where("id = ?", id).Update("is_default", true).Error
}

func (r *FenbiCredentialRepository) Delete(id uint) error {
	return r.db.Delete(&model.FenbiCredential{}, id).Error
}

// FenbiCategoryRepository handles database operations for Fenbi categories
type FenbiCategoryRepository struct {
	db *gorm.DB
}

func NewFenbiCategoryRepository(db *gorm.DB) *FenbiCategoryRepository {
	return &FenbiCategoryRepository{db: db}
}

func (r *FenbiCategoryRepository) Create(category *model.FenbiCategory) error {
	return r.db.Create(category).Error
}

func (r *FenbiCategoryRepository) FindByID(id uint) (*model.FenbiCategory, error) {
	var category model.FenbiCategory
	err := r.db.First(&category, id).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

func (r *FenbiCategoryRepository) FindByTypeAndCode(categoryType, code string) (*model.FenbiCategory, error) {
	var category model.FenbiCategory
	err := r.db.Where("category_type = ? AND code = ?", categoryType, code).First(&category).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

func (r *FenbiCategoryRepository) ListByType(categoryType string, enabledOnly bool) ([]model.FenbiCategory, error) {
	var categories []model.FenbiCategory
	query := r.db.Model(&model.FenbiCategory{})
	if categoryType != "" {
		query = query.Where("category_type = ?", categoryType)
	}
	if enabledOnly {
		query = query.Where("is_enabled = ?", true)
	}
	err := query.Order("sort_order ASC").Find(&categories).Error
	return categories, err
}

func (r *FenbiCategoryRepository) ListAll() ([]model.FenbiCategory, error) {
	var categories []model.FenbiCategory
	err := r.db.Order("category_type ASC, sort_order ASC").Find(&categories).Error
	return categories, err
}

func (r *FenbiCategoryRepository) Update(category *model.FenbiCategory) error {
	return r.db.Save(category).Error
}

func (r *FenbiCategoryRepository) UpdateEnabled(id uint, enabled bool) error {
	return r.db.Model(&model.FenbiCategory{}).Where("id = ?", id).Update("is_enabled", enabled).Error
}

func (r *FenbiCategoryRepository) BatchCreate(categories []model.FenbiCategory) error {
	return r.db.CreateInBatches(categories, 100).Error
}

// GetFenbiParamID returns the fenbi_param_id for a given category type and code
func (r *FenbiCategoryRepository) GetFenbiParamID(categoryType, code string) (string, error) {
	var category model.FenbiCategory
	err := r.db.Where("category_type = ? AND code = ?", categoryType, code).First(&category).Error
	if err != nil {
		return "", err
	}
	return category.FenbiParamID, nil
}

// GetRegionParamIDMapping returns a map of region code to fenbi_param_id
func (r *FenbiCategoryRepository) GetRegionParamIDMapping() (map[string]string, error) {
	var categories []model.FenbiCategory
	err := r.db.Where("category_type = ? AND is_enabled = ?", "region", true).Find(&categories).Error
	if err != nil {
		return nil, err
	}

	mapping := make(map[string]string)
	for _, cat := range categories {
		mapping[cat.Code] = cat.FenbiParamID
	}
	return mapping, nil
}

// FenbiAnnouncementRepository handles database operations for Fenbi announcements
type FenbiAnnouncementRepository struct {
	db *gorm.DB
}

func NewFenbiAnnouncementRepository(db *gorm.DB) *FenbiAnnouncementRepository {
	return &FenbiAnnouncementRepository{db: db}
}

func (r *FenbiAnnouncementRepository) Create(announcement *model.FenbiAnnouncement) error {
	return r.db.Create(announcement).Error
}

func (r *FenbiAnnouncementRepository) FindByID(id uint) (*model.FenbiAnnouncement, error) {
	var announcement model.FenbiAnnouncement
	err := r.db.First(&announcement, id).Error
	if err != nil {
		return nil, err
	}
	return &announcement, nil
}

func (r *FenbiAnnouncementRepository) FindByFenbiID(fenbiID string) (*model.FenbiAnnouncement, error) {
	var announcement model.FenbiAnnouncement
	err := r.db.Where("fenbi_id = ?", fenbiID).First(&announcement).Error
	if err != nil {
		return nil, err
	}
	return &announcement, nil
}

func (r *FenbiAnnouncementRepository) ExistsByFenbiID(fenbiID string) (bool, error) {
	var count int64
	err := r.db.Model(&model.FenbiAnnouncement{}).Where("fenbi_id = ?", fenbiID).Count(&count).Error
	return count > 0, err
}

type FenbiAnnouncementListParams struct {
	RegionCode   string
	ExamTypeCode string
	Year         int
	CrawlStatus  *int
	Keyword      string
	Page         int
	PageSize     int
}

func (r *FenbiAnnouncementRepository) List(params *FenbiAnnouncementListParams) ([]model.FenbiAnnouncement, int64, error) {
	var announcements []model.FenbiAnnouncement
	var total int64

	query := r.db.Model(&model.FenbiAnnouncement{})

	if params.RegionCode != "" {
		query = query.Where("region_code = ?", params.RegionCode)
	}
	if params.ExamTypeCode != "" {
		query = query.Where("exam_type_code = ?", params.ExamTypeCode)
	}
	if params.Year > 0 {
		query = query.Where("year = ?", params.Year)
	}
	if params.CrawlStatus != nil {
		query = query.Where("crawl_status = ?", *params.CrawlStatus)
	}
	if params.Keyword != "" {
		query = query.Where("title LIKE ?", "%"+params.Keyword+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (params.Page - 1) * params.PageSize
	if err := query.Offset(offset).Limit(params.PageSize).Order("created_at DESC").Find(&announcements).Error; err != nil {
		return nil, 0, err
	}

	return announcements, total, nil
}

func (r *FenbiAnnouncementRepository) ListPendingDetails(limit int) ([]model.FenbiAnnouncement, error) {
	var announcements []model.FenbiAnnouncement
	err := r.db.Where("crawl_status = ?", model.FenbiCrawlStatusListCrawled).
		Limit(limit).
		Order("created_at ASC").
		Find(&announcements).Error
	return announcements, err
}

func (r *FenbiAnnouncementRepository) Update(announcement *model.FenbiAnnouncement) error {
	return r.db.Save(announcement).Error
}

func (r *FenbiAnnouncementRepository) UpdateCrawlStatus(id uint, status int) error {
	return r.db.Model(&model.FenbiAnnouncement{}).Where("id = ?", id).Update("crawl_status", status).Error
}

func (r *FenbiAnnouncementRepository) UpdateOriginalURL(id uint, originalURL string) error {
	return r.db.Model(&model.FenbiAnnouncement{}).Where("id = ?", id).Updates(map[string]interface{}{
		"original_url": originalURL,
		"crawl_status": model.FenbiCrawlStatusDetailCrawled,
	}).Error
}

// UpdateURLs updates both original_url and final_url for an announcement
func (r *FenbiAnnouncementRepository) UpdateURLs(id uint, originalURL, finalURL string) error {
	return r.db.Model(&model.FenbiAnnouncement{}).Where("id = ?", id).Updates(map[string]interface{}{
		"original_url": originalURL,
		"final_url":    finalURL,
		"crawl_status": model.FenbiCrawlStatusDetailCrawled,
	}).Error
}

// UpdateFinalURL updates only the final_url for an announcement
func (r *FenbiAnnouncementRepository) UpdateFinalURL(id uint, finalURL string) error {
	return r.db.Model(&model.FenbiAnnouncement{}).Where("id = ?", id).Update("final_url", finalURL).Error
}

func (r *FenbiAnnouncementRepository) UpdateSyncStatus(id uint, synced bool, announcementID *uint) error {
	return r.db.Model(&model.FenbiAnnouncement{}).Where("id = ?", id).Updates(map[string]interface{}{
		"sync_to_announcement": synced,
		"announcement_id":      announcementID,
	}).Error
}

func (r *FenbiAnnouncementRepository) BatchCreate(announcements []model.FenbiAnnouncement) (int, error) {
	result := r.db.CreateInBatches(announcements, 100)
	return int(result.RowsAffected), result.Error
}

func (r *FenbiAnnouncementRepository) BatchUpsert(announcements []model.FenbiAnnouncement) (int, error) {
	var created int
	for _, ann := range announcements {
		exists, _ := r.ExistsByFenbiID(ann.FenbiID)
		if !exists {
			if err := r.Create(&ann); err == nil {
				created++
			}
		}
	}
	return created, nil
}

func (r *FenbiAnnouncementRepository) Delete(id uint) error {
	return r.db.Delete(&model.FenbiAnnouncement{}, id).Error
}

func (r *FenbiAnnouncementRepository) GetTotalCount() (int64, error) {
	var count int64
	err := r.db.Model(&model.FenbiAnnouncement{}).Count(&count).Error
	return count, err
}

func (r *FenbiAnnouncementRepository) GetStatsByCrawlStatus() (map[int]int64, error) {
	var results []struct {
		CrawlStatus int
		Count       int64
	}

	err := r.db.Model(&model.FenbiAnnouncement{}).
		Select("crawl_status, COUNT(*) as count").
		Group("crawl_status").
		Find(&results).Error

	if err != nil {
		return nil, err
	}

	stats := make(map[int]int64)
	for _, r := range results {
		stats[r.CrawlStatus] = r.Count
	}
	return stats, nil
}

func (r *FenbiAnnouncementRepository) GetStatsByRegion() (map[string]int64, error) {
	var results []struct {
		RegionCode string
		Count      int64
	}

	err := r.db.Model(&model.FenbiAnnouncement{}).
		Select("region_code, COUNT(*) as count").
		Group("region_code").
		Find(&results).Error

	if err != nil {
		return nil, err
	}

	stats := make(map[string]int64)
	for _, r := range results {
		stats[r.RegionCode] = r.Count
	}
	return stats, nil
}

func (r *FenbiAnnouncementRepository) GetStatsByYear() (map[int]int64, error) {
	var results []struct {
		Year  int
		Count int64
	}

	err := r.db.Model(&model.FenbiAnnouncement{}).
		Select("year, COUNT(*) as count").
		Group("year").
		Find(&results).Error

	if err != nil {
		return nil, err
	}

	stats := make(map[int]int64)
	for _, r := range results {
		stats[r.Year] = r.Count
	}
	return stats, nil
}

// FenbiParseTaskRepository handles database operations for Fenbi parse tasks
type FenbiParseTaskRepository struct {
	db *gorm.DB
}

func NewFenbiParseTaskRepository(db *gorm.DB) *FenbiParseTaskRepository {
	return &FenbiParseTaskRepository{db: db}
}

func (r *FenbiParseTaskRepository) Create(task *model.FenbiParseTask) error {
	return r.db.Create(task).Error
}

func (r *FenbiParseTaskRepository) BatchCreate(tasks []model.FenbiParseTask) (int, error) {
	if len(tasks) == 0 {
		return 0, nil
	}
	result := r.db.CreateInBatches(tasks, 100)
	return int(result.RowsAffected), result.Error
}

func (r *FenbiParseTaskRepository) FindByID(id uint) (*model.FenbiParseTask, error) {
	var task model.FenbiParseTask
	err := r.db.First(&task, id).Error
	if err != nil {
		return nil, err
	}
	return &task, nil
}

func (r *FenbiParseTaskRepository) FindByFenbiID(fenbiID string) (*model.FenbiParseTask, error) {
	var task model.FenbiParseTask
	err := r.db.Where("fenbi_id = ?", fenbiID).First(&task).Error
	if err != nil {
		return nil, err
	}
	return &task, nil
}

func (r *FenbiParseTaskRepository) ExistsByFenbiID(fenbiID string) (bool, error) {
	var count int64
	err := r.db.Model(&model.FenbiParseTask{}).Where("fenbi_id = ?", fenbiID).Count(&count).Error
	return count > 0, err
}

type FenbiParseTaskListParams struct {
	Status   string
	Keyword  string
	Page     int
	PageSize int
}

func (r *FenbiParseTaskRepository) List(params *FenbiParseTaskListParams) ([]model.FenbiParseTask, int64, error) {
	var tasks []model.FenbiParseTask
	var total int64

	query := r.db.Model(&model.FenbiParseTask{})

	if params.Status != "" && params.Status != "all" {
		query = query.Where("status = ?", params.Status)
	}
	if params.Keyword != "" {
		query = query.Where("title LIKE ?", "%"+params.Keyword+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := 0
	limit := 200 // default max
	if params.Page > 0 && params.PageSize > 0 {
		offset = (params.Page - 1) * params.PageSize
		limit = params.PageSize
	}

	if err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&tasks).Error; err != nil {
		return nil, 0, err
	}

	return tasks, total, nil
}

func (r *FenbiParseTaskRepository) Update(task *model.FenbiParseTask) error {
	return r.db.Save(task).Error
}

func (r *FenbiParseTaskRepository) UpdateStatus(id uint, status string, message string) error {
	updates := map[string]interface{}{
		"status":  status,
		"message": message,
	}
	if status == string(model.FenbiParseTaskStatusRunning) || status == string(model.FenbiParseTaskStatusParsing) {
		updates["started_at"] = gorm.Expr("NOW(3)")
	}
	if status == string(model.FenbiParseTaskStatusCompleted) || status == string(model.FenbiParseTaskStatusFailed) || status == string(model.FenbiParseTaskStatusSkipped) {
		updates["completed_at"] = gorm.Expr("NOW(3)")
	}
	return r.db.Model(&model.FenbiParseTask{}).Where("id = ?", id).Updates(updates).Error
}

func (r *FenbiParseTaskRepository) UpdateParseResult(id uint, status string, message string, steps model.JSON, summary model.JSON) error {
	updates := map[string]interface{}{
		"status":               status,
		"message":              message,
		"steps":                steps,
		"parse_result_summary": summary,
		"completed_at":         gorm.Expr("NOW(3)"),
	}
	return r.db.Model(&model.FenbiParseTask{}).Where("id = ?", id).Updates(updates).Error
}

func (r *FenbiParseTaskRepository) Delete(id uint) error {
	return r.db.Delete(&model.FenbiParseTask{}, id).Error
}

func (r *FenbiParseTaskRepository) DeleteAll() error {
	return r.db.Where("1 = 1").Delete(&model.FenbiParseTask{}).Error
}

func (r *FenbiParseTaskRepository) GetStats() (map[string]int64, error) {
	var results []struct {
		Status string
		Count  int64
	}

	err := r.db.Model(&model.FenbiParseTask{}).
		Select("status, COUNT(*) as count").
		Group("status").
		Find(&results).Error

	if err != nil {
		return nil, err
	}

	stats := make(map[string]int64)
	var total int64
	for _, r := range results {
		stats[r.Status] = r.Count
		total += r.Count
	}
	stats["total"] = total
	return stats, nil
}
