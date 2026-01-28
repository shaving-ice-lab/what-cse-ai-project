package service

import (
	"errors"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

var (
	ErrMajorNotFound         = errors.New("major not found")
	ErrMajorCategoryNotFound = errors.New("major category not found")
)

type MajorService struct {
	majorRepo *repository.MajorRepository
}

func NewMajorService(majorRepo *repository.MajorRepository) *MajorService {
	return &MajorService{majorRepo: majorRepo}
}

// =====================================================
// 响应结构体
// =====================================================

// CategoryListResponse 专业大类列表响应
type CategoryListResponse struct {
	Categories []model.MajorCategoryResponse `json:"categories"`
	Total      int                           `json:"total"`
}

// MajorListResponse 专业列表响应
type MajorListResponse struct {
	Majors   []model.MajorResponse `json:"majors"`
	Total    int64                 `json:"total"`
	Page     int                   `json:"page"`
	PageSize int                   `json:"page_size"`
}

// MajorSearchResponse 专业搜索响应
type MajorSearchResponse struct {
	Majors []model.MajorResponse `json:"majors"`
	Total  int                   `json:"total"`
}

// MajorCascadeListResponse 级联列表响应
type MajorCascadeListResponse struct {
	Data []model.MajorCascadeResponse `json:"data"`
}

// =====================================================
// 业务方法
// =====================================================

// GetCategories 获取专业大类列表
func (s *MajorService) GetCategories() (*CategoryListResponse, error) {
	categories, err := s.majorRepo.GetCategories()
	if err != nil {
		return nil, err
	}

	resp := make([]model.MajorCategoryResponse, 0, len(categories))
	for _, cat := range categories {
		resp = append(resp, *cat.ToResponse())
	}

	return &CategoryListResponse{
		Categories: resp,
		Total:      len(resp),
	}, nil
}

// GetMajors 获取专业列表
func (s *MajorService) GetMajors(categoryCode, educationLevel string, page, pageSize int) (*MajorListResponse, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 50
	}
	if pageSize > 200 {
		pageSize = 200
	}

	majors, total, err := s.majorRepo.GetMajors(categoryCode, educationLevel, page, pageSize)
	if err != nil {
		return nil, err
	}

	// 获取分类名称映射
	categoryNames := make(map[string]string)
	categories, _ := s.majorRepo.GetCategories()
	for _, cat := range categories {
		categoryNames[cat.Code] = cat.Name
	}

	resp := make([]model.MajorResponse, 0, len(majors))
	for _, major := range majors {
		majorResp := major.ToResponse()
		majorResp.CategoryName = categoryNames[major.CategoryCode]
		resp = append(resp, *majorResp)
	}

	return &MajorListResponse{
		Majors:   resp,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}, nil
}

// SearchMajors 搜索专业
func (s *MajorService) SearchMajors(keyword string, limit int) (*MajorSearchResponse, error) {
	if limit <= 0 {
		limit = 20
	}

	majors, err := s.majorRepo.SearchMajors(keyword, limit)
	if err != nil {
		return nil, err
	}

	// 获取分类名称映射
	categoryNames := make(map[string]string)
	categories, _ := s.majorRepo.GetCategories()
	for _, cat := range categories {
		categoryNames[cat.Code] = cat.Name
	}

	resp := make([]model.MajorResponse, 0, len(majors))
	for _, major := range majors {
		majorResp := major.ToResponse()
		majorResp.CategoryName = categoryNames[major.CategoryCode]
		resp = append(resp, *majorResp)
	}

	return &MajorSearchResponse{
		Majors: resp,
		Total:  len(resp),
	}, nil
}

// GetMajorByCode 根据代码获取专业详情
func (s *MajorService) GetMajorByCode(code string) (*model.MajorResponse, error) {
	major, err := s.majorRepo.GetMajorByCode(code)
	if err != nil {
		return nil, ErrMajorNotFound
	}

	// 获取分类名称
	category, _ := s.majorRepo.GetCategoryByCode(major.CategoryCode)
	resp := major.ToResponse()
	if category != nil {
		resp.CategoryName = category.Name
	}

	return resp, nil
}

// GetCascadeData 获取级联数据
func (s *MajorService) GetCascadeData() (*MajorCascadeListResponse, error) {
	data, err := s.majorRepo.GetCascadeData()
	if err != nil {
		return nil, err
	}

	return &MajorCascadeListResponse{
		Data: data,
	}, nil
}

// GetMajorsByCategory 根据大类获取专业
func (s *MajorService) GetMajorsByCategory(categoryCode string) ([]model.MajorResponse, error) {
	majors, err := s.majorRepo.GetMajorsByCategoryCode(categoryCode)
	if err != nil {
		return nil, err
	}

	// 获取分类名称
	category, _ := s.majorRepo.GetCategoryByCode(categoryCode)
	categoryName := ""
	if category != nil {
		categoryName = category.Name
	}

	resp := make([]model.MajorResponse, 0, len(majors))
	for _, major := range majors {
		majorResp := major.ToResponse()
		majorResp.CategoryName = categoryName
		resp = append(resp, *majorResp)
	}

	return resp, nil
}

// InitMajorData 初始化专业数据（导入教育部专业目录）
func (s *MajorService) InitMajorData() error {
	// 专业大类数据
	categories := []model.MajorCategory{
		{Code: "01", Name: "哲学", SortOrder: 1},
		{Code: "02", Name: "经济学", SortOrder: 2},
		{Code: "03", Name: "法学", SortOrder: 3},
		{Code: "04", Name: "教育学", SortOrder: 4},
		{Code: "05", Name: "文学", SortOrder: 5},
		{Code: "06", Name: "历史学", SortOrder: 6},
		{Code: "07", Name: "理学", SortOrder: 7},
		{Code: "08", Name: "工学", SortOrder: 8},
		{Code: "09", Name: "农学", SortOrder: 9},
		{Code: "10", Name: "医学", SortOrder: 10},
		{Code: "11", Name: "军事学", SortOrder: 11},
		{Code: "12", Name: "管理学", SortOrder: 12},
		{Code: "13", Name: "艺术学", SortOrder: 13},
	}

	// 常用专业数据
	majors := []model.Major{
		// 哲学类
		{Code: "010101", Name: "哲学", CategoryCode: "01", Level: 3, EducationLevel: "本科", SortOrder: 1},
		{Code: "010102", Name: "逻辑学", CategoryCode: "01", Level: 3, EducationLevel: "本科", SortOrder: 2},
		{Code: "010103", Name: "宗教学", CategoryCode: "01", Level: 3, EducationLevel: "本科", SortOrder: 3},

		// 经济学类
		{Code: "020101", Name: "经济学", CategoryCode: "02", Level: 3, EducationLevel: "本科", SortOrder: 1},
		{Code: "020102", Name: "经济统计学", CategoryCode: "02", Level: 3, EducationLevel: "本科", SortOrder: 2},
		{Code: "020201", Name: "财政学", CategoryCode: "02", Level: 3, EducationLevel: "本科", SortOrder: 3},
		{Code: "020202", Name: "税收学", CategoryCode: "02", Level: 3, EducationLevel: "本科", SortOrder: 4},
		{Code: "020301", Name: "金融学", CategoryCode: "02", Level: 3, EducationLevel: "本科", SortOrder: 5},
		{Code: "020302", Name: "金融工程", CategoryCode: "02", Level: 3, EducationLevel: "本科", SortOrder: 6},
		{Code: "020303", Name: "保险学", CategoryCode: "02", Level: 3, EducationLevel: "本科", SortOrder: 7},
		{Code: "020304", Name: "投资学", CategoryCode: "02", Level: 3, EducationLevel: "本科", SortOrder: 8},
		{Code: "020401", Name: "国际经济与贸易", CategoryCode: "02", Level: 3, EducationLevel: "本科", SortOrder: 9},

		// 法学类
		{Code: "030101", Name: "法学", CategoryCode: "03", Level: 3, EducationLevel: "本科", SortOrder: 1},
		{Code: "030102", Name: "知识产权", CategoryCode: "03", Level: 3, EducationLevel: "本科", SortOrder: 2},
		{Code: "030201", Name: "政治学与行政学", CategoryCode: "03", Level: 3, EducationLevel: "本科", SortOrder: 3},
		{Code: "030202", Name: "国际政治", CategoryCode: "03", Level: 3, EducationLevel: "本科", SortOrder: 4},
		{Code: "030301", Name: "社会学", CategoryCode: "03", Level: 3, EducationLevel: "本科", SortOrder: 5},
		{Code: "030302", Name: "社会工作", CategoryCode: "03", Level: 3, EducationLevel: "本科", SortOrder: 6},
		{Code: "030503", Name: "思想政治教育", CategoryCode: "03", Level: 3, EducationLevel: "本科", SortOrder: 7},

		// 教育学类
		{Code: "040101", Name: "教育学", CategoryCode: "04", Level: 3, EducationLevel: "本科", SortOrder: 1},
		{Code: "040104", Name: "教育技术学", CategoryCode: "04", Level: 3, EducationLevel: "本科", SortOrder: 2},
		{Code: "040106", Name: "学前教育", CategoryCode: "04", Level: 3, EducationLevel: "本科", SortOrder: 3},
		{Code: "040107", Name: "小学教育", CategoryCode: "04", Level: 3, EducationLevel: "本科", SortOrder: 4},
		{Code: "040201", Name: "体育教育", CategoryCode: "04", Level: 3, EducationLevel: "本科", SortOrder: 5},

		// 文学类
		{Code: "050101", Name: "汉语言文学", CategoryCode: "05", Level: 3, EducationLevel: "本科", SortOrder: 1},
		{Code: "050102", Name: "汉语言", CategoryCode: "05", Level: 3, EducationLevel: "本科", SortOrder: 2},
		{Code: "050103", Name: "汉语国际教育", CategoryCode: "05", Level: 3, EducationLevel: "本科", SortOrder: 3},
		{Code: "050201", Name: "英语", CategoryCode: "05", Level: 3, EducationLevel: "本科", SortOrder: 4},
		{Code: "050207", Name: "日语", CategoryCode: "05", Level: 3, EducationLevel: "本科", SortOrder: 5},
		{Code: "050301", Name: "新闻学", CategoryCode: "05", Level: 3, EducationLevel: "本科", SortOrder: 6},
		{Code: "050302", Name: "广播电视学", CategoryCode: "05", Level: 3, EducationLevel: "本科", SortOrder: 7},
		{Code: "050303", Name: "广告学", CategoryCode: "05", Level: 3, EducationLevel: "本科", SortOrder: 8},
		{Code: "050304", Name: "传播学", CategoryCode: "05", Level: 3, EducationLevel: "本科", SortOrder: 9},

		// 历史学类
		{Code: "060101", Name: "历史学", CategoryCode: "06", Level: 3, EducationLevel: "本科", SortOrder: 1},
		{Code: "060102", Name: "世界史", CategoryCode: "06", Level: 3, EducationLevel: "本科", SortOrder: 2},
		{Code: "060103", Name: "考古学", CategoryCode: "06", Level: 3, EducationLevel: "本科", SortOrder: 3},

		// 理学类
		{Code: "070101", Name: "数学与应用数学", CategoryCode: "07", Level: 3, EducationLevel: "本科", SortOrder: 1},
		{Code: "070102", Name: "信息与计算科学", CategoryCode: "07", Level: 3, EducationLevel: "本科", SortOrder: 2},
		{Code: "070201", Name: "物理学", CategoryCode: "07", Level: 3, EducationLevel: "本科", SortOrder: 3},
		{Code: "070301", Name: "化学", CategoryCode: "07", Level: 3, EducationLevel: "本科", SortOrder: 4},
		{Code: "070501", Name: "地理科学", CategoryCode: "07", Level: 3, EducationLevel: "本科", SortOrder: 5},
		{Code: "070601", Name: "大气科学", CategoryCode: "07", Level: 3, EducationLevel: "本科", SortOrder: 6},
		{Code: "071001", Name: "生物科学", CategoryCode: "07", Level: 3, EducationLevel: "本科", SortOrder: 7},
		{Code: "071002", Name: "生物技术", CategoryCode: "07", Level: 3, EducationLevel: "本科", SortOrder: 8},
		{Code: "071201", Name: "统计学", CategoryCode: "07", Level: 3, EducationLevel: "本科", SortOrder: 9},

		// 工学类
		{Code: "080101", Name: "理论与应用力学", CategoryCode: "08", Level: 3, EducationLevel: "本科", SortOrder: 1},
		{Code: "080201", Name: "机械工程", CategoryCode: "08", Level: 3, EducationLevel: "本科", SortOrder: 2},
		{Code: "080202", Name: "机械设计制造及其自动化", CategoryCode: "08", Level: 3, EducationLevel: "本科", SortOrder: 3},
		{Code: "080301", Name: "测控技术与仪器", CategoryCode: "08", Level: 3, EducationLevel: "本科", SortOrder: 4},
		{Code: "080401", Name: "材料科学与工程", CategoryCode: "08", Level: 3, EducationLevel: "本科", SortOrder: 5},
		{Code: "080501", Name: "能源与动力工程", CategoryCode: "08", Level: 3, EducationLevel: "本科", SortOrder: 6},
		{Code: "080601", Name: "电气工程及其自动化", CategoryCode: "08", Level: 3, EducationLevel: "本科", SortOrder: 7},
		{Code: "080701", Name: "电子信息工程", CategoryCode: "08", Level: 3, EducationLevel: "本科", SortOrder: 8},
		{Code: "080702", Name: "电子科学与技术", CategoryCode: "08", Level: 3, EducationLevel: "本科", SortOrder: 9},
		{Code: "080703", Name: "通信工程", CategoryCode: "08", Level: 3, EducationLevel: "本科", SortOrder: 10},
		{Code: "080801", Name: "自动化", CategoryCode: "08", Level: 3, EducationLevel: "本科", SortOrder: 11},
		{Code: "080901", Name: "计算机科学与技术", CategoryCode: "08", Level: 3, EducationLevel: "本科", SortOrder: 12},
		{Code: "080902", Name: "软件工程", CategoryCode: "08", Level: 3, EducationLevel: "本科", SortOrder: 13},
		{Code: "080903", Name: "网络工程", CategoryCode: "08", Level: 3, EducationLevel: "本科", SortOrder: 14},
		{Code: "080904", Name: "信息安全", CategoryCode: "08", Level: 3, EducationLevel: "本科", SortOrder: 15},
		{Code: "080905", Name: "物联网工程", CategoryCode: "08", Level: 3, EducationLevel: "本科", SortOrder: 16},
		{Code: "080906", Name: "数字媒体技术", CategoryCode: "08", Level: 3, EducationLevel: "本科", SortOrder: 17},
		{Code: "080910", Name: "数据科学与大数据技术", CategoryCode: "08", Level: 3, EducationLevel: "本科", SortOrder: 18},
		{Code: "080911", Name: "人工智能", CategoryCode: "08", Level: 3, EducationLevel: "本科", SortOrder: 19},
		{Code: "081001", Name: "土木工程", CategoryCode: "08", Level: 3, EducationLevel: "本科", SortOrder: 20},
		{Code: "081002", Name: "建筑环境与能源应用工程", CategoryCode: "08", Level: 3, EducationLevel: "本科", SortOrder: 21},
		{Code: "081003", Name: "给排水科学与工程", CategoryCode: "08", Level: 3, EducationLevel: "本科", SortOrder: 22},
		{Code: "081201", Name: "测绘工程", CategoryCode: "08", Level: 3, EducationLevel: "本科", SortOrder: 23},
		{Code: "081301", Name: "化学工程与工艺", CategoryCode: "08", Level: 3, EducationLevel: "本科", SortOrder: 24},
		{Code: "082301", Name: "农业工程", CategoryCode: "08", Level: 3, EducationLevel: "本科", SortOrder: 25},
		{Code: "082502", Name: "环境工程", CategoryCode: "08", Level: 3, EducationLevel: "本科", SortOrder: 26},
		{Code: "082701", Name: "食品科学与工程", CategoryCode: "08", Level: 3, EducationLevel: "本科", SortOrder: 27},
		{Code: "082801", Name: "建筑学", CategoryCode: "08", Level: 3, EducationLevel: "本科", SortOrder: 28},
		{Code: "082802", Name: "城乡规划", CategoryCode: "08", Level: 3, EducationLevel: "本科", SortOrder: 29},

		// 农学类
		{Code: "090101", Name: "农学", CategoryCode: "09", Level: 3, EducationLevel: "本科", SortOrder: 1},
		{Code: "090102", Name: "园艺", CategoryCode: "09", Level: 3, EducationLevel: "本科", SortOrder: 2},
		{Code: "090201", Name: "农业资源与环境", CategoryCode: "09", Level: 3, EducationLevel: "本科", SortOrder: 3},
		{Code: "090301", Name: "动物科学", CategoryCode: "09", Level: 3, EducationLevel: "本科", SortOrder: 4},
		{Code: "090401", Name: "动物医学", CategoryCode: "09", Level: 3, EducationLevel: "本科", SortOrder: 5},
		{Code: "090501", Name: "林学", CategoryCode: "09", Level: 3, EducationLevel: "本科", SortOrder: 6},

		// 医学类
		{Code: "100101", Name: "基础医学", CategoryCode: "10", Level: 3, EducationLevel: "本科", SortOrder: 1},
		{Code: "100201", Name: "临床医学", CategoryCode: "10", Level: 3, EducationLevel: "本科", SortOrder: 2},
		{Code: "100301", Name: "口腔医学", CategoryCode: "10", Level: 3, EducationLevel: "本科", SortOrder: 3},
		{Code: "100401", Name: "预防医学", CategoryCode: "10", Level: 3, EducationLevel: "本科", SortOrder: 4},
		{Code: "100501", Name: "中医学", CategoryCode: "10", Level: 3, EducationLevel: "本科", SortOrder: 5},
		{Code: "100701", Name: "药学", CategoryCode: "10", Level: 3, EducationLevel: "本科", SortOrder: 6},
		{Code: "100801", Name: "中药学", CategoryCode: "10", Level: 3, EducationLevel: "本科", SortOrder: 7},
		{Code: "101001", Name: "医学检验技术", CategoryCode: "10", Level: 3, EducationLevel: "本科", SortOrder: 8},
		{Code: "101101", Name: "护理学", CategoryCode: "10", Level: 3, EducationLevel: "本科", SortOrder: 9},

		// 管理学类
		{Code: "120101", Name: "管理科学", CategoryCode: "12", Level: 3, EducationLevel: "本科", SortOrder: 1},
		{Code: "120102", Name: "信息管理与信息系统", CategoryCode: "12", Level: 3, EducationLevel: "本科", SortOrder: 2},
		{Code: "120103", Name: "工程管理", CategoryCode: "12", Level: 3, EducationLevel: "本科", SortOrder: 3},
		{Code: "120104", Name: "房地产开发与管理", CategoryCode: "12", Level: 3, EducationLevel: "本科", SortOrder: 4},
		{Code: "120201", Name: "工商管理", CategoryCode: "12", Level: 3, EducationLevel: "本科", SortOrder: 5},
		{Code: "120202", Name: "市场营销", CategoryCode: "12", Level: 3, EducationLevel: "本科", SortOrder: 6},
		{Code: "120203", Name: "会计学", CategoryCode: "12", Level: 3, EducationLevel: "本科", SortOrder: 7},
		{Code: "120204", Name: "财务管理", CategoryCode: "12", Level: 3, EducationLevel: "本科", SortOrder: 8},
		{Code: "120206", Name: "人力资源管理", CategoryCode: "12", Level: 3, EducationLevel: "本科", SortOrder: 9},
		{Code: "120207", Name: "审计学", CategoryCode: "12", Level: 3, EducationLevel: "本科", SortOrder: 10},
		{Code: "120401", Name: "公共事业管理", CategoryCode: "12", Level: 3, EducationLevel: "本科", SortOrder: 11},
		{Code: "120402", Name: "行政管理", CategoryCode: "12", Level: 3, EducationLevel: "本科", SortOrder: 12},
		{Code: "120403", Name: "劳动与社会保障", CategoryCode: "12", Level: 3, EducationLevel: "本科", SortOrder: 13},
		{Code: "120404", Name: "土地资源管理", CategoryCode: "12", Level: 3, EducationLevel: "本科", SortOrder: 14},
		{Code: "120601", Name: "物流管理", CategoryCode: "12", Level: 3, EducationLevel: "本科", SortOrder: 15},
		{Code: "120701", Name: "工业工程", CategoryCode: "12", Level: 3, EducationLevel: "本科", SortOrder: 16},
		{Code: "120801", Name: "电子商务", CategoryCode: "12", Level: 3, EducationLevel: "本科", SortOrder: 17},
		{Code: "120901", Name: "旅游管理", CategoryCode: "12", Level: 3, EducationLevel: "本科", SortOrder: 18},

		// 艺术学类
		{Code: "130101", Name: "艺术史论", CategoryCode: "13", Level: 3, EducationLevel: "本科", SortOrder: 1},
		{Code: "130201", Name: "音乐表演", CategoryCode: "13", Level: 3, EducationLevel: "本科", SortOrder: 2},
		{Code: "130202", Name: "音乐学", CategoryCode: "13", Level: 3, EducationLevel: "本科", SortOrder: 3},
		{Code: "130301", Name: "表演", CategoryCode: "13", Level: 3, EducationLevel: "本科", SortOrder: 4},
		{Code: "130305", Name: "广播电视编导", CategoryCode: "13", Level: 3, EducationLevel: "本科", SortOrder: 5},
		{Code: "130401", Name: "美术学", CategoryCode: "13", Level: 3, EducationLevel: "本科", SortOrder: 6},
		{Code: "130402", Name: "绘画", CategoryCode: "13", Level: 3, EducationLevel: "本科", SortOrder: 7},
		{Code: "130502", Name: "视觉传达设计", CategoryCode: "13", Level: 3, EducationLevel: "本科", SortOrder: 8},
		{Code: "130503", Name: "环境设计", CategoryCode: "13", Level: 3, EducationLevel: "本科", SortOrder: 9},
		{Code: "130504", Name: "产品设计", CategoryCode: "13", Level: 3, EducationLevel: "本科", SortOrder: 10},
	}

	// 清空现有数据
	if err := s.majorRepo.DeleteAllMajors(); err != nil {
		return err
	}
	if err := s.majorRepo.DeleteAllCategories(); err != nil {
		return err
	}

	// 创建专业大类
	if err := s.majorRepo.BatchCreateCategories(categories); err != nil {
		return err
	}

	// 创建专业
	if err := s.majorRepo.BatchCreateMajors(majors); err != nil {
		return err
	}

	return nil
}
