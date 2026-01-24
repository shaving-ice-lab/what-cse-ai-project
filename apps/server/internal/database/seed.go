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
			Nickname:     "超级管理员",
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
		// 直辖市 (Level 1)
		{Code: "110000", Name: "北京市", Level: 1},
		{Code: "120000", Name: "天津市", Level: 1},
		{Code: "310000", Name: "上海市", Level: 1},
		{Code: "500000", Name: "重庆市", Level: 1},
		// 省份 (Level 1)
		{Code: "130000", Name: "河北省", Level: 1},
		{Code: "140000", Name: "山西省", Level: 1},
		{Code: "150000", Name: "内蒙古自治区", Level: 1},
		{Code: "210000", Name: "辽宁省", Level: 1},
		{Code: "220000", Name: "吉林省", Level: 1},
		{Code: "230000", Name: "黑龙江省", Level: 1},
		{Code: "320000", Name: "江苏省", Level: 1},
		{Code: "330000", Name: "浙江省", Level: 1},
		{Code: "340000", Name: "安徽省", Level: 1},
		{Code: "350000", Name: "福建省", Level: 1},
		{Code: "360000", Name: "江西省", Level: 1},
		{Code: "370000", Name: "山东省", Level: 1},
		{Code: "410000", Name: "河南省", Level: 1},
		{Code: "420000", Name: "湖北省", Level: 1},
		{Code: "430000", Name: "湖南省", Level: 1},
		{Code: "440000", Name: "广东省", Level: 1},
		{Code: "450000", Name: "广西壮族自治区", Level: 1},
		{Code: "460000", Name: "海南省", Level: 1},
		{Code: "510000", Name: "四川省", Level: 1},
		{Code: "520000", Name: "贵州省", Level: 1},
		{Code: "530000", Name: "云南省", Level: 1},
		{Code: "540000", Name: "西藏自治区", Level: 1},
		{Code: "610000", Name: "陕西省", Level: 1},
		{Code: "620000", Name: "甘肃省", Level: 1},
		{Code: "630000", Name: "青海省", Level: 1},
		{Code: "640000", Name: "宁夏回族自治区", Level: 1},
		{Code: "650000", Name: "新疆维吾尔自治区", Level: 1},
		// 示例城市 (Level 2)
		{Code: "110100", Name: "北京市", ParentCode: "110000", Level: 2},
		{Code: "440100", Name: "广州市", ParentCode: "440000", Level: 2},
		{Code: "440300", Name: "深圳市", ParentCode: "440000", Level: 2},
		{Code: "320100", Name: "南京市", ParentCode: "320000", Level: 2},
		{Code: "320500", Name: "苏州市", ParentCode: "320000", Level: 2},
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
		// 一级学科门类 (Level 1)
		{Code: "01", Name: "哲学", Category: "哲学", Level: 1},
		{Code: "02", Name: "经济学", Category: "经济学", Level: 1},
		{Code: "03", Name: "法学", Category: "法学", Level: 1},
		{Code: "04", Name: "教育学", Category: "教育学", Level: 1},
		{Code: "05", Name: "文学", Category: "文学", Level: 1},
		{Code: "06", Name: "历史学", Category: "历史学", Level: 1},
		{Code: "07", Name: "理学", Category: "理学", Level: 1},
		{Code: "08", Name: "工学", Category: "工学", Level: 1},
		{Code: "09", Name: "农学", Category: "农学", Level: 1},
		{Code: "10", Name: "医学", Category: "医学", Level: 1},
		{Code: "11", Name: "军事学", Category: "军事学", Level: 1},
		{Code: "12", Name: "管理学", Category: "管理学", Level: 1},
		{Code: "13", Name: "艺术学", Category: "艺术学", Level: 1},
		// 二级学科类 (Level 2)
		{Code: "0809", Name: "计算机类", Category: "工学", ParentCode: "08", Level: 2},
		{Code: "1202", Name: "工商管理类", Category: "管理学", ParentCode: "12", Level: 2},
		// 具体专业 (Level 3)
		{Code: "020301", Name: "金融学", Category: "经济学", ParentCode: "02", Level: 3},
		{Code: "020302", Name: "金融工程", Category: "经济学", ParentCode: "02", Level: 3},
		{Code: "020303", Name: "保险学", Category: "经济学", ParentCode: "02", Level: 3},
		{Code: "030101", Name: "法学", Category: "法学", ParentCode: "03", Level: 3},
		{Code: "030102", Name: "知识产权", Category: "法学", ParentCode: "03", Level: 3},
		{Code: "050101", Name: "汉语言文学", Category: "文学", ParentCode: "05", Level: 3},
		{Code: "050201", Name: "英语", Category: "文学", ParentCode: "05", Level: 3},
		{Code: "080901", Name: "计算机科学与技术", Category: "工学", ParentCode: "0809", Level: 3},
		{Code: "080902", Name: "软件工程", Category: "工学", ParentCode: "0809", Level: 3},
		{Code: "080903", Name: "网络工程", Category: "工学", ParentCode: "0809", Level: 3},
		{Code: "080904", Name: "信息安全", Category: "工学", ParentCode: "0809", Level: 3},
		{Code: "120201", Name: "工商管理", Category: "管理学", ParentCode: "1202", Level: 3},
		{Code: "120203", Name: "会计学", Category: "管理学", ParentCode: "1202", Level: 3},
		{Code: "120402", Name: "行政管理", Category: "管理学", ParentCode: "12", Level: 3},
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
