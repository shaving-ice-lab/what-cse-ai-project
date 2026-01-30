package service

import (
	"encoding/json"
	"errors"
	"strings"
	"time"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
	"gorm.io/gorm"
)

var (
	ErrCourseNotFound         = errors.New("课程不存在")
	ErrCourseCategoryNotFound = errors.New("课程分类不存在")
	ErrCategoryNotFound       = ErrCourseCategoryNotFound // alias for backward compatibility
	ErrChapterNotFound        = errors.New("章节不存在")
	ErrKnowledgeNotFound      = errors.New("知识点不存在")
	ErrCourseNotPublished     = errors.New("课程未发布")
	ErrChapterAccessDenied    = errors.New("章节需要VIP权限")
	ErrCourseAlreadyCollected = errors.New("已收藏该课程")
)

// =====================================================
// Course Category Service
// =====================================================

type CourseCategoryService struct {
	categoryRepo *repository.CourseCategoryRepository
	courseRepo   *repository.CourseRepository
}

func NewCourseCategoryService(
	categoryRepo *repository.CourseCategoryRepository,
	courseRepo *repository.CourseRepository,
) *CourseCategoryService {
	return &CourseCategoryService{
		categoryRepo: categoryRepo,
		courseRepo:   courseRepo,
	}
}

func (s *CourseCategoryService) applyCourseCounts(categories []model.CourseCategory, status *model.CourseStatus) error {
	if len(categories) == 0 {
		return nil
	}

	ids := make([]uint, 0, len(categories))
	for _, category := range categories {
		ids = append(ids, category.ID)
	}

	counts, err := s.courseRepo.CountByCategoryIDs(ids, status)
	if err != nil {
		return err
	}

	for i := range categories {
		if count, ok := counts[categories[i].ID]; ok {
			categories[i].CourseCount = int(count)
		} else {
			categories[i].CourseCount = 0
		}
	}

	return nil
}

// GetAll gets all categories
func (s *CourseCategoryService) GetAll() ([]*model.CourseCategoryResponse, error) {
	return s.GetAllWithStatus(nil)
}

// GetAllWithStatus gets all categories with course count filtered by status
func (s *CourseCategoryService) GetAllWithStatus(status *model.CourseStatus) ([]*model.CourseCategoryResponse, error) {
	categories, err := s.categoryRepo.GetAll()
	if err != nil {
		return nil, err
	}

	if err := s.applyCourseCounts(categories, status); err != nil {
		return nil, err
	}

	// Build tree structure
	return s.buildCategoryTree(categories), nil
}

// GetBySubject gets categories by subject
func (s *CourseCategoryService) GetBySubject(subject string) ([]*model.CourseCategoryResponse, error) {
	return s.GetBySubjectWithStatus(subject, nil)
}

// GetBySubjectWithStatus gets categories by subject with course count filtered by status
func (s *CourseCategoryService) GetBySubjectWithStatus(subject string, status *model.CourseStatus) ([]*model.CourseCategoryResponse, error) {
	categories, err := s.categoryRepo.GetBySubject(subject)
	if err != nil {
		return nil, err
	}
	if err := s.applyCourseCounts(categories, status); err != nil {
		return nil, err
	}
	return s.buildCategoryTree(categories), nil
}

// GetByExamType gets categories by exam type
func (s *CourseCategoryService) GetByExamType(examType string) ([]*model.CourseCategoryResponse, error) {
	return s.GetByExamTypeWithStatus(examType, nil)
}

// GetByExamTypeWithStatus gets categories by exam type with course count filtered by status
func (s *CourseCategoryService) GetByExamTypeWithStatus(examType string, status *model.CourseStatus) ([]*model.CourseCategoryResponse, error) {
	categories, err := s.categoryRepo.GetByExamType(examType)
	if err != nil {
		return nil, err
	}
	if err := s.applyCourseCounts(categories, status); err != nil {
		return nil, err
	}
	return s.buildCategoryTree(categories), nil
}

// GetByID gets a category by ID
func (s *CourseCategoryService) GetByID(id uint) (*model.CourseCategoryResponse, error) {
	return s.GetByIDWithStatus(id, nil)
}

// GetByIDWithStatus gets a category by ID with course count filtered by status
func (s *CourseCategoryService) GetByIDWithStatus(id uint, status *model.CourseStatus) (*model.CourseCategoryResponse, error) {
	category, err := s.categoryRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCourseCategoryNotFound
		}
		return nil, err
	}

	counts, err := s.courseRepo.CountByCategoryIDs([]uint{id}, status)
	if err != nil {
		return nil, err
	}
	if count, ok := counts[id]; ok {
		category.CourseCount = int(count)
	} else {
		category.CourseCount = 0
	}

	return category.ToResponse(), nil
}

// buildCategoryTree builds a tree structure from flat category list
func (s *CourseCategoryService) buildCategoryTree(categories []model.CourseCategory) []*model.CourseCategoryResponse {
	// Create a map for quick lookup
	categoryMap := make(map[uint]*model.CourseCategoryResponse)
	for i := range categories {
		categoryMap[categories[i].ID] = categories[i].ToResponse()
	}

	// Build tree
	var roots []*model.CourseCategoryResponse
	for _, cat := range categories {
		resp := categoryMap[cat.ID]
		if cat.ParentID == nil || *cat.ParentID == 0 {
			roots = append(roots, resp)
		} else {
			if parent, exists := categoryMap[*cat.ParentID]; exists {
				parent.Children = append(parent.Children, resp)
			}
		}
	}

	return roots
}

// Create creates a new category
func (s *CourseCategoryService) Create(category *model.CourseCategory) error {
	return s.categoryRepo.Create(category)
}

// Update updates a category
func (s *CourseCategoryService) Update(id uint, updates map[string]interface{}) error {
	return s.categoryRepo.UpdateFields(id, updates)
}

// Delete deletes a category
func (s *CourseCategoryService) Delete(id uint) error {
	return s.categoryRepo.Delete(id)
}

// =====================================================
// Course Service
// =====================================================

type CourseService struct {
	courseRepo   *repository.CourseRepository
	categoryRepo *repository.CourseCategoryRepository
	chapterRepo  *repository.CourseChapterRepository
	progressRepo *repository.UserCourseProgressRepository
	collectRepo  *repository.UserCourseCollectRepository
}

func NewCourseService(
	courseRepo *repository.CourseRepository,
	categoryRepo *repository.CourseCategoryRepository,
	chapterRepo *repository.CourseChapterRepository,
	progressRepo *repository.UserCourseProgressRepository,
	collectRepo *repository.UserCourseCollectRepository,
) *CourseService {
	return &CourseService{
		courseRepo:   courseRepo,
		categoryRepo: categoryRepo,
		chapterRepo:  chapterRepo,
		progressRepo: progressRepo,
		collectRepo:  collectRepo,
	}
}

// GetCourses gets courses with filters
func (s *CourseService) GetCourses(params *repository.CourseQueryParams) ([]model.Course, int64, error) {
	return s.courseRepo.GetList(params)
}

// GetCourseByID gets a course by ID
func (s *CourseService) GetCourseByID(id uint) (*model.Course, error) {
	course, err := s.courseRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCourseNotFound
		}
		return nil, err
	}
	return course, nil
}

// GetCourseDetail gets course detail with chapters
func (s *CourseService) GetCourseDetail(id uint, userID uint) (*model.CourseDetailResponse, error) {
	course, err := s.courseRepo.GetWithChapters(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCourseNotFound
		}
		return nil, err
	}

	// Increment view count
	_ = s.courseRepo.IncrementViewCount(id)

	resp := course.ToDetailResponse()

	// Add user-specific data if logged in
	if userID > 0 {
		resp.IsCollected = s.collectRepo.IsCollected(userID, id)

		// Get study progress
		progress, err := s.progressRepo.GetByUserAndCourse(userID, id)
		if err == nil && progress != nil {
			resp.StudyProgress = progress.Progress
		}
	}

	return resp, nil
}

// GetFeaturedCourses gets featured courses
func (s *CourseService) GetFeaturedCourses(limit int) ([]model.Course, error) {
	if limit <= 0 || limit > 50 {
		limit = 10
	}
	return s.courseRepo.GetFeatured(limit)
}

// GetFreeCourses gets free courses
func (s *CourseService) GetFreeCourses(limit int) ([]model.Course, error) {
	if limit <= 0 || limit > 50 {
		limit = 10
	}
	return s.courseRepo.GetFreeCourses(limit)
}

// GetChapterContent gets chapter content
func (s *CourseService) GetChapterContent(chapterID uint, userID uint, isVIP bool) (*model.CourseChapter, error) {
	chapter, err := s.chapterRepo.GetByID(chapterID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrChapterNotFound
		}
		return nil, err
	}

	// Check access
	if !chapter.IsFreePreview {
		// Get course to check if VIP only
		course, err := s.courseRepo.GetByID(chapter.CourseID)
		if err != nil {
			return nil, err
		}
		if course.VIPOnly && !isVIP {
			return nil, ErrChapterAccessDenied
		}
		if !course.IsFree && !isVIP && userID == 0 {
			return nil, ErrChapterAccessDenied
		}
	}

	return chapter, nil
}

// GetChapterFullContent gets chapter content with all modules
func (s *CourseService) GetChapterFullContent(chapterID uint, userID uint, isVIP bool) (*model.CourseChapterContentResponse, error) {
	chapter, err := s.chapterRepo.GetByIDWithModules(chapterID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrChapterNotFound
		}
		return nil, err
	}

	// Check access
	if !chapter.IsFreePreview {
		course, err := s.courseRepo.GetByID(chapter.CourseID)
		if err != nil {
			return nil, err
		}
		if course.VIPOnly && !isVIP {
			return nil, ErrChapterAccessDenied
		}
		if !course.IsFree && !isVIP && userID == 0 {
			return nil, ErrChapterAccessDenied
		}
	}

	// Build response
	resp := &model.CourseChapterContentResponse{
		Chapter:      chapter.ToResponse(),
		ExamAnalysis: chapter.ExamAnalysis,
	}

	// Add content JSON if available and valid
	if len(chapter.ContentJSON) > 0 {
		// Validate JSON before adding to response
		if json.Valid([]byte(chapter.ContentJSON)) {
			resp.Content = json.RawMessage(chapter.ContentJSON)
		} else {
			// Log warning but don't fail - invalid JSON might be from old/corrupted data
			// The modules should still have the content
		}
	}

	// Add modules
	if len(chapter.Modules) > 0 {
		resp.Modules = make([]*model.CourseLessonModuleResponse, len(chapter.Modules))
		byModule := make(map[string]int)
		totalWords := 0
		for i, m := range chapter.Modules {
			resp.Modules[i] = m.ToResponse()
			byModule[string(m.ModuleType)] = m.WordCount
			totalWords += m.WordCount
		}
		resp.WordCount = &model.ChapterWordCount{
			Total:    totalWords,
			ByModule: byModule,
		}
	}

	return resp, nil
}

// GetChapterModules gets chapter modules list
func (s *CourseService) GetChapterModules(chapterID uint) ([]*model.CourseLessonModuleResponse, error) {
	modules, err := s.chapterRepo.GetModulesByChapterID(chapterID)
	if err != nil {
		return nil, err
	}

	resp := make([]*model.CourseLessonModuleResponse, len(modules))
	for i, m := range modules {
		resp[i] = m.ToResponse()
	}
	return resp, nil
}

// GetSubjectModulesConfig gets module configuration for a subject
// 优先从数据库读取，如果数据库为空则返回默认配置
func (s *CourseService) GetSubjectModulesConfig(subject string) []SubjectModuleConfig {
	// 尝试从数据库读取 Level 2 的分类（模块层级）
	dbConfigs := s.getModulesFromDatabase(subject)
	if len(dbConfigs) > 0 {
		return dbConfigs
	}

	// 数据库为空，返回默认配置（兼容旧版本）
	return s.getDefaultModulesConfig(subject)
}

// SubjectOverview 科目概览数据结构
type SubjectOverview struct {
	ID            string   `json:"id"`
	Name          string   `json:"name"`
	FullName      string   `json:"full_name"`
	Description   string   `json:"description"`
	QuestionCount int      `json:"question_count"`
	CourseCount   int      `json:"course_count"`
	Features      []string `json:"features"`
	Icon          string   `json:"icon"`
	BgColor       string   `json:"bg_color"`
	TextColor     string   `json:"text_color"`
	BorderColor   string   `json:"border_color"`
}

// GetSubjectsOverview 获取所有科目的概览信息（用于学习首页展示）
func (s *CourseService) GetSubjectsOverview() []SubjectOverview {
	subjects := []string{"xingce", "shenlun", "mianshi", "gongji"}
	overviews := make([]SubjectOverview, 0, len(subjects))

	// 科目基础信息
	subjectMeta := map[string]struct {
		name        string
		fullName    string
		description string
		icon        string
		bgColor     string
		textColor   string
		borderColor string
	}{
		"xingce": {
			name:        "行测",
			fullName:    "行政职业能力测验",
			description: "数量关系、判断推理、言语理解、资料分析、常识判断",
			icon:        "BarChart3",
			bgColor:     "bg-blue-50",
			textColor:   "text-blue-600",
			borderColor: "border-blue-200",
		},
		"shenlun": {
			name:        "申论",
			fullName:    "申论写作",
			description: "归纳概括、提出对策、综合分析、贯彻执行、文章写作",
			icon:        "PenLine",
			bgColor:     "bg-emerald-50",
			textColor:   "text-emerald-600",
			borderColor: "border-emerald-200",
		},
		"mianshi": {
			name:        "面试",
			fullName:    "结构化面试",
			description: "综合分析、计划组织、人际关系、应急应变、自我认知",
			icon:        "Mic",
			bgColor:     "bg-violet-50",
			textColor:   "text-violet-600",
			borderColor: "border-violet-200",
		},
		"gongji": {
			name:        "公基",
			fullName:    "公共基础知识",
			description: "政治理论、法律知识、经济常识、管理知识、公文写作",
			icon:        "BookOpen",
			bgColor:     "bg-amber-50",
			textColor:   "text-amber-600",
			borderColor: "border-amber-200",
		},
	}

	for _, subjectID := range subjects {
		meta := subjectMeta[subjectID]

		// 从数据库获取模块
		modules := s.GetSubjectModulesConfig(subjectID)

		// 计算总题目数和特性列表
		totalQuestions := 0
		features := make([]string, 0)
		for _, m := range modules {
			totalQuestions += m.QuestionCount
			if len(features) < 3 { // 只取前3个特性
				features = append(features, m.ShortName)
			}
		}

		// 如果没有从数据库获取到模块，使用默认描述作为特性
		if len(features) == 0 {
			switch subjectID {
			case "xingce":
				features = []string{"逻辑推理", "数学运算", "言语理解"}
			case "shenlun":
				features = []string{"材料分析", "对策提出", "大作文"}
			case "mianshi":
				features = []string{"综合分析", "情景应变", "表达技巧"}
			case "gongji":
				features = []string{"法律常识", "政治理论", "时事热点"}
			}
		}

		// 使用默认题目数量（如果数据库中没有）
		if totalQuestions == 0 {
			switch subjectID {
			case "xingce":
				totalQuestions = 12580
			case "shenlun":
				totalQuestions = 3240
			case "mianshi":
				totalQuestions = 2860
			case "gongji":
				totalQuestions = 8920
			}
		}

		// 实时计算课程数量（只统计已发布的课程）
		courseCount := 0
		categories, err := s.categoryRepo.GetBySubject(subjectID)
		if err == nil && len(categories) > 0 {
			// 收集所有分类ID
			categoryIDs := make([]uint, 0, len(categories))
			for _, cat := range categories {
				categoryIDs = append(categoryIDs, cat.ID)
			}
			// 实时统计已发布课程数量
			publishedStatus := model.CourseStatusPublished
			counts, countErr := s.courseRepo.CountByCategoryIDs(categoryIDs, &publishedStatus)
			if countErr == nil {
				for _, count := range counts {
					courseCount += int(count)
				}
			}
		}

		overview := SubjectOverview{
			ID:            subjectID,
			Name:          meta.name,
			FullName:      meta.fullName,
			Description:   meta.description,
			QuestionCount: totalQuestions,
			CourseCount:   courseCount,
			Features:      features,
			Icon:          meta.icon,
			BgColor:       meta.bgColor,
			TextColor:     meta.textColor,
			BorderColor:   meta.borderColor,
		}
		overviews = append(overviews, overview)
	}

	return overviews
}

// getModulesFromDatabase 从数据库获取模块配置
func (s *CourseService) getModulesFromDatabase(subject string) []SubjectModuleConfig {
	// 查询该科目下所有分类
	categories, err := s.categoryRepo.GetBySubject(subject)
	if err != nil {
		return nil
	}

	if len(categories) == 0 {
		return nil
	}

	// 智能筛选模块分类：
	// 1. 如果有 Level 1 的分类（没有父级的顶级分类），它们就是模块
	// 2. 如果所有分类都有父级，找到最小 Level 的分类作为模块
	var moduleCategories []model.CourseCategory
	minLevel := 999

	// 首先找到最小 Level
	for _, cat := range categories {
		if cat.Level < minLevel {
			minLevel = cat.Level
		}
	}

	// 筛选最小 Level 的分类作为模块
	for _, cat := range categories {
		if cat.Level == minLevel {
			moduleCategories = append(moduleCategories, cat)
		}
	}

	if len(moduleCategories) == 0 {
		return nil
	}

	// 按 SortOrder 排序模块
	sortModuleCategories(moduleCategories)

	// 转换为 SubjectModuleConfig
	configs := make([]SubjectModuleConfig, 0, len(moduleCategories))
	for _, cat := range moduleCategories {
		// 获取子分类名称作为 Categories（下一级的分类）
		childCategories := make([]string, 0)
		for _, c := range categories {
			if c.ParentID != nil && *c.ParentID == cat.ID {
				childCategories = append(childCategories, c.Name)
			}
		}

		// 难度映射
		difficulty := 3
		switch cat.Difficulty {
		case "基础":
			difficulty = 2
		case "进阶":
			difficulty = 3
		case "提高":
			difficulty = 4
		case "冲刺":
			difficulty = 5
		}

		// 使用默认颜色映射
		color := cat.Color
		if color == "" || color == "#6366f1" {
			color = getDefaultColorForModule(cat.Code)
		}

		config := SubjectModuleConfig{
			ID:                 stripSubjectPrefix(cat.Code, subject), // 去掉科目前缀，让前端路由匹配
			Name:               cat.Name,
			ShortName:          getShortName(cat.Name),
			Description:        cat.Description,
			QuestionCount:      cat.QuestionCount,
			AvgTime:            cat.AvgTime,
			Weight:             int(cat.Weight),
			Difficulty:         difficulty,
			Color:              color,
			Categories:         childCategories,
			KeyPoints:          cat.KeyPoints,
			LongDescription:    cat.LongDescription,
			Features:           cat.Features,
			LearningObjectives: cat.LearningObjectives,
			Keywords:           cat.Keywords,
			EstimatedDuration:  cat.EstimatedDuration,
			Icon:               cat.Icon,
		}
		configs = append(configs, config)
	}

	return configs
}

// stripSubjectPrefix 从 code 中移除科目前缀
// 例如: xingce_yanyu -> yanyu, shenlun_guina -> guina
func stripSubjectPrefix(code, subject string) string {
	prefix := subject + "_"
	if strings.HasPrefix(code, prefix) {
		return strings.TrimPrefix(code, prefix)
	}
	return code
}

// sortModuleCategories 按 SortOrder 排序模块分类
func sortModuleCategories(categories []model.CourseCategory) {
	for i := 0; i < len(categories)-1; i++ {
		for j := i + 1; j < len(categories); j++ {
			if categories[i].SortOrder > categories[j].SortOrder {
				categories[i], categories[j] = categories[j], categories[i]
			}
		}
	}
}

// getShortName 获取简称
func getShortName(name string) string {
	// 移除"课程"后缀
	shortName := name
	if len(name) > 6 {
		// 取前4个字符
		runes := []rune(name)
		if len(runes) > 4 {
			shortName = string(runes[:4])
		}
	}
	return shortName
}

// getDefaultColorForModule 获取模块默认颜色
func getDefaultColorForModule(code string) string {
	colorMap := map[string]string{
		"yanyu":       "from-sky-500 to-cyan-600",
		"shuliang":    "from-violet-500 to-purple-600",
		"panduan":     "from-emerald-500 to-teal-600",
		"ziliao":      "from-orange-500 to-amber-600",
		"changshi":    "from-rose-500 to-pink-600",
		"guina":       "from-blue-500 to-indigo-600",
		"duice":       "from-green-500 to-emerald-600",
		"fenxi":       "from-purple-500 to-violet-600",
		"guanche":     "from-orange-500 to-amber-600",
		"xiezuo":      "from-rose-500 to-pink-600",
		"zonghefenxi": "from-blue-500 to-indigo-600",
		"jihuazuzhi":  "from-green-500 to-emerald-600",
		"renji":       "from-purple-500 to-violet-600",
		"yingji":      "from-orange-500 to-amber-600",
		"liyi":        "from-rose-500 to-pink-600",
		"zhengzhi":    "from-red-500 to-rose-600",
		"falv":        "from-blue-500 to-indigo-600",
		"gongwen":     "from-green-500 to-emerald-600",
		"jingji":      "from-purple-500 to-violet-600",
		"renwen":      "from-orange-500 to-amber-600",
	}
	if color, ok := colorMap[code]; ok {
		return color
	}
	return "from-indigo-500 to-blue-600"
}

// getDefaultModulesConfig 获取默认模块配置（用于数据库为空时的降级）
func (s *CourseService) getDefaultModulesConfig(subject string) []SubjectModuleConfig {
	configs := make([]SubjectModuleConfig, 0)

	switch subject {
	case "xingce":
		configs = []SubjectModuleConfig{
			{
				ID:            "yanyu",
				Name:          "言语理解与表达",
				ShortName:     "言语理解",
				Description:   "考查词语运用、阅读理解能力",
				QuestionCount: 40,
				AvgTime:       35,
				Weight:        25,
				Difficulty:    3,
				Color:         "from-sky-500 to-cyan-600",
				Categories:    []string{"逻辑填空", "片段阅读", "语句表达"},
				KeyPoints:     []string{"实词辨析", "成语辨析", "主旨概括", "意图判断"},
			},
			{
				ID:            "shuliang",
				Name:          "数量关系",
				ShortName:     "数量关系",
				Description:   "考查数学运算与数字推理能力",
				QuestionCount: 15,
				AvgTime:       25,
				Weight:        15,
				Difficulty:    5,
				Color:         "from-violet-500 to-purple-600",
				Categories:    []string{"数学运算", "数字推理"},
				KeyPoints:     []string{"行程问题", "工程问题", "排列组合", "概率问题"},
			},
			{
				ID:            "panduan",
				Name:          "判断推理",
				ShortName:     "判断推理",
				Description:   "考查逻辑推理与分析判断能力",
				QuestionCount: 40,
				AvgTime:       35,
				Weight:        25,
				Difficulty:    4,
				Color:         "from-emerald-500 to-teal-600",
				Categories:    []string{"图形推理", "定义判断", "类比推理", "逻辑判断"},
				KeyPoints:     []string{"位置规律", "样式规律", "翻译推理", "加强削弱"},
			},
			{
				ID:            "ziliao",
				Name:          "资料分析",
				ShortName:     "资料分析",
				Description:   "考查数据处理与分析能力",
				QuestionCount: 20,
				AvgTime:       25,
				Weight:        20,
				Difficulty:    4,
				Color:         "from-orange-500 to-amber-600",
				Categories:    []string{"增长问题", "比重问题", "倍数问题", "平均数问题"},
				KeyPoints:     []string{"增长率计算", "比重变化", "截位直除", "特征数字法"},
			},
			{
				ID:            "changshi",
				Name:          "常识判断",
				ShortName:     "常识判断",
				Description:   "考查综合知识与日常积累",
				QuestionCount: 20,
				AvgTime:       10,
				Weight:        15,
				Difficulty:    3,
				Color:         "from-rose-500 to-pink-600",
				Categories:    []string{"政治", "法律", "经济", "科技", "历史", "地理"},
				KeyPoints:     []string{"时政热点", "法律常识", "科技前沿", "人文历史"},
			},
		}
	case "shenlun":
		configs = []SubjectModuleConfig{
			{ID: "guina", Name: "归纳概括", ShortName: "归纳概括", Description: "提炼核心信息的能力", Difficulty: 3, Color: "from-blue-500 to-indigo-600"},
			{ID: "duice", Name: "提出对策", ShortName: "提出对策", Description: "解决实际问题的能力", Difficulty: 4, Color: "from-green-500 to-emerald-600"},
			{ID: "fenxi", Name: "综合分析", ShortName: "综合分析", Description: "深度分析问题的能力", Difficulty: 5, Color: "from-purple-500 to-violet-600"},
			{ID: "guanche", Name: "贯彻执行", ShortName: "贯彻执行", Description: "公文写作与执行能力", Difficulty: 4, Color: "from-orange-500 to-amber-600"},
			{ID: "xiezuo", Name: "文章写作", ShortName: "文章写作", Description: "议论文写作能力", Difficulty: 5, Color: "from-rose-500 to-pink-600"},
		}
	case "mianshi":
		configs = []SubjectModuleConfig{
			{ID: "zonghefenxi", Name: "综合分析题", ShortName: "综合分析", Description: "社会现象、政策理解等", Difficulty: 4, Color: "from-blue-500 to-indigo-600"},
			{ID: "jihuazuzhi", Name: "计划组织题", ShortName: "计划组织", Description: "活动策划、调研组织等", Difficulty: 3, Color: "from-green-500 to-emerald-600"},
			{ID: "renji", Name: "人际关系题", ShortName: "人际关系", Description: "处理人际矛盾与协调", Difficulty: 3, Color: "from-purple-500 to-violet-600"},
			{ID: "yingji", Name: "应急应变题", ShortName: "应急应变", Description: "突发情况的处理能力", Difficulty: 4, Color: "from-orange-500 to-amber-600"},
			{ID: "liyi", Name: "礼仪礼节", ShortName: "礼仪礼节", Description: "面试仪表与言谈举止", Difficulty: 2, Color: "from-rose-500 to-pink-600"},
		}
	case "gongji":
		configs = []SubjectModuleConfig{
			{ID: "zhengzhi", Name: "政治理论", ShortName: "政治理论", Description: "马哲、毛概、中特等", Difficulty: 3, Color: "from-red-500 to-rose-600"},
			{ID: "falv", Name: "法律知识", ShortName: "法律知识", Description: "宪法、民法、刑法等", Difficulty: 4, Color: "from-blue-500 to-indigo-600"},
			{ID: "gongwen", Name: "公文写作", ShortName: "公文写作", Description: "公文格式与写作规范", Difficulty: 3, Color: "from-green-500 to-emerald-600"},
			{ID: "jingji", Name: "经济管理", ShortName: "经济管理", Description: "经济学基础与管理学", Difficulty: 3, Color: "from-purple-500 to-violet-600"},
			{ID: "renwen", Name: "人文科技", ShortName: "人文科技", Description: "历史、地理、科技等", Difficulty: 3, Color: "from-orange-500 to-amber-600"},
		}
	}

	return configs
}

// SubjectModuleConfig 科目模块配置
type SubjectModuleConfig struct {
	ID            string   `json:"id"`
	Name          string   `json:"name"`
	ShortName     string   `json:"short_name"`
	Description   string   `json:"description"`
	QuestionCount int      `json:"question_count,omitempty"`
	AvgTime       int      `json:"avg_time,omitempty"`
	Weight        int      `json:"weight,omitempty"`
	Difficulty    int      `json:"difficulty"`
	Color         string   `json:"color"`
	Categories    []string `json:"categories,omitempty"`
	KeyPoints     []string `json:"key_points,omitempty"`

	// 新增：LLM 生成的丰富描述信息
	LongDescription    string   `json:"long_description,omitempty"`
	Features           []string `json:"features,omitempty"`
	LearningObjectives []string `json:"learning_objectives,omitempty"`
	Keywords           []string `json:"keywords,omitempty"`
	EstimatedDuration  string   `json:"estimated_duration,omitempty"`
	Icon               string   `json:"icon,omitempty"`
}

// CollectCourse collects a course
func (s *CourseService) CollectCourse(userID, courseID uint) error {
	// Check if course exists
	_, err := s.courseRepo.GetByID(courseID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrCourseNotFound
		}
		return err
	}

	// Check if already collected
	if s.collectRepo.IsCollected(userID, courseID) {
		return ErrCourseAlreadyCollected
	}

	// Create collect record
	collect := &model.UserCourseCollect{
		UserID:   userID,
		CourseID: courseID,
	}
	if err := s.collectRepo.Create(collect); err != nil {
		return err
	}

	// Increment collect count
	_ = s.courseRepo.IncrementCollectCount(courseID)

	return nil
}

// UncollectCourse uncollects a course
func (s *CourseService) UncollectCourse(userID, courseID uint) error {
	if err := s.collectRepo.Delete(userID, courseID); err != nil {
		return err
	}

	// Decrement collect count
	_ = s.courseRepo.DecrementCollectCount(courseID)

	return nil
}

// GetUserCollects gets user's collected courses
func (s *CourseService) GetUserCollects(userID uint, page, pageSize int) ([]model.UserCourseCollect, int64, error) {
	return s.collectRepo.GetUserCollects(userID, page, pageSize)
}

// UpdateStudyProgress updates study progress
func (s *CourseService) UpdateStudyProgress(userID, courseID, chapterID uint, progress float64) error {
	// Get or create progress
	courseProgress, err := s.progressRepo.GetOrCreate(userID, courseID)
	if err != nil {
		return err
	}

	// Update last chapter and time
	now := time.Now()
	courseProgress.LastChapterID = &chapterID
	courseProgress.LastStudyAt = &now

	// Calculate overall progress based on chapter completion
	// For simplicity, just update the passed progress value
	if progress > courseProgress.Progress {
		courseProgress.Progress = progress
	}

	// Check if completed
	if courseProgress.Progress >= 100 {
		courseProgress.IsCompleted = true
		courseProgress.CompletedAt = &now
	}

	return s.progressRepo.Update(courseProgress)
}

// GetUserProgress gets user's course progress
func (s *CourseService) GetUserProgress(userID, courseID uint) (*model.UserCourseProgress, error) {
	return s.progressRepo.GetByUserAndCourse(userID, courseID)
}

// GetRecentLearning gets recently learned courses
func (s *CourseService) GetRecentLearning(userID uint, limit int) ([]model.UserCourseProgress, error) {
	if limit <= 0 || limit > 20 {
		limit = 5
	}
	return s.progressRepo.GetRecentLearning(userID, limit)
}

// GetUserLearningCourses gets all courses user is learning
func (s *CourseService) GetUserLearningCourses(userID uint, page, pageSize int) ([]model.UserCourseProgress, int64, error) {
	return s.progressRepo.GetUserCourses(userID, page, pageSize)
}

// =====================================================
// Admin Methods
// =====================================================

// CreateCourse creates a new course
func (s *CourseService) CreateCourse(course *model.Course) error {
	if err := s.courseRepo.Create(course); err != nil {
		return err
	}
	// Increment category course count
	_ = s.categoryRepo.IncrementCourseCount(course.CategoryID)
	return nil
}

// UpdateCourse updates a course
func (s *CourseService) UpdateCourse(id uint, updates map[string]interface{}) error {
	return s.courseRepo.UpdateFields(id, updates)
}

// DeleteCourse deletes a course
func (s *CourseService) DeleteCourse(id uint) error {
	course, err := s.courseRepo.GetByID(id)
	if err != nil {
		return err
	}
	if err := s.courseRepo.Delete(id); err != nil {
		return err
	}
	// Decrement category course count
	_ = s.categoryRepo.DecrementCourseCount(course.CategoryID)
	return nil
}

// UpdateCourseStatus updates course status
func (s *CourseService) UpdateCourseStatus(id uint, status model.CourseStatus) error {
	updates := map[string]interface{}{
		"status": status,
	}
	if status == model.CourseStatusPublished {
		now := time.Now()
		updates["published_at"] = &now
	}
	return s.courseRepo.UpdateFields(id, updates)
}

// GetChaptersByCourse gets all chapters for a course
func (s *CourseService) GetChaptersByCourse(courseID uint) ([]*model.CourseChapterResponse, error) {
	chapters, err := s.chapterRepo.GetByCourse(courseID)
	if err != nil {
		return nil, err
	}

	// Build tree structure
	chapterMap := make(map[uint]*model.CourseChapterResponse)
	for i := range chapters {
		chapterMap[chapters[i].ID] = chapters[i].ToResponse()
	}

	var roots []*model.CourseChapterResponse
	for _, ch := range chapters {
		resp := chapterMap[ch.ID]
		if ch.ParentID == nil || *ch.ParentID == 0 {
			roots = append(roots, resp)
		} else {
			if parent, exists := chapterMap[*ch.ParentID]; exists {
				parent.Children = append(parent.Children, resp)
			}
		}
	}

	return roots, nil
}

// CreateChapter creates a new chapter
func (s *CourseService) CreateChapter(chapter *model.CourseChapter) error {
	if err := s.chapterRepo.Create(chapter); err != nil {
		return err
	}
	// Update course chapter count
	count, _ := s.chapterRepo.CountByCourse(chapter.CourseID)
	_ = s.courseRepo.UpdateFields(chapter.CourseID, map[string]interface{}{
		"chapter_count": count,
	})
	return nil
}

// UpdateChapter updates a chapter
func (s *CourseService) UpdateChapter(id uint, updates map[string]interface{}) error {
	return s.chapterRepo.UpdateFields(id, updates)
}

// DeleteChapter deletes a chapter
func (s *CourseService) DeleteChapter(id uint) error {
	chapter, err := s.chapterRepo.GetByID(id)
	if err != nil {
		return err
	}
	if err := s.chapterRepo.Delete(id); err != nil {
		return err
	}
	// Update course chapter count
	count, _ := s.chapterRepo.CountByCourse(chapter.CourseID)
	_ = s.courseRepo.UpdateFields(chapter.CourseID, map[string]interface{}{
		"chapter_count": count,
	})
	return nil
}

// CourseStats course statistics
type CourseStats struct {
	TotalCourses     int64            `json:"total_courses"`
	PublishedCourses int64            `json:"published_courses"`
	DraftCourses     int64            `json:"draft_courses"`
	FreeCourses      int64            `json:"free_courses"`
	VIPCourses       int64            `json:"vip_courses"`
	TotalChapters    int64            `json:"total_chapters"`
	TotalKnowledge   int64            `json:"total_knowledge"`
	TotalStudyCount  int64            `json:"total_study_count"`
	CategoryStats    []CategoryStat   `json:"category_stats"`
	SubjectStats     []SubjectStat    `json:"subject_stats"`
	DifficultyStats  []DifficultyStat `json:"difficulty_stats"`
}

type CategoryStat struct {
	CategoryID   uint   `json:"category_id"`
	CategoryName string `json:"category_name"`
	CourseCount  int64  `json:"course_count"`
}

type SubjectStat struct {
	Subject     string `json:"subject"`
	CourseCount int64  `json:"course_count"`
}

type DifficultyStat struct {
	Difficulty  string `json:"difficulty"`
	CourseCount int64  `json:"course_count"`
}

// GetStats gets course statistics
func (s *CourseService) GetStats() (*CourseStats, error) {
	stats := &CourseStats{}

	// Total courses
	s.courseRepo.CountAll(&stats.TotalCourses)

	// Published courses
	s.courseRepo.CountByStatus(model.CourseStatusPublished, &stats.PublishedCourses)

	// Draft courses
	s.courseRepo.CountByStatus(model.CourseStatusDraft, &stats.DraftCourses)

	// Free courses
	s.courseRepo.CountFree(&stats.FreeCourses)

	// VIP courses
	s.courseRepo.CountVIP(&stats.VIPCourses)

	// Total study count
	s.courseRepo.SumStudyCount(&stats.TotalStudyCount)

	return stats, nil
}

// InitCourseContent initializes course content from seed data
func (s *CourseService) InitCourseContent() error {
	// This will be called from the handler to trigger seed data
	// The actual implementation is in database/seed_courses.go
	return nil
}

// =====================================================
// Knowledge Point Service
// =====================================================

type KnowledgePointService struct {
	pointRepo    *repository.KnowledgePointRepository
	categoryRepo *repository.CourseCategoryRepository
}

func NewKnowledgePointService(
	pointRepo *repository.KnowledgePointRepository,
	categoryRepo *repository.CourseCategoryRepository,
) *KnowledgePointService {
	return &KnowledgePointService{
		pointRepo:    pointRepo,
		categoryRepo: categoryRepo,
	}
}

// GetByCategory gets knowledge points by category
func (s *KnowledgePointService) GetByCategory(categoryID uint) ([]*model.KnowledgePointResponse, error) {
	points, err := s.pointRepo.GetByCategory(categoryID)
	if err != nil {
		return nil, err
	}
	return s.buildPointTree(points), nil
}

// GetTree gets knowledge point tree
func (s *KnowledgePointService) GetTree(categoryID uint) ([]*model.KnowledgePointResponse, error) {
	points, err := s.pointRepo.GetTree(categoryID)
	if err != nil {
		return nil, err
	}
	return s.buildPointTree(points), nil
}

// GetHighFrequency gets high-frequency knowledge points
func (s *KnowledgePointService) GetHighFrequency(categoryID uint, limit int) ([]model.KnowledgePoint, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}
	return s.pointRepo.GetHighFrequency(categoryID, limit)
}

// GetByID gets a knowledge point by ID
func (s *KnowledgePointService) GetByID(id uint) (*model.KnowledgePointResponse, error) {
	point, err := s.pointRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrKnowledgeNotFound
		}
		return nil, err
	}
	return point.ToResponse(), nil
}

// buildPointTree builds tree structure from flat list
func (s *KnowledgePointService) buildPointTree(points []model.KnowledgePoint) []*model.KnowledgePointResponse {
	pointMap := make(map[uint]*model.KnowledgePointResponse)
	for i := range points {
		pointMap[points[i].ID] = points[i].ToResponse()
	}

	var roots []*model.KnowledgePointResponse
	for _, point := range points {
		resp := pointMap[point.ID]
		if point.ParentID == nil || *point.ParentID == 0 {
			roots = append(roots, resp)
		} else {
			if parent, exists := pointMap[*point.ParentID]; exists {
				parent.Children = append(parent.Children, resp)
			}
		}
	}

	return roots
}

// GetAll gets all knowledge points
func (s *KnowledgePointService) GetAll() ([]*model.KnowledgePointResponse, error) {
	points, err := s.pointRepo.GetAll()
	if err != nil {
		return nil, err
	}
	return s.buildPointTree(points), nil
}

// Create creates a new knowledge point
func (s *KnowledgePointService) Create(point *model.KnowledgePoint) error {
	return s.pointRepo.Create(point)
}

// Update updates a knowledge point
func (s *KnowledgePointService) Update(id uint, updates map[string]interface{}) error {
	return s.pointRepo.UpdateFields(id, updates)
}

// Delete deletes a knowledge point
func (s *KnowledgePointService) Delete(id uint) error {
	return s.pointRepo.Delete(id)
}
