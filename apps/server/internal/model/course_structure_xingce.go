package model

// GetXingceStructure 获取行测课程预设结构
func GetXingceStructure() *SubjectStructurePreset {
	return &SubjectStructurePreset{
		Subject:     "xingce",
		Name:        "行政职业能力测验",
		TotalHours:  280,
		Description: "行政职业能力测验，包含五大模块：言语理解、数量关系、判断推理、资料分析、常识判断",
		Modules: []ModulePreset{
			// 模块1：言语理解与表达
			{
				Code:          "yanyu",
				Name:          "言语理解与表达",
				ShortName:     "言语理解",
				Icon:          "BookText",
				Color:         "from-sky-500 to-cyan-600",
				Description:   "考查词语运用、阅读理解能力",
				QuestionCount: 40,
				AvgTime:       35,
				Weight:        25,
				Difficulty:    3,
				Categories: []CategoryPreset{
					// 逻辑填空课程
					{
						Name:              "逻辑填空",
						Code:              "luoji_tiankong",
						EstimatedDuration: "45课时",
						Description:       "考查词语运用和语境理解能力",
						Topics: []TopicPreset{
							{
								Name:        "实词辨析精讲",
								Code:        "shici_bianxi",
								Duration:    "20课时",
								Description: "掌握实词辨析的核心方法和高频词汇",
								Courses: []CoursePreset{
									{
										Name:        "实词辨析基础方法",
										Duration:    "4课时",
										Description: "学习语素分析法、语境推断法等基础方法",
										Lessons: []LessonPreset{
											{Title: "第1课：语素分析法", Subtitle: "拆分词语分析语素含义差异"},
											{Title: "第2课：语境推断法", Subtitle: "根据上下文判断词语意思"},
											{Title: "第3课：感情色彩法", Subtitle: "褒义、贬义、中性词辨析"},
											{Title: "第4课：语体色彩法", Subtitle: "书面语与口语的区分"},
										},
									},
									{
										Name:        "高频实词专题",
										Duration:    "6课时",
										Description: "500+组高频实词分类讲解",
										Lessons: []LessonPreset{
											{Title: "第5课：表「改变、变化」的词", Subtitle: "改革/改良/改进/改善"},
											{Title: "第6课：表「增加、提升」的词", Subtitle: "增强/加强/增进/促进"},
											{Title: "第7课：表「限制、约束」的词", Subtitle: "限制/制约/约束/束缚"},
											{Title: "第8课：表「影响、作用」的词", Subtitle: "影响/干预/干涉/介入"},
											{Title: "第9课：表「揭示、表明」的词", Subtitle: "揭示/揭露/暴露/显示"},
											{Title: "第10课：表「解决、处理」的词", Subtitle: "解决/处理/应对/化解"},
										},
									},
									{
										Name:        "语境分析专题",
										Duration:    "6课时",
										Description: "掌握六大语境分析方法",
										Lessons: []LessonPreset{
											{Title: "第11课：相反相对关系", Subtitle: "转折关系词语填空"},
											{Title: "第12课：解释说明关系", Subtitle: "同义复现词语填空"},
											{Title: "第13课：递进关系", Subtitle: "程度加深词语填空"},
											{Title: "第14课：并列关系", Subtitle: "同类词语填空"},
											{Title: "第15课：因果关系", Subtitle: "逻辑推导词语填空"},
											{Title: "第16课：条件关系", Subtitle: "假设、必要条件词语填空"},
										},
									},
									{
										Name:        "固定搭配专题",
										Duration:    "4课时",
										Description: "掌握常见词语搭配规则",
										Lessons: []LessonPreset{
											{Title: "第17课：动宾搭配", Subtitle: "500+组高频搭配"},
											{Title: "第18课：主谓搭配", Subtitle: "300+组高频搭配"},
											{Title: "第19课：偏正搭配", Subtitle: "形容词+名词搭配"},
											{Title: "第20课：介词搭配与惯用表达", Subtitle: "常见介词搭配"},
										},
									},
								},
							},
							{
								Name:        "成语辨析精讲",
								Code:        "chengyu_bianxi",
								Duration:    "15课时",
								Description: "掌握800个高频成语及易混辨析",
								Courses: []CoursePreset{
									{
										Name:        "高频成语精讲",
										Duration:    "5课时",
										Description: "800个高频成语分类讲解",
										Lessons: []LessonPreset{
											{Title: "第1课：描述事物发展变化类成语", Subtitle: "日新月异、与日俱增、突飞猛进等（80个）"},
											{Title: "第2课：描述程度深浅类成语", Subtitle: "根深蒂固、入木三分、刻骨铭心等（80个）"},
											{Title: "第3课：描述范围大小类成语", Subtitle: "包罗万象、无所不包、面面俱到等（80个）"},
											{Title: "第4课：描述态度情感类成语", Subtitle: "高瞻远瞩、未雨绸缪、杞人忧天等（80个）"},
											{Title: "第5课：描述行为方式类成语", Subtitle: "循序渐进、一蹴而就、按部就班等（80个）"},
										},
									},
									{
										Name:        "易混成语辨析",
										Duration:    "5课时",
										Description: "200组易混成语深度辨析",
										Lessons: []LessonPreset{
											{Title: "第6课：近义成语辨析", Subtitle: "耳濡目染vs潜移默化等（50组）"},
											{Title: "第7课：形近成语辨析", Subtitle: "无所适从vs无所事事等（50组）"},
											{Title: "第8课：意近成语辨析", Subtitle: "独树一帜vs别具一格等（50组）"},
											{Title: "第9课：褒贬易混成语", Subtitle: "无微不至vs无所不至等（30组）"},
											{Title: "第10课：程度易混成语", Subtitle: "相辅相成vs相得益彰等（20组）"},
										},
									},
									{
										Name:        "成语误用类型总结",
										Duration:    "5课时",
										Description: "掌握成语使用的常见错误类型",
										Lessons: []LessonPreset{
											{Title: "第11课：望文生义类误用", Subtitle: "50例常见错误分析"},
											{Title: "第12课：对象误用类", Subtitle: "40例常见错误分析"},
											{Title: "第13课：褒贬误用类", Subtitle: "30例常见错误分析"},
											{Title: "第14课：语法功能误用类", Subtitle: "30例常见错误分析"},
											{Title: "第15课：语义重复类误用", Subtitle: "20例常见错误分析"},
										},
									},
								},
							},
							{
								Name:        "关联词精讲",
								Code:        "guanlian_ci",
								Duration:    "10课时",
								Description: "掌握关联词的分类和搭配规则",
								Courses: []CoursePreset{
									{
										Name:        "关联词分类总结",
										Duration:    "3课时",
										Description: "系统学习各类关联词",
										Lessons: []LessonPreset{
											{Title: "第1课：转折关系关联词", Subtitle: "虽然...但是、尽管...却、然而、不过、可是"},
											{Title: "第2课：递进关系关联词", Subtitle: "不仅...而且、不但...反而、甚至、更、况且"},
											{Title: "第3课：因果关系关联词", Subtitle: "因为...所以、由于、以致、因此、导致"},
										},
									},
									{
										Name:        "关联词搭配规则",
										Duration:    "3课时",
										Description: "掌握关联词的正确搭配",
										Lessons: []LessonPreset{
											{Title: "第4课：条件关系关联词", Subtitle: "只有...才、只要...就、无论...都、除非...否则"},
											{Title: "第5课：假设关系关联词", Subtitle: "如果...那么、假如...就、即使...也、倘若"},
											{Title: "第6课：并列关系关联词", Subtitle: "一方面...另一方面、既...又、或者...或者"},
										},
									},
									{
										Name:        "关联词综合运用",
										Duration:    "4课时",
										Description: "关联词综合运用技巧",
										Lessons: []LessonPreset{
											{Title: "第7课：复合关联词使用规则", Subtitle: "多重关联词组合使用"},
											{Title: "第8课：关联词缺失补全技巧", Subtitle: "根据语境补全关联词"},
											{Title: "第9课：关联词位置调整技巧", Subtitle: "调整关联词位置使句子通顺"},
											{Title: "第10课：典型真题关联词解析", Subtitle: "历年真题关联词题型精讲"},
										},
									},
								},
							},
						},
					},
					// 片段阅读课程
					{
						Name:              "片段阅读",
						Code:              "pianduan_yuedu",
						EstimatedDuration: "40课时",
						Description:       "考查阅读理解和主旨概括能力",
						Topics: []TopicPreset{
							{
								Name:        "主旨概括精讲",
								Code:        "zhuzhi_gaigua",
								Duration:    "15课时",
								Description: "掌握主旨概括题的核心方法",
								Courses: []CoursePreset{
									{
										Name:     "行文脉络分析法",
										Duration: "5课时",
										Lessons: []LessonPreset{
											{Title: "第1课：总-分结构", Subtitle: "总说在前，分说在后"},
											{Title: "第2课：分-总结构", Subtitle: "先铺垫后总结"},
											{Title: "第3课：总-分-总结构", Subtitle: "首尾呼应"},
											{Title: "第4课：分-总-分结构", Subtitle: "中间核心"},
											{Title: "第5课：并列结构", Subtitle: "多个方面并重"},
										},
									},
									{
										Name:     "关键词定位法",
										Duration: "5课时",
										Lessons: []LessonPreset{
											{Title: "第6课：转折词定位", Subtitle: "但是、然而、其实"},
											{Title: "第7课：因果词定位", Subtitle: "因此、所以、可见"},
											{Title: "第8课：总结词定位", Subtitle: "总之、概括起来、一言以蔽之"},
											{Title: "第9课：递进词定位", Subtitle: "更、甚至、尤其"},
											{Title: "第10课：对策词定位", Subtitle: "应该、需要、必须"},
										},
									},
									{
										Name:     "各结构类型精讲",
										Duration: "5课时",
										Lessons: []LessonPreset{
											{Title: "第11课：议论文主旨概括技巧", Subtitle: "论点提取方法"},
											{Title: "第12课：说明文主旨概括技巧", Subtitle: "说明对象把握"},
											{Title: "第13课：新闻报道类主旨概括", Subtitle: "导语抓取法"},
											{Title: "第14课：科普文章类主旨概括", Subtitle: "核心观点提炼"},
											{Title: "第15课：社论评论类主旨概括", Subtitle: "作者态度把握"},
										},
									},
								},
							},
							{
								Name:        "意图判断精讲",
								Code:        "yitu_panduan",
								Duration:    "10课时",
								Description: "掌握意图判断题的解题技巧",
								Courses: []CoursePreset{
									{
										Name:     "意图判断基础方法",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：问题引导型", Subtitle: "指出问题→暗示对策"},
											{Title: "第2课：故事寓言型", Subtitle: "借古讽今→揭示道理"},
											{Title: "第3课：现象阐述型", Subtitle: "描述现象→暗示态度"},
											{Title: "第4课：观点阐述型", Subtitle: "表明观点→意在强调"},
										},
									},
									{
										Name:     "意图题与主旨题区分",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第5课：选项设置差异分析", Subtitle: "主旨vs意图选项特点"},
											{Title: "第6课：题干提问方式差异", Subtitle: "提问词辨析"},
											{Title: "第7课：混淆选项排除技巧", Subtitle: "排除干扰项方法"},
										},
									},
									{
										Name:     "典型意图题专练",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第8课：社会现象类意图判断", Subtitle: "社会热点类题目"},
											{Title: "第9课：政策解读类意图判断", Subtitle: "政策分析类题目"},
											{Title: "第10课：科技发展类意图判断", Subtitle: "科技前沿类题目"},
										},
									},
								},
							},
							{
								Name:        "细节理解精讲",
								Code:        "xijie_lijie",
								Duration:    "10课时",
								Description: "掌握细节理解题的解题技巧",
								Courses: []CoursePreset{
									{
										Name:     "细节判断基础方法",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：概念偷换类错误识别", Subtitle: "偷换概念的常见形式"},
											{Title: "第2课：范围扩大/缩小类错误", Subtitle: "范围变化的识别"},
											{Title: "第3课：时态混淆类错误", Subtitle: "已然与未然"},
											{Title: "第4课：因果倒置类错误", Subtitle: "因果关系错误"},
										},
									},
									{
										Name:     "干扰项设置规律",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第5课：无中生有类干扰项", Subtitle: "凭空捏造的选项"},
											{Title: "第6课：绝对化表述类干扰项", Subtitle: "过于绝对的选项"},
											{Title: "第7课：正话反说类干扰项", Subtitle: "正反颠倒的选项"},
										},
									},
									{
										Name:     "快速定位技巧",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第8课：关键词定位法", Subtitle: "快速找到原文对应"},
											{Title: "第9课：选项对比排除法", Subtitle: "通过对比排除错误"},
											{Title: "第10课：典型真题精讲", Subtitle: "历年真题实战演练"},
										},
									},
								},
							},
							{
								Name:        "标题选择精讲",
								Code:        "biaoti_xuanze",
								Duration:    "5课时",
								Description: "掌握标题选择题的解题技巧",
								Courses: []CoursePreset{
									{
										Name:     "标题选择基本原则",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：紧扣主旨、简洁醒目", Subtitle: "标题选择的基本要求"},
											{Title: "第2课：吸引眼球、概括全面", Subtitle: "好标题的特点"},
										},
									},
									{
										Name:     "各类文章标题选择",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第3课：新闻类文章标题技巧", Subtitle: "新闻标题的特点"},
											{Title: "第4课：议论类文章标题技巧", Subtitle: "议论文标题的特点"},
											{Title: "第5课：科普类文章标题技巧", Subtitle: "科普文标题的特点"},
										},
									},
								},
							},
						},
					},
					// 语句表达课程
					{
						Name:              "语句表达",
						Code:              "yuju_biaoda",
						EstimatedDuration: "13课时",
						Description:       "考查语句排序和语句填空能力",
						Topics: []TopicPreset{
							{
								Name:        "语句排序精讲",
								Code:        "yuju_paixu",
								Duration:    "8课时",
								Description: "掌握语句排序的核心方法",
								Courses: []CoursePreset{
									{
										Name:     "排序基础方法",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第1课：首句排除法", Subtitle: "代词开头、关联词后半部分开头不做首句"},
											{Title: "第2课：尾句确定法", Subtitle: "总结性语句、呼吁性语句适合做尾句"},
											{Title: "第3课：关键词捆绑法", Subtitle: "指代词、关联词、时间词、逻辑词"},
										},
									},
									{
										Name:     "排序进阶技巧",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第4课：时间顺序排列", Subtitle: "按时间先后排序"},
											{Title: "第5课：逻辑顺序排列", Subtitle: "由浅入深、由表及里"},
											{Title: "第6课：空间顺序排列", Subtitle: "由近及远、由内到外"},
										},
									},
									{
										Name:     "排序综合训练",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第7课：议论文语句排序", Subtitle: "议论文排序实战"},
											{Title: "第8课：说明文语句排序", Subtitle: "说明文排序实战"},
										},
									},
								},
							},
							{
								Name:        "语句填空精讲",
								Code:        "yuju_tiankong",
								Duration:    "5课时",
								Description: "掌握语句填空的解题技巧",
								Courses: []CoursePreset{
									{
										Name:     "语句填空基础方法",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：位置判断法", Subtitle: "首句、中间、尾句"},
											{Title: "第2课：话题一致性原则", Subtitle: "保持话题统一"},
										},
									},
									{
										Name:     "语句填空进阶",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第3课：承上启下类填空", Subtitle: "过渡句填空"},
											{Title: "第4课：总结收束类填空", Subtitle: "结尾句填空"},
											{Title: "第5课：引出话题类填空", Subtitle: "开头句填空"},
										},
									},
								},
							},
						},
					},
				},
			},
			// 模块2：数量关系
			{
				Code:          "shuliang",
				Name:          "数量关系",
				ShortName:     "数量关系",
				Icon:          "Calculator",
				Color:         "from-violet-500 to-purple-600",
				Description:   "考查数学运算与数字推理能力",
				QuestionCount: 15,
				AvgTime:       25,
				Weight:        15,
				Difficulty:    5,
				Categories: []CategoryPreset{
					{
						Name:              "数学运算",
						Code:              "shuxue_yunsuan",
						EstimatedDuration: "66课时",
						Description:       "考查数学运算能力",
						Topics: []TopicPreset{
							{
								Name:     "计算问题与技巧",
								Code:     "jisuan_jiqiao",
								Duration: "10课时",
								Courses: []CoursePreset{
									{
										Name:     "速算技巧汇总",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：凑整法", Subtitle: "快速凑成整数计算"},
											{Title: "第2课：提公因式法", Subtitle: "简化计算过程"},
											{Title: "第3课：分组计算法", Subtitle: "将复杂计算分组"},
											{Title: "第4课：基准数法", Subtitle: "选取基准数简化"},
										},
									},
									{
										Name:     "整除特性应用",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第5课：整除特性基础", Subtitle: "2、3、4、5、6、8、9整除"},
											{Title: "第6课：尾数法快速判断", Subtitle: "利用尾数判断"},
											{Title: "第7课：数字特性在选项排除中的应用", Subtitle: "数字特性排除"},
										},
									},
									{
										Name:     "比例法与方程法",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第8课：比例统一法", Subtitle: "统一份数关系"},
											{Title: "第9课：设1法与赋值法", Subtitle: "特值法应用"},
											{Title: "第10课：方程法与代入排除法", Subtitle: "方程求解技巧"},
										},
									},
								},
							},
							{
								Name:     "行程问题精讲",
								Code:     "xingcheng_wenti",
								Duration: "10课时",
								Courses: []CoursePreset{
									{
										Name:     "相遇与追及问题",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第1课：相遇问题", Subtitle: "同向、相向"},
											{Title: "第2课：追及问题", Subtitle: "速度差、时间差"},
											{Title: "第3课：多次相遇问题", Subtitle: "往返相遇"},
										},
									},
									{
										Name:     "流水行船问题",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第4课：顺流逆流基本公式", Subtitle: "基本公式推导"},
											{Title: "第5课：漂流物问题", Subtitle: "漂流物速度为水速"},
											{Title: "第6课：多船相遇问题", Subtitle: "复杂场景分析"},
										},
									},
									{
										Name:     "环形与其他行程",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第7课：环形相遇问题", Subtitle: "环形跑道相遇"},
											{Title: "第8课：环形追及问题", Subtitle: "环形跑道追及"},
											{Title: "第9课：火车过桥/隧道问题", Subtitle: "火车长度问题"},
											{Title: "第10课：钟表问题", Subtitle: "时针分针追及"},
										},
									},
								},
							},
							{
								Name:     "工程问题精讲",
								Code:     "gongcheng_wenti",
								Duration: "8课时",
								Courses: []CoursePreset{
									{
										Name:     "工程问题基础",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第1课：效率相同型", Subtitle: "设工作总量为1"},
											{Title: "第2课：效率不同型", Subtitle: "按比例赋值"},
											{Title: "第3课：给定时间条件型", Subtitle: "条件转化"},
										},
									},
									{
										Name:     "工程问题进阶",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第4课：轮流工作问题", Subtitle: "周期性工作"},
											{Title: "第5课：交替工作问题", Subtitle: "交替进行"},
											{Title: "第6课：水管进水放水问题", Subtitle: "进出平衡"},
										},
									},
									{
										Name:     "工程问题综合",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第7课：多人合作问题", Subtitle: "多人协作"},
											{Title: "第8课：效率变化问题", Subtitle: "效率变化分析"},
										},
									},
								},
							},
							{
								Name:     "利润问题精讲",
								Code:     "lirun_wenti",
								Duration: "6课时",
								Courses: []CoursePreset{
									{
										Name:     "利润问题基础",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：成本、售价、利润、利润率关系", Subtitle: "基本公式"},
											{Title: "第2课：打折与定价策略", Subtitle: "折扣计算"},
										},
									},
									{
										Name:     "利润问题进阶",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第3课：分段计价问题", Subtitle: "分段定价"},
											{Title: "第4课：批量销售问题", Subtitle: "批量折扣"},
										},
									},
									{
										Name:     "利润问题综合",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第5课：促销方案比较", Subtitle: "方案对比"},
											{Title: "第6课：盈亏平衡分析", Subtitle: "盈亏临界点"},
										},
									},
								},
							},
							{
								Name:     "排列组合精讲",
								Code:     "pailie_zuhe",
								Duration: "12课时",
								Courses: []CoursePreset{
									{
										Name:     "基本原理",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第1课：加法原理", Subtitle: "分类计数"},
											{Title: "第2课：乘法原理", Subtitle: "分步计数"},
											{Title: "第3课：两原理综合应用", Subtitle: "综合运用"},
										},
									},
									{
										Name:     "排列组合公式",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第4课：排列数公式与应用", Subtitle: "排列计算"},
											{Title: "第5课：组合数公式与应用", Subtitle: "组合计算"},
											{Title: "第6课：排列组合公式综合", Subtitle: "综合应用"},
										},
									},
									{
										Name:     "典型模型",
										Duration: "6课时",
										Lessons: []LessonPreset{
											{Title: "第7课：相邻问题", Subtitle: "捆绑法"},
											{Title: "第8课：不相邻问题", Subtitle: "插空法"},
											{Title: "第9课：定位问题", Subtitle: "优先安排法"},
											{Title: "第10课：分组问题", Subtitle: "分堆与分配"},
											{Title: "第11课：环形排列问题", Subtitle: "圆桌排列"},
											{Title: "第12课：多元素排列问题", Subtitle: "复杂排列"},
										},
									},
								},
							},
							{
								Name:     "概率问题精讲",
								Code:     "gailv_wenti",
								Duration: "6课时",
								Courses: []CoursePreset{
									{
										Name:     "概率基础",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：古典概型", Subtitle: "等可能事件"},
											{Title: "第2课：独立事件与互斥事件", Subtitle: "事件关系"},
										},
									},
									{
										Name:     "概率进阶",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第3课：条件概率", Subtitle: "条件概率公式"},
											{Title: "第4课：几何概型", Subtitle: "长度、面积概率"},
										},
									},
									{
										Name:     "概率综合",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第5课：排列组合与概率结合", Subtitle: "计数与概率"},
											{Title: "第6课：典型真题精讲", Subtitle: "真题实战"},
										},
									},
								},
							},
							{
								Name:     "几何问题精讲",
								Code:     "jihe_wenti",
								Duration: "8课时",
								Courses: []CoursePreset{
									{
										Name:     "平面几何",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第1课：三角形相关计算", Subtitle: "面积、周长"},
											{Title: "第2课：四边形与多边形", Subtitle: "各类图形"},
											{Title: "第3课：圆与扇形", Subtitle: "圆的计算"},
										},
									},
									{
										Name:     "立体几何",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第4课：长方体、正方体表面积与体积", Subtitle: "立方体"},
											{Title: "第5课：圆柱、圆锥、球体", Subtitle: "旋转体"},
										},
									},
									{
										Name:     "几何综合",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第6课：切割问题", Subtitle: "切分图形"},
											{Title: "第7课：最短路径问题", Subtitle: "路径优化"},
											{Title: "第8课：几何最值问题", Subtitle: "几何极值"},
										},
									},
								},
							},
							{
								Name:     "其他问题精讲",
								Code:     "qita_wenti",
								Duration: "6课时",
								Courses: []CoursePreset{
									{
										Name:     "其他典型问题",
										Duration: "6课时",
										Lessons: []LessonPreset{
											{Title: "第1课：容斥问题", Subtitle: "两集合容斥公式、三集合容斥公式"},
											{Title: "第2课：极值问题", Subtitle: "最不利原则、最优策略"},
											{Title: "第3课：年龄问题", Subtitle: "年龄差不变原则、倍数关系变化"},
											{Title: "第4课：日期问题", Subtitle: "星期推算、周期问题"},
											{Title: "第5课：钟表问题", Subtitle: "追及问题应用、特殊时刻计算"},
											{Title: "第6课：植树问题", Subtitle: "单边植树、双边植树、环形植树"},
										},
									},
								},
							},
						},
					},
					{
						Name:              "数字推理",
						Code:              "shuzi_tuili",
						EstimatedDuration: "16课时",
						Description:       "考查数字规律推理能力",
						Topics: []TopicPreset{
							{
								Name:     "基础数列精讲",
								Code:     "jichu_shulie",
								Duration: "6课时",
								Courses: []CoursePreset{
									{
										Name:     "等差等比数列",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：基本等差数列", Subtitle: "公差恒定"},
											{Title: "第2课：二级等差数列", Subtitle: "差值成等差"},
											{Title: "第3课：基本等比数列", Subtitle: "公比恒定"},
											{Title: "第4课：变形等比数列", Subtitle: "比值变化"},
										},
									},
									{
										Name:     "和积数列",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第5课：两项和数列、三项和数列", Subtitle: "和关系"},
											{Title: "第6课：两项积数列", Subtitle: "积关系"},
										},
									},
								},
							},
							{
								Name:     "递推数列精讲",
								Code:     "ditui_shulie",
								Duration: "6课时",
								Courses: []CoursePreset{
									{
										Name:     "递推数列",
										Duration: "6课时",
										Lessons: []LessonPreset{
											{Title: "第1课：前两项加法递推", Subtitle: "斐波那契型"},
											{Title: "第2课：前三项加法递推", Subtitle: "三项和递推"},
											{Title: "第3课：前两项乘法递推", Subtitle: "乘法关系"},
											{Title: "第4课：混合运算递推", Subtitle: "加减乘混合"},
											{Title: "第5课：带常数项递推", Subtitle: "常数修正"},
											{Title: "第6课：多级递推关系", Subtitle: "复杂递推"},
										},
									},
								},
							},
							{
								Name:     "特殊数列精讲",
								Code:     "teshu_shulie",
								Duration: "4课时",
								Courses: []CoursePreset{
									{
										Name:     "特殊数列",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：质数数列", Subtitle: "质数判定方法、质数变形数列"},
											{Title: "第2课：幂次数列", Subtitle: "平方数列、立方数列、幂次变形数列"},
											{Title: "第3课：分数数列", Subtitle: "分子分母分别成规律、分数转化技巧"},
											{Title: "第4课：多重数列", Subtitle: "交叉数列、分组数列"},
										},
									},
								},
							},
						},
					},
				},
			},
			// 模块3：判断推理
			{
				Code:          "panduan",
				Name:          "判断推理",
				ShortName:     "判断推理",
				Icon:          "Brain",
				Color:         "from-emerald-500 to-teal-600",
				Description:   "考查逻辑推理与分析判断能力",
				QuestionCount: 40,
				AvgTime:       35,
				Weight:        25,
				Difficulty:    4,
				Categories: []CategoryPreset{
					{
						Name:              "图形推理",
						Code:              "tuxing_tuili",
						EstimatedDuration: "30课时",
						Description:       "考查图形规律推理能力",
						Topics: []TopicPreset{
							{
								Name:     "位置规律精讲",
								Code:     "weizhi_guilu",
								Duration: "6课时",
								Courses: []CoursePreset{
									{
										Name:     "平移与旋转",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：直线平移", Subtitle: "上下、左右"},
											{Title: "第2课：路径平移", Subtitle: "顺时针、逆时针"},
											{Title: "第3课：整体旋转", Subtitle: "固定角度"},
											{Title: "第4课：自身旋转", Subtitle: "元素旋转"},
										},
									},
									{
										Name:     "翻转规律",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第5课：左右翻转", Subtitle: "镜像对称"},
											{Title: "第6课：上下翻转、对角翻转", Subtitle: "其他翻转"},
										},
									},
								},
							},
							{
								Name:     "样式规律精讲",
								Code:     "yangshi_guilu",
								Duration: "6课时",
								Courses: []CoursePreset{
									{
										Name:     "叠加规律",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：直接叠加", Subtitle: "图形简单相加"},
											{Title: "第2课：规律叠加", Subtitle: "去同存异、去异存同"},
										},
									},
									{
										Name:     "遍历规律",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第3课：元素遍历", Subtitle: "每种元素出现一次"},
											{Title: "第4课：位置遍历", Subtitle: "每个位置出现一次"},
										},
									},
									{
										Name:     "对称与相似",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第5课：轴对称规律", Subtitle: "对称轴分析"},
											{Title: "第6课：相似图形规律", Subtitle: "相似变换"},
										},
									},
								},
							},
							{
								Name:     "属性规律精讲",
								Code:     "shuxing_guilu",
								Duration: "4课时",
								Courses: []CoursePreset{
									{
										Name:     "属性规律",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：对称性", Subtitle: "轴对称图形识别、中心对称图形识别"},
											{Title: "第2课：曲直性", Subtitle: "全曲线、全直线图形、曲直结合图形"},
											{Title: "第3课：开闭性", Subtitle: "开放图形与封闭图形、开闭混合规律"},
											{Title: "第4课：连通性", Subtitle: "单一图形与多部分图形、连通数量规律"},
										},
									},
								},
							},
							{
								Name:     "数量规律精讲",
								Code:     "shuliang_guilu",
								Duration: "8课时",
								Courses: []CoursePreset{
									{
										Name:     "点线数量",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：交点数量", Subtitle: "线条交点"},
											{Title: "第2课：端点数量", Subtitle: "线条端点"},
											{Title: "第3课：直线数量", Subtitle: "直线条数"},
											{Title: "第4课：曲线数量、笔画数", Subtitle: "曲线和笔画"},
										},
									},
									{
										Name:     "面角数量",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第5课：封闭区域数量", Subtitle: "封闭面数"},
											{Title: "第6课：部分数量", Subtitle: "图形部分"},
											{Title: "第7课：直角、锐角、钝角数量", Subtitle: "角的类型"},
											{Title: "第8课：内角和规律", Subtitle: "多边形内角"},
										},
									},
								},
							},
							{
								Name:     "空间重构精讲",
								Code:     "kongjian_chonggou",
								Duration: "6课时",
								Courses: []CoursePreset{
									{
										Name:     "六面体与展开图",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：相对面判断", Subtitle: "Z字法则"},
											{Title: "第2课：相邻面判断", Subtitle: "公共边法"},
											{Title: "第3课：平面展开与折叠", Subtitle: "展开图识别"},
											{Title: "第4课：立体图形切割", Subtitle: "截面分析"},
										},
									},
									{
										Name:     "三视图与截面",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第5课：三视图识别", Subtitle: "主视、俯视、侧视"},
											{Title: "第6课：截面图判断", Subtitle: "截面形状"},
										},
									},
								},
							},
						},
					},
					{
						Name:              "定义判断",
						Code:              "dingyi_panduan",
						EstimatedDuration: "14课时",
						Description:       "考查定义理解和应用能力",
						Topics: []TopicPreset{
							{
								Name:     "定义判断方法精讲",
								Code:     "dingyi_fangfa",
								Duration: "8课时",
								Courses: []CoursePreset{
									{
										Name:     "核心成分分析法",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第1课：主体成分", Subtitle: "谁"},
											{Title: "第2课：客体成分", Subtitle: "对谁"},
											{Title: "第3课：方式目的成分", Subtitle: "怎么做、为什么"},
										},
									},
									{
										Name:     "列举排除法",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第4课：包含型列举", Subtitle: "包括..."},
											{Title: "第5课：排除型列举", Subtitle: "不包括..."},
										},
									},
									{
										Name:     "关键词对比法",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第6课：并列定义对比", Subtitle: "同级定义比较"},
											{Title: "第7课：包含关系定义", Subtitle: "上下级定义"},
											{Title: "第8课：递进关系定义", Subtitle: "层次递进"},
										},
									},
								},
							},
							{
								Name:     "常见定义类型精讲",
								Code:     "dingyi_leixing",
								Duration: "6课时",
								Courses: []CoursePreset{
									{
										Name:     "各类定义",
										Duration: "6课时",
										Lessons: []LessonPreset{
											{Title: "第1课：法律类定义", Subtitle: "法律术语解读、法律条文理解"},
											{Title: "第2课：管理类定义", Subtitle: "管理学概念、经济学概念"},
											{Title: "第3课：心理学类定义", Subtitle: "心理学效应、认知偏差"},
											{Title: "第4课：社会学类定义", Subtitle: "社会现象定义、社会关系定义"},
											{Title: "第5课：逻辑学类定义", Subtitle: "逻辑学术语、推理形式"},
											{Title: "第6课：自然科学类定义", Subtitle: "科学概念、技术术语"},
										},
									},
								},
							},
						},
					},
					{
						Name:              "类比推理",
						Code:              "leibi_tuili",
						EstimatedDuration: "10课时",
						Description:       "考查类比关系分析能力",
						Topics: []TopicPreset{
							{
								Name:     "语义关系精讲",
								Code:     "yuyi_guanxi",
								Duration: "4课时",
								Courses: []CoursePreset{
									{
										Name:     "语义关系",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：近义关系", Subtitle: "同义词判断、近义程度差异"},
											{Title: "第2课：反义关系", Subtitle: "绝对反义、相对反义"},
											{Title: "第3课：比喻象征关系", Subtitle: "比喻修辞、象征意义"},
											{Title: "第4课：词义侧重关系", Subtitle: "感情色彩差异、语体色彩差异"},
										},
									},
								},
							},
							{
								Name:     "逻辑关系精讲",
								Code:     "luoji_guanxi",
								Duration: "4课时",
								Courses: []CoursePreset{
									{
										Name:     "逻辑关系",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：全同与包含关系", Subtitle: "全同关系、种属关系"},
											{Title: "第2课：交叉与并列关系", Subtitle: "交叉关系、并列关系"},
											{Title: "第3课：因果与条件关系", Subtitle: "因果对应、条件对应"},
											{Title: "第4课：对应关系", Subtitle: "功能对应、材料对应、工具与作用对象"},
										},
									},
								},
							},
							{
								Name:     "语法关系精讲",
								Code:     "yufa_guanxi",
								Duration: "2课时",
								Courses: []CoursePreset{
									{
										Name:     "语法关系",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：主谓关系与动宾关系", Subtitle: "主谓结构、动宾结构"},
											{Title: "第2课：偏正关系与并列关系", Subtitle: "偏正结构、并列结构"},
										},
									},
								},
							},
						},
					},
					{
						Name:              "逻辑判断",
						Code:              "luoji_panduan",
						EstimatedDuration: "30课时",
						Description:       "考查逻辑推理能力",
						Topics: []TopicPreset{
							{
								Name:     "翻译推理精讲",
								Code:     "fanyi_tuili",
								Duration: "8课时",
								Courses: []CoursePreset{
									{
										Name:     "翻译规则",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第1课：如果...那么", Subtitle: "充分条件"},
											{Title: "第2课：只有...才", Subtitle: "必要条件"},
											{Title: "第3课：且/或关系翻译", Subtitle: "联言与选言"},
										},
									},
									{
										Name:     "推理规则",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第4课：逆否等价", Subtitle: "逆否命题"},
											{Title: "第5课：传递推理", Subtitle: "推理链条"},
											{Title: "第6课：德摩根定律", Subtitle: "否定转换"},
										},
									},
									{
										Name:     "综合应用",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第7课：复杂命题翻译", Subtitle: "多条件翻译"},
											{Title: "第8课：多命题推理", Subtitle: "命题组合"},
										},
									},
								},
							},
							{
								Name:     "真假推理精讲",
								Code:     "zhenjia_tuili",
								Duration: "6课时",
								Courses: []CoursePreset{
									{
										Name:     "矛盾与反对关系",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：矛盾命题识别", Subtitle: "矛盾关系"},
											{Title: "第2课：矛盾关系应用", Subtitle: "必有一真一假"},
											{Title: "第3课：上反对", Subtitle: "不能同真"},
											{Title: "第4课：下反对", Subtitle: "不能同假"},
										},
									},
									{
										Name:     "真假推理综合",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第5课：一真一假问题", Subtitle: "真假确定"},
											{Title: "第6课：多真多假问题", Subtitle: "复杂真假"},
										},
									},
								},
							},
							{
								Name:     "分析推理精讲",
								Code:     "fenxi_tuili",
								Duration: "6课时",
								Courses: []CoursePreset{
									{
										Name:     "分析推理方法",
										Duration: "6课时",
										Lessons: []LessonPreset{
											{Title: "第1课：代入排除", Subtitle: "代入验证"},
											{Title: "第2课：条件排除", Subtitle: "条件筛选"},
											{Title: "第3课：最大信息优先", Subtitle: "信息量分析"},
											{Title: "第4课：关联信息推导", Subtitle: "信息关联"},
											{Title: "第5课：假设验证", Subtitle: "假设法"},
											{Title: "第6课：反证法", Subtitle: "反向证明"},
										},
									},
								},
							},
							{
								Name:     "加强削弱精讲",
								Code:     "jiaqiang_xueruo",
								Duration: "10课时",
								Courses: []CoursePreset{
									{
										Name:     "论证结构分析",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第1课：论点识别", Subtitle: "找出结论"},
											{Title: "第2课：论据识别", Subtitle: "找出证据"},
											{Title: "第3课：论证方式识别", Subtitle: "论证结构"},
										},
									},
									{
										Name:     "加强方式",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第4课：加强论点", Subtitle: "补充论据"},
											{Title: "第5课：加强论据", Subtitle: "前提假设"},
											{Title: "第6课：搭桥", Subtitle: "建立联系"},
										},
									},
									{
										Name:     "削弱方式",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第7课：削弱论点", Subtitle: "反驳结论"},
											{Title: "第8课：削弱论据", Subtitle: "质疑证据"},
											{Title: "第9课：切断联系", Subtitle: "否定推理"},
											{Title: "第10课：力度比较", Subtitle: "直接优于间接、必然优于可能"},
										},
									},
								},
							},
						},
					},
				},
			},
			// 模块4：资料分析
			{
				Code:          "ziliao",
				Name:          "资料分析",
				ShortName:     "资料分析",
				Icon:          "BarChart",
				Color:         "from-orange-500 to-amber-600",
				Description:   "考查数据处理与分析能力",
				QuestionCount: 20,
				AvgTime:       25,
				Weight:        20,
				Difficulty:    4,
				Categories: []CategoryPreset{
					{
						Name:              "核心概念",
						Code:              "hexin_gainian",
						EstimatedDuration: "24课时",
						Description:       "资料分析核心概念和公式",
						Topics: []TopicPreset{
							{
								Name:     "增长问题精讲",
								Code:     "zengzhang_wenti",
								Duration: "8课时",
								Courses: []CoursePreset{
									{
										Name:     "基础概念",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：增长量与增长率", Subtitle: "基本定义"},
											{Title: "第2课：现期值与基期值", Subtitle: "时期概念"},
										},
									},
									{
										Name:     "年均增长",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第3课：年均增长量计算", Subtitle: "平均增长量"},
											{Title: "第4课：年均增长率计算", Subtitle: "平均增长率"},
										},
									},
									{
										Name:     "增长率比较",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第5课：增长率大小比较", Subtitle: "比较方法"},
											{Title: "第6课：增长量大小比较", Subtitle: "增量比较"},
										},
									},
									{
										Name:     "隔年增长",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第7课：隔年增长率计算", Subtitle: "跨年增长率"},
											{Title: "第8课：隔年增长量计算", Subtitle: "跨年增长量"},
										},
									},
								},
							},
							{
								Name:     "比重问题精讲",
								Code:     "bizhong_wenti",
								Duration: "8课时",
								Courses: []CoursePreset{
									{
										Name:     "现期比重",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：比重计算", Subtitle: "比重公式"},
											{Title: "第2课：比重比较", Subtitle: "比较技巧"},
										},
									},
									{
										Name:     "基期比重",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第3课：基期比重计算", Subtitle: "基期比重公式"},
											{Title: "第4课：比重变化判断", Subtitle: "升降判断"},
										},
									},
									{
										Name:     "比重变化量",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第5课：比重变化量公式", Subtitle: "变化量计算"},
											{Title: "第6课：变化量计算技巧", Subtitle: "简化计算"},
										},
									},
									{
										Name:     "两期比重比较",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第7课：判断方法", Subtitle: "快速判断"},
											{Title: "第8课：综合应用", Subtitle: "复杂场景"},
										},
									},
								},
							},
							{
								Name:     "倍数问题精讲",
								Code:     "beishu_wenti",
								Duration: "4课时",
								Courses: []CoursePreset{
									{
										Name:     "倍数问题",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：现期倍数", Subtitle: "是几倍与多几倍"},
											{Title: "第2课：基期倍数", Subtitle: "基期倍数公式"},
											{Title: "第3课：倍数变化", Subtitle: "增长到几倍、翻番问题"},
											{Title: "第4课：倍数综合应用", Subtitle: "倍数与增长率结合"},
										},
									},
								},
							},
							{
								Name:     "平均数问题精讲",
								Code:     "pingjunshu_wenti",
								Duration: "4课时",
								Courses: []CoursePreset{
									{
										Name:     "平均数问题",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：现期平均数", Subtitle: "平均数计算与比较"},
											{Title: "第2课：基期平均数", Subtitle: "基期平均数公式"},
											{Title: "第3课：平均数变化率", Subtitle: "变化率公式、正负判断"},
											{Title: "第4课：平均数综合应用", Subtitle: "人均、单位均值计算"},
										},
									},
								},
							},
						},
					},
					{
						Name:              "速算技巧",
						Code:              "susuan_jiqiao",
						EstimatedDuration: "11课时",
						Description:       "资料分析速算技巧",
						Topics: []TopicPreset{
							{
								Name:     "截位直除法",
								Code:     "jiewei_zhichu",
								Duration: "3课时",
								Courses: []CoursePreset{
									{
										Name:     "截位直除",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第1课：截位规则", Subtitle: "两位截位、三位截位"},
											{Title: "第2课：误差控制", Subtitle: "截位方向选择、误差范围判断"},
											{Title: "第3课：直除技巧", Subtitle: "商的首位确定、快速估算"},
										},
									},
								},
							},
							{
								Name:     "特征数字法",
								Code:     "tezheng_shuzi",
								Duration: "3课时",
								Courses: []CoursePreset{
									{
										Name:     "特征数字",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第1课：常用特征数字", Subtitle: "1/2、1/3、1/4、1/5等"},
											{Title: "第2课：特征数字应用", Subtitle: "增长率、比重计算中的应用"},
											{Title: "第3课：误差修正", Subtitle: "放缩法、误差估计"},
										},
									},
								},
							},
							{
								Name:     "有效数字法",
								Code:     "youxiao_shuzi",
								Duration: "3课时",
								Courses: []CoursePreset{
									{
										Name:     "有效数字",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第1课：乘法有效数字", Subtitle: "两位有效数字计算、取舍原则"},
											{Title: "第2课：除法有效数字", Subtitle: "除法估算技巧、快速定位"},
											{Title: "第3课：综合运算", Subtitle: "加减乘除混合"},
										},
									},
								},
							},
							{
								Name:     "同位比较法",
								Code:     "tongwei_bijiao",
								Duration: "2课时",
								Courses: []CoursePreset{
									{
										Name:     "同位比较",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：比较原理", Subtitle: "分数大小比较、同位比较规则"},
											{Title: "第2课：综合应用", Subtitle: "增长率比较、比重比较"},
										},
									},
								},
							},
						},
					},
					{
						Name:              "材料解读",
						Code:              "cailiao_jiedu",
						EstimatedDuration: "9课时",
						Description:       "各类材料阅读技巧",
						Topics: []TopicPreset{
							{
								Name:     "文字材料解读",
								Code:     "wenzi_cailiao",
								Duration: "3课时",
								Courses: []CoursePreset{
									{
										Name:     "文字材料",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第1课：结构分析", Subtitle: "总分结构、并列结构材料"},
											{Title: "第2课：关键信息定位", Subtitle: "数据标记技巧、关键词识别"},
											{Title: "第3课：综合型文字材料", Subtitle: "多段落材料阅读、信息整合"},
										},
									},
								},
							},
							{
								Name:     "表格材料解读",
								Code:     "biaoge_cailiao",
								Duration: "3课时",
								Courses: []CoursePreset{
									{
										Name:     "表格材料",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第1课：表格结构识别", Subtitle: "行列关系、汇总行/列识别"},
											{Title: "第2课：数据定位技巧", Subtitle: "快速查找、多表格对比"},
											{Title: "第3课：表格数据计算", Subtitle: "行列运算、综合计算"},
										},
									},
								},
							},
							{
								Name:     "图形材料解读",
								Code:     "tuxing_cailiao",
								Duration: "3课时",
								Courses: []CoursePreset{
									{
										Name:     "图形材料",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第1课：柱状图/条形图", Subtitle: "数据读取、趋势分析"},
											{Title: "第2课：折线图", Subtitle: "变化趋势、增长率判断"},
											{Title: "第3课：饼图/扇形图", Subtitle: "比重读取、扇形比较"},
										},
									},
								},
							},
						},
					},
				},
			},
			// 模块5：常识判断
			{
				Code:          "changshi",
				Name:          "常识判断",
				ShortName:     "常识判断",
				Icon:          "BookOpen",
				Color:         "from-rose-500 to-pink-600",
				Description:   "考查综合知识与日常积累",
				QuestionCount: 20,
				AvgTime:       10,
				Weight:        15,
				Difficulty:    3,
				Categories: []CategoryPreset{
					{
						Name:              "政治常识",
						Code:              "zhengzhi_changshi",
						EstimatedDuration: "12课时",
						Description:       "政治理论和时政热点",
						Topics: []TopicPreset{
							{
								Name:     "时政热点精讲",
								Code:     "shizheng_redian",
								Duration: "持续更新",
								Courses: []CoursePreset{
									{
										Name:     "时政热点",
										Duration: "持续更新",
										Lessons: []LessonPreset{
											{Title: "每月更新：当月重大时政", Subtitle: "国内重要会议与政策、国际重大事件"},
										},
									},
								},
							},
							{
								Name:     "中国特色社会主义理论精讲",
								Code:     "zhongtese_lilun",
								Duration: "6课时",
								Courses: []CoursePreset{
									{
										Name:     "中国特色社会主义道路",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：道路形成与发展", Subtitle: "历史进程"},
											{Title: "第2课：基本内涵与特征", Subtitle: "核心内容"},
										},
									},
									{
										Name:     "中国特色社会主义理论体系",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第3课：邓小平理论", Subtitle: "理论核心"},
											{Title: "第4课：三个代表重要思想、科学发展观", Subtitle: "理论发展"},
										},
									},
									{
										Name:     "习近平新时代中国特色社会主义思想",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第5课：核心要义与主要内容", Subtitle: "理论精髓"},
											{Title: "第6课：重要论述与实践要求", Subtitle: "实践指导"},
										},
									},
								},
							},
							{
								Name:     "党史党建精讲",
								Code:     "dangshi_dangjian",
								Duration: "6课时",
								Courses: []CoursePreset{
									{
										Name:     "党的发展历程",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：建党到新中国成立", Subtitle: "革命时期"},
											{Title: "第2课：社会主义建设与改革开放", Subtitle: "建设时期"},
										},
									},
									{
										Name:     "重要会议与决议",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第3课：历次党代会主要内容", Subtitle: "党代会梳理"},
											{Title: "第4课：重要历史决议", Subtitle: "历史决议"},
										},
									},
									{
										Name:     "党的建设",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第5课：党的组织建设", Subtitle: "组织建设"},
											{Title: "第6课：党的纪律与反腐倡廉", Subtitle: "纪律建设"},
										},
									},
								},
							},
						},
					},
					{
						Name:              "法律常识",
						Code:              "falv_changshi",
						EstimatedDuration: "18课时",
						Description:       "法律基础知识",
						Topics: []TopicPreset{
							{
								Name:     "宪法精讲",
								Code:     "xianfa_jingjiang",
								Duration: "4课时",
								Courses: []CoursePreset{
									{
										Name:     "宪法",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：宪法基本理论", Subtitle: "宪法地位与作用、宪法修改程序"},
											{Title: "第2课：国家基本制度", Subtitle: "政治制度、经济制度"},
											{Title: "第3课：公民基本权利与义务", Subtitle: "权利种类、义务履行"},
											{Title: "第4课：国家机构", Subtitle: "中央国家机关、地方国家机关"},
										},
									},
								},
							},
							{
								Name:     "民法典精讲",
								Code:     "minfadian_jingjiang",
								Duration: "6课时",
								Courses: []CoursePreset{
									{
										Name:     "民法典",
										Duration: "6课时",
										Lessons: []LessonPreset{
											{Title: "第1课：民法总则", Subtitle: "民事主体、民事行为能力"},
											{Title: "第2课：物权编", Subtitle: "所有权、用益物权、担保物权"},
											{Title: "第3课：合同编", Subtitle: "合同订立与效力、常见合同类型"},
											{Title: "第4课：人格权编", Subtitle: "生命权、名誉权、隐私权"},
											{Title: "第5课：婚姻家庭编", Subtitle: "结婚与离婚、家庭关系"},
											{Title: "第6课：继承编", Subtitle: "法定继承、遗嘱继承"},
										},
									},
								},
							},
							{
								Name:     "刑法精讲",
								Code:     "xingfa_jingjiang",
								Duration: "4课时",
								Courses: []CoursePreset{
									{
										Name:     "刑法",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：刑法基本原则", Subtitle: "罪刑法定、罪责刑相适应"},
											{Title: "第2课：犯罪构成", Subtitle: "犯罪主体、犯罪客体、主观方面、客观方面"},
											{Title: "第3课：刑罚种类", Subtitle: "主刑与附加刑、量刑情节"},
											{Title: "第4课：常见罪名", Subtitle: "侵犯人身权利罪、侵犯财产罪、职务犯罪"},
										},
									},
								},
							},
							{
								Name:     "行政法精讲",
								Code:     "xingzhengfa_jingjiang",
								Duration: "4课时",
								Courses: []CoursePreset{
									{
										Name:     "行政法",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：行政法基本原则", Subtitle: "合法性原则、合理性原则"},
											{Title: "第2课：行政行为", Subtitle: "行政处罚、行政许可、行政强制"},
											{Title: "第3课：行政救济", Subtitle: "行政复议、行政诉讼"},
											{Title: "第4课：国家赔偿", Subtitle: "赔偿范围、赔偿程序"},
										},
									},
								},
							},
						},
					},
					{
						Name:              "其他常识",
						Code:              "qita_changshi",
						EstimatedDuration: "20课时",
						Description:       "经济、历史、地理、科技、文学常识",
						Topics: []TopicPreset{
							{
								Name:     "经济常识课程",
								Code:     "jingji_changshi",
								Duration: "4课时",
								Courses: []CoursePreset{
									{
										Name:     "经济常识",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：宏观经济", Subtitle: "GDP、CPI等指标、财政政策与货币政策"},
											{Title: "第2课：微观经济", Subtitle: "供求关系、市场竞争"},
											{Title: "第3课：国际经济", Subtitle: "国际贸易、汇率与外汇"},
											{Title: "第4课：中国经济", Subtitle: "经济发展战略、经济改革措施"},
										},
									},
								},
							},
							{
								Name:     "历史常识课程",
								Code:     "lishi_changshi",
								Duration: "6课时",
								Courses: []CoursePreset{
									{
										Name:     "中国古代史",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：先秦至南北朝", Subtitle: "古代史上半部"},
											{Title: "第2课：隋唐至明清", Subtitle: "古代史下半部"},
										},
									},
									{
										Name:     "中国近现代史",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第3课：1840-1949年", Subtitle: "近代史"},
											{Title: "第4课：新中国成立后", Subtitle: "现代史"},
										},
									},
									{
										Name:     "世界史",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第5课：古代文明", Subtitle: "世界古代史"},
											{Title: "第6课：近现代世界", Subtitle: "世界近现代史"},
										},
									},
								},
							},
							{
								Name:     "地理常识课程",
								Code:     "dili_changshi",
								Duration: "4课时",
								Courses: []CoursePreset{
									{
										Name:     "地理常识",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：中国地理", Subtitle: "地形地貌、气候分区"},
											{Title: "第2课：世界地理", Subtitle: "主要国家与地区、自然资源分布"},
											{Title: "第3课：人文地理", Subtitle: "人口与城市、交通与经济带"},
											{Title: "第4课：地理热点", Subtitle: "环境问题、自然灾害"},
										},
									},
								},
							},
							{
								Name:     "科技常识课程",
								Code:     "keji_changshi",
								Duration: "4课时",
								Courses: []CoursePreset{
									{
										Name:     "科技常识",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：物理化学常识", Subtitle: "基本物理现象、化学反应与应用"},
											{Title: "第2课：生物医学常识", Subtitle: "人体健康知识、生命科学进展"},
											{Title: "第3课：信息技术常识", Subtitle: "互联网与人工智能、5G、区块链"},
											{Title: "第4课：航天航空常识", Subtitle: "中国航天成就、航空航天基础"},
										},
									},
								},
							},
							{
								Name:     "文学常识课程",
								Code:     "wenxue_changshi",
								Duration: "2课时",
								Courses: []CoursePreset{
									{
										Name:     "文学常识",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：中国文学", Subtitle: "古代文学名著、诗词曲赋精选"},
											{Title: "第2课：外国文学", Subtitle: "世界文学名著、诺贝尔文学奖作品"},
										},
									},
								},
							},
						},
					},
				},
			},
		},
	}
}
