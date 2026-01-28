package database

import (
	"time"

	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

// SeedCourseContent 初始化公考学习课程内容
// 包括：行测课程、申论课程、面试课程、公基课程
func SeedCourseContent(db *gorm.DB) error {
	// 检查是否已有课程数据
	var count int64
	db.Model(&model.Course{}).Count(&count)
	if count > 0 {
		return nil
	}

	// 获取课程分类
	categories := make(map[string]*model.CourseCategory)
	var allCategories []model.CourseCategory
	db.Find(&allCategories)
	for i := range allCategories {
		categories[allCategories[i].Code] = &allCategories[i]
	}

	// 初始化行测课程
	if err := seedXingceCourses(db, categories); err != nil {
		return err
	}

	// 初始化申论课程
	if err := seedShenlunCourses(db, categories); err != nil {
		return err
	}

	// 初始化面试课程
	if err := seedMianshiCourses(db, categories); err != nil {
		return err
	}

	// 初始化公基课程
	if err := seedGongjiCourses(db, categories); err != nil {
		return err
	}

	// 初始化知识点
	if err := seedKnowledgePoints(db, categories); err != nil {
		return err
	}

	return nil
}

// =====================================================
// 行测课程内容
// =====================================================

func seedXingceCourses(db *gorm.DB, categories map[string]*model.CourseCategory) error {
	now := time.Now()

	// 言语理解课程
	yanyuCourses := []model.Course{
		{
			CategoryID:  categories["xc_yanyu_luoji"].ID,
			Title:       "逻辑填空精讲 - 实词辨析",
			Subtitle:    "掌握500+组高频实词，轻松应对填空题",
			Description: "本课程系统讲解行测言语理解中的实词辨析题型，涵盖常见实词辨析方法、语境分析技巧、固定搭配总结等内容。通过大量真题演练，帮助考生快速提升答题准确率。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyBasic,
			Duration:    600, // 10小时
			TeacherName: "王老师",
			IsFree:      false,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"行测", "言语理解", "实词辨析", "高频考点"},
			SortOrder:   1,
		},
		{
			CategoryID:  categories["xc_yanyu_luoji"].ID,
			Title:       "成语辨析速成班",
			Subtitle:    "800个高频成语，易混成语辨析一网打尽",
			Description: "针对公考中常考的成语辨析题型，精选800个高频成语，重点讲解200组易混成语的辨析技巧，帮助考生快速记忆并正确运用。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyBasic,
			Duration:    480, // 8小时
			TeacherName: "李老师",
			IsFree:      true,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"行测", "言语理解", "成语", "免费课程"},
			SortOrder:   2,
		},
		{
			CategoryID:  categories["xc_yanyu_pianduan"].ID,
			Title:       "片段阅读技巧精讲",
			Subtitle:    "主旨概括、意图判断、细节理解全覆盖",
			Description: "全面讲解片段阅读各题型的解题方法，包括行文脉络分析、关键词定位、选项排除等核心技巧，配合大量真题实战演练。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyIntermediate,
			Duration:    540, // 9小时
			TeacherName: "张老师",
			IsFree:      false,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"行测", "言语理解", "片段阅读", "必学"},
			SortOrder:   3,
		},
		{
			CategoryID:  categories["xc_yanyu_yuju"].ID,
			Title:       "语句表达专项突破",
			Subtitle:    "语句排序与语句填空的解题秘籍",
			Description: "专门针对语句排序和语句填空题型，讲解首句判断、逻辑顺序分析、承上启下判断等核心方法。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyBasic,
			Duration:    300, // 5小时
			TeacherName: "王老师",
			IsFree:      true,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"行测", "言语理解", "语句表达", "入门"},
			SortOrder:   4,
		},
	}

	// 数量关系课程
	shuliangCourses := []model.Course{
		{
			CategoryID:  categories["xc_shuliang_yunsuan"].ID,
			Title:       "数学运算核心题型精讲",
			Subtitle:    "行程、工程、利润问题一课通关",
			Description: "系统讲解数学运算中的核心题型，包括行程问题、工程问题、利润问题等，每种题型配有详细的解题模板和速算技巧。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyIntermediate,
			Duration:    720, // 12小时
			TeacherName: "刘老师",
			IsFree:      false,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"行测", "数量关系", "数学运算", "核心课程"},
			SortOrder:   1,
		},
		{
			CategoryID:  categories["xc_shuliang_yunsuan"].ID,
			Title:       "排列组合与概率精讲",
			Subtitle:    "公考数学难点突破专项课",
			Description: "针对数量关系中的排列组合和概率问题进行专项讲解，从基本原理到高级技巧，逐步攻克这一难点。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyAdvanced,
			Duration:    480, // 8小时
			TeacherName: "刘老师",
			IsFree:      false,
			VIPOnly:     true,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"行测", "数量关系", "排列组合", "概率", "难点"},
			SortOrder:   2,
		},
		{
			CategoryID:  categories["xc_shuliang_tuili"].ID,
			Title:       "数字推理规律速解",
			Subtitle:    "等差、等比、递推数列全攻略",
			Description: "全面讲解数字推理的各种规律类型，包括等差数列、等比数列、递推数列、分数数列等，掌握快速找规律的方法。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyBasic,
			Duration:    360, // 6小时
			TeacherName: "陈老师",
			IsFree:      true,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"行测", "数量关系", "数字推理", "免费"},
			SortOrder:   3,
		},
	}

	// 判断推理课程
	panduanCourses := []model.Course{
		{
			CategoryID:  categories["xc_panduan_tuxing"].ID,
			Title:       "图形推理规律精讲",
			Subtitle:    "位置、样式、属性、数量规律全掌握",
			Description: "系统讲解图形推理中的各种规律类型，包括位置规律、样式规律、属性规律、数量规律等，配有大量真题演练。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyIntermediate,
			Duration:    540, // 9小时
			TeacherName: "赵老师",
			IsFree:      false,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"行测", "判断推理", "图形推理", "规律"},
			SortOrder:   1,
		},
		{
			CategoryID:  categories["xc_panduan_tuxing"].ID,
			Title:       "空间重构与立体图形",
			Subtitle:    "六面体、四面体、截面图专项突破",
			Description: "专门针对空间重构类图形推理题，讲解六面体展开图、四面体重构、截面图分析等内容。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyAdvanced,
			Duration:    360, // 6小时
			TeacherName: "赵老师",
			IsFree:      false,
			VIPOnly:     true,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"行测", "判断推理", "图形推理", "空间重构", "难点"},
			SortOrder:   2,
		},
		{
			CategoryID:  categories["xc_panduan_dingyi"].ID,
			Title:       "定义判断解题技巧",
			Subtitle:    "关键信息提取与选项排除法",
			Description: "讲解定义判断题的核心解题方法，包括关键信息提取、选项排除、常见定义类型识别等技巧。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyBasic,
			Duration:    420, // 7小时
			TeacherName: "孙老师",
			IsFree:      true,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"行测", "判断推理", "定义判断", "入门"},
			SortOrder:   3,
		},
		{
			CategoryID:  categories["xc_panduan_leibi"].ID,
			Title:       "类比推理全题型精讲",
			Subtitle:    "语义、逻辑、语法关系一网打尽",
			Description: "全面讲解类比推理中的各种关系类型，包括语义关系、逻辑关系、语法关系等，帮助考生快速识别和解答。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyBasic,
			Duration:    360, // 6小时
			TeacherName: "周老师",
			IsFree:      false,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"行测", "判断推理", "类比推理"},
			SortOrder:   4,
		},
		{
			CategoryID:  categories["xc_panduan_luoji"].ID,
			Title:       "逻辑判断系统班",
			Subtitle:    "翻译推理、真假推理、加强削弱全覆盖",
			Description: "系统讲解逻辑判断的所有题型，包括翻译推理、真假推理、分析推理、归纳推理、加强削弱等，是备考必修课程。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyIntermediate,
			Duration:    900, // 15小时
			TeacherName: "吴老师",
			IsFree:      false,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"行测", "判断推理", "逻辑判断", "系统课"},
			SortOrder:   5,
		},
	}

	// 资料分析课程
	ziliaoCourses := []model.Course{
		{
			CategoryID:  categories["xc_ziliao_zengzhang"].ID,
			Title:       "增长问题核心公式与技巧",
			Subtitle:    "增长率、增长量、年均增长一课搞定",
			Description: "详细讲解资料分析中的增长问题，包括增长率计算、增长量计算、年均增长率等，配有速算技巧和真题演练。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyBasic,
			Duration:    480, // 8小时
			TeacherName: "郑老师",
			IsFree:      true,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"行测", "资料分析", "增长问题", "免费"},
			SortOrder:   1,
		},
		{
			CategoryID:  categories["xc_ziliao_bizhong"].ID,
			Title:       "比重问题专项精讲",
			Subtitle:    "现期比重、基期比重、比重变化全攻略",
			Description: "专门针对资料分析中的比重问题，讲解各类比重计算方法和判断技巧。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyIntermediate,
			Duration:    420, // 7小时
			TeacherName: "郑老师",
			IsFree:      false,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"行测", "资料分析", "比重问题"},
			SortOrder:   2,
		},
		{
			CategoryID:  categories["xc_ziliao_zonghe"].ID,
			Title:       "资料分析速算技巧大全",
			Subtitle:    "截位直除、特征数字、有效数字法",
			Description: "系统讲解资料分析中的各种速算技巧，包括截位直除法、特征数字法、有效数字法、同位比较法等。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyIntermediate,
			Duration:    360, // 6小时
			TeacherName: "冯老师",
			IsFree:      false,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"行测", "资料分析", "速算技巧", "必学"},
			SortOrder:   3,
		},
	}

	// 常识判断课程
	changshiCourses := []model.Course{
		{
			CategoryID:  categories["xc_changshi_zhengzhi"].ID,
			Title:       "时政热点精讲与预测",
			Subtitle:    "年度重要会议、政策文件全解读",
			Description: "精选年度重要时政热点，系统讲解重大会议精神、政策文件要点，帮助考生把握常识判断命题方向。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyBasic,
			Duration:    480, // 8小时
			TeacherName: "黄老师",
			IsFree:      true,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"行测", "常识判断", "时政", "热点"},
			SortOrder:   1,
		},
		{
			CategoryID:  categories["xc_changshi_falv"].ID,
			Title:       "法律常识速记课",
			Subtitle:    "宪法、民法典、刑法、行政法核心考点",
			Description: "精选公考常考的法律知识点，系统梳理宪法、民法典、刑法、行政法等核心内容，帮助考生快速记忆。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyBasic,
			Duration:    600, // 10小时
			TeacherName: "杨律师",
			IsFree:      false,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"行测", "常识判断", "法律", "核心考点"},
			SortOrder:   2,
		},
		{
			CategoryID:  categories["xc_changshi_lishi"].ID,
			Title:       "历史常识通关课",
			Subtitle:    "中国古代史、近现代史、世界史全覆盖",
			Description: "系统梳理公考常考的历史知识点，包括中国古代史、近现代史、世界史、党史等内容。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyBasic,
			Duration:    540, // 9小时
			TeacherName: "林老师",
			IsFree:      false,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"行测", "常识判断", "历史"},
			SortOrder:   3,
		},
		{
			CategoryID:  categories["xc_changshi_keji"].ID,
			Title:       "科技常识速览",
			Subtitle:    "物理、化学、生物、信息技术考点精讲",
			Description: "精选公考常考的科技知识点，涵盖物理、化学、生物、信息技术、前沿科技等内容。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyBasic,
			Duration:    420, // 7小时
			TeacherName: "何博士",
			IsFree:      true,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"行测", "常识判断", "科技", "免费"},
			SortOrder:   4,
		},
	}

	// 批量创建行测课程
	allXingceCourses := append(yanyuCourses, shuliangCourses...)
	allXingceCourses = append(allXingceCourses, panduanCourses...)
	allXingceCourses = append(allXingceCourses, ziliaoCourses...)
	allXingceCourses = append(allXingceCourses, changshiCourses...)

	if err := db.Create(&allXingceCourses).Error; err != nil {
		return err
	}

	// 为每个课程创建章节
	for _, course := range allXingceCourses {
		if err := createCourseChapters(db, &course); err != nil {
			return err
		}
	}

	return nil
}

// =====================================================
// 申论课程内容
// =====================================================

func seedShenlunCourses(db *gorm.DB, categories map[string]*model.CourseCategory) error {
	now := time.Now()

	shenlunCourses := []model.Course{
		{
			CategoryID:  categories["sl_guina"].ID,
			Title:       "归纳概括题型精讲",
			Subtitle:    "概括问题、原因、做法、特点的答题模板",
			Description: "系统讲解申论归纳概括题的各种类型，包括概括问题、概括原因、概括做法、概括特点等，提供实用的答题模板和技巧。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyBasic,
			Duration:    600, // 10小时
			TeacherName: "申论名师",
			IsFree:      true,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"申论", "归纳概括", "入门", "免费"},
			SortOrder:   1,
		},
		{
			CategoryID:  categories["sl_duice"].ID,
			Title:       "提出对策专项突破",
			Subtitle:    "直接对策、间接对策、对策维度全攻略",
			Description: "专门针对申论提出对策题型，讲解对策来源分析、对策维度框架、对策表述规范等核心内容。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyIntermediate,
			Duration:    480, // 8小时
			TeacherName: "申论名师",
			IsFree:      false,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"申论", "提出对策", "核心课程"},
			SortOrder:   2,
		},
		{
			CategoryID:  categories["sl_fenxi"].ID,
			Title:       "综合分析题型全解",
			Subtitle:    "解释型、评价型、比较型、启示型分析",
			Description: "全面讲解申论综合分析题的各种类型，提供标准答题结构和高分技巧。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyIntermediate,
			Duration:    540, // 9小时
			TeacherName: "申论名师",
			IsFree:      false,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"申论", "综合分析", "题型精讲"},
			SortOrder:   3,
		},
		{
			CategoryID:  categories["sl_guanche"].ID,
			Title:       "贯彻执行公文写作大全",
			Subtitle:    "讲话稿、倡议书、调研报告、工作方案等20+文种",
			Description: "系统讲解申论贯彻执行题中常考的各类公文格式和写作方法，涵盖讲话稿、倡议书、调研报告、工作方案等20多种文种。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyAdvanced,
			Duration:    900, // 15小时
			TeacherName: "申论名师",
			IsFree:      false,
			VIPOnly:     true,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"申论", "贯彻执行", "公文写作", "VIP"},
			SortOrder:   4,
		},
		{
			CategoryID:  categories["sl_xiezuo"].ID,
			Title:       "大作文写作系统班",
			Subtitle:    "立意、标题、开头、分论点、结尾全覆盖",
			Description: "全面讲解申论大作文写作的各个环节，包括立意技巧、标题拟定、开头写法、分论点论证、结尾写法等，配有大量范文赏析。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyIntermediate,
			Duration:    720, // 12小时
			TeacherName: "申论名师",
			IsFree:      false,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"申论", "大作文", "写作", "系统课"},
			SortOrder:   5,
		},
		{
			CategoryID:  categories["sl_xiezuo"].ID,
			Title:       "申论素材积累与运用",
			Subtitle:    "名言警句、案例素材、优美语句一站式积累",
			Description: "精选申论写作常用素材，包括习近平金句、名言警句、经典案例、优美语句等，教你如何在写作中恰当运用。",
			ContentType: model.CourseContentArticle,
			Difficulty:  model.CourseDifficultyBasic,
			Duration:    300, // 5小时
			TeacherName: "申论名师",
			IsFree:      true,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"申论", "素材积累", "免费"},
			SortOrder:   6,
		},
	}

	if err := db.Create(&shenlunCourses).Error; err != nil {
		return err
	}

	for _, course := range shenlunCourses {
		if err := createCourseChapters(db, &course); err != nil {
			return err
		}
	}

	return nil
}

// =====================================================
// 面试课程内容
// =====================================================

func seedMianshiCourses(db *gorm.DB, categories map[string]*model.CourseCategory) error {
	now := time.Now()

	mianshiCourses := []model.Course{
		{
			CategoryID:  categories["ms_jiegou_zonghe"].ID,
			Title:       "综合分析题全攻略",
			Subtitle:    "社会现象、政策理解、名言警句、哲理故事",
			Description: "系统讲解结构化面试中的综合分析题，涵盖社会现象类、政策理解类、名言警句类、哲理故事类等题型，提供标准答题框架。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyIntermediate,
			Duration:    720, // 12小时
			TeacherName: "面试名师",
			IsFree:      false,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"面试", "综合分析", "结构化", "核心课程"},
			SortOrder:   1,
		},
		{
			CategoryID:  categories["ms_jiegou_jihua"].ID,
			Title:       "计划组织题型精讲",
			Subtitle:    "调研、宣传、活动策划、会议组织",
			Description: "全面讲解计划组织协调题的各种类型，包括调研类、宣传类、活动策划类、会议组织类等，提供详细的答题模板。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyIntermediate,
			Duration:    600, // 10小时
			TeacherName: "面试名师",
			IsFree:      false,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"面试", "计划组织", "结构化"},
			SortOrder:   2,
		},
		{
			CategoryID:  categories["ms_jiegou_renji"].ID,
			Title:       "人际关系题解题技巧",
			Subtitle:    "与领导、同事、群众、亲友关系处理",
			Description: "讲解面试中人际关系题的处理原则和答题技巧，涵盖与领导、同事、群众、亲友等各种关系场景。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyBasic,
			Duration:    480, // 8小时
			TeacherName: "面试名师",
			IsFree:      true,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"面试", "人际关系", "结构化", "免费"},
			SortOrder:   3,
		},
		{
			CategoryID:  categories["ms_jiegou_yingji"].ID,
			Title:       "应急应变题突破课",
			Subtitle:    "公共危机、工作危机、舆情处理",
			Description: "专门针对应急应变类面试题，讲解各种紧急情况的处理原则和答题框架。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyIntermediate,
			Duration:    540, // 9小时
			TeacherName: "面试名师",
			IsFree:      false,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"面试", "应急应变", "结构化"},
			SortOrder:   4,
		},
		{
			CategoryID:  categories["ms_wulingdao"].ID,
			Title:       "无领导小组讨论全程指导",
			Subtitle:    "题型分类、角色策略、讨论技巧",
			Description: "全面讲解无领导小组讨论的各种题型、角色策略和讨论技巧，帮助考生在讨论中脱颖而出。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyAdvanced,
			Duration:    480, // 8小时
			TeacherName: "面试名师",
			IsFree:      false,
			VIPOnly:     true,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"面试", "无领导小组讨论", "VIP"},
			SortOrder:   5,
		},
		{
			CategoryID:  categories["ms_jiqiao"].ID,
			Title:       "面试礼仪与心理调适",
			Subtitle:    "着装规范、仪态举止、紧张缓解",
			Description: "讲解面试中的礼仪规范和心理调适技巧，包括着装、仪态、语言表达、紧张缓解等内容。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyBeginner,
			Duration:    240, // 4小时
			TeacherName: "面试名师",
			IsFree:      true,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"面试", "礼仪", "心理", "入门", "免费"},
			SortOrder:   6,
		},
	}

	if err := db.Create(&mianshiCourses).Error; err != nil {
		return err
	}

	for _, course := range mianshiCourses {
		if err := createCourseChapters(db, &course); err != nil {
			return err
		}
	}

	return nil
}

// =====================================================
// 公共基础知识课程内容
// =====================================================

func seedGongjiCourses(db *gorm.DB, categories map[string]*model.CourseCategory) error {
	now := time.Now()

	gongjiCourses := []model.Course{
		{
			CategoryID:  categories["gj_zhengzhi"].ID,
			Title:       "马克思主义哲学精讲",
			Subtitle:    "唯物论、辩证法、认识论、唯物史观",
			Description: "系统讲解马克思主义哲学的核心内容，包括唯物论、辩证法、认识论、唯物史观等，是公基必考内容。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyBasic,
			Duration:    480, // 8小时
			TeacherName: "政治名师",
			IsFree:      true,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"公基", "政治理论", "马哲", "免费"},
			SortOrder:   1,
		},
		{
			CategoryID:  categories["gj_zhengzhi"].ID,
			Title:       "习近平新时代中国特色社会主义思想",
			Subtitle:    "核心要义、主要内容、重要论述",
			Description: "全面解读习近平新时代中国特色社会主义思想的核心要义、主要内容和重要论述，是公考必学内容。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyBasic,
			Duration:    360, // 6小时
			TeacherName: "政治名师",
			IsFree:      false,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"公基", "政治理论", "习思想", "必学"},
			SortOrder:   2,
		},
		{
			CategoryID:  categories["gj_falv"].ID,
			Title:       "宪法核心考点精讲",
			Subtitle:    "国家基本制度、公民权利义务、国家机构",
			Description: "系统讲解宪法的核心考点，包括国家基本制度、公民基本权利与义务、国家机构等内容。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyBasic,
			Duration:    300, // 5小时
			TeacherName: "法律名师",
			IsFree:      true,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"公基", "法律", "宪法", "免费"},
			SortOrder:   3,
		},
		{
			CategoryID:  categories["gj_falv"].ID,
			Title:       "民法典全面解读",
			Subtitle:    "总则、物权、合同、人格权、婚姻家庭、继承、侵权",
			Description: "全面解读民法典的各编内容，包括总则、物权、合同、人格权、婚姻家庭、继承、侵权责任等。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyIntermediate,
			Duration:    720, // 12小时
			TeacherName: "法律名师",
			IsFree:      false,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"公基", "法律", "民法典", "重点"},
			SortOrder:   4,
		},
		{
			CategoryID:  categories["gj_falv"].ID,
			Title:       "刑法核心考点",
			Subtitle:    "犯罪构成、排除犯罪事由、刑罚、常见罪名",
			Description: "讲解公考常考的刑法知识点，包括犯罪构成、排除犯罪事由、刑罚种类、常见罪名等。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyBasic,
			Duration:    420, // 7小时
			TeacherName: "法律名师",
			IsFree:      false,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"公基", "法律", "刑法"},
			SortOrder:   5,
		},
		{
			CategoryID:  categories["gj_gongwen"].ID,
			Title:       "公文写作与处理",
			Subtitle:    "公文格式、常用文种、公文处理流程",
			Description: "系统讲解公文写作的格式规范、常用文种和处理流程，是事业单位考试的高频考点。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyBasic,
			Duration:    360, // 6小时
			TeacherName: "公文名师",
			IsFree:      false,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"公基", "公文写作", "事业单位"},
			SortOrder:   6,
		},
		{
			CategoryID:  categories["gj_jingji"].ID,
			Title:       "经济常识速览",
			Subtitle:    "社会主义市场经济、宏微观经济、国际经济",
			Description: "精讲公考常考的经济知识点，包括社会主义市场经济、宏观经济、微观经济、国际经济等内容。",
			ContentType: model.CourseContentVideo,
			Difficulty:  model.CourseDifficultyBasic,
			Duration:    300, // 5小时
			TeacherName: "经济名师",
			IsFree:      true,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"公基", "经济", "免费"},
			SortOrder:   7,
		},
		{
			CategoryID:  categories["gj_shishi"].ID,
			Title:       "时事政治月度汇编",
			Subtitle:    "国内外时政热点、重大会议精神",
			Description: "每月更新的时事政治汇编，涵盖国内外重要时政新闻、重大会议精神等内容。",
			ContentType: model.CourseContentArticle,
			Difficulty:  model.CourseDifficultyBasic,
			Duration:    180, // 3小时
			TeacherName: "时政编辑",
			IsFree:      true,
			VIPOnly:     false,
			Status:      model.CourseStatusPublished,
			PublishedAt: &now,
			Tags:        model.JSONStringArray{"公基", "时政", "月度更新", "免费"},
			SortOrder:   8,
		},
	}

	if err := db.Create(&gongjiCourses).Error; err != nil {
		return err
	}

	for _, course := range gongjiCourses {
		if err := createCourseChapters(db, &course); err != nil {
			return err
		}
	}

	return nil
}

// =====================================================
// 创建课程章节
// =====================================================

func createCourseChapters(db *gorm.DB, course *model.Course) error {
	// 根据课程类型创建不同的章节结构
	var chapters []model.CourseChapter

	// 通用章节结构
	chapters = []model.CourseChapter{
		{
			CourseID:      course.ID,
			Title:         "课程导学",
			ContentType:   course.ContentType,
			Duration:      15,
			IsFreePreview: true,
			SortOrder:     1,
			Level:         1,
		},
		{
			CourseID:    course.ID,
			Title:       "第一章 基础知识",
			ContentType: course.ContentType,
			Duration:    course.Duration / 5,
			SortOrder:   2,
			Level:       1,
		},
		{
			CourseID:    course.ID,
			Title:       "第二章 核心技巧",
			ContentType: course.ContentType,
			Duration:    course.Duration / 4,
			SortOrder:   3,
			Level:       1,
		},
		{
			CourseID:    course.ID,
			Title:       "第三章 题型精讲",
			ContentType: course.ContentType,
			Duration:    course.Duration / 3,
			SortOrder:   4,
			Level:       1,
		},
		{
			CourseID:    course.ID,
			Title:       "第四章 真题演练",
			ContentType: course.ContentType,
			Duration:    course.Duration / 4,
			SortOrder:   5,
			Level:       1,
		},
		{
			CourseID:      course.ID,
			Title:         "课程总结",
			ContentType:   course.ContentType,
			Duration:      15,
			IsFreePreview: false,
			SortOrder:     6,
			Level:         1,
		},
	}

	if err := db.Create(&chapters).Error; err != nil {
		return err
	}

	// 更新课程的章节数
	return db.Model(&model.Course{}).Where("id = ?", course.ID).
		Update("chapter_count", len(chapters)).Error
}

// =====================================================
// 知识点数据
// =====================================================

func seedKnowledgePoints(db *gorm.DB, categories map[string]*model.CourseCategory) error {
	var count int64
	db.Model(&model.KnowledgePoint{}).Count(&count)
	if count > 0 {
		return nil
	}

	// 行测 - 言语理解知识点
	if categories["xc_yanyu_luoji"] != nil {
		yanyuPoints := []model.KnowledgePoint{
			{CategoryID: categories["xc_yanyu_luoji"].ID, Name: "实词辨析", Code: "xc_yy_sc", Description: "辨析词义相近或相关的实词", Importance: 5, Frequency: model.KnowledgeFrequencyHigh, SortOrder: 1, Level: 1},
			{CategoryID: categories["xc_yanyu_luoji"].ID, Name: "成语辨析", Code: "xc_yy_cy", Description: "辨析意义相近或易混的成语", Importance: 5, Frequency: model.KnowledgeFrequencyHigh, SortOrder: 2, Level: 1},
			{CategoryID: categories["xc_yanyu_luoji"].ID, Name: "关联词", Code: "xc_yy_glc", Description: "递进、转折、因果、并列、条件等关联词", Importance: 4, Frequency: model.KnowledgeFrequencyMedium, SortOrder: 3, Level: 1},
		}
		if err := db.Create(&yanyuPoints).Error; err != nil {
			return err
		}
	}

	// 行测 - 数量关系知识点
	if categories["xc_shuliang_yunsuan"] != nil {
		shuliangPoints := []model.KnowledgePoint{
			{CategoryID: categories["xc_shuliang_yunsuan"].ID, Name: "行程问题", Code: "xc_sl_xc", Description: "相遇追及、流水行船、环形轨道等问题", Importance: 5, Frequency: model.KnowledgeFrequencyHigh, SortOrder: 1, Level: 1},
			{CategoryID: categories["xc_shuliang_yunsuan"].ID, Name: "工程问题", Code: "xc_sl_gc", Description: "单独完成、合作完成、交替完成等问题", Importance: 5, Frequency: model.KnowledgeFrequencyHigh, SortOrder: 2, Level: 1},
			{CategoryID: categories["xc_shuliang_yunsuan"].ID, Name: "利润问题", Code: "xc_sl_lr", Description: "成本利润、打折促销、分段计费等问题", Importance: 4, Frequency: model.KnowledgeFrequencyMedium, SortOrder: 3, Level: 1},
			{CategoryID: categories["xc_shuliang_yunsuan"].ID, Name: "排列组合", Code: "xc_sl_plzh", Description: "排列、组合、加法原理、乘法原理", Importance: 5, Frequency: model.KnowledgeFrequencyHigh, SortOrder: 4, Level: 1},
			{CategoryID: categories["xc_shuliang_yunsuan"].ID, Name: "概率问题", Code: "xc_sl_gl", Description: "古典概型、独立事件、条件概率", Importance: 4, Frequency: model.KnowledgeFrequencyMedium, SortOrder: 5, Level: 1},
		}
		if err := db.Create(&shuliangPoints).Error; err != nil {
			return err
		}
	}

	// 行测 - 判断推理知识点
	if categories["xc_panduan_luoji"] != nil {
		panduanPoints := []model.KnowledgePoint{
			{CategoryID: categories["xc_panduan_luoji"].ID, Name: "翻译推理", Code: "xc_pd_fy", Description: "充分必要条件、逆否命题、推理规则", Importance: 5, Frequency: model.KnowledgeFrequencyHigh, SortOrder: 1, Level: 1},
			{CategoryID: categories["xc_panduan_luoji"].ID, Name: "真假推理", Code: "xc_pd_zj", Description: "矛盾关系、反对关系的判断", Importance: 4, Frequency: model.KnowledgeFrequencyMedium, SortOrder: 2, Level: 1},
			{CategoryID: categories["xc_panduan_luoji"].ID, Name: "加强削弱", Code: "xc_pd_jqxr", Description: "加强论点、削弱论点、搭桥、拆桥", Importance: 5, Frequency: model.KnowledgeFrequencyHigh, SortOrder: 3, Level: 1},
		}
		if err := db.Create(&panduanPoints).Error; err != nil {
			return err
		}
	}

	// 行测 - 资料分析知识点
	if categories["xc_ziliao_zengzhang"] != nil {
		ziliaoPoints := []model.KnowledgePoint{
			{CategoryID: categories["xc_ziliao_zengzhang"].ID, Name: "增长率计算", Code: "xc_zl_zzl", Description: "同比增长率、环比增长率的计算", Importance: 5, Frequency: model.KnowledgeFrequencyHigh, SortOrder: 1, Level: 1},
			{CategoryID: categories["xc_ziliao_zengzhang"].ID, Name: "增长量计算", Code: "xc_zl_zzlj", Description: "增长量的各种计算方法", Importance: 5, Frequency: model.KnowledgeFrequencyHigh, SortOrder: 2, Level: 1},
			{CategoryID: categories["xc_ziliao_zengzhang"].ID, Name: "年均增长率", Code: "xc_zl_nj", Description: "多年平均增长率的计算", Importance: 4, Frequency: model.KnowledgeFrequencyMedium, SortOrder: 3, Level: 1},
		}
		if err := db.Create(&ziliaoPoints).Error; err != nil {
			return err
		}
	}

	return nil
}
