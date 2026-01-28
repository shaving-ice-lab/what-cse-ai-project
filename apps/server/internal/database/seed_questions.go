package database

import (
	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

// seedQuestions 初始化题库示例数据
func seedQuestions(db *gorm.DB) error {
	var count int64
	db.Model(&model.Question{}).Count(&count)
	if count > 0 {
		return nil
	}

	// 获取分类ID映射
	categoryMap := make(map[string]uint)
	var categories []model.CourseCategory
	db.Find(&categories)
	for _, cat := range categories {
		categoryMap[cat.Code] = cat.ID
	}

	// =====================================================
	// 行测 - 言语理解与表达
	// =====================================================
	yanyuQuestions := createYanyuQuestions(categoryMap)

	// =====================================================
	// 行测 - 数量关系
	// =====================================================
	shuliangQuestions := createShuliangQuestions(categoryMap)

	// =====================================================
	// 行测 - 判断推理
	// =====================================================
	panduanQuestions := createPanduanQuestions(categoryMap)

	// =====================================================
	// 行测 - 资料分析
	// =====================================================
	ziliaoQuestions := createZiliaoQuestions(categoryMap)

	// =====================================================
	// 行测 - 常识判断
	// =====================================================
	changshiQuestions := createChangshiQuestions(categoryMap)

	// =====================================================
	// 申论题目
	// =====================================================
	shenlunQuestions := createShenlunQuestions(categoryMap)

	// =====================================================
	// 面试题目
	// =====================================================
	mianshiQuestions := createMianshiQuestions(categoryMap)

	// =====================================================
	// 公基题目
	// =====================================================
	gongjiQuestions := createGongjiQuestions(categoryMap)

	// 合并所有题目
	allQuestions := append(yanyuQuestions, shuliangQuestions...)
	allQuestions = append(allQuestions, panduanQuestions...)
	allQuestions = append(allQuestions, ziliaoQuestions...)
	allQuestions = append(allQuestions, changshiQuestions...)
	allQuestions = append(allQuestions, shenlunQuestions...)
	allQuestions = append(allQuestions, mianshiQuestions...)
	allQuestions = append(allQuestions, gongjiQuestions...)

	// 批量创建题目
	if len(allQuestions) > 0 {
		if err := db.CreateInBatches(&allQuestions, 100).Error; err != nil {
			return err
		}
	}

	return nil
}

// createYanyuQuestions 创建言语理解与表达题目
func createYanyuQuestions(categoryMap map[string]uint) []model.Question {
	year2024 := 2024
	year2023 := 2023

	questions := []model.Question{
		// 逻辑填空 - 实词辨析
		{
			CategoryID:   categoryMap["xc_yanyu_luoji"],
			QuestionType: model.QuestionTypeSingleChoice,
			Difficulty:   3,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2024,
			SourceRegion: "国考",
			SourceExam:   "2024年国家公务员考试行测真题",
			Content:      "在科技飞速发展的今天，人工智能正以______的速度改变着我们的生活方式，从智能家居到自动驾驶，从医疗诊断到金融服务，AI技术的应用已经______到社会的方方面面。",
			Options: model.QuestionOptions{
				{Key: "A", Content: "惊人 渗透"},
				{Key: "B", Content: "迅猛 延伸"},
				{Key: "C", Content: "飞快 扩展"},
				{Key: "D", Content: "超常 深入"},
			},
			Answer:   "A",
			Analysis: "第一空，形容人工智能改变生活方式的速度，「惊人」强调令人吃惊的程度，与「飞速发展」相呼应。「迅猛」侧重快且猛烈，「飞快」过于口语化，「超常」指超出正常范围，均不如「惊人」贴切。\n\n第二空，「渗透」比喻一种事物逐渐进入到另一事物中，与「方方面面」搭配恰当，形象地描述了AI技术逐步深入各领域的过程。「延伸」指延长伸展，「扩展」指向外扩大，「深入」缺少「进入各个角落」的含义。\n\n故本题选A。",
			Tips:     "解题技巧：1. 结合语境分析词语含义；2. 注意词语的搭配习惯；3. 排除法辅助验证。",
			Tags:     model.JSONStringArray{"高频", "实词辨析"},
			IsVIP:    false,
			Status:   model.QuestionStatusPublished,
		},
		{
			CategoryID:   categoryMap["xc_yanyu_luoji"],
			QuestionType: model.QuestionTypeSingleChoice,
			Difficulty:   3,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2024,
			SourceRegion: "国考",
			SourceExam:   "2024年国家公务员考试行测真题",
			Content:      "传统文化的传承不能仅仅停留在表面的______，更需要深入挖掘其内在的精神价值，使其在当代社会中______，焕发新的生机与活力。",
			Options: model.QuestionOptions{
				{Key: "A", Content: "模仿 融会贯通"},
				{Key: "B", Content: "复制 历久弥新"},
				{Key: "C", Content: "延续 薪火相传"},
				{Key: "D", Content: "继承 推陈出新"},
			},
			Answer:   "B",
			Analysis: "第一空，「停留在表面的」暗示这是一种浅层次的行为，与后文「深入挖掘」形成对比。「复制」指完全照搬，强调表面形式的照搬，与语境契合。「模仿」、「延续」、「继承」都含有一定的深层含义，不能完全体现「表面」的特征。\n\n第二空，「历久弥新」指经历长久时间而更加新鲜，与「焕发新的生机与活力」意思一致，且强调了传统文化在时间长河中保持活力。\n\n故本题选B。",
			Tips:     "注意对比关系：表面vs深入，这是解题的关键线索。",
			Tags:     model.JSONStringArray{"高频", "成语辨析"},
			IsVIP:    false,
			Status:   model.QuestionStatusPublished,
		},
		{
			CategoryID:   categoryMap["xc_yanyu_luoji"],
			QuestionType: model.QuestionTypeSingleChoice,
			Difficulty:   4,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2023,
			SourceRegion: "国考",
			SourceExam:   "2023年国家公务员考试行测真题",
			Content:      "面对复杂多变的国际形势，我们必须保持战略定力，既不能______，也不能______，而应该在充分评估各种风险的基础上，稳步推进各项工作。",
			Options: model.QuestionOptions{
				{Key: "A", Content: "盲目乐观 妄自菲薄"},
				{Key: "B", Content: "掉以轻心 杞人忧天"},
				{Key: "C", Content: "麻痹大意 草木皆兵"},
				{Key: "D", Content: "粗心大意 小题大做"},
			},
			Answer:   "C",
			Analysis: "文段强调面对复杂形势要保持战略定力，既不能对风险视而不见，也不能过度紧张。\n\n「麻痹大意」指缺乏警觉性，对事情漫不经心。「草木皆兵」比喻神经过敏，疑神疑鬼，把草木都看成是敌人。两者恰好形成「不警觉」与「过度警觉」的对比，符合题意。\n\n「盲目乐观vs妄自菲薄」是乐观与悲观的对比，与「风险评估」关联不紧密。「掉以轻心vs杞人忧天」虽然也有类似含义，但「杞人忧天」侧重担心没必要担心的事，与「复杂多变的国际形势」不符。\n\n故本题选C。",
			Tips:     "并列句式通常要求填入的词语在逻辑上形成对照或递进关系。",
			Tags:     model.JSONStringArray{"高频", "成语辨析", "易错"},
			IsVIP:    false,
			Status:   model.QuestionStatusPublished,
		},
		// 片段阅读 - 主旨概括
		{
			CategoryID:   categoryMap["xc_yanyu_pianduan"],
			QuestionType: model.QuestionTypeSingleChoice,
			Difficulty:   3,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2024,
			SourceRegion: "国考",
			SourceExam:   "2024年国家公务员考试行测真题",
			Content:      "数字经济正在重塑全球产业格局。一方面，数字技术与传统产业深度融合，推动制造业向智能化、服务化方向发展，大幅提升了生产效率和产品质量。另一方面，数字经济催生了平台经济、共享经济等新业态新模式，创造了大量新的就业机会。然而，数字经济的快速发展也带来了数据安全、隐私保护、数字鸿沟等挑战，需要政府、企业和社会各界共同应对。\n\n这段文字主要说明的是：",
			Options: model.QuestionOptions{
				{Key: "A", Content: "数字经济发展面临的主要挑战"},
				{Key: "B", Content: "数字经济对就业市场的深刻影响"},
				{Key: "C", Content: "数字经济的发展及其带来的影响"},
				{Key: "D", Content: "数字技术与传统产业的融合方式"},
			},
			Answer:   "C",
			Analysis: "文段结构为「总-分-分」。\n\n首句点明主旨：数字经济正在重塑全球产业格局。\n\n然后从两个方面展开论述数字经济的积极影响：1）与传统产业融合，提升效率；2）催生新业态，创造就业。\n\n最后补充说明数字经济发展带来的挑战。\n\n综合来看，文段全面介绍了数字经济的发展状况及其正负两方面的影响，C项概括最为全面准确。\n\nA项只涉及挑战，以偏概全。B项只涉及就业影响，范围过窄。D项只涉及融合方式，概括不全。\n\n故本题选C。",
			Tips:     "主旨概括题要把握文段整体结构，选择最全面的选项，避免以偏概全。",
			Tags:     model.JSONStringArray{"高频", "主旨概括"},
			IsVIP:    false,
			Status:   model.QuestionStatusPublished,
		},
		{
			CategoryID:   categoryMap["xc_yanyu_pianduan"],
			QuestionType: model.QuestionTypeSingleChoice,
			Difficulty:   4,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2023,
			SourceRegion: "联考",
			SourceExam:   "2023年公务员联考行测真题",
			Content:      "城市更新不是简单的拆旧建新，而是要在保护历史文化底蕴的基础上，实现功能提升和品质改善。老旧街区改造应当充分尊重居民意愿，保留具有历史价值的建筑和街巷肌理，同时引入现代化的公共服务设施，提升居民生活质量。只有将历史传承与现代需求有机结合，才能让城市在更新中延续文脉、留住记忆。\n\n这段文字意在强调：",
			Options: model.QuestionOptions{
				{Key: "A", Content: "城市更新要注重保护历史文化"},
				{Key: "B", Content: "老旧街区改造应充分尊重居民意愿"},
				{Key: "C", Content: "城市更新应兼顾历史传承与现代需求"},
				{Key: "D", Content: "现代化设施是提升居民生活质量的关键"},
			},
			Answer:   "C",
			Analysis: "文段首先指出城市更新的正确理念：不是简单拆建，而是在保护历史的基础上实现功能提升。接着以老旧街区改造为例，说明要保留历史价值同时引入现代设施。尾句总结：「只有将历史传承与现代需求有机结合」才能实现良好效果。\n\n「只有...才...」为条件关系，强调的是「历史传承与现代需求的结合」，C项与此对应。\n\nA项只强调保护历史，忽略了现代需求。B项是具体做法，非文段主旨。D项曲解文意，文段并未强调现代设施是「关键」。\n\n故本题选C。",
			Tips:     "意图判断题关注作者的观点态度，尾句常为重点。",
			Tags:     model.JSONStringArray{"高频", "意图判断"},
			IsVIP:    false,
			Status:   model.QuestionStatusPublished,
		},
		// 语句表达 - 语句排序
		{
			CategoryID:   categoryMap["xc_yanyu_yuju"],
			QuestionType: model.QuestionTypeSingleChoice,
			Difficulty:   3,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2024,
			SourceRegion: "国考",
			SourceExam:   "2024年国家公务员考试行测真题",
			Content:      "①这种思维方式有助于我们发现事物之间的内在联系\n②系统思维强调从整体出发认识事物\n③从而找到解决问题的最优方案\n④而不是孤立地看待每个组成部分\n⑤它要求我们关注各要素之间的相互作用\n\n将以上5个句子重新排列，语序正确的是：",
			Options: model.QuestionOptions{
				{Key: "A", Content: "②④⑤①③"},
				{Key: "B", Content: "②⑤④①③"},
				{Key: "C", Content: "①②④⑤③"},
				{Key: "D", Content: "⑤②④③①"},
			},
			Answer:   "A",
			Analysis: "首先确定首句。②「系统思维强调...」是对概念的定义说明，适合作为首句引出话题。①以「这种思维方式」开头，需要前文铺垫，不宜作首句。⑤以「它」开头，也需要前文铺垫。排除C、D。\n\n②句定义系统思维：从整体出发。④句「而不是」与②句形成对比，说明不是孤立看待部分，②④紧密衔接。\n\n⑤句「它要求我们关注各要素之间的相互作用」，进一步说明系统思维的要求。\n\n①句「这种思维方式有助于...」承接前文说明系统思维的作用。\n\n③句「从而找到解决问题的最优方案」是①句的结果，①③构成因果关系。\n\n排序为：②④⑤①③\n\n故本题选A。",
			Tips:     "语句排序先定首句，再找关联词和指代词，确定句子间的逻辑关系。",
			Tags:     model.JSONStringArray{"高频", "语句排序"},
			IsVIP:    false,
			Status:   model.QuestionStatusPublished,
		},
	}

	return questions
}

// createShuliangQuestions 创建数量关系题目
func createShuliangQuestions(categoryMap map[string]uint) []model.Question {
	year2024 := 2024
	year2023 := 2023

	questions := []model.Question{
		// 数学运算 - 行程问题
		{
			CategoryID:   categoryMap["xc_shuliang_yunsuan"],
			QuestionType: model.QuestionTypeSingleChoice,
			Difficulty:   3,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2024,
			SourceRegion: "国考",
			SourceExam:   "2024年国家公务员考试行测真题",
			Content:      "甲、乙两人分别从A、B两地同时出发相向而行，甲的速度为60千米/小时，乙的速度为40千米/小时。两人相遇后继续前进，甲到达B地后立即返回，乙到达A地后也立即返回。问两人第二次相遇时，甲走了多少千米？（A、B两地相距200千米）",
			Options: model.QuestionOptions{
				{Key: "A", Content: "300"},
				{Key: "B", Content: "320"},
				{Key: "C", Content: "360"},
				{Key: "D", Content: "400"},
			},
			Answer:   "C",
			Analysis: "设A、B两地相距200千米。\n\n第一次相遇时，甲乙共同走完200千米。\n时间 = 200 ÷ (60+40) = 2小时\n甲走了：60×2 = 120千米\n\n从第一次相遇到第二次相遇，甲乙共同又走了400千米（需要走完两个全程）。\n时间 = 400 ÷ (60+40) = 4小时\n甲在这段时间走了：60×4 = 240千米\n\n所以甲一共走了：120 + 240 = 360千米\n\n故本题选C。",
			Tips:     "相遇问题的核心公式：相遇距离 = (速度和) × 相遇时间。第N次相遇时，两人共走的总路程是全程的(2N-1)倍。",
			Tags:     model.JSONStringArray{"高频", "行程问题", "相遇问题"},
			IsVIP:    false,
			Status:   model.QuestionStatusPublished,
		},
		{
			CategoryID:   categoryMap["xc_shuliang_yunsuan"],
			QuestionType: model.QuestionTypeSingleChoice,
			Difficulty:   4,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2023,
			SourceRegion: "国考",
			SourceExam:   "2023年国家公务员考试行测真题",
			Content:      "某工厂有甲、乙两条生产线。甲生产线单独完成一批订单需要12天，乙生产线单独完成需要18天。如果两条生产线同时开工，但甲生产线中途停工了若干天进行维护，结果总共用了9天完成订单。问甲生产线停工了几天？",
			Options: model.QuestionOptions{
				{Key: "A", Content: "3"},
				{Key: "B", Content: "4"},
				{Key: "C", Content: "5"},
				{Key: "D", Content: "6"},
			},
			Answer:   "A",
			Analysis: "设工程总量为36（12和18的最小公倍数）。\n\n甲每天工作量 = 36 ÷ 12 = 3\n乙每天工作量 = 36 ÷ 18 = 2\n\n设甲停工了x天，则甲实际工作了(9-x)天。\n\n甲的工作量 + 乙的工作量 = 总工作量\n3 × (9-x) + 2 × 9 = 36\n27 - 3x + 18 = 36\n45 - 3x = 36\n3x = 9\nx = 3\n\n故本题选A。",
			Tips:     "工程问题的核心：工作量 = 效率 × 时间。常用「设工程总量为特值」的方法简化计算。",
			Tags:     model.JSONStringArray{"高频", "工程问题"},
			IsVIP:    false,
			Status:   model.QuestionStatusPublished,
		},
		{
			CategoryID:   categoryMap["xc_shuliang_yunsuan"],
			QuestionType: model.QuestionTypeSingleChoice,
			Difficulty:   4,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2024,
			SourceRegion: "联考",
			SourceExam:   "2024年公务员联考行测真题",
			Content:      "从1到100的自然数中，既不是3的倍数，也不是5的倍数的数有多少个？",
			Options: model.QuestionOptions{
				{Key: "A", Content: "50"},
				{Key: "B", Content: "53"},
				{Key: "C", Content: "54"},
				{Key: "D", Content: "56"},
			},
			Answer:   "B",
			Analysis: "运用容斥原理：\n\n1到100中：\n- 3的倍数有：100 ÷ 3 = 33个（取整数）\n- 5的倍数有：100 ÷ 5 = 20个\n- 既是3的倍数又是5的倍数（即15的倍数）有：100 ÷ 15 = 6个\n\n3的倍数或5的倍数的个数 = 33 + 20 - 6 = 47个\n\n既不是3的倍数也不是5的倍数的数 = 100 - 47 = 53个\n\n故本题选B。",
			Tips:     "容斥原理公式：|A∪B| = |A| + |B| - |A∩B|",
			Tags:     model.JSONStringArray{"高频", "容斥问题"},
			IsVIP:    false,
			Status:   model.QuestionStatusPublished,
		},
		// 数字推理
		{
			CategoryID:   categoryMap["xc_shuliang_tuili"],
			QuestionType: model.QuestionTypeSingleChoice,
			Difficulty:   3,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2024,
			SourceRegion: "国考",
			SourceExam:   "2024年国家公务员考试行测真题",
			Content:      "2, 5, 11, 23, 47, (  )",
			Options: model.QuestionOptions{
				{Key: "A", Content: "91"},
				{Key: "B", Content: "93"},
				{Key: "C", Content: "95"},
				{Key: "D", Content: "97"},
			},
			Answer:   "C",
			Analysis: "观察数列特点：\n\n5 = 2 × 2 + 1\n11 = 5 × 2 + 1\n23 = 11 × 2 + 1\n47 = 23 × 2 + 1\n\n规律：每一项 = 前一项 × 2 + 1\n\n所以下一项 = 47 × 2 + 1 = 95\n\n故本题选C。",
			Tips:     "数字推理常见规律：等差、等比、递推（和递推、积递推、混合递推）、幂次等。",
			Tags:     model.JSONStringArray{"递推数列", "倍数关系"},
			IsVIP:    false,
			Status:   model.QuestionStatusPublished,
		},
		{
			CategoryID:   categoryMap["xc_shuliang_tuili"],
			QuestionType: model.QuestionTypeSingleChoice,
			Difficulty:   4,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2023,
			SourceRegion: "国考",
			SourceExam:   "2023年国家公务员考试行测真题",
			Content:      "1, 2, 6, 24, 120, (  )",
			Options: model.QuestionOptions{
				{Key: "A", Content: "480"},
				{Key: "B", Content: "600"},
				{Key: "C", Content: "720"},
				{Key: "D", Content: "840"},
			},
			Answer:   "C",
			Analysis: "观察数列特点：\n\n1 = 1!\n2 = 2! = 2×1\n6 = 3! = 3×2×1\n24 = 4! = 4×3×2×1\n120 = 5! = 5×4×3×2×1\n\n规律：这是阶乘数列，第n项 = n!\n\n所以下一项 = 6! = 6×5×4×3×2×1 = 720\n\n故本题选C。",
			Tips:     "阶乘数列是常见的特殊数列类型，要熟记1!到10!的值。",
			Tags:     model.JSONStringArray{"阶乘数列", "高频"},
			IsVIP:    false,
			Status:   model.QuestionStatusPublished,
		},
	}

	return questions
}

// createPanduanQuestions 创建判断推理题目
func createPanduanQuestions(categoryMap map[string]uint) []model.Question {
	year2024 := 2024
	year2023 := 2023

	questions := []model.Question{
		// 定义判断
		{
			CategoryID:   categoryMap["xc_panduan_dingyi"],
			QuestionType: model.QuestionTypeSingleChoice,
			Difficulty:   3,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2024,
			SourceRegion: "国考",
			SourceExam:   "2024年国家公务员考试行测真题",
			Content:      "沉没成本是指已经发生且无法收回的支出，如时间、金钱、精力等。由于沉没成本已经付出且不可回收，理性决策时不应考虑沉没成本。\n\n根据上述定义，下列属于沉没成本的是：",
			Options: model.QuestionOptions{
				{Key: "A", Content: "小王计划明天去超市购买一台电视机"},
				{Key: "B", Content: "某公司为研发新产品已投入500万元，但研发尚未完成"},
				{Key: "C", Content: "小李计划下月参加培训，已预付了3000元培训费"},
				{Key: "D", Content: "某企业预计下季度将投入100万元用于市场推广"},
			},
			Answer:   "B",
			Analysis: "沉没成本的要件：\n1. 已经发生的支出\n2. 无法收回\n\nA项：计划购买，尚未发生支出，不符合「已经发生」这一要件。\n\nB项：500万元已投入研发（已发生），且已经花费无法收回（即使项目终止也无法拿回），符合定义。\n\nC项：预付培训费虽已支付，但培训尚未开始，通常可以申请退款，不一定「无法收回」。\n\nD项：预计将投入，尚未发生支出，不符合定义。\n\n故本题选B。",
			Tips:     "定义判断关键在于逐一分析选项是否符合定义的每个要件。",
			Tags:     model.JSONStringArray{"经济类定义", "高频"},
			IsVIP:    false,
			Status:   model.QuestionStatusPublished,
		},
		// 类比推理
		{
			CategoryID:   categoryMap["xc_panduan_leibi"],
			QuestionType: model.QuestionTypeSingleChoice,
			Difficulty:   3,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2024,
			SourceRegion: "国考",
			SourceExam:   "2024年国家公务员考试行测真题",
			Content:      "医生：医院：治病\n与此逻辑关系最为相似的是：",
			Options: model.QuestionOptions{
				{Key: "A", Content: "教师：学校：育人"},
				{Key: "B", Content: "司机：汽车：运输"},
				{Key: "C", Content: "厨师：饭店：吃饭"},
				{Key: "D", Content: "警察：公安局：抓人"},
			},
			Answer:   "A",
			Analysis: "题干逻辑关系：\n医生——医院——治病\n职业——工作地点——工作内容\n\nA项：教师——学校——育人，职业——工作地点——工作内容，与题干结构一致。\n\nB项：司机——汽车——运输，汽车是工作工具而非工作地点，与题干结构不同。\n\nC项：厨师——饭店——吃饭，「吃饭」是顾客的行为，不是厨师的工作内容（应为「做饭」）。\n\nD项：警察——公安局——抓人，「抓人」只是警察工作的一部分，不能概括警察的主要工作职责。\n\n故本题选A。",
			Tips:     "类比推理首先要确定题干中词语之间的逻辑关系，然后找出关系最相似的选项。",
			Tags:     model.JSONStringArray{"职业关系", "高频"},
			IsVIP:    false,
			Status:   model.QuestionStatusPublished,
		},
		// 逻辑判断 - 加强削弱
		{
			CategoryID:   categoryMap["xc_panduan_luoji"],
			QuestionType: model.QuestionTypeSingleChoice,
			Difficulty:   4,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2023,
			SourceRegion: "国考",
			SourceExam:   "2023年国家公务员考试行测真题",
			Content:      "研究人员发现，经常使用智能手机的人比不使用智能手机的人更容易出现注意力不集中的问题。因此，研究人员认为，智能手机的使用导致了人们注意力的下降。\n\n以下哪项如果为真，最能削弱上述结论？",
			Options: model.QuestionOptions{
				{Key: "A", Content: "有些注意力不集中的人从不使用智能手机"},
				{Key: "B", Content: "智能手机的应用程序越来越丰富，功能越来越强大"},
				{Key: "C", Content: "注意力容易分散的人更倾向于使用智能手机来打发时间"},
				{Key: "D", Content: "部分智能手机用户通过自律提高了自己的注意力水平"},
			},
			Answer:   "C",
			Analysis: "题干论证：\n论据：经常使用智能手机的人更容易注意力不集中\n论点：智能手机的使用导致注意力下降（智能手机→注意力下降）\n\nC项指出「注意力容易分散的人更倾向于使用智能手机」，即因果倒置——不是智能手机导致注意力下降，而是注意力本就不好的人更喜欢用智能手机。这直接否定了题干的因果关系，最能削弱。\n\nA项只是举反例，但个例不能否定一般规律，削弱力度有限。\n\nB项说明智能手机功能丰富，与论点无关。\n\nD项说部分人通过自律提高了注意力，但不能否定智能手机对多数人的影响。\n\n故本题选C。",
			Tips:     "削弱因果关系最有力的方式是「因果倒置」或「另有他因」。",
			Tags:     model.JSONStringArray{"加强削弱", "因果倒置", "高频"},
			IsVIP:    false,
			Status:   model.QuestionStatusPublished,
		},
		// 翻译推理
		{
			CategoryID:   categoryMap["xc_panduan_luoji"],
			QuestionType: model.QuestionTypeSingleChoice,
			Difficulty:   3,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2024,
			SourceRegion: "联考",
			SourceExam:   "2024年公务员联考行测真题",
			Content:      "某公司规定：如果员工通过年度考核，就可以获得晋升机会；如果获得晋升机会，就能参加高级培训。已知小张参加了高级培训。\n\n由此可以推出：",
			Options: model.QuestionOptions{
				{Key: "A", Content: "小张通过了年度考核"},
				{Key: "B", Content: "小张获得了晋升机会"},
				{Key: "C", Content: "小张没有通过年度考核"},
				{Key: "D", Content: "以上均不能确定"},
			},
			Answer:   "D",
			Analysis: "翻译题干中的逻辑关系：\n通过考核 → 晋升机会 → 高级培训\n\n已知：小张参加了高级培训（肯定后件）\n\n根据充分条件的推理规则：\n- 肯定前件可以肯定后件\n- 否定后件可以否定前件\n- 但「肯定后件」不能推出任何确定结论\n\n因为「参加高级培训」有可能是其他途径获得的（比如公司安排、自费参加等），不一定是因为获得了晋升机会。\n\n同理，即使获得晋升机会，也不能反推一定通过了年度考核。\n\n因此，A、B、C均不能确定。\n\n故本题选D。",
			Tips:     "充分条件：A→B，肯前必肯后，否后必否前，但肯后否前无法得出确定结论。",
			Tags:     model.JSONStringArray{"翻译推理", "充分条件", "高频"},
			IsVIP:    false,
			Status:   model.QuestionStatusPublished,
		},
	}

	return questions
}

// createZiliaoQuestions 创建资料分析题目
func createZiliaoQuestions(categoryMap map[string]uint) []model.Question {
	year2024 := 2024
	year2023 := 2023

	questions := []model.Question{
		// 增长问题
		{
			CategoryID:   categoryMap["xc_ziliao_zengzhang"],
			QuestionType: model.QuestionTypeSingleChoice,
			Difficulty:   3,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2024,
			SourceRegion: "国考",
			SourceExam:   "2024年国家公务员考试行测真题",
			Content:      "2023年某市实现地区生产总值8500亿元，同比增长6.5%。其中，第一产业增加值500亿元，同比增长3.2%；第二产业增加值3200亿元，同比增长5.8%；第三产业增加值4800亿元，同比增长7.5%。\n\n问题：2022年该市地区生产总值约为多少亿元？",
			Options: model.QuestionOptions{
				{Key: "A", Content: "7800"},
				{Key: "B", Content: "7981"},
				{Key: "C", Content: "8023"},
				{Key: "D", Content: "8200"},
			},
			Answer:   "B",
			Analysis: "基期值 = 现期值 ÷ (1 + 增长率)\n\n2022年地区生产总值 = 8500 ÷ (1 + 6.5%)\n= 8500 ÷ 1.065\n≈ 7981.2亿元\n\n故本题选B。",
			Tips:     "基期量公式：基期值 = 现期值 ÷ (1 + r)。当增长率较小时，可用近似公式：基期值 ≈ 现期值 × (1 - r)。",
			Tags:     model.JSONStringArray{"基期计算", "高频"},
			IsVIP:    false,
			Status:   model.QuestionStatusPublished,
		},
		{
			CategoryID:   categoryMap["xc_ziliao_zengzhang"],
			QuestionType: model.QuestionTypeSingleChoice,
			Difficulty:   3,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2023,
			SourceRegion: "国考",
			SourceExam:   "2023年国家公务员考试行测真题",
			Content:      "2022年全国货物进出口总额42.07万亿元，比上年增长7.7%。其中，出口23.97万亿元，增长10.5%；进口18.10万亿元，增长4.3%。\n\n问题：2022年全国货物出口额的增长量约为多少万亿元？",
			Options: model.QuestionOptions{
				{Key: "A", Content: "2.02"},
				{Key: "B", Content: "2.28"},
				{Key: "C", Content: "2.52"},
				{Key: "D", Content: "2.76"},
			},
			Answer:   "B",
			Analysis: "增长量 = 现期值 × 增长率 ÷ (1 + 增长率)\n= 现期值 - 基期值\n= 现期值 - 现期值 ÷ (1 + 增长率)\n= 现期值 × [1 - 1/(1 + 增长率)]\n= 现期值 × 增长率 ÷ (1 + 增长率)\n\n出口增长量 = 23.97 × 10.5% ÷ (1 + 10.5%)\n= 23.97 × 0.105 ÷ 1.105\n≈ 2.52 ÷ 1.105\n≈ 2.28万亿元\n\n故本题选B。",
			Tips:     "增长量公式：增长量 = 现期值 × r/(1+r)，或 增长量 = 现期值 - 基期值。",
			Tags:     model.JSONStringArray{"增长量计算", "高频"},
			IsVIP:    false,
			Status:   model.QuestionStatusPublished,
		},
		// 比重问题
		{
			CategoryID:   categoryMap["xc_ziliao_bizhong"],
			QuestionType: model.QuestionTypeSingleChoice,
			Difficulty:   3,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2024,
			SourceRegion: "联考",
			SourceExam:   "2024年公务员联考行测真题",
			Content:      "2023年某省社会消费品零售总额为12000亿元，其中城镇消费品零售额为9600亿元，乡村消费品零售额为2400亿元。2022年该省社会消费品零售总额为11000亿元。\n\n问题：2023年该省城镇消费品零售额占社会消费品零售总额的比重为多少？",
			Options: model.QuestionOptions{
				{Key: "A", Content: "75%"},
				{Key: "B", Content: "78%"},
				{Key: "C", Content: "80%"},
				{Key: "D", Content: "82%"},
			},
			Answer:   "C",
			Analysis: "比重 = 部分 ÷ 整体\n\n城镇消费品零售额占比 = 9600 ÷ 12000\n= 0.8\n= 80%\n\n故本题选C。",
			Tips:     "比重 = 部分值 ÷ 整体值 × 100%",
			Tags:     model.JSONStringArray{"比重计算", "高频"},
			IsVIP:    false,
			Status:   model.QuestionStatusPublished,
		},
		// 倍数问题
		{
			CategoryID:   categoryMap["xc_ziliao_beishu"],
			QuestionType: model.QuestionTypeSingleChoice,
			Difficulty:   3,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2023,
			SourceRegion: "联考",
			SourceExam:   "2023年公务员联考行测真题",
			Content:      "2022年A市粮食产量为300万吨，B市粮食产量为180万吨。\n\n问题：2022年A市粮食产量是B市的多少倍？",
			Options: model.QuestionOptions{
				{Key: "A", Content: "1.5"},
				{Key: "B", Content: "1.67"},
				{Key: "C", Content: "1.75"},
				{Key: "D", Content: "2.0"},
			},
			Answer:   "B",
			Analysis: "倍数 = A ÷ B\n\nA市粮食产量是B市的倍数 = 300 ÷ 180\n= 5/3\n≈ 1.67倍\n\n故本题选B。",
			Tips:     "倍数计算：A是B的多少倍 = A ÷ B",
			Tags:     model.JSONStringArray{"倍数计算", "高频"},
			IsVIP:    false,
			Status:   model.QuestionStatusPublished,
		},
		// 平均数问题
		{
			CategoryID:   categoryMap["xc_ziliao_pingjun"],
			QuestionType: model.QuestionTypeSingleChoice,
			Difficulty:   3,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2024,
			SourceRegion: "国考",
			SourceExam:   "2024年国家公务员考试行测真题",
			Content:      "2023年某公司有员工500人，工资总额为4500万元。2022年该公司有员工450人，工资总额为3600万元。\n\n问题：2023年该公司员工平均工资比2022年增长了多少？",
			Options: model.QuestionOptions{
				{Key: "A", Content: "10%"},
				{Key: "B", Content: "12.5%"},
				{Key: "C", Content: "15%"},
				{Key: "D", Content: "17.5%"},
			},
			Answer:   "B",
			Analysis: "2023年平均工资 = 4500 ÷ 500 = 9万元\n2022年平均工资 = 3600 ÷ 450 = 8万元\n\n平均工资增长率 = (9 - 8) ÷ 8\n= 1 ÷ 8\n= 12.5%\n\n故本题选B。",
			Tips:     "平均数 = 总量 ÷ 个数。平均数增长率 = (现期平均 - 基期平均) ÷ 基期平均。",
			Tags:     model.JSONStringArray{"平均数计算", "增长率", "高频"},
			IsVIP:    false,
			Status:   model.QuestionStatusPublished,
		},
	}

	return questions
}

// createChangshiQuestions 创建常识判断题目
func createChangshiQuestions(categoryMap map[string]uint) []model.Question {
	year2024 := 2024
	year2023 := 2023

	questions := []model.Question{
		// 政治常识
		{
			CategoryID:   categoryMap["xc_changshi_zhengzhi"],
			QuestionType: model.QuestionTypeSingleChoice,
			Difficulty:   3,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2024,
			SourceRegion: "国考",
			SourceExam:   "2024年国家公务员考试行测真题",
			Content:      "党的二十大报告指出，中国式现代化是中国共产党领导的社会主义现代化，既有各国现代化的共同特征，更有基于自己国情的中国特色。下列关于中国式现代化特征的说法，不正确的是：",
			Options: model.QuestionOptions{
				{Key: "A", Content: "是人口规模巨大的现代化"},
				{Key: "B", Content: "是全体人民共同富裕的现代化"},
				{Key: "C", Content: "是物质文明和精神文明相协调的现代化"},
				{Key: "D", Content: "是以经济建设为中心的现代化"},
			},
			Answer:   "D",
			Analysis: "党的二十大报告概括了中国式现代化的五个特征：\n\n1. 人口规模巨大的现代化（A正确）\n2. 全体人民共同富裕的现代化（B正确）\n3. 物质文明和精神文明相协调的现代化（C正确）\n4. 人与自然和谐共生的现代化\n5. 走和平发展道路的现代化\n\nD项「以经济建设为中心」是党的基本路线的内容，不是中国式现代化的五个特征之一。\n\n故本题选D。",
			Tips:     "中国式现代化五个特征要牢记，常考选非题。",
			Tags:     model.JSONStringArray{"党的二十大", "中国式现代化", "高频"},
			IsVIP:    false,
			Status:   model.QuestionStatusPublished,
		},
		// 法律常识
		{
			CategoryID:   categoryMap["xc_changshi_falv"],
			QuestionType: model.QuestionTypeSingleChoice,
			Difficulty:   3,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2023,
			SourceRegion: "国考",
			SourceExam:   "2023年国家公务员考试行测真题",
			Content:      "关于我国宪法规定的公民基本权利，下列说法正确的是：",
			Options: model.QuestionOptions{
				{Key: "A", Content: "宪法规定公民有服兵役的权利"},
				{Key: "B", Content: "劳动既是公民的权利也是公民的义务"},
				{Key: "C", Content: "公民的住宅不受侵犯是绝对权利"},
				{Key: "D", Content: "通信自由和通信秘密只受法律保护"},
			},
			Answer:   "B",
			Analysis: "A项错误：宪法规定「依照法律服兵役和参加民兵组织是中华人民共和国公民的光荣义务」，服兵役是义务而非权利。\n\nB项正确：宪法第四十二条规定「中华人民共和国公民有劳动的权利和义务」，劳动既是权利也是义务。\n\nC项错误：公民的住宅不受侵犯不是绝对权利，因公共利益需要，依法可以搜查或征用。\n\nD项错误：宪法规定「公民的通信自由和通信秘密受法律的保护。除因国家安全或者追查刑事犯罪的需要，由公安机关或者检察机关依照法律规定的程序对通信进行检查外，任何组织或者个人不得以任何理由侵犯公民的通信自由和通信秘密。」说明存在例外情况。\n\n故本题选B。",
			Tips:     "宪法中「权利+义务」的双重属性常考：劳动、受教育。",
			Tags:     model.JSONStringArray{"宪法", "公民权利", "高频"},
			IsVIP:    false,
			Status:   model.QuestionStatusPublished,
		},
		// 经济常识
		{
			CategoryID:   categoryMap["xc_changshi_jingji"],
			QuestionType: model.QuestionTypeSingleChoice,
			Difficulty:   3,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2024,
			SourceRegion: "联考",
			SourceExam:   "2024年公务员联考行测真题",
			Content:      "当经济出现通货膨胀时，中央银行可以采取的货币政策是：",
			Options: model.QuestionOptions{
				{Key: "A", Content: "降低存款准备金率"},
				{Key: "B", Content: "降低再贴现率"},
				{Key: "C", Content: "在公开市场上买入政府债券"},
				{Key: "D", Content: "提高存款准备金率"},
			},
			Answer:   "D",
			Analysis: "通货膨胀时，市场上货币过多，需要采取紧缩性货币政策，减少货币供应量。\n\n三大货币政策工具：\n\n1. 存款准备金率：\n- 提高准备金率 → 银行可贷资金减少 → 货币供应减少（紧缩）\n- 降低准备金率 → 银行可贷资金增加 → 货币供应增加（扩张）\n\n2. 再贴现率：\n- 提高再贴现率 → 商业银行融资成本上升 → 货币供应减少\n- 降低再贴现率 → 商业银行融资成本下降 → 货币供应增加\n\n3. 公开市场操作：\n- 卖出债券 → 回笼货币 → 货币供应减少\n- 买入债券 → 投放货币 → 货币供应增加\n\nA、B、C项都是扩张性货币政策，D项是紧缩性货币政策。\n\n故本题选D。",
			Tips:     "记住口诀：通胀紧缩，通缩扩张。紧缩政策：提准、提贴、卖债。",
			Tags:     model.JSONStringArray{"货币政策", "通货膨胀", "高频"},
			IsVIP:    false,
			Status:   model.QuestionStatusPublished,
		},
		// 历史常识
		{
			CategoryID:   categoryMap["xc_changshi_lishi"],
			QuestionType: model.QuestionTypeSingleChoice,
			Difficulty:   3,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2023,
			SourceRegion: "联考",
			SourceExam:   "2023年公务员联考行测真题",
			Content:      "下列关于中国古代选官制度的说法，按照时间先后顺序排列正确的是：\n①九品中正制\n②察举制\n③科举制\n④世卿世禄制",
			Options: model.QuestionOptions{
				{Key: "A", Content: "④②①③"},
				{Key: "B", Content: "②④①③"},
				{Key: "C", Content: "④①②③"},
				{Key: "D", Content: "②①④③"},
			},
			Answer:   "A",
			Analysis: "中国古代选官制度的演变：\n\n④世卿世禄制：夏商周时期，官位世袭。\n\n②察举制：汉代，由地方官员向中央举荐人才。\n\n①九品中正制：魏晋南北朝时期，由中正官评定人才等级。\n\n③科举制：隋唐时期开始，通过考试选拔官员。\n\n按时间顺序：④世卿世禄制（先秦）→ ②察举制（汉）→ ①九品中正制（魏晋）→ ③科举制（隋唐）\n\n故本题选A。",
			Tips:     "古代选官制度演变口诀：先世后察，再中正，最后科举兴。",
			Tags:     model.JSONStringArray{"选官制度", "历史常识", "高频"},
			IsVIP:    false,
			Status:   model.QuestionStatusPublished,
		},
		// 科技常识
		{
			CategoryID:   categoryMap["xc_changshi_keji"],
			QuestionType: model.QuestionTypeSingleChoice,
			Difficulty:   3,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2024,
			SourceRegion: "国考",
			SourceExam:   "2024年国家公务员考试行测真题",
			Content:      "下列关于物理现象的解释，正确的是：",
			Options: model.QuestionOptions{
				{Key: "A", Content: "冬天用热水洗菜比冷水更容易洗干净，是因为热水的溶解度大"},
				{Key: "B", Content: "夏天洒水降温，是因为水蒸发时会吸收周围的热量"},
				{Key: "C", Content: "高压锅能更快煮熟食物，是因为锅内气压低，水的沸点低"},
				{Key: "D", Content: "冰箱冷冻室结霜，是因为水蒸气液化后凝固"},
			},
			Answer:   "B",
			Analysis: "A项错误：热水比冷水更容易洗干净主要是因为温度升高，分子运动加快，油脂等污物更容易溶解和分散，不是因为「溶解度」。\n\nB项正确：水蒸发（从液态变为气态）是吸热过程，会吸收周围的热量，从而降低环境温度。\n\nC项错误：高压锅内气压高于大气压，水的沸点升高（约120℃），所以能更快煮熟食物。说法正好相反。\n\nD项错误：冰箱冷冻室结霜是水蒸气直接凝华（气态→固态）成霜，而非先液化再凝固。\n\n故本题选B。",
			Tips:     "物态变化：熔化、凝固、汽化、液化、升华、凝华。吸热：熔化、汽化、升华。",
			Tags:     model.JSONStringArray{"物理常识", "物态变化", "高频"},
			IsVIP:    false,
			Status:   model.QuestionStatusPublished,
		},
	}

	return questions
}

// createShenlunQuestions 创建申论题目
func createShenlunQuestions(categoryMap map[string]uint) []model.Question {
	year2024 := 2024
	year2023 := 2023

	questions := []model.Question{
		// 归纳概括
		{
			CategoryID:   categoryMap["sl_guina"],
			QuestionType: model.QuestionTypeEssay,
			Difficulty:   3,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2024,
			SourceRegion: "国考",
			SourceExam:   "2024年国家公务员考试申论真题",
			Content:      "【给定资料】\n\n近年来，某市在推进基层治理创新方面取得了显著成效。该市通过建立社区议事协商机制，让居民参与社区公共事务的讨论和决策；推广「网格化管理」模式，将社区划分为若干网格，配备专职网格员；利用大数据技术建立社区服务平台，实现了社区服务的智能化；此外，还培育了一批社区社会组织，为居民提供多元化的服务。\n\n【作答要求】\n\n根据给定资料，概括该市基层治理创新的主要做法。（15分）\n\n要求：全面、准确、有条理。不超过200字。",
			Answer:       "该市基层治理创新的主要做法包括：\n\n一是建立民主协商机制。通过社区议事协商，让居民参与公共事务的讨论和决策，激发群众自治活力。\n\n二是推行网格化管理。将社区划分网格，配备专职网格员，实现精细化管理。\n\n三是推进智慧化转型。利用大数据技术建立服务平台，提升社区服务智能化水平。\n\n四是培育多元服务主体。发展社区社会组织，为居民提供多元化服务，构建共建共治共享格局。",
			Analysis:     "【解题思路】\n\n1. 审题要点：\n- 作答任务：概括做法\n- 限定条件：该市基层治理创新\n- 作答要求：全面、准确、有条理\n- 字数限制：不超过200字\n\n2. 要点提取：\n- 建立社区议事协商机制 → 民主协商\n- 网格化管理 → 精细管理\n- 大数据+服务平台 → 智慧化\n- 培育社会组织 → 多元服务\n\n3. 答案加工：\n- 采用「总-分」结构\n- 每个要点包含：做法+效果\n- 注意要点的完整性和概括性",
			Tips:         "归纳概括题要做到：1）紧扣材料提取要点；2）合并同类项；3）表述简洁规范。",
			Tags:         model.JSONStringArray{"归纳概括", "做法总结", "高频"},
			IsVIP:        false,
			Status:       model.QuestionStatusPublished,
		},
		// 综合分析
		{
			CategoryID:   categoryMap["sl_fenxi"],
			QuestionType: model.QuestionTypeEssay,
			Difficulty:   4,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2023,
			SourceRegion: "国考",
			SourceExam:   "2023年国家公务员考试申论真题",
			Content:      "【给定资料】\n\n资料中提到，「传统文化的创造性转化和创新性发展，既要守正，又要创新。」请结合给定资料，谈谈你对这句话的理解。（20分）\n\n要求：理解准确，分析透彻，条理清晰。不超过300字。",
			Answer:       "这句话阐述了传统文化发展必须坚持守正与创新的辩证统一。\n\n「守正」是指坚守传统文化的核心价值和精神内核。传统文化是民族的精神命脉，其蕴含的思想观念、人文精神、道德规范是我们在世界文化激荡中站稳脚跟的根基，必须传承弘扬。\n\n「创新」是指推动传统文化与时代特点相结合。时代在变化，传统文化的表现形式和传播方式也需要与时俱进，要用现代技术赋能，用新颖方式表达，让传统文化焕发新的生机活力。\n\n守正是创新的前提和基础，创新是守正的目的和归宿。只有坚持守正创新相统一，才能让传统文化既保持本真又顺应时代，实现中华优秀传统文化的创造性转化和创新性发展。",
			Analysis:     "【解题思路】\n\n1. 解释型分析的答题结构：\n- 亮明观点（解释核心含义）\n- 分析论述（分别阐释关键词）\n- 总结/对策\n\n2. 本题关键词：\n- 守正：坚守传统文化的核心价值\n- 创新：与时代结合，创新发展\n\n3. 论述层次：\n- 什么是守正？为什么要守正？\n- 什么是创新？为什么要创新？\n- 二者的关系是什么？",
			Tips:         "综合分析题采用「是什么-为什么-怎么办」的结构，注意对概念的阐释要准确。",
			Tags:         model.JSONStringArray{"综合分析", "解释型分析", "高频"},
			IsVIP:        false,
			Status:       model.QuestionStatusPublished,
		},
		// 提出对策
		{
			CategoryID:   categoryMap["sl_duice"],
			QuestionType: model.QuestionTypeEssay,
			Difficulty:   3,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2024,
			SourceRegion: "联考",
			SourceExam:   "2024年公务员联考申论真题",
			Content:      "【给定资料】\n\n某地农村电商发展存在以下问题：一是农村物流配送「最后一公里」问题突出，快递进村难、成本高；二是农产品标准化程度低，品质难以保证；三是农民电商技能不足，缺乏专业人才；四是农村网络基础设施薄弱，网络信号不稳定。\n\n【作答要求】\n\n针对材料中农村电商发展存在的问题，提出解决对策。（20分）\n\n要求：对策具体可行，针对性强。不超过350字。",
			Answer:       "针对农村电商发展存在的问题，提出以下对策：\n\n一是完善农村物流体系。整合邮政、快递、商贸流通等资源，建设县乡村三级物流配送网络；推广共同配送模式，降低物流成本；在村级设立快递服务点，打通「最后一公里」。\n\n二是推进农产品标准化。制定农产品分级分类标准，建立质量追溯体系；发展农产品初加工，提升产品附加值；打造区域公共品牌，提高产品辨识度。\n\n三是加强人才培养。开展电商技能培训，培养农村电商带头人；吸引返乡创业青年从事电商行业；与高校、电商平台合作，引进专业人才。\n\n四是夯实数字基础。加快农村通信网络建设，实现行政村5G网络全覆盖；推进农村电网改造，保障用电需求；建设农村数字化综合服务平台。",
			Analysis:     "【解题思路】\n\n1. 对策题的基本原则：\n- 针对问题提对策（一一对应）\n- 对策要具体可行\n- 主体、措施、目的要明确\n\n2. 本题问题与对策对应：\n- 物流配送难 → 完善物流体系\n- 标准化程度低 → 推进标准化\n- 人才不足 → 加强人才培养\n- 基础设施薄弱 → 夯实数字基础\n\n3. 对策的展开方式：\n- 总括句 + 具体措施\n- 每条对策2-3个具体做法",
			Tips:         "对策题要做到「问题导向、具体可行」，每条对策最好包含主体+动词+对象+目的。",
			Tags:         model.JSONStringArray{"提出对策", "农村电商", "高频"},
			IsVIP:        false,
			Status:       model.QuestionStatusPublished,
		},
	}

	return questions
}

// createMianshiQuestions 创建面试题目
func createMianshiQuestions(categoryMap map[string]uint) []model.Question {
	year2024 := 2024
	year2023 := 2023

	questions := []model.Question{
		// 综合分析 - 社会现象
		{
			CategoryID:   categoryMap["ms_jiegou_zonghe"],
			QuestionType: model.QuestionTypeEssay,
			Difficulty:   3,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2024,
			SourceRegion: "国考",
			SourceExam:   "2024年国家公务员考试面试真题",
			Content:      "近年来，「反向消费」「反向旅游」等现象在年轻人中逐渐流行。一些年轻人选择去小众目的地旅游、购买平替产品、追求性价比消费。对此，你怎么看？",
			Answer:       "【破题表态】\n\n「反向消费」是当代年轻人消费观念转变的体现，反映出他们更加理性、务实的生活态度，这种变化值得肯定，但也需要引导其健康发展。\n\n【分析论述】\n\n这一现象产生的原因主要有三方面：\n\n一是经济压力使然。面对房价、教育、医疗等多重压力，年轻人更加注重合理规划消费。\n\n二是消费观念成熟。经历过「买买买」的冲动消费后，年轻人更加注重消费的实用价值，追求「物有所值」。\n\n三是自我意识觉醒。年轻人不再盲目追随潮流和品牌，更加注重自身真实需求和感受。\n\n这一现象带来的积极影响：有助于形成理性消费风尚，减少资源浪费；促进市场多元化发展，为小众品牌和目的地带来机遇；引导社会重新审视消费主义。\n\n但也需注意：避免将「省钱」绝对化而影响生活品质；防止部分商家借机销售劣质「平替」产品。\n\n【总结升华】\n\n作为年轻人，应当保持理性消费的态度，量入为出、适度消费；政府应当加强市场监管，保障消费者权益；媒体应当正确引导，倡导健康消费文化。",
			Analysis:     "【答题思路】\n\n1. 社会现象类综合分析的基本框架：\n- 破题表态：表明对现象的总体看法\n- 分析论述：分析原因、影响（正反两面）\n- 总结升华：提出建议或对策\n\n2. 本题答题要点：\n- 态度：肯定为主，客观看待\n- 原因：经济压力、观念成熟、自我意识\n- 影响：正面为主，兼顾负面\n- 建议：多主体（个人、政府、媒体）",
			Tips:         "社会现象类题目要保持客观态度，既要看到积极面，也要指出需要注意的问题。",
			Tags:         model.JSONStringArray{"社会现象", "消费观念", "高频"},
			IsVIP:        false,
			Status:       model.QuestionStatusPublished,
		},
		// 计划组织 - 调研类
		{
			CategoryID:   categoryMap["ms_jiegou_jihua"],
			QuestionType: model.QuestionTypeEssay,
			Difficulty:   3,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2023,
			SourceRegion: "联考",
			SourceExam:   "2023年公务员联考面试真题",
			Content:      "领导让你组织一次关于本单位青年干部成长需求的调研活动，你会怎么做？",
			Answer:       "【目的意义】\n\n了解青年干部的成长需求，是优化人才培养机制、促进青年干部健康成长的重要基础，我会认真组织好这次调研。\n\n【工作重点】\n\n第一，做好调研准备。确定调研目的和内容，重点了解青年干部在能力提升、职业发展、工作环境等方面的需求；设计调研问卷和访谈提纲；确定调研对象，涵盖不同岗位、不同工龄的青年干部，以及其直接领导。\n\n第二，多元开展调研。一是发放问卷，了解青年干部的普遍性需求；二是组织座谈会，听取青年干部代表的意见建议；三是个别访谈，深入了解个性化需求；四是与人事部门沟通，了解青年干部培养现状。\n\n第三，分析形成报告。对调研数据进行统计分析，梳理青年干部的共性需求和个性需求；结合单位实际情况，提出针对性建议；形成调研报告报领导审阅。\n\n【结尾延伸】\n\n调研结束后，我会持续跟进调研成果的运用情况，确保调研真正服务于青年干部成长。",
			Analysis:     "【答题思路】\n\n1. 调研类题目的基本框架：\n- 目的意义：简述调研的重要性\n- 工作重点：准备阶段、实施阶段、总结阶段\n- 结尾延伸：成果运用\n\n2. 调研实施的四种常用方法：\n- 问卷调查（面广）\n- 座谈会（互动性强）\n- 个别访谈（深入）\n- 资料分析（参考借鉴）\n\n3. 本题要注意的细节：\n- 调研对象要全面（青年干部+领导）\n- 调研内容要具体\n- 成果运用要落实",
			Tips:         "调研类题目要体现「准备充分、方法多元、分析深入、成果落实」的特点。",
			Tags:         model.JSONStringArray{"计划组织", "调研", "高频"},
			IsVIP:        false,
			Status:       model.QuestionStatusPublished,
		},
		// 人际关系
		{
			CategoryID:   categoryMap["ms_jiegou_renji"],
			QuestionType: model.QuestionTypeEssay,
			Difficulty:   3,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2024,
			SourceRegion: "联考",
			SourceExam:   "2024年公务员联考面试真题",
			Content:      "你负责的一项工作，老同事认为应该按照传统方式做，而你想尝试新方法，双方产生了分歧，你会怎么办？",
			Answer:       "【表明态度】\n\n工作中产生不同意见是正常的，这恰恰说明老同事对工作认真负责。面对分歧，我会保持尊重和理性，妥善处理。\n\n【解决措施】\n\n首先，认真倾听老同事的意见。老同事经验丰富，坚持传统方式必有其道理。我会诚恳请教，了解传统方式的优势和这样做的原因，虚心学习老同事的经验。\n\n其次，客观分析两种方案。我会冷静思考新方法是否确实更优，还是我考虑不周。如果老同事的意见更合理，我会虚心接受；如果新方法确有优势，我会用数据和案例来论证，而不是主观臆断。\n\n再次，寻求最优解决方案。可以将两种方案的优势结合，或者在小范围内先试行新方法，用实际效果来检验。必要时，可以向领导汇报，请领导决策。\n\n【结尾升华】\n\n无论最终采用哪种方式，我都会与老同事保持良好的合作关系，毕竟我们的目标是一致的，都是为了把工作做好。",
			Analysis:     "【答题思路】\n\n1. 人际关系题的核心原则：\n- 阳光心态：正面理解他人行为\n- 换位思考：理解对方立场\n- 有效沟通：真诚表达、积极倾听\n- 工作为重：以完成工作为最终目标\n\n2. 与同事分歧的处理步骤：\n- 倾听理解：先听取对方意见\n- 客观分析：分析双方方案利弊\n- 寻求共识：找到最优解决方案\n- 维护关系：不论结果如何都保持良好关系",
			Tips:         "人际关系题要体现尊重、理解、沟通、合作的态度，避免过于强调自我。",
			Tags:         model.JSONStringArray{"人际关系", "与同事", "高频"},
			IsVIP:        false,
			Status:       model.QuestionStatusPublished,
		},
		// 应急应变
		{
			CategoryID:   categoryMap["ms_jiegou_yingji"],
			QuestionType: model.QuestionTypeEssay,
			Difficulty:   4,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2023,
			SourceRegion: "国考",
			SourceExam:   "2023年国家公务员考试面试真题",
			Content:      "你是政务服务中心的工作人员，有群众来办事时情绪激动，声称自己跑了好几趟都没办成，现在又被告知材料不全，群众要求见领导。你会怎么处理？",
			Answer:       "【稳定情绪】\n\n我会先安抚群众情绪。把群众请到安静的接待区，倒杯水让他坐下来，表达歉意：「给您带来不便，非常抱歉。您先消消气，有什么问题我们一定帮您解决。」\n\n【了解情况】\n\n待群众情绪稳定后，详细了解情况。询问群众办理什么业务，之前来过几次，每次是什么原因没办成。同时调取群众的办事记录，核实相关情况。\n\n【分类处理】\n\n根据了解到的情况分类处理：\n\n一是如果确实是我们工作失误，如之前没有一次性告知所需材料，我会诚恳道歉，并协调同事帮助群众补齐材料，特事特办。\n\n二是如果是群众自身原因导致，我会耐心解释办事流程和材料要求，帮助群众梳理还需要准备什么，并告知最便捷的补办方式。\n\n三是如果涉及复杂情况需要领导协调，我会向领导汇报，请领导出面接待。\n\n【事后总结】\n\n事后，我会反思此次事件，如果是工作流程问题，建议完善「一次性告知」制度；如果是个案问题，做好记录备案，避免类似情况再次发生。",
			Analysis:     "【答题思路】\n\n1. 应急应变题的基本框架：\n- 稳定情绪：控制局面，安抚情绪\n- 了解情况：弄清事情原委\n- 分类处理：根据不同情况采取不同措施\n- 事后总结：反思改进\n\n2. 本题的处理要点：\n- 态度：耐心、热情、负责\n- 方法：先安抚后处理\n- 原则：实事求是、依法依规",
			Tips:         "应急应变题要体现冷静、理性、负责的态度，处理方式要灵活、务实。",
			Tags:         model.JSONStringArray{"应急应变", "群众工作", "高频"},
			IsVIP:        false,
			Status:       model.QuestionStatusPublished,
		},
	}

	return questions
}

// createGongjiQuestions 创建公共基础知识题目
func createGongjiQuestions(categoryMap map[string]uint) []model.Question {
	year2024 := 2024
	year2023 := 2023

	questions := []model.Question{
		// 政治理论
		{
			CategoryID:   categoryMap["gj_zhengzhi"],
			QuestionType: model.QuestionTypeSingleChoice,
			Difficulty:   3,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2024,
			SourceRegion: "事业单位",
			SourceExam:   "2024年事业单位联考综合应用能力真题",
			Content:      "习近平新时代中国特色社会主义思想的核心要义是：",
			Options: model.QuestionOptions{
				{Key: "A", Content: "坚持和发展中国特色社会主义"},
				{Key: "B", Content: "实现中华民族伟大复兴"},
				{Key: "C", Content: "以人民为中心"},
				{Key: "D", Content: "推进国家治理体系和治理能力现代化"},
			},
			Answer:   "A",
			Analysis: "习近平新时代中国特色社会主义思想的核心要义是坚持和发展中国特色社会主义。\n\n党的十九大报告明确指出，习近平新时代中国特色社会主义思想，是对马克思列宁主义、毛泽东思想、邓小平理论、「三个代表」重要思想、科学发展观的继承和发展，是马克思主义中国化最新成果，是党和人民实践经验和集体智慧的结晶，是中国特色社会主义理论体系的重要组成部分，是全党全国人民为实现中华民族伟大复兴而奋斗的行动指南。\n\nB项是我们的奋斗目标，C项是发展思想，D项是全面深化改革的总目标的一部分。\n\n故本题选A。",
			Tips:     "习近平新时代中国特色社会主义思想的核心要义就是「坚持和发展中国特色社会主义」。",
			Tags:     model.JSONStringArray{"习近平新时代中国特色社会主义思想", "高频"},
			IsVIP:    false,
			Status:   model.QuestionStatusPublished,
		},
		// 法律知识 - 宪法
		{
			CategoryID:   categoryMap["gj_falv"],
			QuestionType: model.QuestionTypeSingleChoice,
			Difficulty:   3,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2023,
			SourceRegion: "事业单位",
			SourceExam:   "2023年事业单位联考公共基础知识真题",
			Content:      "根据我国宪法规定，下列关于全国人民代表大会常务委员会的说法，正确的是：",
			Options: model.QuestionOptions{
				{Key: "A", Content: "全国人大常委会是最高国家权力机关"},
				{Key: "B", Content: "全国人大常委会有权修改宪法"},
				{Key: "C", Content: "全国人大常委会有权解释宪法"},
				{Key: "D", Content: "全国人大常委会委员长主持全国人民代表大会会议"},
			},
			Answer:   "C",
			Analysis: "A项错误：全国人民代表大会是最高国家权力机关，全国人大常委会是全国人大的常设机关。\n\nB项错误：修改宪法的权力属于全国人民代表大会，全国人大常委会无权修改宪法。\n\nC项正确：根据宪法第六十七条规定，全国人大常委会有权「解释宪法，监督宪法的实施」。\n\nD项错误：全国人民代表大会会议由全国人大常委会召集，由大会主席团主持，而非委员长主持。\n\n故本题选C。",
			Tips:     "注意区分：全国人大有权「修改宪法」，全国人大常委会有权「解释宪法」。",
			Tags:     model.JSONStringArray{"宪法", "全国人大常委会", "高频"},
			IsVIP:    false,
			Status:   model.QuestionStatusPublished,
		},
		// 公文写作
		{
			CategoryID:   categoryMap["gj_gongwen"],
			QuestionType: model.QuestionTypeSingleChoice,
			Difficulty:   3,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2024,
			SourceRegion: "事业单位",
			SourceExam:   "2024年事业单位联考公共基础知识真题",
			Content:      "下列关于公文格式的表述，正确的是：",
			Options: model.QuestionOptions{
				{Key: "A", Content: "联合行文时，发文机关标志可以并用联合发文机关名称"},
				{Key: "B", Content: "公文标题由发文机关名称、事由和文种组成，缺一不可"},
				{Key: "C", Content: "主送机关是公文的主要受理机关，必须使用全称或规范化简称"},
				{Key: "D", Content: "附件说明置于正文之后、落款之前，另起一行"},
			},
			Answer:   "A",
			Analysis: "A项正确：根据《党政机关公文格式》规定，联合行文时，发文机关标志可以并用联合发文机关名称，也可以单独用主办机关名称。\n\nB项错误：公文标题一般由发文机关名称、事由和文种组成，但发文机关名称可以省略。例如「关于xxx的通知」。\n\nC项错误：主送机关一般使用全称或规范化简称，但向下级机关行文时，可以使用统称，如「各省、自治区、直辖市人民政府」。\n\nD项错误：附件说明的位置确实在正文之后，但应空一行，而不是「另起一行」紧接正文。\n\n故本题选A。",
			Tips:     "公文格式是常考内容，要注意标题组成、主送机关、附件说明等细节。",
			Tags:     model.JSONStringArray{"公文写作", "公文格式", "高频"},
			IsVIP:    false,
			Status:   model.QuestionStatusPublished,
		},
		// 经济知识
		{
			CategoryID:   categoryMap["gj_jingji"],
			QuestionType: model.QuestionTypeSingleChoice,
			Difficulty:   3,
			SourceType:   model.QuestionSourceRealExam,
			SourceYear:   &year2023,
			SourceRegion: "事业单位",
			SourceExam:   "2023年事业单位联考公共基础知识真题",
			Content:      "下列不属于市场失灵表现的是：",
			Options: model.QuestionOptions{
				{Key: "A", Content: "外部性"},
				{Key: "B", Content: "公共物品供给不足"},
				{Key: "C", Content: "信息不对称"},
				{Key: "D", Content: "规模效益递增"},
			},
			Answer:   "D",
			Analysis: "市场失灵是指市场机制不能实现资源的有效配置，主要表现为：\n\n1. 外部性：指一个经济主体的活动对其他经济主体产生的影响。（A正确）\n\n2. 公共物品供给不足：公共物品具有非排他性和非竞争性，市场难以有效提供。（B正确）\n\n3. 信息不对称：交易双方信息不对等，可能导致逆向选择和道德风险。（C正确）\n\n4. 垄断：市场集中度过高，破坏竞争机制。\n\n5. 收入分配不公。\n\nD项「规模效益递增」是指企业扩大生产规模后，单位成本下降、效益提高，这是正常的经济现象，不是市场失灵的表现。\n\n故本题选D。",
			Tips:     "市场失灵主要包括：外部性、公共物品、信息不对称、垄断、收入分配不公。",
			Tags:     model.JSONStringArray{"市场失灵", "经济学", "高频"},
			IsVIP:    false,
			Status:   model.QuestionStatusPublished,
		},
	}

	return questions
}

// seedExamPapers 初始化试卷示例数据
func seedExamPapers(db *gorm.DB) error {
	var count int64
	db.Model(&model.ExamPaper{}).Count(&count)
	if count > 0 {
		return nil
	}

	year2024 := 2024
	year2023 := 2023

	// 获取已创建的题目ID
	var questions []model.Question
	db.Select("id").Find(&questions)
	if len(questions) == 0 {
		return nil // 没有题目就不创建试卷
	}

	// 创建试卷题目列表
	var paperQuestions model.PaperQuestions
	for i, q := range questions {
		if i >= 20 {
			break
		}
		paperQuestions = append(paperQuestions, model.PaperQuestion{
			QuestionID: q.ID,
			Score:      5,
			Order:      i + 1,
		})
	}

	papers := []model.ExamPaper{
		// 真题卷
		{
			Title:          "2024年国家公务员考试行测真题（地市级）",
			PaperType:      model.PaperTypeRealExam,
			ExamType:       "国考",
			Subject:        "行测",
			Year:           &year2024,
			Region:         "全国",
			TotalQuestions: 130,
			TotalScore:     100,
			TimeLimit:      120,
			Questions:      paperQuestions,
			IsFree:         false,
			Status:         model.PaperStatusPublished,
			Description:    "2024年度国家公务员考试行政职业能力测验真题（地市级），包含言语理解、数量关系、判断推理、资料分析、常识判断五大模块。",
		},
		{
			Title:          "2023年国家公务员考试行测真题（省部级）",
			PaperType:      model.PaperTypeRealExam,
			ExamType:       "国考",
			Subject:        "行测",
			Year:           &year2023,
			Region:         "全国",
			TotalQuestions: 135,
			TotalScore:     100,
			TimeLimit:      120,
			Questions:      paperQuestions,
			IsFree:         true,
			Status:         model.PaperStatusPublished,
			Description:    "2023年度国家公务员考试行政职业能力测验真题（省部级），完整版试题含答案解析。",
		},
		// 模拟卷
		{
			Title:          "行测冲刺模拟卷（一）",
			PaperType:      model.PaperTypeMock,
			ExamType:       "国考",
			Subject:        "行测",
			Year:           &year2024,
			TotalQuestions: 100,
			TotalScore:     100,
			TimeLimit:      100,
			Questions:      paperQuestions,
			IsFree:         true,
			Status:         model.PaperStatusPublished,
			Description:    "行测专项训练模拟卷，精选高频考点题目，限时100分钟。",
		},
		{
			Title:          "行测言语理解专项练习",
			PaperType:      model.PaperTypeMock,
			ExamType:       "国考",
			Subject:        "行测",
			Year:           &year2024,
			TotalQuestions: 40,
			TotalScore:     40,
			TimeLimit:      35,
			Questions:      paperQuestions[:10],
			IsFree:         true,
			Status:         model.PaperStatusPublished,
			Description:    "言语理解与表达专项练习，涵盖逻辑填空、片段阅读、语句表达三大题型。",
		},
		{
			Title:          "行测数量关系专项练习",
			PaperType:      model.PaperTypeMock,
			ExamType:       "国考",
			Subject:        "行测",
			Year:           &year2024,
			TotalQuestions: 15,
			TotalScore:     15,
			TimeLimit:      20,
			Questions:      paperQuestions[:5],
			IsFree:         true,
			Status:         model.PaperStatusPublished,
			Description:    "数量关系专项练习，包括数学运算和数字推理两大类型。",
		},
		// 每日练习
		{
			Title:          "每日一练 - 2024年1月28日",
			PaperType:      model.PaperTypeDaily,
			ExamType:       "综合",
			Subject:        "行测",
			Year:           &year2024,
			TotalQuestions: 10,
			TotalScore:     10,
			TimeLimit:      15,
			Questions:      paperQuestions[:10],
			IsFree:         true,
			Status:         model.PaperStatusPublished,
			Description:    "每日精选10道高频考题，助你保持学习状态。",
		},
	}

	return db.Create(&papers).Error
}
