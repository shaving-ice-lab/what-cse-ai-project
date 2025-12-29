package database

import (
	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		// User related tables
		&model.User{},
		&model.UserProfile{},
		&model.UserCertificate{},
		&model.UserPreference{},

		// Position related tables
		&model.Position{},
		&model.Announcement{},
		&model.PositionAnnouncement{},
		&model.ListPage{},

		// User behavior tables
		&model.UserFavorite{},
		&model.UserView{},
		&model.UserNotification{},

		// System tables
		&model.Admin{},
		&model.MajorDictionary{},
		&model.RegionDictionary{},
	)
}

func CreateIndexes(db *gorm.DB) error {
	// Add composite indexes for frequently used queries
	
	// Position search indexes
	db.Exec("CREATE INDEX IF NOT EXISTS idx_positions_search ON positions(exam_type, work_location_province, education_min, status)")
	
	// User favorites composite index
	db.Exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_user_favorites_unique ON user_favorites(user_id, position_id)")
	
	// User views index for recent views
	db.Exec("CREATE INDEX IF NOT EXISTS idx_user_views_recent ON user_views(user_id, view_time DESC)")
	
	return nil
}
