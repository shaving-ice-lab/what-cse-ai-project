package model

// GetMianshiStructure 获取面试课程预设结构
func GetMianshiStructure() *SubjectStructurePreset {
	return &SubjectStructurePreset{
		Subject:     "mianshi",
		Name:        "面试",
		TotalHours:  100,
		Description: "面试考试，包含结构化面试、无领导小组讨论、面试礼仪",
		Modules: []ModulePreset{
			// 模块1：面试导学
			{
				Code:        "daoxue",
				Name:        "面试导学课程",
				ShortName:   "面试导学",
				Icon:        "GraduationCap",
				Color:       "from-blue-500 to-indigo-600",
				Description: "面试备考入门指导",
				Difficulty:  2,
				Categories: []CategoryPreset{
					{
						Name:              "面试入门",
						Code:              "mianshi_rumen",
						EstimatedDuration: "6课时",
						Description:       "面试考试基础认知",
						Topics: []TopicPreset{
							{
								Name:     "面试入门精讲",
								Code:     "rumen_jingjiang",
								Duration: "6课时",
								Courses: []CoursePreset{
									{
										Name:     "面试考试概述",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：公务员面试形式与特点", Subtitle: "结构化面试vs无领导、国考与省考差异、不同部门面试特点"},
											{Title: "第2课：面试评分标准详解", Subtitle: "综合分析、计划组织、人际沟通、应变、语言表达、举止仪表"},
										},
									},
									{
										Name:     "面试备考策略",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第3课：面试备考规划", Subtitle: "备考时间分配、各阶段训练重点、资料准备与使用"},
											{Title: "第4课：面试答题方法论", Subtitle: "审题技巧、答题框架搭建、时间分配原则"},
										},
									},
									{
										Name:     "面试心态调适",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第5课：面试心理准备", Subtitle: "常见心理障碍、紧张情绪克服、自信心建立"},
											{Title: "第6课：面试状态调整", Subtitle: "考前状态调整、考场应对技巧、突发情况处理"},
										},
									},
								},
							},
						},
					},
				},
			},
			// 模块2：综合分析题
			{
				Code:        "zonghefenxi",
				Name:        "综合分析题",
				ShortName:   "综合分析",
				Icon:        "Brain",
				Color:       "from-blue-500 to-indigo-600",
				Description: "社会现象、政策理解等",
				Difficulty:  4,
				Categories: []CategoryPreset{
					{
						Name:              "综合分析题型",
						Code:              "zonghefenxi_tixing",
						EstimatedDuration: "20课时",
						Description:       "综合分析各题型精讲",
						Topics: []TopicPreset{
							{
								Name:     "社会现象类",
								Code:     "shehui_xianxiang",
								Duration: "6课时",
								Courses: []CoursePreset{
									{
										Name:     "社会现象分析框架",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：积极/正面现象分析", Subtitle: "表态+原因/意义+启示/对策、推广可行性分析"},
											{Title: "第2课：消极/负面现象分析", Subtitle: "表态+原因+危害+对策、多主体分析视角"},
										},
									},
									{
										Name:     "社会现象专题",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第3课：社会热点现象", Subtitle: "网络治理/就业问题等"},
											{Title: "第4课：基层治理现象", Subtitle: "形式主义/官僚主义等"},
										},
									},
									{
										Name:     "社会现象实战",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第5课：国考社会现象真题精讲", Subtitle: "国考真题"},
											{Title: "第6课：省考社会现象真题精讲", Subtitle: "省考真题"},
										},
									},
								},
							},
							{
								Name:     "政策理解类",
								Code:     "zhengce_lijie",
								Duration: "5课时",
								Courses: []CoursePreset{
									{
										Name:     "政策分析框架",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：政策出台背景分析", Subtitle: "问题导向、目标导向"},
											{Title: "第2课：政策内容与影响分析", Subtitle: "政策积极意义、潜在问题与挑战、完善建议"},
										},
									},
									{
										Name:     "政策类型专题",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第3课：民生政策分析", Subtitle: "教育/医疗/养老等"},
											{Title: "第4课：治理政策分析", Subtitle: "环保/安全/监管等"},
										},
									},
									{
										Name:     "政策理解真题精讲",
										Duration: "1课时",
										Lessons: []LessonPreset{
											{Title: "第5课：政策理解真题精讲", Subtitle: "真题实战"},
										},
									},
								},
							},
							{
								Name:     "名言警句类",
								Code:     "mingyan_jingju",
								Duration: "4课时",
								Courses: []CoursePreset{
									{
										Name:     "名言警句分析框架",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：名言内涵解读", Subtitle: "关键词分析、引申义阐释"},
											{Title: "第2课：名言启示与实践", Subtitle: "对工作的指导意义、具体实践路径"},
										},
									},
									{
										Name:     "名言警句专题",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第3课：习近平总书记重要讲话", Subtitle: "重要论述"},
											{Title: "第4课：传统文化经典名言", Subtitle: "古典名言"},
										},
									},
								},
							},
							{
								Name:     "哲理故事类",
								Code:     "zheli_gushi",
								Duration: "5课时",
								Courses: []CoursePreset{
									{
										Name:     "哲理故事分析框架",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：故事核心道理提炼", Subtitle: "故事梗概、寓意阐释"},
											{Title: "第2课：道理的多角度阐发", Subtitle: "结合实际工作、结合个人成长"},
										},
									},
									{
										Name:     "哲理故事专题",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第3课：寓言故事类", Subtitle: "经典寓言"},
											{Title: "第4课：历史典故类", Subtitle: "历史故事"},
											{Title: "第5课：哲理故事真题精讲", Subtitle: "真题实战"},
										},
									},
								},
							},
						},
					},
				},
			},
			// 模块3：计划组织题
			{
				Code:        "jihuazuzhi",
				Name:        "计划组织题",
				ShortName:   "计划组织",
				Icon:        "Calendar",
				Color:       "from-green-500 to-emerald-600",
				Description: "活动策划、调研组织等",
				Difficulty:  3,
				Categories: []CategoryPreset{
					{
						Name:              "计划组织题型",
						Code:              "jihuazuzhi_tixing",
						EstimatedDuration: "18课时",
						Description:       "计划组织各题型精讲",
						Topics: []TopicPreset{
							{
								Name:     "调研类",
								Code:     "diaoyan_lei",
								Duration: "5课时",
								Courses: []CoursePreset{
									{
										Name:     "调研活动框架",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：调研前期准备", Subtitle: "调研目的明确、调研内容设计、调研对象选择"},
											{Title: "第2课：调研实施与总结", Subtitle: "调研方式方法、数据收集与分析、调研报告撰写"},
										},
									},
									{
										Name:     "调研专题",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第3课：基层调研", Subtitle: "走访入户/座谈会等"},
											{Title: "第4课：专项调研", Subtitle: "政策落实/问题排查等"},
										},
									},
									{
										Name:     "调研类真题精讲",
										Duration: "1课时",
										Lessons: []LessonPreset{
											{Title: "第5课：调研类真题精讲", Subtitle: "真题实战"},
										},
									},
								},
							},
							{
								Name:     "宣传类",
								Code:     "xuanchuan_lei",
								Duration: "4课时",
								Courses: []CoursePreset{
									{
										Name:     "宣传活动框架",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：宣传活动策划", Subtitle: "宣传目的与主题、宣传对象与渠道、宣传内容与形式"},
											{Title: "第2课：宣传效果保障", Subtitle: "多渠道联动、效果评估与反馈、长效机制建立"},
										},
									},
									{
										Name:     "宣传类真题精讲",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第3课：政策宣传类", Subtitle: "政策宣传"},
											{Title: "第4课：公益宣传类", Subtitle: "公益宣传"},
										},
									},
								},
							},
							{
								Name:     "活动策划类",
								Code:     "huodong_cehua",
								Duration: "5课时",
								Courses: []CoursePreset{
									{
										Name:     "活动策划框架",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：活动策划要素", Subtitle: "活动目的与主题、活动时间与地点、活动对象与规模"},
											{Title: "第2课：活动实施与保障", Subtitle: "活动流程安排、人员分工、物资与经费保障、应急预案"},
										},
									},
									{
										Name:     "活动策划专题",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第3课：培训类活动", Subtitle: "培训组织"},
											{Title: "第4课：比赛/评选类活动", Subtitle: "比赛评选"},
											{Title: "第5课：节日/纪念日活动", Subtitle: "节日纪念"},
										},
									},
								},
							},
							{
								Name:     "会议组织类",
								Code:     "huiyi_zuzhi",
								Duration: "4课时",
								Courses: []CoursePreset{
									{
										Name:     "会议组织框架",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：会前准备", Subtitle: "会议方案制定、参会人员通知、会议材料准备、会场布置"},
											{Title: "第2课：会中与会后", Subtitle: "会议流程把控、会议记录、会议纪要与落实"},
										},
									},
									{
										Name:     "会议类型专题",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第3课：工作会议/总结会", Subtitle: "工作会议"},
											{Title: "第4课：协调会/座谈会", Subtitle: "协调座谈"},
										},
									},
								},
							},
						},
					},
				},
			},
			// 模块4：人际关系题
			{
				Code:        "renji",
				Name:        "人际关系题",
				ShortName:   "人际关系",
				Icon:        "Users",
				Color:       "from-purple-500 to-violet-600",
				Description: "处理人际矛盾与协调",
				Difficulty:  3,
				Categories: []CategoryPreset{
					{
						Name:              "人际关系题型",
						Code:              "renji_tixing",
						EstimatedDuration: "12课时",
						Description:       "人际关系各题型精讲",
						Topics: []TopicPreset{
							{
								Name:     "人际关系精讲",
								Code:     "renji_jingjiang",
								Duration: "12课时",
								Courses: []CoursePreset{
									{
										Name:     "人际关系分析框架",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第1课：人际关系题审题技巧", Subtitle: "人物关系识别、矛盾点定位、题目类型判断"},
											{Title: "第2课：人际关系处理原则", Subtitle: "工作为重、尊重理解、沟通协调、反思改进"},
											{Title: "第3课：人际关系答题框架", Subtitle: "表态+分析+解决+反思"},
										},
									},
									{
										Name:     "人际关系专题",
										Duration: "5课时",
										Lessons: []LessonPreset{
											{Title: "第4课：与领导的关系处理", Subtitle: "领导批评/误解、领导安排冲突、向领导汇报/请示"},
											{Title: "第5课：与同事的关系处理", Subtitle: "同事不配合、同事竞争/冲突、新老同事关系"},
											{Title: "第6课：与下属的关系处理", Subtitle: "下属消极怠工、下属越级汇报、下属矛盾调解"},
											{Title: "第7课：与群众的关系处理", Subtitle: "群众不理解/不配合、群众投诉/上访、群众服务"},
											{Title: "第8课：多重人际关系处理", Subtitle: "复杂人际关系"},
										},
									},
									{
										Name:     "人际关系真题实战",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第9课：国考人际关系真题", Subtitle: "国考真题"},
											{Title: "第10课：省考人际关系真题", Subtitle: "省考真题"},
											{Title: "第11课：特殊情境人际关系", Subtitle: "特殊情境"},
											{Title: "第12课：综合人际关系真题", Subtitle: "综合真题"},
										},
									},
								},
							},
						},
					},
				},
			},
			// 模块5：应急应变题
			{
				Code:        "yingji",
				Name:        "应急应变题",
				ShortName:   "应急应变",
				Icon:        "AlertTriangle",
				Color:       "from-orange-500 to-amber-600",
				Description: "突发情况的处理能力",
				Difficulty:  4,
				Categories: []CategoryPreset{
					{
						Name:              "应急应变题型",
						Code:              "yingji_tixing",
						EstimatedDuration: "12课时",
						Description:       "应急应变各题型精讲",
						Topics: []TopicPreset{
							{
								Name:     "应急应变精讲",
								Code:     "yingji_jingjiang",
								Duration: "12课时",
								Courses: []CoursePreset{
									{
										Name:     "应急应变分析框架",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第1课：应急应变题审题技巧", Subtitle: "紧急情况识别、矛盾主次判断、资源条件分析"},
											{Title: "第2课：应急处理原则", Subtitle: "冷静应对、轻重缓急、灵活变通、善后总结"},
											{Title: "第3课：应急应变答题框架", Subtitle: "稳定情绪+解决问题+善后处理+总结反思"},
										},
									},
									{
										Name:     "应急应变专题",
										Duration: "5课时",
										Lessons: []LessonPreset{
											{Title: "第4课：突发公共事件", Subtitle: "自然灾害、公共卫生事件、社会安全事件"},
											{Title: "第5课：工作突发状况", Subtitle: "工作失误、设备故障、人员缺位"},
											{Title: "第6课：群众矛盾冲突", Subtitle: "群体性事件、个体冲突、舆情应对"},
											{Title: "第7课：活动现场突发", Subtitle: "会议/活动变故、接待/检查突发"},
											{Title: "第8课：媒体舆论应对", Subtitle: "舆情处理"},
										},
									},
									{
										Name:     "应急应变真题实战",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第9课：国考应急应变真题", Subtitle: "国考真题"},
											{Title: "第10课：省考应急应变真题", Subtitle: "省考真题"},
											{Title: "第11课：铁路公安等执法岗位", Subtitle: "执法岗位"},
											{Title: "第12课：综合应急应变真题", Subtitle: "综合真题"},
										},
									},
								},
							},
						},
					},
				},
			},
			// 模块6：其他题型
			{
				Code:        "qita",
				Name:        "其他题型课程",
				ShortName:   "其他题型",
				Icon:        "MoreHorizontal",
				Color:       "from-gray-500 to-slate-600",
				Description: "自我认知、情景模拟等",
				Difficulty:  3,
				Categories: []CategoryPreset{
					{
						Name:              "自我认知与情景模拟",
						Code:              "ziwo_qingjing",
						EstimatedDuration: "8课时",
						Description:       "自我认知与情景模拟题精讲",
						Topics: []TopicPreset{
							{
								Name:     "自我认知题精讲",
								Code:     "ziwo_renzhi",
								Duration: "4课时",
								Courses: []CoursePreset{
									{
										Name:     "自我认知题基础",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：自我认知题类型", Subtitle: "自我介绍、优缺点分析、职业规划、求职动机"},
											{Title: "第2课：自我认知答题技巧", Subtitle: "真实与适度包装、岗位匹配性展示、避免套路化"},
										},
									},
									{
										Name:     "自我认知真题精讲",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第3课：常规自我认知题", Subtitle: "常规题型"},
											{Title: "第4课：创新型自我认知题", Subtitle: "创新题型"},
										},
									},
								},
							},
							{
								Name:     "情景模拟题精讲",
								Code:     "qingjing_moni",
								Duration: "4课时",
								Courses: []CoursePreset{
									{
										Name:     "情景模拟答题方法",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：情景模拟特点与要求", Subtitle: "入情入境、语言转换、身份带入"},
											{Title: "第2课：情景模拟答题技巧", Subtitle: "开场/称呼、内容组织、语气语调"},
										},
									},
									{
										Name:     "情景模拟专题",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第3课：劝说/劝导类情景", Subtitle: "劝说技巧"},
											{Title: "第4课：解释/安抚类情景", Subtitle: "解释安抚"},
										},
									},
								},
							},
						},
					},
				},
			},
			// 模块7：无领导小组讨论
			{
				Code:        "wulingdao",
				Name:        "无领导小组讨论",
				ShortName:   "无领导",
				Icon:        "UsersRound",
				Color:       "from-teal-500 to-cyan-600",
				Description: "无领导小组讨论技巧",
				Difficulty:  4,
				Categories: []CategoryPreset{
					{
						Name:              "无领导小组讨论",
						Code:              "wulingdao_taolun",
						EstimatedDuration: "15课时",
						Description:       "无领导小组讨论全流程技巧",
						Topics: []TopicPreset{
							{
								Name:     "题型分类精讲",
								Code:     "tixing_fenlei",
								Duration: "6课时",
								Courses: []CoursePreset{
									{
										Name:     "开放式问题",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：开放式问题特点与策略", Subtitle: "开放式特点"},
											{Title: "第2课：开放式问题真题演练", Subtitle: "真题演练"},
										},
									},
									{
										Name:     "两难式问题",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第3课：两难式问题分析框架", Subtitle: "两难分析"},
											{Title: "第4课：两难式问题真题演练", Subtitle: "真题演练"},
										},
									},
									{
										Name:     "排序/资源分配问题",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第5课：排序问题分析框架", Subtitle: "排序方法"},
											{Title: "第6课：资源分配问题策略", Subtitle: "资源分配"},
										},
									},
								},
							},
							{
								Name:     "角色策略",
								Code:     "juese_celue",
								Duration: "5课时",
								Courses: []CoursePreset{
									{
										Name:     "无领导角色定位",
										Duration: "1课时",
										Lessons: []LessonPreset{
											{Title: "第1课：无领导角色定位", Subtitle: "领导者/组织者、时间管理者、记录者、参与者"},
										},
									},
									{
										Name:     "各角色策略",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第2课：领导者角色策略", Subtitle: "领导者技巧"},
											{Title: "第3课：其他角色策略", Subtitle: "其他角色"},
										},
									},
									{
										Name:     "角色选择与转换",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第4课：角色选择原则", Subtitle: "选择技巧"},
											{Title: "第5课：角色转换技巧", Subtitle: "转换技巧"},
										},
									},
								},
							},
							{
								Name:     "讨论技巧",
								Code:     "taolun_jiqiao",
								Duration: "4课时",
								Courses: []CoursePreset{
									{
										Name:     "讨论技巧",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：发言技巧", Subtitle: "首发言策略、插话技巧、总结发言"},
											{Title: "第2课：倾听与回应", Subtitle: "积极倾听、有效回应、求同存异"},
											{Title: "第3课：冲突处理", Subtitle: "意见分歧处理、气氛调节、推动共识"},
											{Title: "第4课：无领导实战演练", Subtitle: "实战演练"},
										},
									},
								},
							},
						},
					},
				},
			},
		// 模块8：面试礼仪
		{
			Code:        "liyi_module",
			Name:        "面试礼仪课程",
				ShortName:   "面试礼仪",
				Icon:        "Smile",
				Color:       "from-rose-500 to-pink-600",
				Description: "面试仪表与言谈举止",
				Difficulty:  2,
				Categories: []CategoryPreset{
					{
						Name:              "面试礼仪",
						Code:              "mianshi_liyi",
						EstimatedDuration: "9课时",
						Description:       "面试礼仪全流程指导",
						Topics: []TopicPreset{
							{
								Name:     "着装礼仪",
								Code:     "zhuozhuang_liyi",
								Duration: "2课时",
								Courses: []CoursePreset{
									{
										Name:     "着装礼仪",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：面试着装原则", Subtitle: "男士着装规范、女士着装规范、配饰与发型"},
											{Title: "第2课：着装误区与建议", Subtitle: "常见着装误区、不同季节着装、特殊岗位着装"},
										},
									},
								},
							},
							{
								Name:     "仪态举止",
								Code:     "yitai_juzhi",
								Duration: "3课时",
								Courses: []CoursePreset{
									{
										Name:     "仪态举止",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第1课：站姿与坐姿", Subtitle: "标准站姿训练、标准坐姿训练、走姿训练"},
											{Title: "第2课：表情与眼神", Subtitle: "微笑训练、眼神交流、面部表情管理"},
											{Title: "第3课：手势与动作", Subtitle: "恰当手势、避免小动作、整体协调"},
										},
									},
								},
							},
							{
								Name:     "语言表达",
								Code:     "yuyan_biaoda",
								Duration: "2课时",
								Courses: []CoursePreset{
									{
										Name:     "语言表达",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：语言表达技巧", Subtitle: "语速与语调、停顿与重音、逻辑与条理"},
											{Title: "第2课：语言表达训练", Subtitle: "口语化表达、避免口头禅、流畅度提升"},
										},
									},
								},
							},
							{
								Name:     "心理调适",
								Code:     "xinli_tiaoshi",
								Duration: "2课时",
								Courses: []CoursePreset{
									{
										Name:     "心理调适",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：考前心理准备", Subtitle: "自信心建立、紧张情绪缓解、积极心理暗示"},
											{Title: "第2课：考场心理调适", Subtitle: "入场前调整、答题中调整、突发情况应对"},
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
