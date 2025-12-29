package database

import (
	"time"

	"github.com/what-cse/server/internal/model"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func SeedData(db *gorm.DB) error {
	// Seed admin user
	if err := seedAdmins(db); err != nil {
		return err
	}

	// Seed region dictionary
	if err := seedRegions(db); err != nil {
		return err
	}

	// Seed major dictionary
	if err := seedMajors(db); err != nil {
		return err
	}

	// Seed sample positions (for development/testing)
	if err := seedSamplePositions(db); err != nil {
		return err
	}

	return nil
}

func seedAdmins(db *gorm.DB) error {
	// Check if admin already exists
	var count int64
	db.Model(&model.Admin{}).Count(&count)
	if count > 0 {
		return nil
	}

	// Create default admin password hash
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123456"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	admins := []model.Admin{
		{
			Username:     "admin",
			PasswordHash: string(hashedPassword),
			Role:         "super_admin",
			Status:       1,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		},
	}

	return db.Create(&admins).Error
}

func seedRegions(db *gorm.DB) error {
	var count int64
	db.Model(&model.RegionDictionary{}).Count(&count)
	if count > 0 {
		return nil
	}

	regions := []model.RegionDictionary{
		// 直辖市
		{RegionCode: "110000", Province: "北京市"},
		{RegionCode: "120000", Province: "天津市"},
		{RegionCode: "310000", Province: "上海市"},
		{RegionCode: "500000", Province: "重庆市"},
		// 省份
		{RegionCode: "130000", Province: "河北省"},
		{RegionCode: "140000", Province: "山西省"},
		{RegionCode: "150000", Province: "内蒙古自治区"},
		{RegionCode: "210000", Province: "辽宁省"},
		{RegionCode: "220000", Province: "吉林省"},
		{RegionCode: "230000", Province: "黑龙江省"},
		{RegionCode: "320000", Province: "江苏省"},
		{RegionCode: "330000", Province: "浙江省"},
		{RegionCode: "340000", Province: "安徽省"},
		{RegionCode: "350000", Province: "福建省"},
		{RegionCode: "360000", Province: "江西省"},
		{RegionCode: "370000", Province: "山东省"},
		{RegionCode: "410000", Province: "河南省"},
		{RegionCode: "420000", Province: "湖北省"},
		{RegionCode: "430000", Province: "湖南省"},
		{RegionCode: "440000", Province: "广东省"},
		{RegionCode: "450000", Province: "广西壮族自治区"},
		{RegionCode: "460000", Province: "海南省"},
		{RegionCode: "510000", Province: "四川省"},
		{RegionCode: "520000", Province: "贵州省"},
		{RegionCode: "530000", Province: "云南省"},
		{RegionCode: "540000", Province: "西藏自治区"},
		{RegionCode: "610000", Province: "陕西省"},
		{RegionCode: "620000", Province: "甘肃省"},
		{RegionCode: "630000", Province: "青海省"},
		{RegionCode: "640000", Province: "宁夏回族自治区"},
		{RegionCode: "650000", Province: "新疆维吾尔自治区"},
		// 示例城市
		{RegionCode: "110100", Province: "北京市", City: "北京市"},
		{RegionCode: "440100", Province: "广东省", City: "广州市"},
		{RegionCode: "440300", Province: "广东省", City: "深圳市"},
		{RegionCode: "320100", Province: "江苏省", City: "南京市"},
		{RegionCode: "320500", Province: "江苏省", City: "苏州市"},
	}

	return db.Create(&regions).Error
}

func seedMajors(db *gorm.DB) error {
	var count int64
	db.Model(&model.MajorDictionary{}).Count(&count)
	if count > 0 {
		return nil
	}

	majors := []model.MajorDictionary{
		// 一级学科大类
		{MajorCode: "01", MajorName: "哲学", Category: "哲学"},
		{MajorCode: "02", MajorName: "经济学", Category: "经济学"},
		{MajorCode: "03", MajorName: "法学", Category: "法学"},
		{MajorCode: "04", MajorName: "教育学", Category: "教育学"},
		{MajorCode: "05", MajorName: "文学", Category: "文学"},
		{MajorCode: "06", MajorName: "历史学", Category: "历史学"},
		{MajorCode: "07", MajorName: "理学", Category: "理学"},
		{MajorCode: "08", MajorName: "工学", Category: "工学"},
		{MajorCode: "09", MajorName: "农学", Category: "农学"},
		{MajorCode: "10", MajorName: "医学", Category: "医学"},
		{MajorCode: "11", MajorName: "军事学", Category: "军事学"},
		{MajorCode: "12", MajorName: "管理学", Category: "管理学"},
		{MajorCode: "13", MajorName: "艺术学", Category: "艺术学"},
		// 经济学类
		{MajorCode: "020301", MajorName: "金融学", Category: "经济学"},
		{MajorCode: "020302", MajorName: "金融工程", Category: "经济学"},
		{MajorCode: "020303", MajorName: "保险学", Category: "经济学"},
		{MajorCode: "120203", MajorName: "会计学", Category: "管理学"},
		// 法学类
		{MajorCode: "030101", MajorName: "法学", Category: "法学"},
		{MajorCode: "030102", MajorName: "知识产权", Category: "法学"},
		// 计算机类
		{MajorCode: "080901", MajorName: "计算机科学与技术", Category: "工学"},
		{MajorCode: "080902", MajorName: "软件工程", Category: "工学"},
		{MajorCode: "080903", MajorName: "网络工程", Category: "工学"},
		{MajorCode: "080904", MajorName: "信息安全", Category: "工学"},
		// 管理类
		{MajorCode: "120201", MajorName: "工商管理", Category: "管理学"},
		{MajorCode: "120402", MajorName: "行政管理", Category: "管理学"},
		// 文学类
		{MajorCode: "050101", MajorName: "汉语言文学", Category: "文学"},
		{MajorCode: "050201", MajorName: "英语", Category: "文学"},
	}

	return db.Create(&majors).Error
}

func seedSamplePositions(db *gorm.DB) error {
	var count int64
	db.Model(&model.Position{}).Count(&count)
	if count > 0 {
		return nil
	}

	now := time.Now()
	regStart := now.AddDate(0, 0, 7)
	regEnd := now.AddDate(0, 0, 21)
	examDate := now.AddDate(0, 1, 0)

	positions := []model.Position{
		{
			PositionID:           "GK2024-001-0001",
			PositionName:         "综合管理岗",
			DepartmentCode:       "001",
			DepartmentName:       "国家税务总局北京市税务局",
			DepartmentLevel:      "省级",
			WorkLocationProvince: "110000",
			WorkLocationCity:     "110100",
			RecruitCount:         2,
			ExamType:             "国考",
			EducationMin:         "本科",
			DegreeRequired:       "是",
			MajorCategory:        model.JSONStringArray{"12", "02"},
			MajorSpecific:        model.JSONStringArray{"120203", "020301"},
			MajorUnlimited:       false,
			PoliticalStatus:      "中共党员",
			WorkExpYearsMin:      0,
			AgeMin:               18,
			AgeMax:               35,
			GenderRequired:       "不限",
			HukouRequired:        false,
			RegistrationStart:    &regStart,
			RegistrationEnd:      &regEnd,
			ExamDateWritten:      &examDate,
			ApplicantCount:       0,
			CompetitionRatio:     0,
			ParseConfidence:      100,
			Status:               1,
		},
		{
			PositionID:           "GK2024-001-0002",
			PositionName:         "信息技术岗",
			DepartmentCode:       "002",
			DepartmentName:       "国家税务总局广东省税务局",
			DepartmentLevel:      "省级",
			WorkLocationProvince: "440000",
			WorkLocationCity:     "440100",
			RecruitCount:         3,
			ExamType:             "国考",
			EducationMin:         "本科",
			DegreeRequired:       "是",
			MajorCategory:        model.JSONStringArray{"08"},
			MajorSpecific:        model.JSONStringArray{"080901", "080902", "080903"},
			MajorUnlimited:       false,
			PoliticalStatus:      "不限",
			WorkExpYearsMin:      0,
			AgeMin:               18,
			AgeMax:               35,
			GenderRequired:       "不限",
			HukouRequired:        false,
			RegistrationStart:    &regStart,
			RegistrationEnd:      &regEnd,
			ExamDateWritten:      &examDate,
			ApplicantCount:       0,
			CompetitionRatio:     0,
			ParseConfidence:      100,
			Status:               1,
		},
		{
			PositionID:           "GK2024-001-0003",
			PositionName:         "法律事务岗",
			DepartmentCode:       "003",
			DepartmentName:       "司法部机关",
			DepartmentLevel:      "中央",
			WorkLocationProvince: "110000",
			WorkLocationCity:     "110100",
			RecruitCount:         1,
			ExamType:             "国考",
			EducationMin:         "硕士",
			DegreeRequired:       "是",
			MajorCategory:        model.JSONStringArray{"03"},
			MajorSpecific:        model.JSONStringArray{"030101"},
			MajorUnlimited:       false,
			PoliticalStatus:      "中共党员",
			WorkExpYearsMin:      2,
			AgeMin:               18,
			AgeMax:               35,
			GenderRequired:       "不限",
			HukouRequired:        false,
			RegistrationStart:    &regStart,
			RegistrationEnd:      &regEnd,
			ExamDateWritten:      &examDate,
			ApplicantCount:       0,
			CompetitionRatio:     0,
			ParseConfidence:      100,
			Status:               1,
		},
		{
			PositionID:           "SK2024-GD-0001",
			PositionName:         "行政执法岗",
			DepartmentCode:       "GD001",
			DepartmentName:       "广州市市场监督管理局",
			DepartmentLevel:      "市级",
			WorkLocationProvince: "440000",
			WorkLocationCity:     "440100",
			RecruitCount:         5,
			ExamType:             "省考",
			EducationMin:         "本科",
			DegreeRequired:       "不限",
			MajorUnlimited:       true,
			PoliticalStatus:      "不限",
			WorkExpYearsMin:      0,
			AgeMin:               18,
			AgeMax:               30,
			GenderRequired:       "男",
			HukouRequired:        true,
			HukouProvinces:       model.JSONStringArray{"440000"},
			RegistrationStart:    &regStart,
			RegistrationEnd:      &regEnd,
			ExamDateWritten:      &examDate,
			ApplicantCount:       0,
			CompetitionRatio:     0,
			ParseConfidence:      100,
			Status:               1,
		},
		{
			PositionID:           "SK2024-JS-0001",
			PositionName:         "财务管理岗",
			DepartmentCode:       "JS001",
			DepartmentName:       "南京市财政局",
			DepartmentLevel:      "市级",
			WorkLocationProvince: "320000",
			WorkLocationCity:     "320100",
			RecruitCount:         2,
			ExamType:             "省考",
			EducationMin:         "本科",
			DegreeRequired:       "是",
			MajorCategory:        model.JSONStringArray{"02", "12"},
			MajorSpecific:        model.JSONStringArray{"120203", "120204", "020301"},
			MajorUnlimited:       false,
			PoliticalStatus:      "不限",
			WorkExpYearsMin:      0,
			AgeMin:               18,
			AgeMax:               35,
			GenderRequired:       "不限",
			HukouRequired:        false,
			RegistrationStart:    &regStart,
			RegistrationEnd:      &regEnd,
			ExamDateWritten:      &examDate,
			ApplicantCount:       0,
			CompetitionRatio:     0,
			ParseConfidence:      100,
			Status:               1,
		},
	}

	return db.Create(&positions).Error
}
