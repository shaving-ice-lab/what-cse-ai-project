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

	// Seed course categories (learning system)
	if err := seedCourseCategories(db); err != nil {
		return err
	}

	// Seed course content (learning system courses, chapters, knowledge points)
	if err := SeedCourseContent(db); err != nil {
		return err
	}

	// TODO: Uncomment after fixing seed_questions.go syntax errors
	// // Seed questions (question bank for learning system)
	// if err := seedQuestions(db); err != nil {
	// 	return err
	// }

	// // Seed exam papers (real exam and mock papers)
	// if err := seedExamPapers(db); err != nil {
	// 	return err
	// }

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
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
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
			PositionID:          "GK2024-001-0001",
			PositionName:        "综合管理岗",
			DepartmentCode:      "001",
			DepartmentName:      "国家税务总局北京市税务局",
			DepartmentLevel:     "省级",
			Province:            "北京",
			City:                "北京市",
			RecruitCount:        2,
			ExamType:            "国考",
			Education:           "本科",
			Degree:              "学士",
			MajorCategory:       "管理学、经济学",
			MajorList:           model.JSONStringArray{"工商管理", "经济学"},
			IsUnlimitedMajor:    false,
			PoliticalStatus:     "中共党员",
			WorkExperienceYears: 0,
			AgeMin:              18,
			AgeMax:              35,
			Gender:              "不限",
			RegistrationStart:   &regStart,
			RegistrationEnd:     &regEnd,
			ExamDate:            &examDate,
			ApplicantCount:      0,
			CompetitionRatio:    0,
			ParseConfidence:     100,
			Status:              1,
		},
		{
			PositionID:          "GK2024-001-0002",
			PositionName:        "信息技术岗",
			DepartmentCode:      "002",
			DepartmentName:      "国家税务总局广东省税务局",
			DepartmentLevel:     "省级",
			Province:            "广东",
			City:                "广州市",
			RecruitCount:        3,
			ExamType:            "国考",
			Education:           "本科",
			Degree:              "学士",
			MajorCategory:       "工学",
			MajorList:           model.JSONStringArray{"计算机科学与技术", "软件工程", "网络工程"},
			IsUnlimitedMajor:    false,
			PoliticalStatus:     "不限",
			WorkExperienceYears: 0,
			AgeMin:              18,
			AgeMax:              35,
			Gender:              "不限",
			RegistrationStart:   &regStart,
			RegistrationEnd:     &regEnd,
			ExamDate:            &examDate,
			ApplicantCount:      0,
			CompetitionRatio:    0,
			ParseConfidence:     100,
			Status:              1,
		},
		{
			PositionID:          "GK2024-001-0003",
			PositionName:        "法律事务岗",
			DepartmentCode:      "003",
			DepartmentName:      "司法部机关",
			DepartmentLevel:     "中央",
			Province:            "北京",
			City:                "北京市",
			RecruitCount:        1,
			ExamType:            "国考",
			Education:           "硕士",
			Degree:              "硕士",
			MajorCategory:       "法学",
			MajorList:           model.JSONStringArray{"法学"},
			IsUnlimitedMajor:    false,
			PoliticalStatus:     "中共党员",
			WorkExperienceYears: 2,
			AgeMin:              18,
			AgeMax:              35,
			Gender:              "不限",
			RegistrationStart:   &regStart,
			RegistrationEnd:     &regEnd,
			ExamDate:            &examDate,
			ApplicantCount:      0,
			CompetitionRatio:    0,
			ParseConfidence:     100,
			Status:              1,
		},
		{
			PositionID:           "SK2024-GD-0001",
			PositionName:         "行政执法岗",
			DepartmentCode:       "GD001",
			DepartmentName:       "广州市市场监督管理局",
			DepartmentLevel:      "市级",
			Province:             "广东",
			City:                 "广州市",
			RecruitCount:         5,
			ExamType:             "省考",
			Education:            "本科",
			Degree:               "",
			IsUnlimitedMajor:     true,
			PoliticalStatus:      "不限",
			WorkExperienceYears:  0,
			AgeMin:               18,
			AgeMax:               30,
			Gender:               "男",
			HouseholdRequirement: "广东省户籍",
			RegistrationStart:    &regStart,
			RegistrationEnd:      &regEnd,
			ExamDate:             &examDate,
			ApplicantCount:       0,
			CompetitionRatio:     0,
			ParseConfidence:      100,
			Status:               1,
		},
		{
			PositionID:          "SK2024-JS-0001",
			PositionName:        "财务管理岗",
			DepartmentCode:      "JS001",
			DepartmentName:      "南京市财政局",
			DepartmentLevel:     "市级",
			Province:            "江苏",
			City:                "南京市",
			RecruitCount:        2,
			ExamType:            "省考",
			Education:           "本科",
			Degree:              "学士",
			MajorCategory:       "经济学、管理学",
			MajorList:           model.JSONStringArray{"会计学", "财务管理", "金融学"},
			IsUnlimitedMajor:    false,
			PoliticalStatus:     "不限",
			WorkExperienceYears: 0,
			AgeMin:              18,
			AgeMax:              35,
			Gender:              "不限",
			RegistrationStart:   &regStart,
			RegistrationEnd:     &regEnd,
			ExamDate:            &examDate,
			ApplicantCount:      0,
			CompetitionRatio:    0,
			ParseConfidence:     100,
			Status:              1,
		},
	}

	return db.Create(&positions).Error
}

// seedCourseCategories 初始化公考学习课程分类体系
func seedCourseCategories(db *gorm.DB) error {
	var count int64
	db.Model(&model.CourseCategory{}).Count(&count)
	if count > 0 {
		return nil
	}

	// 一级分类（科目）
	subjects := []model.CourseCategory{
		{Name: "行政职业能力测验", Code: "xingce", Subject: "行测", ExamType: "公务员", Icon: "brain", Color: "#6366f1", Description: "行测是公务员考试的核心科目，主要测查应试者的基本素质和能力要素", SortOrder: 1, Level: 1, IsActive: true},
		{Name: "申论", Code: "shenlun", Subject: "申论", ExamType: "公务员", Icon: "edit-3", Color: "#8b5cf6", Description: "申论主要测查从事机关工作应当具备的基本能力", SortOrder: 2, Level: 1, IsActive: true},
		{Name: "面试", Code: "mianshi", Subject: "面试", ExamType: "公务员", Icon: "users", Color: "#ec4899", Description: "结构化面试、无领导小组讨论等面试形式的系统学习", SortOrder: 3, Level: 1, IsActive: true},
		{Name: "公共基础知识", Code: "gongji", Subject: "公基", ExamType: "事业单位", Icon: "book-open", Color: "#14b8a6", Description: "事业单位考试必考科目，涵盖政治、法律、经济、管理等内容", SortOrder: 4, Level: 1, IsActive: true},
	}

	if err := db.Create(&subjects).Error; err != nil {
		return err
	}

	// 获取已创建的一级分类ID
	var xingce, shenlun, mianshi, gongji model.CourseCategory
	db.Where("code = ?", "xingce").First(&xingce)
	db.Where("code = ?", "shenlun").First(&shenlun)
	db.Where("code = ?", "mianshi").First(&mianshi)
	db.Where("code = ?", "gongji").First(&gongji)

	// =====================================================
	// 行测二级分类
	// =====================================================
	xingceCategories := []model.CourseCategory{
		{Name: "言语理解与表达", Code: "xc_yanyu", Subject: "行测", ParentID: &xingce.ID, Icon: "message-circle", Color: "#3b82f6", Description: "测查理解和运用语言文字的能力", SortOrder: 1, Level: 2, IsActive: true},
		{Name: "数量关系", Code: "xc_shuliang", Subject: "行测", ParentID: &xingce.ID, Icon: "calculator", Color: "#f59e0b", Description: "测查数学运算和数字推理能力", SortOrder: 2, Level: 2, IsActive: true},
		{Name: "判断推理", Code: "xc_panduan", Subject: "行测", ParentID: &xingce.ID, Icon: "git-branch", Color: "#10b981", Description: "测查逻辑思维和推理判断能力", SortOrder: 3, Level: 2, IsActive: true},
		{Name: "资料分析", Code: "xc_ziliao", Subject: "行测", ParentID: &xingce.ID, Icon: "bar-chart-2", Color: "#f43f5e", Description: "测查数据分析和处理能力", SortOrder: 4, Level: 2, IsActive: true},
		{Name: "常识判断", Code: "xc_changshi", Subject: "行测", ParentID: &xingce.ID, Icon: "lightbulb", Color: "#a855f7", Description: "测查综合知识和基本素养", SortOrder: 5, Level: 2, IsActive: true},
	}
	if err := db.Create(&xingceCategories).Error; err != nil {
		return err
	}

	// 获取行测二级分类ID
	var yanyu, shuliang, panduan, ziliao, changshi model.CourseCategory
	db.Where("code = ?", "xc_yanyu").First(&yanyu)
	db.Where("code = ?", "xc_shuliang").First(&shuliang)
	db.Where("code = ?", "xc_panduan").First(&panduan)
	db.Where("code = ?", "xc_ziliao").First(&ziliao)
	db.Where("code = ?", "xc_changshi").First(&changshi)

	// 行测三级分类 - 言语理解与表达
	yanyuSubs := []model.CourseCategory{
		{Name: "逻辑填空", Code: "xc_yanyu_luoji", Subject: "行测", ParentID: &yanyu.ID, Description: "实词辨析、成语辨析、关联词填空", SortOrder: 1, Level: 3, IsActive: true},
		{Name: "片段阅读", Code: "xc_yanyu_pianduan", Subject: "行测", ParentID: &yanyu.ID, Description: "主旨概括、意图判断、细节理解、标题选择", SortOrder: 2, Level: 3, IsActive: true},
		{Name: "语句表达", Code: "xc_yanyu_yuju", Subject: "行测", ParentID: &yanyu.ID, Description: "语句排序、语句填空", SortOrder: 3, Level: 3, IsActive: true},
	}
	if err := db.Create(&yanyuSubs).Error; err != nil {
		return err
	}

	// 行测三级分类 - 数量关系
	shuliangSubs := []model.CourseCategory{
		{Name: "数学运算", Code: "xc_shuliang_yunsuan", Subject: "行测", ParentID: &shuliang.ID, Description: "行程问题、工程问题、利润问题、排列组合、概率问题、几何问题", SortOrder: 1, Level: 3, IsActive: true},
		{Name: "数字推理", Code: "xc_shuliang_tuili", Subject: "行测", ParentID: &shuliang.ID, Description: "等差数列、等比数列、递推数列、分数数列", SortOrder: 2, Level: 3, IsActive: true},
	}
	if err := db.Create(&shuliangSubs).Error; err != nil {
		return err
	}

	// 行测三级分类 - 判断推理
	panduanSubs := []model.CourseCategory{
		{Name: "图形推理", Code: "xc_panduan_tuxing", Subject: "行测", ParentID: &panduan.ID, Description: "规律类、重构类、分类分组", SortOrder: 1, Level: 3, IsActive: true},
		{Name: "定义判断", Code: "xc_panduan_dingyi", Subject: "行测", ParentID: &panduan.ID, Description: "单定义、多定义判断", SortOrder: 2, Level: 3, IsActive: true},
		{Name: "类比推理", Code: "xc_panduan_leibi", Subject: "行测", ParentID: &panduan.ID, Description: "两词型、三词型、填空型", SortOrder: 3, Level: 3, IsActive: true},
		{Name: "逻辑判断", Code: "xc_panduan_luoji", Subject: "行测", ParentID: &panduan.ID, Description: "翻译推理、真假推理、分析推理、归纳推理、加强削弱", SortOrder: 4, Level: 3, IsActive: true},
	}
	if err := db.Create(&panduanSubs).Error; err != nil {
		return err
	}

	// 行测三级分类 - 资料分析
	ziliaoSubs := []model.CourseCategory{
		{Name: "增长问题", Code: "xc_ziliao_zengzhang", Subject: "行测", ParentID: &ziliao.ID, Description: "增长率、增长量、年均增长", SortOrder: 1, Level: 3, IsActive: true},
		{Name: "比重问题", Code: "xc_ziliao_bizhong", Subject: "行测", ParentID: &ziliao.ID, Description: "现期比重、基期比重、比重变化", SortOrder: 2, Level: 3, IsActive: true},
		{Name: "倍数问题", Code: "xc_ziliao_beishu", Subject: "行测", ParentID: &ziliao.ID, Description: "现期倍数、基期倍数", SortOrder: 3, Level: 3, IsActive: true},
		{Name: "平均数问题", Code: "xc_ziliao_pingjun", Subject: "行测", ParentID: &ziliao.ID, Description: "平均数计算、平均数增长率", SortOrder: 4, Level: 3, IsActive: true},
		{Name: "综合分析", Code: "xc_ziliao_zonghe", Subject: "行测", ParentID: &ziliao.ID, Description: "综合性资料分析", SortOrder: 5, Level: 3, IsActive: true},
	}
	if err := db.Create(&ziliaoSubs).Error; err != nil {
		return err
	}

	// 行测三级分类 - 常识判断
	changshiSubs := []model.CourseCategory{
		{Name: "政治常识", Code: "xc_changshi_zhengzhi", Subject: "行测", ParentID: &changshi.ID, Description: "时政热点、中国特色社会主义理论", SortOrder: 1, Level: 3, IsActive: true},
		{Name: "法律常识", Code: "xc_changshi_falv", Subject: "行测", ParentID: &changshi.ID, Description: "宪法、民法、刑法、行政法", SortOrder: 2, Level: 3, IsActive: true},
		{Name: "经济常识", Code: "xc_changshi_jingji", Subject: "行测", ParentID: &changshi.ID, Description: "宏观经济、微观经济", SortOrder: 3, Level: 3, IsActive: true},
		{Name: "历史常识", Code: "xc_changshi_lishi", Subject: "行测", ParentID: &changshi.ID, Description: "中国古代史、近现代史、世界史", SortOrder: 4, Level: 3, IsActive: true},
		{Name: "地理常识", Code: "xc_changshi_dili", Subject: "行测", ParentID: &changshi.ID, Description: "自然地理、人文地理", SortOrder: 5, Level: 3, IsActive: true},
		{Name: "科技常识", Code: "xc_changshi_keji", Subject: "行测", ParentID: &changshi.ID, Description: "物理、化学、生物、信息技术", SortOrder: 6, Level: 3, IsActive: true},
		{Name: "文学常识", Code: "xc_changshi_wenxue", Subject: "行测", ParentID: &changshi.ID, Description: "古代文学、现代文学", SortOrder: 7, Level: 3, IsActive: true},
	}
	if err := db.Create(&changshiSubs).Error; err != nil {
		return err
	}

	// =====================================================
	// 申论二级分类
	// =====================================================
	shenlunCategories := []model.CourseCategory{
		{Name: "归纳概括", Code: "sl_guina", Subject: "申论", ParentID: &shenlun.ID, Icon: "list", Color: "#3b82f6", Description: "概括问题、原因、做法、特点等", SortOrder: 1, Level: 2, IsActive: true},
		{Name: "提出对策", Code: "sl_duice", Subject: "申论", ParentID: &shenlun.ID, Icon: "target", Color: "#10b981", Description: "直接对策、间接对策、流程类对策", SortOrder: 2, Level: 2, IsActive: true},
		{Name: "综合分析", Code: "sl_fenxi", Subject: "申论", ParentID: &shenlun.ID, Icon: "search", Color: "#f59e0b", Description: "解释型、评价型、比较型、启示型分析", SortOrder: 3, Level: 2, IsActive: true},
		{Name: "贯彻执行", Code: "sl_guanche", Subject: "申论", ParentID: &shenlun.ID, Icon: "file-text", Color: "#ec4899", Description: "讲话稿、倡议书、调研报告、工作方案等", SortOrder: 4, Level: 2, IsActive: true},
		{Name: "文章写作", Code: "sl_xiezuo", Subject: "申论", ParentID: &shenlun.ID, Icon: "edit", Color: "#8b5cf6", Description: "立意技巧、标题拟定、开头写法、分论点论证", SortOrder: 5, Level: 2, IsActive: true},
	}
	if err := db.Create(&shenlunCategories).Error; err != nil {
		return err
	}

	// =====================================================
	// 面试二级分类
	// =====================================================
	mianshiCategories := []model.CourseCategory{
		{Name: "结构化面试", Code: "ms_jiegou", Subject: "面试", ParentID: &mianshi.ID, Icon: "grid", Color: "#3b82f6", Description: "综合分析、计划组织、人际关系、应急应变等题型", SortOrder: 1, Level: 2, IsActive: true},
		{Name: "无领导小组讨论", Code: "ms_wulingdao", Subject: "面试", ParentID: &mianshi.ID, Icon: "users", Color: "#10b981", Description: "开放式、两难式、排序式、资源分配式问题", SortOrder: 2, Level: 2, IsActive: true},
		{Name: "面试技巧", Code: "ms_jiqiao", Subject: "面试", ParentID: &mianshi.ID, Icon: "star", Color: "#f59e0b", Description: "礼仪规范、答题思路、语言表达、时间控制", SortOrder: 3, Level: 2, IsActive: true},
	}
	if err := db.Create(&mianshiCategories).Error; err != nil {
		return err
	}

	// 获取面试二级分类ID
	var jiegou model.CourseCategory
	db.Where("code = ?", "ms_jiegou").First(&jiegou)

	// 面试三级分类 - 结构化面试题型
	jiegouSubs := []model.CourseCategory{
		{Name: "综合分析题", Code: "ms_jiegou_zonghe", Subject: "面试", ParentID: &jiegou.ID, Description: "社会现象、政策理解、名言警句、哲理故事", SortOrder: 1, Level: 3, IsActive: true},
		{Name: "计划组织题", Code: "ms_jiegou_jihua", Subject: "面试", ParentID: &jiegou.ID, Description: "调研、宣传、活动策划、会议组织", SortOrder: 2, Level: 3, IsActive: true},
		{Name: "人际关系题", Code: "ms_jiegou_renji", Subject: "面试", ParentID: &jiegou.ID, Description: "与领导、与同事、与群众、与亲友", SortOrder: 3, Level: 3, IsActive: true},
		{Name: "应急应变题", Code: "ms_jiegou_yingji", Subject: "面试", ParentID: &jiegou.ID, Description: "公共危机、工作危机、舆情处理", SortOrder: 4, Level: 3, IsActive: true},
		{Name: "自我认知题", Code: "ms_jiegou_ziwo", Subject: "面试", ParentID: &jiegou.ID, Description: "求职动机、职业规划", SortOrder: 5, Level: 3, IsActive: true},
		{Name: "情景模拟题", Code: "ms_jiegou_qingjing", Subject: "面试", ParentID: &jiegou.ID, Description: "角色扮演、现场模拟", SortOrder: 6, Level: 3, IsActive: true},
	}
	if err := db.Create(&jiegouSubs).Error; err != nil {
		return err
	}

	// =====================================================
	// 公共基础知识二级分类
	// =====================================================
	gongjiCategories := []model.CourseCategory{
		{Name: "政治理论", Code: "gj_zhengzhi", Subject: "公基", ParentID: &gongji.ID, Icon: "flag", Color: "#ef4444", Description: "马哲、毛概、中特、习思想、党史党建", SortOrder: 1, Level: 2, IsActive: true},
		{Name: "法律知识", Code: "gj_falv", Subject: "公基", ParentID: &gongji.ID, Icon: "scale", Color: "#3b82f6", Description: "法理学、宪法、民法典、刑法、行政法", SortOrder: 2, Level: 2, IsActive: true},
		{Name: "经济知识", Code: "gj_jingji", Subject: "公基", ParentID: &gongji.ID, Icon: "trending-up", Color: "#10b981", Description: "社会主义市场经济、宏微观经济", SortOrder: 3, Level: 2, IsActive: true},
		{Name: "管理知识", Code: "gj_guanli", Subject: "公基", ParentID: &gongji.ID, Icon: "briefcase", Color: "#f59e0b", Description: "行政管理、公共管理", SortOrder: 4, Level: 2, IsActive: true},
		{Name: "公文写作", Code: "gj_gongwen", Subject: "公基", ParentID: &gongji.ID, Icon: "file-text", Color: "#8b5cf6", Description: "公文格式、常用文种、公文处理", SortOrder: 5, Level: 2, IsActive: true},
		{Name: "人文历史", Code: "gj_renwen", Subject: "公基", ParentID: &gongji.ID, Icon: "book", Color: "#ec4899", Description: "中国历史、世界历史、文学艺术", SortOrder: 6, Level: 2, IsActive: true},
		{Name: "科技地理", Code: "gj_keji", Subject: "公基", ParentID: &gongji.ID, Icon: "globe", Color: "#14b8a6", Description: "科技常识、自然地理、人文地理", SortOrder: 7, Level: 2, IsActive: true},
		{Name: "时事政治", Code: "gj_shishi", Subject: "公基", ParentID: &gongji.ID, Icon: "newspaper", Color: "#6366f1", Description: "国内外时政热点、重大会议精神", SortOrder: 8, Level: 2, IsActive: true},
	}
	if err := db.Create(&gongjiCategories).Error; err != nil {
		return err
	}

	return nil
}
