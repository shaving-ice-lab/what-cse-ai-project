package service

import (
	"regexp"
	"strconv"
	"strings"
	"time"
)

// =====================================================
// 职位信息解析辅助函数
// =====================================================

// isUnlimitedMajor 判断是否不限专业
func isUnlimitedMajor(majorRequirement string) bool {
	if majorRequirement == "" {
		return false
	}

	unlimitedKeywords := []string{
		"不限", "专业不限", "不限专业",
		"无限制", "无专业限制",
		"所有专业", "各专业",
	}

	lowered := strings.ToLower(majorRequirement)
	for _, keyword := range unlimitedKeywords {
		if strings.Contains(lowered, keyword) {
			return true
		}
	}
	return false
}

// parseAgeRequirement 解析年龄要求，返回最小和最大年龄
func parseAgeRequirement(ageStr string) (min, max int) {
	if ageStr == "" {
		return 18, 35 // 默认值
	}

	// 不限年龄
	if strings.Contains(ageStr, "不限") {
		return 18, 60
	}

	// 匹配 "XX周岁以下" 或 "不超过XX周岁" 或 "XX岁以下"
	reMax := regexp.MustCompile(`(\d+)\s*(周岁|岁)\s*(以下|及以下|或以下)`)
	if matches := reMax.FindStringSubmatch(ageStr); len(matches) > 1 {
		if age, err := strconv.Atoi(matches[1]); err == nil {
			max = age
		}
	}

	// 匹配 "不超过XX周岁"
	reNotExceed := regexp.MustCompile(`不超过\s*(\d+)\s*(周岁|岁)`)
	if matches := reNotExceed.FindStringSubmatch(ageStr); len(matches) > 1 {
		if age, err := strconv.Atoi(matches[1]); err == nil {
			max = age
		}
	}

	// 匹配 "XX-XX周岁" 或 "XX至XX周岁"
	reRange := regexp.MustCompile(`(\d+)\s*[-至到~]\s*(\d+)\s*(周岁|岁)`)
	if matches := reRange.FindStringSubmatch(ageStr); len(matches) > 2 {
		if minAge, err := strconv.Atoi(matches[1]); err == nil {
			min = minAge
		}
		if maxAge, err := strconv.Atoi(matches[2]); err == nil {
			max = maxAge
		}
	}

	// 匹配 "XX周岁以上"
	reMin := regexp.MustCompile(`(\d+)\s*(周岁|岁)\s*(以上|及以上)`)
	if matches := reMin.FindStringSubmatch(ageStr); len(matches) > 1 {
		if age, err := strconv.Atoi(matches[1]); err == nil {
			min = age
		}
	}

	// 设置默认值
	if min == 0 {
		min = 18
	}
	if max == 0 {
		max = 35
	}

	return min, max
}

// parseWorkExperience 解析工作年限要求，返回最低工作年限
func parseWorkExperience(expStr string) int {
	if expStr == "" {
		return 0
	}

	// 不限/无要求
	if strings.Contains(expStr, "不限") || strings.Contains(expStr, "无要求") || strings.Contains(expStr, "无限制") {
		return 0
	}

	// 匹配 "X年以上" 或 "X年及以上"
	reYears := regexp.MustCompile(`(\d+)\s*年\s*(以上|及以上|或以上)`)
	if matches := reYears.FindStringSubmatch(expStr); len(matches) > 1 {
		if years, err := strconv.Atoi(matches[1]); err == nil {
			return years
		}
	}

	// 匹配 "两年" "三年" 等中文数字
	chineseNums := map[string]int{
		"一": 1, "二": 2, "两": 2, "三": 3, "四": 4, "五": 5,
		"六": 6, "七": 7, "八": 8, "九": 9, "十": 10,
	}
	reChineseYears := regexp.MustCompile(`([一二两三四五六七八九十]+)\s*年`)
	if matches := reChineseYears.FindStringSubmatch(expStr); len(matches) > 1 {
		if years, ok := chineseNums[matches[1]]; ok {
			return years
		}
	}

	return 0
}

// parseTimeString 解析时间字符串
func parseTimeString(timeStr string) *time.Time {
	if timeStr == "" {
		return nil
	}

	// 尝试多种日期格式
	formats := []string{
		"2006-01-02",
		"2006/01/02",
		"2006年01月02日",
		"2006年1月2日",
		"2006-01-02 15:04:05",
		"2006/01/02 15:04:05",
		"2006-01-02T15:04:05",
		"2006-01-02 15:04",
		"01-02",       // 只有月日
		"2006.01.02",
	}

	for _, format := range formats {
		if t, err := time.Parse(format, timeStr); err == nil {
			return &t
		}
	}

	// 尝试提取数字
	reDate := regexp.MustCompile(`(\d{4})\s*[-年/\.]\s*(\d{1,2})\s*[-月/\.]\s*(\d{1,2})`)
	if matches := reDate.FindStringSubmatch(timeStr); len(matches) > 3 {
		year, _ := strconv.Atoi(matches[1])
		month, _ := strconv.Atoi(matches[2])
		day, _ := strconv.Atoi(matches[3])
		if year > 0 && month > 0 && month <= 12 && day > 0 && day <= 31 {
			t := time.Date(year, time.Month(month), day, 0, 0, 0, 0, time.Local)
			return &t
		}
	}

	return nil
}

// ProvinceList 省份列表
var provinceList = []string{
	"北京", "天津", "河北", "山西", "内蒙古",
	"辽宁", "吉林", "黑龙江",
	"上海", "江苏", "浙江", "安徽", "福建", "江西", "山东",
	"河南", "湖北", "湖南", "广东", "广西", "海南",
	"重庆", "四川", "贵州", "云南", "西藏",
	"陕西", "甘肃", "青海", "宁夏", "新疆",
}

// extractProvince 从工作地点提取省份
func extractProvince(location string) string {
	if location == "" {
		return ""
	}

	// 直辖市特殊处理
	directCities := []string{"北京", "上海", "天津", "重庆"}
	for _, city := range directCities {
		if strings.Contains(location, city) {
			return city
		}
	}

	// 匹配省份
	for _, province := range provinceList {
		if strings.Contains(location, province) {
			return province
		}
	}

	// 尝试提取 XX省
	reProvince := regexp.MustCompile(`([\u4e00-\u9fa5]{2,3})(省|自治区)`)
	if matches := reProvince.FindStringSubmatch(location); len(matches) > 1 {
		return matches[1]
	}

	return ""
}

// extractCity 从工作地点提取城市
func extractCity(location string) string {
	if location == "" {
		return ""
	}

	// 直辖市特殊处理 - 返回区名或空
	directCities := []string{"北京", "上海", "天津", "重庆"}
	for _, city := range directCities {
		if strings.HasPrefix(location, city) {
			// 尝试提取区
			reDistrict := regexp.MustCompile(city + `市?\s*([\u4e00-\u9fa5]{2,5})(区|县)`)
			if matches := reDistrict.FindStringSubmatch(location); len(matches) > 1 {
				return matches[1] + matches[2]
			}
			return ""
		}
	}

	// 匹配 XX市
	reCity := regexp.MustCompile(`([\u4e00-\u9fa5]{2,5})(市)`)
	if matches := reCity.FindStringSubmatch(location); len(matches) > 1 {
		return matches[1]
	}

	// 匹配 XX州（如：恩施州）
	reState := regexp.MustCompile(`([\u4e00-\u9fa5]{2,5})(州)`)
	if matches := reState.FindStringSubmatch(location); len(matches) > 1 {
		return matches[1]
	}

	return ""
}

// extractDistrict 从工作地点提取区县
func extractDistrict(location string) string {
	if location == "" {
		return ""
	}

	// 匹配 XX区 或 XX县
	reDistrict := regexp.MustCompile(`([\u4e00-\u9fa5]{2,5})(区|县)`)
	if matches := reDistrict.FindStringSubmatch(location); len(matches) > 1 {
		return matches[1] + matches[2]
	}

	return ""
}

// normalizeEducation 标准化学历要求
func normalizeEducation(edu string) string {
	if edu == "" {
		return ""
	}

	edu = strings.TrimSpace(edu)
	lowered := strings.ToLower(edu)

	// 标准化映射
	educationMap := map[string]string{
		"博士":   "博士研究生",
		"博士生":  "博士研究生",
		"博士研究生": "博士研究生",
		"硕士":   "硕士研究生",
		"硕士生":  "硕士研究生",
		"硕士研究生": "硕士研究生",
		"研究生":  "硕士研究生",
		"本科":   "本科",
		"大学本科": "本科",
		"全日制本科": "本科",
		"大专":   "大专",
		"专科":   "大专",
		"大学专科": "大专",
		"高中":   "高中",
		"中专":   "中专",
		"不限":   "不限",
	}

	for key, value := range educationMap {
		if strings.Contains(lowered, key) || strings.Contains(edu, key) {
			return value
		}
	}

	return edu
}

// normalizePoliticalStatus 标准化政治面貌
func normalizePoliticalStatus(status string) string {
	if status == "" {
		return "不限"
	}

	status = strings.TrimSpace(status)

	statusMap := map[string]string{
		"中共党员":     "中共党员",
		"党员":       "中共党员",
		"共产党员":     "中共党员",
		"中共党员或共青团员": "中共党员或共青团员",
		"党员或团员":    "中共党员或共青团员",
		"共青团员":     "共青团员",
		"团员":       "共青团员",
		"群众":       "群众",
		"不限":       "不限",
		"无要求":      "不限",
	}

	for key, value := range statusMap {
		if strings.Contains(status, key) {
			return value
		}
	}

	return "不限"
}

// detectFreshGraduateOnly 检测是否仅限应届生
func detectFreshGraduateOnly(conditions string) *bool {
	if conditions == "" {
		return nil
	}

	lowered := strings.ToLower(conditions)

	// 仅限应届
	freshOnlyKeywords := []string{
		"仅限应届", "限应届生", "应届毕业生",
		"仅面向应届", "只招应届",
		"应届高校毕业生", "普通高校应届毕业生",
	}
	for _, keyword := range freshOnlyKeywords {
		if strings.Contains(lowered, keyword) {
			t := true
			return &t
		}
	}

	// 不限应届/往届
	notLimitedKeywords := []string{
		"应届、往届", "应届或往届", "不限应届",
		"应届生及往届", "往届或应届",
	}
	for _, keyword := range notLimitedKeywords {
		if strings.Contains(lowered, keyword) {
			return nil // 不限
		}
	}

	// 需要工作经验（非应届）
	expKeywords := []string{
		"工作经验", "工作经历", "从业经历",
	}
	for _, keyword := range expKeywords {
		if strings.Contains(lowered, keyword) && !strings.Contains(lowered, "不限") {
			f := false
			return &f
		}
	}

	return nil
}

// detectGenderRequirement 检测性别要求
func detectGenderRequirement(conditions string) string {
	if conditions == "" {
		return "不限"
	}

	lowered := strings.ToLower(conditions)

	// 仅限男性
	maleKeywords := []string{"仅限男性", "限男性", "男性", "限男", "仅限男"}
	for _, keyword := range maleKeywords {
		if strings.Contains(lowered, keyword) && !strings.Contains(lowered, "女") {
			return "男"
		}
	}

	// 仅限女性
	femaleKeywords := []string{"仅限女性", "限女性", "女性", "限女", "仅限女"}
	for _, keyword := range femaleKeywords {
		if strings.Contains(lowered, keyword) && !strings.Contains(lowered, "男") {
			return "女"
		}
	}

	return "不限"
}

// detectHouseholdRequirement 检测户籍要求
func detectHouseholdRequirement(conditions string) (bool, string) {
	if conditions == "" {
		return false, ""
	}

	lowered := strings.ToLower(conditions)

	// 不限户籍
	unlimitedKeywords := []string{"不限户籍", "户籍不限", "无户籍要求", "户籍无限制"}
	for _, keyword := range unlimitedKeywords {
		if strings.Contains(lowered, keyword) {
			return false, ""
		}
	}

	// 限定户籍
	limitedKeywords := []string{"户籍", "籍贯"}
	for _, keyword := range limitedKeywords {
		if strings.Contains(lowered, keyword) && !strings.Contains(lowered, "不限") {
			// 尝试提取户籍地
			reHukou := regexp.MustCompile(`([\u4e00-\u9fa5]{2,5})(省|市|县|区)?(户籍|籍贯)`)
			if matches := reHukou.FindStringSubmatch(conditions); len(matches) > 1 {
				return true, matches[1]
			}
			return true, conditions
		}
	}

	return false, ""
}

// ParsedPosition 解析后的职位信息结构
type ParsedPosition struct {
	PositionName         string
	PositionCode         string
	DepartmentName       string
	DepartmentLevel      string
	RecruitCount         int
	Education            string
	Degree               string
	MajorCategory        string
	MajorRequirement     string
	MajorList            []string
	IsUnlimitedMajor     bool
	WorkLocation         string
	Province             string
	City                 string
	District             string
	PoliticalStatus      string
	Age                  string
	AgeMin               int
	AgeMax               int
	WorkExperience       string
	WorkExperienceYears  int
	IsForFreshGraduate   *bool
	Gender               string
	HouseholdRequirement string
	ServicePeriod        string
	OtherConditions      string
	ExamType             string
	ExamCategory         string
	RegistrationStart    *time.Time
	RegistrationEnd      *time.Time
	ExamDate             *time.Time
	ParseConfidence      int
}

// NormalizePosition 标准化职位信息
func NormalizePosition(pos *ParsedPosition) {
	if pos == nil {
		return
	}

	// 标准化学历
	pos.Education = normalizeEducation(pos.Education)

	// 标准化政治面貌
	pos.PoliticalStatus = normalizePoliticalStatus(pos.PoliticalStatus)

	// 判断是否不限专业
	if !pos.IsUnlimitedMajor && pos.MajorRequirement != "" {
		pos.IsUnlimitedMajor = isUnlimitedMajor(pos.MajorRequirement)
	}

	// 解析年龄
	if pos.Age != "" && (pos.AgeMin == 0 || pos.AgeMax == 0) {
		pos.AgeMin, pos.AgeMax = parseAgeRequirement(pos.Age)
	}

	// 解析工作年限
	if pos.WorkExperience != "" && pos.WorkExperienceYears == 0 {
		pos.WorkExperienceYears = parseWorkExperience(pos.WorkExperience)
	}

	// 提取省市区
	if pos.WorkLocation != "" {
		if pos.Province == "" {
			pos.Province = extractProvince(pos.WorkLocation)
		}
		if pos.City == "" {
			pos.City = extractCity(pos.WorkLocation)
		}
		if pos.District == "" {
			pos.District = extractDistrict(pos.WorkLocation)
		}
	}

	// 检测应届限制
	if pos.IsForFreshGraduate == nil && pos.OtherConditions != "" {
		pos.IsForFreshGraduate = detectFreshGraduateOnly(pos.OtherConditions)
	}

	// 检测性别要求
	if pos.Gender == "" && pos.OtherConditions != "" {
		pos.Gender = detectGenderRequirement(pos.OtherConditions)
	}

	// 设置默认值
	if pos.RecruitCount <= 0 {
		pos.RecruitCount = 1
	}
	if pos.AgeMin == 0 {
		pos.AgeMin = 18
	}
	if pos.AgeMax == 0 {
		pos.AgeMax = 35
	}
	if pos.Gender == "" {
		pos.Gender = "不限"
	}
}
