package database

import (
	"time"

	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

func AutoMigrate(db *gorm.DB) error {
	// Disable foreign key checks during migration to avoid order dependency issues
	db.Exec("SET FOREIGN_KEY_CHECKS = 0")
	defer db.Exec("SET FOREIGN_KEY_CHECKS = 1")

	return db.AutoMigrate(
		// User related tables (no dependencies)
		&model.User{},
		&model.UserProfile{},
		&model.UserCertificate{},
		&model.UserPreference{},

		// System tables (no dependencies)
		&model.Admin{},
		&model.MajorDictionary{},
		&model.RegionDictionary{},

		// Position related tables (no dependencies)
		&model.Position{},
		&model.Announcement{},
		&model.ListPage{},

		// Junction tables (depend on Position and Announcement)
		&model.PositionAnnouncement{},

		// User behavior tables (depend on User and Position)
		&model.UserFavorite{},
		&model.UserView{},
		&model.UserNotification{},

		// Crawler related tables
		&model.CrawlTask{},
		&model.CrawlLog{},

		// Fenbi related tables
		&model.FenbiCredential{},
		&model.FenbiCategory{},
		&model.FenbiAnnouncement{},

		// LLM config table
		&model.LLMConfig{},
	)
}

func CreateIndexes(db *gorm.DB) error {
	// Add composite indexes for frequently used queries
	// Note: Most indexes are already defined in the SQL schema, this is for additional indexes

	// Position search indexes (already in schema, skip if exists)
	db.Exec("CREATE INDEX IF NOT EXISTS idx_what_positions_search ON what_positions(exam_type, work_location_province, education_min, status)")

	// User favorites composite index (already in schema as unique key)
	db.Exec("CREATE UNIQUE INDEX IF NOT EXISTS uk_user_position ON what_user_favorites(user_id, position_id)")

	// User views index for recent views
	db.Exec("CREATE INDEX IF NOT EXISTS idx_what_user_views_recent ON what_user_views(user_id, view_time DESC)")

	return nil
}

func CreateFullTextIndexes(db *gorm.DB) error {
	// Create FULLTEXT indexes for MySQL full-text search
	// Note: These indexes support Chinese text search when using ngram parser
	// Note: These might already exist in the schema, errors are ignored

	// Position full-text search index
	db.Exec("ALTER TABLE what_positions ADD FULLTEXT INDEX ft_position_name (position_name) WITH PARSER ngram")
	db.Exec("ALTER TABLE what_positions ADD FULLTEXT INDEX ft_department_name (department_name) WITH PARSER ngram")
	db.Exec("ALTER TABLE what_positions ADD FULLTEXT INDEX ft_position_search (position_name, department_name) WITH PARSER ngram")

	// Announcement full-text search index
	db.Exec("ALTER TABLE what_announcements ADD FULLTEXT INDEX ft_announcement_title (title) WITH PARSER ngram")
	db.Exec("ALTER TABLE what_announcements ADD FULLTEXT INDEX ft_announcement_content (content) WITH PARSER ngram")
	db.Exec("ALTER TABLE what_announcements ADD FULLTEXT INDEX ft_announcement_search (title, content) WITH PARSER ngram")

	return nil
}

// SeedFenbiCategories inserts initial Fenbi category data if the table is empty
func SeedFenbiCategories(db *gorm.DB) error {
	var count int64
	if err := db.Model(&model.FenbiCategory{}).Count(&count).Error; err != nil {
		return err
	}

	// If categories already exist, skip seeding
	if count > 0 {
		return nil
	}

	now := time.Now()
	categories := []model.FenbiCategory{
		// Region categories
		{CategoryType: "region", Code: "all", Name: "全部", FenbiParamID: "", SortOrder: 0, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "national", Name: "国家级机构", FenbiParamID: "4012", SortOrder: 1, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "anhui", Name: "安徽", FenbiParamID: "1", SortOrder: 2, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "beijing", Name: "北京", FenbiParamID: "159", SortOrder: 3, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "chongqing", Name: "重庆", FenbiParamID: "180", SortOrder: 4, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "fujian", Name: "福建", FenbiParamID: "223", SortOrder: 5, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "guangdong", Name: "广东", FenbiParamID: "336", SortOrder: 6, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "gansu", Name: "甘肃", FenbiParamID: "557", SortOrder: 7, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "guangxi", Name: "广西", FenbiParamID: "683", SortOrder: 8, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "guizhou", Name: "贵州", FenbiParamID: "836", SortOrder: 9, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "hebei", Name: "河北", FenbiParamID: "947", SortOrder: 10, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "hubei", Name: "湖北", FenbiParamID: "1157", SortOrder: 11, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "heilongjiang", Name: "黑龙江", FenbiParamID: "1307", SortOrder: 12, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "henan", Name: "河南", FenbiParamID: "1480", SortOrder: 13, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "hainan", Name: "海南", FenbiParamID: "1694", SortOrder: 14, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "hunan", Name: "湖南", FenbiParamID: "1723", SortOrder: 15, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "jilin", Name: "吉林", FenbiParamID: "1887", SortOrder: 16, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "jiangsu", Name: "江苏", FenbiParamID: "1978", SortOrder: 17, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "jiangxi", Name: "江西", FenbiParamID: "2130", SortOrder: 18, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "liaoning", Name: "辽宁", FenbiParamID: "2267", SortOrder: 19, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "neimenggu", Name: "内蒙古", FenbiParamID: "2416", SortOrder: 20, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "ningxia", Name: "宁夏", FenbiParamID: "2551", SortOrder: 21, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "qinghai", Name: "青海", FenbiParamID: "2589", SortOrder: 22, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "sichuan", Name: "四川", FenbiParamID: "2650", SortOrder: 23, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "shandong", Name: "山东", FenbiParamID: "2894", SortOrder: 24, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "shanghai", Name: "上海", FenbiParamID: "3091", SortOrder: 25, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "shanxi", Name: "山西", FenbiParamID: "3114", SortOrder: 26, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "shaanxi", Name: "陕西", FenbiParamID: "3268", SortOrder: 27, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "tianjin", Name: "天津", FenbiParamID: "3406", SortOrder: 28, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "xinjiang", Name: "新疆", FenbiParamID: "3428", SortOrder: 29, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "xizang", Name: "西藏", FenbiParamID: "3559", SortOrder: 30, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "yunnan", Name: "云南", FenbiParamID: "3648", SortOrder: 31, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "region", Code: "zhejiang", Name: "浙江", FenbiParamID: "3818", SortOrder: 32, IsEnabled: true, CreatedAt: now, UpdatedAt: now},

		// Exam type categories - matching website order
		{CategoryType: "exam_type", Code: "shengkao", Name: "省考", FenbiParamID: "1", SortOrder: 1, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "exam_type", Code: "guokao", Name: "国考", FenbiParamID: "2", SortOrder: 2, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "exam_type", Code: "junduiwenzhi", Name: "军队文职", FenbiParamID: "3", SortOrder: 3, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "exam_type", Code: "xuandiao", Name: "选调", FenbiParamID: "4", SortOrder: 4, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "exam_type", Code: "shiyedanwei", Name: "事业单位", FenbiParamID: "5", SortOrder: 5, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "exam_type", Code: "daxueshengcunguan", Name: "大学生村官", FenbiParamID: "6", SortOrder: 6, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "exam_type", Code: "sanzhiyifu", Name: "三支一扶", FenbiParamID: "7", SortOrder: 7, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "exam_type", Code: "lianxuan", Name: "遴选", FenbiParamID: "8", SortOrder: 8, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "exam_type", Code: "zhaojing", Name: "招警", FenbiParamID: "9", SortOrder: 9, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "exam_type", Code: "guoqi", Name: "国企", FenbiParamID: "10", SortOrder: 10, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "exam_type", Code: "jiaoshi", Name: "教师", FenbiParamID: "11", SortOrder: 11, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "exam_type", Code: "yiliao", Name: "医疗", FenbiParamID: "12", SortOrder: 12, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "exam_type", Code: "yinhang", Name: "银行", FenbiParamID: "13", SortOrder: 13, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "exam_type", Code: "qita", Name: "其他", FenbiParamID: "14", SortOrder: 14, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "exam_type", Code: "nongxinshe", Name: "农信社", FenbiParamID: "15", SortOrder: 15, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "exam_type", Code: "paiqian", Name: "派遣/临时/购买服务等", FenbiParamID: "16", SortOrder: 16, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "exam_type", Code: "liankao", Name: "联考/统考", FenbiParamID: "17", SortOrder: 17, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "exam_type", Code: "shequ", Name: "社区工作者", FenbiParamID: "18", SortOrder: 18, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "exam_type", Code: "gaoxiao", Name: "高校", FenbiParamID: "19", SortOrder: 19, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "exam_type", Code: "gongwuyuandanzhao", Name: "公务员单招", FenbiParamID: "20", SortOrder: 20, IsEnabled: true, CreatedAt: now, UpdatedAt: now},

		// Year categories
		{CategoryType: "year", Code: "2026", Name: "2026", FenbiParamID: "", SortOrder: 1, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "year", Code: "2025", Name: "2025", FenbiParamID: "", SortOrder: 2, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "year", Code: "2024", Name: "2024", FenbiParamID: "", SortOrder: 3, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "year", Code: "2023", Name: "2023", FenbiParamID: "", SortOrder: 4, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "year", Code: "2022", Name: "2022", FenbiParamID: "", SortOrder: 5, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
		{CategoryType: "year", Code: "2021", Name: "2021", FenbiParamID: "", SortOrder: 6, IsEnabled: true, CreatedAt: now, UpdatedAt: now},
	}

	return db.CreateInBatches(categories, 100).Error
}
