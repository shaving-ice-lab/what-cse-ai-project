package prompts

// ChapterSummaryPrompt 章节总结提示词模板
const ChapterSummaryPrompt = `你是一位公考课程设计专家。请根据以下章节信息生成学习总结。

## 章节信息
- 章节标题：{{chapter_title}}
- 所属课程：{{course_name}}
- 章节描述：{{description}}
- 章节内容概要：{{content_summary}}
- 包含知识点：{{knowledge_points}}

## 输出要求
请按以下JSON格式输出章节总结：

{
  "summary": "本章节主要内容总结（100-200字）",
  "main_points": [
    "重点1：...",
    "重点2：...",
    "重点3：..."
  ],
  "key_points": [
    "核心考点1",
    "核心考点2",
    "核心考点3"
  ],
  "review_points": [
    "复习要点1",
    "复习要点2",
    "复习要点3"
  ],
  "common_mistakes": [
    "易错点1",
    "易错点2"
  ],
  "learning_objectives": [
    "学完本章后，你应该能够...",
    "掌握...",
    "理解..."
  ],
  "estimated_time": 60
}

## 注意事项
1. 总结要抓住核心，突出重点
2. 考点要结合公考实际
3. 复习要点要具体可操作
4. 易错点要有针对性

请输出JSON：`

// ChapterKeypointsPrompt 章节重点提示词模板
const ChapterKeypointsPrompt = `你是一位公考教学专家。请根据以下章节信息提炼学习重点。

## 章节信息
- 章节标题：{{chapter_title}}
- 所属课程：{{course_name}}
- 章节内容：{{content}}
- 知识点列表：{{knowledge_points}}

## 输出要求
请按以下JSON格式输出章节重点：

{
  "summary": "本章节核心知识点和重难点梳理",
  "key_points": [
    "【重点一】核心概念理解：掌握基本定义和原理",
    "【重点二】公式运用：熟练应用核心公式解题",
    "【重点三】题型归纳：识别常见题型及解法",
    "【重点四】易错点：注意常见陷阱和易混淆概念"
  ],
  "main_points": [
    "概念定义要准确",
    "公式推导要熟练",
    "解题步骤要规范",
    "答案检验不能少"
  ],
  "tips": [
    "建议学习时间：60-90分钟",
    "配合例题练习效果更佳",
    "重点内容建议做笔记"
  ],
  "formulas": [
    "公式1：...",
    "公式2：..."
  ],
  "concepts": [
    "概念1：定义...",
    "概念2：定义..."
  ],
  "estimated_time": 60
}

## 注意事项
1. 重点要突出，不要面面俱到
2. 配合公式和概念的总结
3. 提供学习建议和时间参考
4. 突出考试高频考点

请输出JSON：`

// CoursePreviewPrompt 课程预习要点提示词模板
const CoursePreviewPrompt = `你是一位学习指导专家。请根据以下课程信息生成预习要点。

## 课程信息
- 课程标题：{{course_title}}
- 课程描述：{{description}}
- 章节列表：{{chapters}}
- 前置知识：{{prerequisites}}

## 输出要求
请按以下JSON格式输出预习要点：

{
  "preview_points": [
    "预习要点1：了解基本概念",
    "预习要点2：回顾相关知识",
    "预习要点3：准备学习材料"
  ],
  "prior_knowledge": [
    "需要掌握的前置知识1",
    "需要掌握的前置知识2"
  ],
  "questions_to_think": [
    "思考问题1：...",
    "思考问题2：..."
  ],
  "materials_needed": [
    "准备材料1",
    "准备材料2"
  ],
  "learning_goals": [
    "本课学习目标1",
    "本课学习目标2"
  ],
  "estimated_time": 30
}

## 注意事项
1. 预习要点要具体可操作
2. 前置知识帮助学生做好准备
3. 思考问题激发学习兴趣
4. 预计时间合理，不要太长

请输出JSON：`

// CourseReviewPrompt 课程复习要点提示词模板
const CourseReviewPrompt = `你是一位学习复习指导专家。请根据以下课程信息生成复习要点。

## 课程信息
- 课程标题：{{course_title}}
- 课程描述：{{description}}
- 章节列表：{{chapters}}
- 重要知识点：{{key_points}}

## 输出要求
请按以下JSON格式输出复习要点：

{
  "review_points": [
    "复习要点1：巩固核心概念",
    "复习要点2：做配套练习",
    "复习要点3：总结易错点"
  ],
  "knowledge_checklist": [
    "知识点1 - 需要掌握的程度",
    "知识点2 - 需要掌握的程度"
  ],
  "practice_suggestions": [
    "练习建议1：...",
    "练习建议2：..."
  ],
  "review_schedule": [
    "第1天：初次复习重点内容",
    "第3天：再次复习，做练习题",
    "第7天：巩固复习，查漏补缺"
  ],
  "common_mistakes": [
    "易错点1",
    "易错点2"
  ],
  "estimated_time": 45
}

## 注意事项
1. 复习要点覆盖课程核心内容
2. 提供知识点检查清单
3. 结合艾宾浩斯遗忘曲线安排复习
4. 指出常见易错点和需要强化的内容

请输出JSON：`

// GetChapterSummaryPrompt 获取章节总结提示词
func GetChapterSummaryPrompt() string {
	return ChapterSummaryPrompt
}

// GetChapterKeypointsPrompt 获取章节重点提示词
func GetChapterKeypointsPrompt() string {
	return ChapterKeypointsPrompt
}

// GetCoursePreviewPrompt 获取课程预习提示词
func GetCoursePreviewPrompt() string {
	return CoursePreviewPrompt
}

// GetCourseReviewPrompt 获取课程复习提示词
func GetCourseReviewPrompt() string {
	return CourseReviewPrompt
}
