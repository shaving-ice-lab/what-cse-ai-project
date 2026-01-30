package model

// GetGongjiStructure 获取公共基础知识课程预设结构
func GetGongjiStructure() *SubjectStructurePreset {
	return &SubjectStructurePreset{
		Subject:     "gongji",
		Name:        "公共基础知识",
		TotalHours:  80,
		Description: "公共基础知识，适用于事业单位、三支一扶等考试，包含政治理论、法律知识、公文写作、经济管理、人文科技",
		Modules: []ModulePreset{
			// 模块1：政治理论
			{
				Code:        "zhengzhi",
				Name:        "政治理论课程",
				ShortName:   "政治理论",
				Icon:        "Flag",
				Color:       "from-red-500 to-rose-600",
				Description: "马哲、毛概、中特等",
				Difficulty:  3,
				Categories: []CategoryPreset{
					{
						Name:              "政治理论",
						Code:              "zhengzhi_lilun",
						EstimatedDuration: "28课时",
						Description:       "政治理论各专题精讲",
						Topics: []TopicPreset{
							{
								Name:     "马克思主义哲学精讲",
								Code:     "makesi_zhexue",
								Duration: "8课时",
								Courses: []CoursePreset{
									{
										Name:     "唯物论",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：物质与意识", Subtitle: "物质的定义与形态、意识的本质与能动作用、物质与意识的辩证关系"},
											{Title: "第2课：运动与规律", Subtitle: "运动与静止、规律的客观性、主观能动性与客观规律性"},
										},
									},
									{
										Name:     "辩证法",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第3课：联系与发展", Subtitle: "联系的普遍性、客观性、多样性、发展的实质与过程"},
											{Title: "第4课：三大规律", Subtitle: "对立统一规律、质量互变规律、否定之否定规律"},
										},
									},
									{
										Name:     "认识论",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第5课：实践与认识", Subtitle: "实践的本质与形式、认识的来源与过程、实践与认识的辩证关系"},
											{Title: "第6课：真理与价值", Subtitle: "真理的绝对性与相对性、价值观与价值评价、真理与价值的统一"},
										},
									},
									{
										Name:     "唯物史观",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第7课：社会存在与社会意识", Subtitle: "社会存在的构成、社会意识的相对独立性"},
											{Title: "第8课：人民群众与历史发展", Subtitle: "人民群众是历史创造者、个人在历史中的作用"},
										},
									},
								},
							},
							{
								Name:     "毛泽东思想精讲",
								Code:     "maozedong_sixiang",
								Duration: "4课时",
								Courses: []CoursePreset{
									{
										Name:     "毛泽东思想",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：毛泽东思想概述", Subtitle: "形成与发展、科学体系与主要内容、活的灵魂"},
											{Title: "第2课：新民主主义革命理论", Subtitle: "革命总路线、三大法宝、农村包围城市道路"},
											{Title: "第3课：社会主义改造理论", Subtitle: "过渡时期总路线、社会主义改造道路"},
											{Title: "第4课：社会主义建设探索", Subtitle: "正确处理人民内部矛盾、社会主义建设总路线"},
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
										Name:     "邓小平理论",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：理论核心内容", Subtitle: "解放思想、实事求是、社会主义本质、社会主义初级阶段理论"},
											{Title: "第2课：改革开放理论", Subtitle: "改革的性质与目的、对外开放格局"},
										},
									},
									{
										Name:     "三个代表重要思想与科学发展观",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第3课：三个代表重要思想", Subtitle: "核心内容、历史地位"},
											{Title: "第4课：科学发展观", Subtitle: "科学内涵、基本要求"},
										},
									},
									{
										Name:     "习近平新时代中国特色社会主义思想",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第5课：核心要义", Subtitle: "「八个明确」、「十四个坚持」"},
											{Title: "第6课：重要论述专题", Subtitle: "新发展理念、全面深化改革、全面依法治国、生态文明建设"},
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
											{Title: "第1课：新民主主义革命时期（1921-1949）", Subtitle: "建党初期、土地革命、抗日战争、解放战争"},
											{Title: "第2课：社会主义革命和建设时期（1949-1978）", Subtitle: "过渡时期、社会主义建设探索"},
										},
									},
									{
										Name:     "改革开放新时期",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第3课：改革开放历程", Subtitle: "重要会议与决策、发展阶段与成就"},
											{Title: "第4课：新时代党的建设", Subtitle: "全面从严治党、党的建设总要求"},
										},
									},
									{
										Name:     "党的重要会议",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第5课：历次党代会主要内容", Subtitle: "党代会梳理"},
											{Title: "第6课：重要历史决议与文献", Subtitle: "历史决议"},
										},
									},
								},
							},
							{
								Name:     "时政热点专题",
								Code:     "shizheng_redian",
								Duration: "4课时",
								Courses: []CoursePreset{
									{
										Name:     "时政热点",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：国内时政要闻", Subtitle: "重要会议精神、政策法规动态"},
											{Title: "第2课：国际形势与外交", Subtitle: "国际局势变化、中国外交政策"},
											{Title: "第3课：经济社会发展", Subtitle: "经济政策措施、民生保障政策"},
											{Title: "第4课：科技文化教育", Subtitle: "科技创新成就、文化教育发展"},
										},
									},
								},
							},
						},
					},
				},
			},
			// 模块2：法律知识
			{
				Code:        "falv",
				Name:        "法律知识课程",
				ShortName:   "法律知识",
				Icon:        "Scale",
				Color:       "from-blue-500 to-indigo-600",
				Description: "宪法、民法、刑法等",
				Difficulty:  4,
				Categories: []CategoryPreset{
					{
						Name:              "法律知识",
						Code:              "falv_zhishi",
						EstimatedDuration: "34课时",
						Description:       "法律各专题精讲",
						Topics: []TopicPreset{
							{
								Name:     "法理学精讲",
								Code:     "fali_xue",
								Duration: "2课时",
								Courses: []CoursePreset{
									{
										Name:     "法理学",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：法的本质与特征", Subtitle: "法的概念、法的特征、法的作用"},
											{Title: "第2课：法的运行", Subtitle: "法的制定、法的实施、法律关系"},
										},
									},
								},
							},
							{
								Name:     "宪法精讲",
								Code:     "xianfa_jingjiang",
								Duration: "6课时",
								Courses: []CoursePreset{
									{
										Name:     "宪法基本理论",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：宪法概述", Subtitle: "宪法的地位与作用、宪法的发展历程、宪法修改"},
											{Title: "第2课：国家基本制度", Subtitle: "人民民主专政、人民代表大会制度、民族区域自治制度、基层群众自治制度"},
										},
									},
									{
										Name:     "公民权利与义务",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第3课：公民基本权利", Subtitle: "政治权利与自由、人身自由权利、社会经济权利、文化教育权利"},
											{Title: "第4课：公民基本义务", Subtitle: "维护国家统一、遵守宪法法律、依法纳税、服兵役"},
										},
									},
									{
										Name:     "国家机构",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第5课：中央国家机关", Subtitle: "全国人大及常委会、国家主席、国务院、中央军委、监察委员会、最高人民法院、最高人民检察院"},
											{Title: "第6课：地方国家机关", Subtitle: "地方各级人大、地方各级人民政府、地方监察机关、司法机关"},
										},
									},
								},
							},
							{
								Name:     "民法典精讲",
								Code:     "minfadian_jingjiang",
								Duration: "10课时",
								Courses: []CoursePreset{
									{
										Name:     "民法总则",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：民事主体", Subtitle: "自然人、法人、非法人组织"},
											{Title: "第2课：民事行为与代理", Subtitle: "民事法律行为、代理制度、民事责任"},
										},
									},
									{
										Name:     "物权编",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第3课：物权通则与所有权", Subtitle: "物权的种类、所有权取得与消灭、共有"},
											{Title: "第4课：用益物权与担保物权", Subtitle: "土地承包经营权、建设用地使用权、抵押权、质权、留置权"},
										},
									},
									{
										Name:     "合同编",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第5课：合同通则", Subtitle: "合同订立、合同效力、合同履行与违约"},
											{Title: "第6课：典型合同", Subtitle: "买卖合同、租赁合同、借款合同、劳务合同"},
										},
									},
									{
										Name:     "人格权与侵权责任",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第7课：人格权编", Subtitle: "生命权、身体权、健康权、姓名权、肖像权、名誉权、荣誉权、隐私权与个人信息保护"},
											{Title: "第8课：侵权责任编", Subtitle: "侵权责任构成、特殊侵权责任、损害赔偿"},
										},
									},
									{
										Name:     "婚姻家庭与继承",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第9课：婚姻家庭编", Subtitle: "结婚条件与程序、夫妻关系、离婚制度、收养制度"},
											{Title: "第10课：继承编", Subtitle: "法定继承、遗嘱继承与遗赠、遗产处理"},
										},
									},
								},
							},
							{
								Name:     "刑法精讲",
								Code:     "xingfa_jingjiang",
								Duration: "6课时",
								Courses: []CoursePreset{
									{
										Name:     "刑法总则",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：犯罪论", Subtitle: "犯罪构成要件、正当防卫与紧急避险、犯罪形态"},
											{Title: "第2课：刑罚论", Subtitle: "刑罚种类、量刑制度、刑罚执行"},
										},
									},
									{
										Name:     "刑法分则常考罪名",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第3课：侵犯公民人身权利罪", Subtitle: "故意杀人罪、故意伤害罪、强奸罪、猥亵罪、非法拘禁罪"},
											{Title: "第4课：侵犯财产罪", Subtitle: "盗窃罪、抢劫罪、抢夺罪、诈骗罪、敲诈勒索罪、侵占罪、挪用资金罪"},
											{Title: "第5课：贪污贿赂罪", Subtitle: "贪污罪、受贿罪、挪用公款罪、行贿罪"},
											{Title: "第6课：渎职罪与其他常考罪名", Subtitle: "滥用职权罪、玩忽职守罪、危害公共安全罪、妨害社会管理秩序罪"},
										},
									},
								},
							},
							{
								Name:     "行政法精讲",
								Code:     "xingzhengfa_jingjiang",
								Duration: "6课时",
								Courses: []CoursePreset{
									{
										Name:     "行政法基础",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：行政法基本原则", Subtitle: "合法性原则、合理性原则、程序正当原则、诚实信用原则"},
											{Title: "第2课：行政主体与相对人", Subtitle: "行政主体的种类、行政授权与委托、公务员制度"},
										},
									},
									{
										Name:     "行政行为",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第3课：具体行政行为", Subtitle: "行政许可、行政处罚、行政强制、行政征收"},
											{Title: "第4课：行政程序", Subtitle: "行政决定程序、行政听证程序、行政公开制度"},
										},
									},
									{
										Name:     "行政救济",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第5课：行政复议", Subtitle: "复议范围与管辖、复议程序、复议决定"},
											{Title: "第6课：行政诉讼与国家赔偿", Subtitle: "行政诉讼受案范围、行政诉讼程序、国家赔偿制度"},
										},
									},
								},
							},
							{
								Name:     "其他法律精讲",
								Code:     "qita_falv",
								Duration: "4课时",
								Courses: []CoursePreset{
									{
										Name:     "其他法律",
										Duration: "4课时",
										Lessons: []LessonPreset{
											{Title: "第1课：劳动与社会保障法", Subtitle: "劳动合同法、社会保险法"},
											{Title: "第2课：知识产权法", Subtitle: "著作权法、专利法、商标法"},
											{Title: "第3课：经济法", Subtitle: "消费者权益保护法、反不正当竞争法、反垄断法"},
											{Title: "第4课：诉讼法", Subtitle: "民事诉讼法基础、刑事诉讼法基础"},
										},
									},
								},
							},
						},
					},
				},
			},
			// 模块3：公文写作
			{
				Code:        "gongwen",
				Name:        "公文写作课程",
				ShortName:   "公文写作",
				Icon:        "FileEdit",
				Color:       "from-green-500 to-emerald-600",
				Description: "公文格式与写作规范",
				Difficulty:  3,
				Categories: []CategoryPreset{
					{
						Name:              "公文写作",
						Code:              "gongwen_xiezuo",
						EstimatedDuration: "11课时",
						Description:       "公文写作全流程指导",
						Topics: []TopicPreset{
							{
								Name:     "公文格式规范",
								Code:     "gongwen_geshi",
								Duration: "3课时",
								Courses: []CoursePreset{
									{
										Name:     "公文格式规范",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第1课：公文构成要素", Subtitle: "版头（发文机关标志、发文字号等）、主体（标题、主送机关、正文、附件等）、版记（抄送机关、印发日期等）"},
											{Title: "第2课：公文版式规范", Subtitle: "页面设置、字体字号、行距版心"},
											{Title: "第3课：公文格式常见错误", Subtitle: "格式错误类型、格式审核要点"},
										},
									},
								},
							},
							{
								Name:     "常用文种精讲",
								Code:     "changyong_wenzhong",
								Duration: "6课时",
								Courses: []CoursePreset{
									{
										Name:     "常用文种",
										Duration: "6课时",
										Lessons: []LessonPreset{
											{Title: "第1课：决定与决议", Subtitle: "决定的写法、决议的写法"},
											{Title: "第2课：通知与通报", Subtitle: "各类通知写法、各类通报写法"},
											{Title: "第3课：报告与请示", Subtitle: "报告的类型与写法、请示的写法与注意事项"},
											{Title: "第4课：批复与函", Subtitle: "批复的写法、各类函的写法"},
											{Title: "第5课：意见与纪要", Subtitle: "意见的写法、会议纪要的写法"},
											{Title: "第6课：事务性文书", Subtitle: "计划与总结、简报与调查报告、讲话稿与演讲稿"},
										},
									},
								},
							},
							{
								Name:     "公文处理流程",
								Code:     "gongwen_chuli",
								Duration: "2课时",
								Courses: []CoursePreset{
									{
										Name:     "公文处理流程",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：公文办理", Subtitle: "收文办理流程、发文办理流程"},
											{Title: "第2课：公文管理", Subtitle: "公文归档、公文销毁"},
										},
									},
								},
							},
						},
					},
				},
			},
			// 模块4：其他知识
			{
				Code:        "qita",
				Name:        "其他知识课程",
				ShortName:   "其他知识",
				Icon:        "Layers",
				Color:       "from-purple-500 to-violet-600",
				Description: "经济管理、人文历史、科技地理",
				Difficulty:  3,
				Categories: []CategoryPreset{
					{
						Name:              "其他知识",
						Code:              "qita_zhishi",
						EstimatedDuration: "7课时",
						Description:       "其他常考知识点",
						Topics: []TopicPreset{
							{
								Name:     "经济管理课程",
								Code:     "jingji_guanli",
								Duration: "2课时",
								Courses: []CoursePreset{
									{
										Name:     "经济管理",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：宏微观经济学基础", Subtitle: "宏观经济指标、微观经济理论"},
											{Title: "第2课：管理学基础", Subtitle: "管理职能、管理方法"},
										},
									},
								},
							},
							{
								Name:     "人文历史课程",
								Code:     "renwen_lishi",
								Duration: "3课时",
								Courses: []CoursePreset{
									{
										Name:     "人文历史",
										Duration: "3课时",
										Lessons: []LessonPreset{
											{Title: "第1课：中国历史", Subtitle: "古代史重要知识点、近现代史重要事件"},
											{Title: "第2课：文学艺术", Subtitle: "中国古典文学、中外文学名著"},
											{Title: "第3课：传统文化", Subtitle: "传统节日与习俗、文化遗产与非遗"},
										},
									},
								},
							},
							{
								Name:     "科技地理课程",
								Code:     "keji_dili",
								Duration: "2课时",
								Courses: []CoursePreset{
									{
										Name:     "科技地理",
										Duration: "2课时",
										Lessons: []LessonPreset{
											{Title: "第1课：科技常识", Subtitle: "物理化学基础、生物医学常识、信息技术发展"},
											{Title: "第2课：地理常识", Subtitle: "中国地理、世界地理"},
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
