package model

// =====================================================
// 职位相关常量枚举定义
// =====================================================

// PositionStatus 职位状态枚举
type PositionStatus int

const (
	PositionStatusPending   PositionStatus = 0 // 待审核
	PositionStatusPublished PositionStatus = 1 // 已发布
	PositionStatusOffline   PositionStatus = 2 // 已下线
)

var PositionStatusNames = map[PositionStatus]string{
	PositionStatusPending:   "待审核",
	PositionStatusPublished: "已发布",
	PositionStatusOffline:   "已下线",
}

// EducationList 学历列表（用于筛选选项）
// 注意：Education 类型定义在 user_profile.go 中
var EducationList = []string{
	"大专",
	"本科",
	"硕士",
	"博士",
	"硕士研究生",
	"博士研究生",
}

// EducationLevel 学历级别映射（用于比较）
var EducationLevel = map[string]int{
	"大专":    1,
	"本科":    2,
	"硕士":    3,
	"硕士研究生": 3,
	"博士":    4,
	"博士研究生": 4,
}

// Degree 学位枚举
type Degree string

const (
	DegreeNone     Degree = "无"
	DegreeBachelor Degree = "学士"
	DegreeMaster   Degree = "硕士"
	DegreeDoctor   Degree = "博士"
)

var DegreeList = []string{
	string(DegreeNone),
	string(DegreeBachelor),
	string(DegreeMaster),
	string(DegreeDoctor),
}

// PoliticalStatusList 政治面貌列表（用于筛选选项）
// 注意：PoliticalStatus 类型定义在 user_profile.go 中
// 这里定义的是职位筛选用的常量，包含"不限"选项
const (
	PoliticalStatusNoLimit       = "不限"
	PoliticalStatusCCPMember     = "中共党员"
	PoliticalStatusPartyOrLeague = "中共党员或共青团员"
)

var PoliticalStatusList = []string{
	"不限",
	"中共党员",
	"中共党员或共青团员",
	"共青团员",
	"团员",
	"群众",
}

// ExamType 考试类型枚举
type ExamType string

const (
	ExamTypeCivilServant      ExamType = "公务员"
	ExamTypeInstitution       ExamType = "事业单位"
	ExamTypeTeacher           ExamType = "教师招聘"
	ExamTypeMedical           ExamType = "医疗卫生"
	ExamTypeBank              ExamType = "银行招聘"
	ExamTypeSOE               ExamType = "国企招聘"
	ExamTypeMilitaryCivilian  ExamType = "军队文职"
	ExamTypeThreeSupports     ExamType = "三支一扶"
	ExamTypeVillageOfficial   ExamType = "大学生村官"
	ExamTypePolice            ExamType = "警法招聘"
	ExamTypeSelection         ExamType = "选调生"
	ExamTypeCommunityWorker   ExamType = "社区工作者"
	ExamTypeOther             ExamType = "其他"
)

var ExamTypeList = []string{
	string(ExamTypeCivilServant),
	string(ExamTypeInstitution),
	string(ExamTypeTeacher),
	string(ExamTypeMedical),
	string(ExamTypeBank),
	string(ExamTypeSOE),
	string(ExamTypeMilitaryCivilian),
	string(ExamTypeThreeSupports),
	string(ExamTypeVillageOfficial),
	string(ExamTypePolice),
	string(ExamTypeSelection),
	string(ExamTypeCommunityWorker),
	string(ExamTypeOther),
}

// DepartmentLevel 单位层级枚举
type DepartmentLevel string

const (
	DepartmentLevelCentral  DepartmentLevel = "中央"
	DepartmentLevelProvince DepartmentLevel = "省级"
	DepartmentLevelCity     DepartmentLevel = "市级"
	DepartmentLevelCounty   DepartmentLevel = "县级"
	DepartmentLevelTownship DepartmentLevel = "乡镇"
)

var DepartmentLevelList = []string{
	string(DepartmentLevelCentral),
	string(DepartmentLevelProvince),
	string(DepartmentLevelCity),
	string(DepartmentLevelCounty),
	string(DepartmentLevelTownship),
}

// ExamCategory 考试分类枚举
type ExamCategory string

const (
	ExamCategoryA ExamCategory = "综合管理类(A类)"
	ExamCategoryB ExamCategory = "社会科学专技类(B类)"
	ExamCategoryC ExamCategory = "自然科学专技类(C类)"
	ExamCategoryD ExamCategory = "中小学教师类(D类)"
	ExamCategoryE ExamCategory = "医疗卫生类(E类)"
)

var ExamCategoryList = []string{
	string(ExamCategoryA),
	string(ExamCategoryB),
	string(ExamCategoryC),
	string(ExamCategoryD),
	string(ExamCategoryE),
}

// Gender 性别枚举
type Gender string

const (
	GenderNoLimit Gender = "不限"
	GenderMale    Gender = "男"
	GenderFemale  Gender = "女"
)

var GenderList = []string{
	string(GenderNoLimit),
	string(GenderMale),
	string(GenderFemale),
}

// RegistrationStatus 报名状态
type RegistrationStatus string

const (
	RegistrationStatusUpcoming    RegistrationStatus = "upcoming"    // 即将开始
	RegistrationStatusRegistering RegistrationStatus = "registering" // 报名中
	RegistrationStatusEnded       RegistrationStatus = "ended"       // 已结束
)

// ProvinceList 省份列表
var ProvinceList = []string{
	"北京", "天津", "河北", "山西", "内蒙古",
	"辽宁", "吉林", "黑龙江",
	"上海", "江苏", "浙江", "安徽", "福建", "江西", "山东",
	"河南", "湖北", "湖南", "广东", "广西", "海南",
	"重庆", "四川", "贵州", "云南", "西藏",
	"陕西", "甘肃", "青海", "宁夏", "新疆",
}

// MajorCategoryList 专业大类列表
var MajorCategoryList = []string{
	"哲学", "经济学", "法学", "教育学", "文学",
	"历史学", "理学", "工学", "农学", "医学",
	"管理学", "艺术学", "军事学",
}
