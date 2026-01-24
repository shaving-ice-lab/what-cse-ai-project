package database

import (
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
