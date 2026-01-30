package model

// GetShenlunStructure 获取申论课程预设结构
func GetShenlunStructure() *SubjectStructurePreset {
	return &SubjectStructurePreset{
		Subject:     "shenlun",
		Name:        "申论",
		TotalHours:  120,
		Description: "申论考试，包含五大题型：归纳概括、提出对策、综合分析、贯彻执行、文章写作",
		Modules: []ModulePreset{
			// 模块1：申论导学
			{
				Code:        "daoxue",
				Name:        "申论导学课程",
				ShortName:   "申论导学",
				Icon:        "GraduationCap",
				Color:       "from-blue-500 to-indigo-600",
				Description: "申论备考入门指导",
				Difficulty:  2,
				Categories: []CategoryPreset{
					{
						Name:              "申论入门",
						Code:              "shenlun_rumen",
						EstimatedDuration: "6课时",
						Description:       "申论考试基础认知",
						Topics: []TopicPreset{
							{
								Name:     "申论入门精讲",
								Code:     "rumen_jingjiang",
								Duration: "6课时",
								Courses: []CoursePreset{
									{
										Name:     "申论考试概述",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：申论考试性质与特点", Subtitle: "申论与行测的区别、国考与省考申论差异、评分标准详解"},
											{Title: "第2课：申论备考规划", Subtitle: "备考阶段划分、各阶段学习重点、时间分配建议"},
										},
									},
									{
										Name:     "申论作答方法论",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第3课：材料阅读方法", Subtitle: "精读与略读技巧、关键信息标注法、段落层次划分"},
											{Title: "第4课：答案要点提炼", Subtitle: "关键词识别、要点合并同类项、逻辑框架搭建"},
										},
									},
									{
										Name:     "申论材料类型解读",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第5课：案例型材料解读", Subtitle: "正面案例提取经验、反面案例分析教训、对比案例辩证分析"},
											{Title: "第6课：观点型/数据型材料解读", Subtitle: "观点归纳与提炼、数据材料分析技巧、混合材料整合"},
										},
									},
								},
							},
						},
					},
				},
			},
			// 模块2：归纳概括
			{
				Code:        "guina",
				Name:        "归纳概括课程",
				ShortName:   "归纳概括",
				Icon:        "FileText",
				Color:       "from-blue-500 to-indigo-600",
				Description: "提炼核心信息的能力",
				Difficulty:  3,
				Categories: []CategoryPreset{
					{
						Name:              "归纳概括方法",
						Code:              "guina_fangfa",
						EstimatedDuration: "18课时",
						Description:       "归纳概括题型方法精讲",
						Topics: []TopicPreset{
							{
								Name:     "归纳概括方法精讲",
								Code:     "guina_fangfa_jingjiang",
								Duration: "10课时",
								Courses: []CoursePreset{
									{
										Name:     "归纳概括基础方法",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第1课：题干审题技巧", Subtitle: "作答对象识别、作答范围判定、字数与格式要求"},
											{Title: "第2课：要点提取方法", Subtitle: "直接摘抄法、概括归纳法、推理引申法"},
											{Title: "第3课：答案加工技巧", Subtitle: "分类整理、合并同类项、逻辑排序"},
										},
									},
									{
										Name:     "归纳概括题型分类",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第4课：概括问题类", Subtitle: "问题的表现形式、问题的层次划分、典型真题精讲"},
											{Title: "第5课：概括原因类", Subtitle: "原因的多角度分析、因果关系链条梳理、典型真题精讲"},
											{Title: "第6课：概括影响/意义类", Subtitle: "积极与消极影响、短期与长期影响、不同主体影响"},
											{Title: "第7课：概括做法/经验类", Subtitle: "成功经验提炼、可复制性分析、典型真题精讲"},
										},
									},
									{
										Name:     "归纳概括进阶",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第8课：概括特点/特征类", Subtitle: "特点的提炼角度、特点的表述方式"},
											{Title: "第9课：概括变化/趋势类", Subtitle: "时间线梳理、变化对比分析"},
											{Title: "第10课：概括争议/观点类", Subtitle: "不同观点梳理、争议焦点概括"},
										},
									},
								},
							},
							{
								Name:     "归纳概括题型实战",
								Code:     "guina_shizhan",
								Duration: "8课时",
								Courses: []CoursePreset{
									{
										Name:     "国考真题实战",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：国考地市级归纳概括真题", Subtitle: "地市级真题精讲"},
											{Title: "第2课：国考省部级归纳概括真题", Subtitle: "省部级真题精讲"},
											{Title: "第3课：难点题目深度解析", Subtitle: "高难度题目分析"},
											{Title: "第4课：高分答案对比分析", Subtitle: "优秀答案赏析"},
										},
									},
									{
										Name:     "省考真题实战",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第5课：联考归纳概括真题", Subtitle: "联考真题精讲"},
											{Title: "第6课：各省特色题型解析", Subtitle: "地方特色题型"},
											{Title: "第7课：易错点总结", Subtitle: "常见错误分析"},
											{Title: "第8课：模拟演练与点评", Subtitle: "实战模拟"},
										},
									},
								},
							},
						},
					},
				},
			},
			// 模块3：提出对策
			{
				Code:        "duice",
				Name:        "提出对策课程",
				ShortName:   "提出对策",
				Icon:        "Lightbulb",
				Color:       "from-green-500 to-emerald-600",
				Description: "解决实际问题的能力",
				Difficulty:  4,
				Categories: []CategoryPreset{
					{
						Name:              "提出对策方法",
						Code:              "duice_fangfa",
						EstimatedDuration: "16课时",
						Description:       "对策类题型方法精讲",
						Topics: []TopicPreset{
							{
								Name:     "对策来源分析",
								Code:     "duice_laiyuan",
								Duration: "8课时",
								Courses: []CoursePreset{
									{
										Name:     "直接对策来源",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：材料直接对策", Subtitle: "已采取的措施、专家学者建议、群众呼声与期盼"},
											{Title: "第2课：问题推导对策", Subtitle: "针对问题表现/原因提对策、问题-对策对应关系"},
											{Title: "第3课：经验借鉴对策", Subtitle: "成功案例经验提炼、国内外先进经验借鉴"},
											{Title: "第4课：教训反推对策", Subtitle: "失败教训分析、反向思维提对策"},
										},
									},
									{
										Name:     "对策完善与优化",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第5课：对策的可行性分析", Subtitle: "经济、技术、政策可行性、社会接受度"},
											{Title: "第6课：对策的针对性检验", Subtitle: "对策与问题的对应、避免答非所问"},
											{Title: "第7课：对策的可操作性提升", Subtitle: "主体明确、措施具体、方式方法清晰"},
											{Title: "第8课：对策表述规范", Subtitle: "条目化表述、概括+具体展开、字数把控"},
										},
									},
								},
							},
							{
								Name:     "对策维度框架",
								Code:     "duice_weidu",
								Duration: "8课时",
								Courses: []CoursePreset{
									{
										Name:     "常用对策维度",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：主体维度", Subtitle: "政府层面、社会层面、个人层面"},
											{Title: "第2课：要素维度", Subtitle: "人（人才）、财（资金）、物（设施）、技术"},
											{Title: "第3课：环节维度", Subtitle: "事前（预防）、事中（监管）、事后（评估）"},
											{Title: "第4课：手段维度", Subtitle: "法律手段、行政手段、经济手段、教育手段"},
										},
									},
									{
										Name:     "对策框架综合应用",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第5课：单一主体对策框架", Subtitle: "单一主体对策结构"},
											{Title: "第6课：多主体协同对策框架", Subtitle: "多方协作"},
											{Title: "第7课：系统性对策框架", Subtitle: "系统思维"},
											{Title: "第8课：真题对策框架分析", Subtitle: "真题框架分析"},
										},
									},
								},
							},
						},
					},
				},
			},
			// 模块4：综合分析
			{
				Code:        "fenxi",
				Name:        "综合分析课程",
				ShortName:   "综合分析",
				Icon:        "Search",
				Color:       "from-purple-500 to-violet-600",
				Description: "深度分析问题的能力",
				Difficulty:  5,
				Categories: []CategoryPreset{
					{
						Name:              "综合分析题型",
						Code:              "fenxi_tixing",
						EstimatedDuration: "18课时",
						Description:       "综合分析各题型精讲",
						Topics: []TopicPreset{
							{
								Name:     "词句理解分析",
								Code:     "ciju_lijie",
								Duration: "5课时",
								Courses: []CoursePreset{
									{
										Name:     "词句理解分析",
										Duration: "5课时",
										Lessons: []LessonPreset{
											{Title: "第1课：词语理解题解题思路", Subtitle: "词语的字面含义、语境含义、深层含义"},
											{Title: "第2课：句子理解题解题思路", Subtitle: "句子的表层含义、深层含义、引申含义"},
											{Title: "第3课：答案结构组织", Subtitle: "含义+分析+总结/对策、要点层次安排"},
											{Title: "第4课：国考词句理解真题精讲", Subtitle: "国考真题精讲"},
											{Title: "第5课：省考词句理解真题精讲", Subtitle: "省考真题精讲"},
										},
									},
								},
							},
							{
								Name:     "观点评价分析",
								Code:     "guandian_pingjia",
								Duration: "5课时",
								Courses: []CoursePreset{
									{
										Name:     "观点评价分析",
										Duration: "5课时",
										Lessons: []LessonPreset{
											{Title: "第6课：观点评价题解题思路", Subtitle: "观点识别与概括、多角度评价、评价依据"},
											{Title: "第7课：单一观点评价", Subtitle: "完全正确型观点、完全错误型观点"},
											{Title: "第8课：辩证观点评价", Subtitle: "既对又错型观点、各有道理型观点"},
											{Title: "第9课：多观点比较分析", Subtitle: "观点异同分析、综合评价与建议"},
											{Title: "第10课：观点评价真题精讲", Subtitle: "真题精讲"},
										},
									},
								},
							},
							{
								Name:     "原因/影响分析",
								Code:     "yuanyin_yingxiang",
								Duration: "4课时",
								Courses: []CoursePreset{
									{
										Name:     "原因/影响分析",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第11课：原因分析题解题思路", Subtitle: "直接与根本原因、主观与客观原因"},
											{Title: "第12课：影响分析题解题思路", Subtitle: "积极与消极影响、直接与间接影响"},
											{Title: "第13课：原因分析真题精讲", Subtitle: "原因分析真题"},
											{Title: "第14课：影响分析真题精讲", Subtitle: "影响分析真题"},
										},
									},
								},
							},
							{
								Name:     "比较分析与启示分析",
								Code:     "bijiao_qishi",
								Duration: "4课时",
								Courses: []CoursePreset{
									{
										Name:     "比较分析与启示分析",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第15课：比较分析题解题思路", Subtitle: "异同点比较框架、比较维度选择"},
											{Title: "第16课：启示分析题解题思路", Subtitle: "启示的来源、启示的转化"},
											{Title: "第17课：比较分析真题精讲", Subtitle: "比较分析真题"},
											{Title: "第18课：启示分析真题精讲", Subtitle: "启示分析真题"},
										},
									},
								},
							},
						},
					},
				},
			},
			// 模块5：贯彻执行
			{
				Code:        "guanche",
				Name:        "贯彻执行课程",
				ShortName:   "贯彻执行",
				Icon:        "FileCheck",
				Color:       "from-orange-500 to-amber-600",
				Description: "公文写作与执行能力",
				Difficulty:  4,
				Categories: []CategoryPreset{
					{
						Name:              "公文格式规范",
						Code:              "gongwen_geshi",
						EstimatedDuration: "6课时",
						Description:       "公文格式基础",
						Topics: []TopicPreset{
							{
								Name:     "公文格式精讲",
								Code:     "geshi_jingjiang",
								Duration: "6课时",
								Courses: []CoursePreset{
									{
										Name:     "公文基础格式",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第1课：标题写法", Subtitle: "完整式标题、省略式标题、新闻类标题"},
											{Title: "第2课：称谓与落款", Subtitle: "主送机关写法、抄送机关写法、发文日期格式"},
											{Title: "第3课：正文结构", Subtitle: "开头（背景目的）、主体（核心内容）、结尾（号召呼吁）"},
										},
									},
									{
										Name:     "各类公文格式对比",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第4课：上行文格式要求", Subtitle: "请示、报告"},
											{Title: "第5课：下行文格式要求", Subtitle: "通知、批复、意见"},
											{Title: "第6课：平行文格式要求", Subtitle: "函、议案"},
										},
									},
								},
							},
						},
					},
					{
						Name:              "各类公文写作",
						Code:              "gongwen_xiezuo",
						EstimatedDuration: "26课时",
						Description:       "各类公文写作方法",
						Topics: []TopicPreset{
							{
								Name:     "讲话稿类",
								Code:     "jianghuagao",
								Duration: "4课时",
								Courses: []CoursePreset{
									{
										Name:     "讲话稿",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：讲话稿基本结构", Subtitle: "开场白、正文、结尾"},
											{Title: "第2课：不同场合讲话稿", Subtitle: "会议讲话稿、活动致辞、动员讲话"},
											{Title: "第3课：讲话稿语言风格", Subtitle: "口语化表达、感染力与号召力"},
											{Title: "第4课：讲话稿真题精讲", Subtitle: "真题实战"},
										},
									},
								},
							},
							{
								Name:     "宣传倡议类",
								Code:     "xuanchuan_changyi",
								Duration: "4课时",
								Courses: []CoursePreset{
									{
										Name:     "宣传倡议类",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：宣传材料写作", Subtitle: "宣传手册/海报、宣传标语/口号"},
											{Title: "第2课：倡议书写作", Subtitle: "倡议书格式与结构、倡议内容组织"},
											{Title: "第3课：公开信写作", Subtitle: "公开信特点、情感表达技巧"},
											{Title: "第4课：宣传倡议类真题精讲", Subtitle: "真题实战"},
										},
									},
								},
							},
							{
								Name:     "报告总结类",
								Code:     "baogao_zongjie",
								Duration: "5课时",
								Courses: []CoursePreset{
									{
										Name:     "报告总结类",
										Duration: "5课时",
										Lessons: []LessonPreset{
											{Title: "第1课：工作报告写作", Subtitle: "工作报告结构、成绩与问题并述"},
											{Title: "第2课：调研报告写作", Subtitle: "调研背景与目的、调研发现与分析"},
											{Title: "第3课：工作总结写作", Subtitle: "总结结构、经验提炼、问题剖析"},
											{Title: "第4课：情况汇报写作", Subtitle: "汇报结构、重点突出、简明扼要"},
											{Title: "第5课：报告总结类真题精讲", Subtitle: "真题实战"},
										},
									},
								},
							},
							{
								Name:     "方案计划类",
								Code:     "fangan_jihua",
								Duration: "5课时",
								Courses: []CoursePreset{
									{
										Name:     "方案计划类",
										Duration: "5课时",
										Lessons: []LessonPreset{
											{Title: "第1课：工作方案写作", Subtitle: "方案结构（目标+措施+保障）"},
											{Title: "第2课：活动方案写作", Subtitle: "活动目的与主题、活动内容与流程"},
											{Title: "第3课：整改方案写作", Subtitle: "问题分析、整改措施、整改时限"},
											{Title: "第4课：计划/规划写作", Subtitle: "年度计划/工作计划、发展规划"},
											{Title: "第5课：方案计划类真题精讲", Subtitle: "真题实战"},
										},
									},
								},
							},
							{
								Name:     "新闻传媒类",
								Code:     "xinwen_chuanmei",
								Duration: "4课时",
								Courses: []CoursePreset{
									{
										Name:     "新闻传媒类",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：新闻稿写作", Subtitle: "新闻六要素、倒金字塔结构"},
											{Title: "第2课：简报写作", Subtitle: "简报结构与格式、简报内容选择"},
											{Title: "第3课：导言/编者按写作", Subtitle: "导言结构与功能、编者按写作技巧"},
											{Title: "第4课：新闻传媒类真题精讲", Subtitle: "真题实战"},
										},
									},
								},
							},
							{
								Name:     "其他文书",
								Code:     "qita_wenshu",
								Duration: "4课时",
								Courses: []CoursePreset{
									{
										Name:     "其他文书",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：提纲/要点写作", Subtitle: "发言提纲、汇报要点、工作要点"},
											{Title: "第2课：短评/短文写作", Subtitle: "短评结构、观点鲜明、论证有力"},
											{Title: "第3课：建议/意见写作", Subtitle: "建议书格式、意见的表述"},
											{Title: "第4课：其他文书真题精讲", Subtitle: "真题实战"},
										},
									},
								},
							},
						},
					},
				},
			},
			// 模块6：文章写作
			{
				Code:        "xiezuo",
				Name:        "文章写作课程",
				ShortName:   "文章写作",
				Icon:        "PenTool",
				Color:       "from-rose-500 to-pink-600",
				Description: "议论文写作能力",
				Difficulty:  5,
				Categories: []CategoryPreset{
					{
						Name:              "文章写作技巧",
						Code:              "xiezuo_jiqiao",
						EstimatedDuration: "30课时",
						Description:       "大作文写作全流程技巧",
						Topics: []TopicPreset{
							{
								Name:     "立意技巧",
								Code:     "liyi_jiqiao",
								Duration: "6课时",
								Courses: []CoursePreset{
									{
										Name:     "审题立意基础",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：题干分析法", Subtitle: "关键词识别、题目类型判断、立意范围确定"},
											{Title: "第2课：材料分析法", Subtitle: "核心材料识别、主旨提炼、立意角度选择"},
										},
									},
									{
										Name:     "立意提升技巧",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第3课：立意的高度提升", Subtitle: "从个别到一般、从现象到本质"},
											{Title: "第4课：立意的角度创新", Subtitle: "多角度思考、逆向思维、辩证思维"},
										},
									},
									{
										Name:     "立意常见误区",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第5课：偏题跑题分析", Subtitle: "偏离核心话题、立意过大或过小"},
											{Title: "第6课：优秀立意案例分析", Subtitle: "高分立意赏析"},
										},
									},
								},
							},
							{
								Name:     "标题拟定",
								Code:     "biaoti_niding",
								Duration: "3课时",
								Courses: []CoursePreset{
									{
										Name:     "标题拟定",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第1课：标题拟定原则", Subtitle: "准确体现立意、简洁有力、富有文采"},
											{Title: "第2课：常用标题格式", Subtitle: "对仗式、比喻式、引用式、设问式标题"},
											{Title: "第3课：优秀标题案例赏析", Subtitle: "国考省考高分标题"},
										},
									},
								},
							},
							{
								Name:     "开头写法",
								Code:     "kaitou_xiefa",
								Duration: "5课时",
								Courses: []CoursePreset{
									{
										Name:     "常用开头方式",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：开门见山式", Subtitle: "直接亮明观点、简洁明了"},
											{Title: "第2课：引用名言式", Subtitle: "名言选择原则、名言引用技巧"},
										},
									},
									{
										Name:     "进阶开头方式",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第3课：案例引入式", Subtitle: "案例选择、案例概述、案例分析引出观点"},
											{Title: "第4课：背景分析式", Subtitle: "时代背景、政策背景、社会背景"},
										},
									},
									{
										Name:     "开头写作实战",
										Duration: "1课时",
										Lessons: []LessonPreset{
											{Title: "第5课：开头写作实战", Subtitle: "开头模板练习、开头修改优化"},
										},
									},
								},
							},
							{
								Name:     "分论点论证",
								Code:     "fenlundian_lunzheng",
								Duration: "8课时",
								Courses: []CoursePreset{
									{
										Name:     "分论点设置",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：分论点数量与结构", Subtitle: "2-4个分论点、并列式/递进式/对比式"},
											{Title: "第2课：分论点表述技巧", Subtitle: "分论点的统一性、差异性、概括性"},
										},
									},
									{
										Name:     "论证方法",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第3课：举例论证", Subtitle: "案例选择原则、案例叙述技巧"},
											{Title: "第4课：道理论证", Subtitle: "引用名言警句、理论分析、因果分析"},
											{Title: "第5课：对比论证", Subtitle: "正反对比、古今对比、中外对比"},
										},
									},
									{
										Name:     "论证段落写作",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第6课：段落结构组织", Subtitle: "分论点句+阐释句+论据句+分析句+总结句"},
											{Title: "第7课：论证段落衔接", Subtitle: "段落间过渡、逻辑连贯性"},
											{Title: "第8课：分论点论证实战练习", Subtitle: "实战演练"},
										},
									},
								},
							},
							{
								Name:     "结尾写法",
								Code:     "jiewei_xiefa",
								Duration: "3课时",
								Courses: []CoursePreset{
									{
										Name:     "结尾写法",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第1课：常用结尾方式", Subtitle: "总结全文式、号召呼吁式、展望未来式"},
											{Title: "第2课：进阶结尾方式", Subtitle: "引用名言式、设问反问式、照应开头式"},
											{Title: "第3课：结尾写作实战", Subtitle: "结尾模板练习、真题结尾赏析"},
										},
									},
								},
							},
							{
								Name:     "高分范文赏析",
								Code:     "gaofin_fanwen",
								Duration: "5课时",
								Courses: []CoursePreset{
									{
										Name:     "国考高分范文",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：省部级高分范文赏析", Subtitle: "省部级范文"},
											{Title: "第2课：地市级高分范文赏析", Subtitle: "地市级范文"},
										},
									},
									{
										Name:     "省考高分范文",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第3课：联考高分范文赏析", Subtitle: "联考范文"},
											{Title: "第4课：各省特色范文赏析", Subtitle: "各省范文"},
										},
									},
									{
										Name:     "范文写作技巧总结",
										Duration: "1课时",
										Lessons: []LessonPreset{
											{Title: "第5课：范文写作技巧总结", Subtitle: "高分作文共性分析、得分点与失分点"},
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
