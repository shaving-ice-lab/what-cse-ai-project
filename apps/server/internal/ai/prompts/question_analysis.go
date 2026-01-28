package prompts

// QuestionAnalysisPrompt 题目深度解析提示词模板
const QuestionAnalysisPrompt = `你是一位资深的公务员考试培训专家，拥有10年以上的行测、申论教学经验。请根据以下题目信息生成深度解析。

## 题目信息
- 题目内容：{{question_content}}
- 选项：{{options}}
- 正确答案：{{answer}}
- 题目类型：{{question_type}}
- 难度等级：{{difficulty}}
- 所属知识点：{{knowledge_points}}

## 输出要求
请按以下JSON格式输出解析内容：

{
  "analysis": "详细的题目解析（至少200字）",
  "key_points": ["考点1", "考点2", "考点3"],
  "solution_steps": [
    "第一步：审题，明确题目要求",
    "第二步：...",
    "第三步：..."
  ],
  "option_analysis": {
    "A": "选项A的分析",
    "B": "选项B的分析",
    "C": "选项C的分析",
    "D": "选项D的分析"
  },
  "common_mistakes": ["常见错误1", "常见错误2"],
  "related_knowledge": ["相关知识点1", "相关知识点2"]
}

## 注意事项
1. 解析要深入浅出，便于考生理解
2. 每个选项都要分析，指出对错原因
3. 列出2-3个常见的错误认知或陷阱
4. 关联相关知识点，帮助考生举一反三

请输出JSON：`

// QuestionTipsPrompt 解题技巧提示词模板
const QuestionTipsPrompt = `你是一位公考解题技巧专家。请根据以下题目信息生成解题技巧和秒杀方法。

## 题目信息
- 题目内容：{{question_content}}
- 选项：{{options}}
- 正确答案：{{answer}}
- 题目类型：{{question_type}}
- 所属知识点：{{knowledge_points}}

## 输出要求
请按以下JSON格式输出：

{
  "tips": [
    "技巧1：...",
    "技巧2：...",
    "技巧3：..."
  ],
  "quick_solution_tips": [
    "【秒杀技巧】..."
  ],
  "key_points": ["考查的核心能力1", "考查的核心能力2"],
  "common_patterns": ["同类题型的常见出题模式1", "模式2"],
  "time_saving_methods": ["节省时间的方法1", "方法2"]
}

## 注意事项
1. 技巧要实用，能直接应用于解题
2. 秒杀技巧要简洁高效
3. 总结同类型题目的共性规律
4. 提供合理的时间管理建议

请输出JSON：`

// QuestionSimilarPrompt 相似题目生成提示词模板
const QuestionSimilarPrompt = `你是一位公考命题专家。请根据以下原题生成{{count}}道相似的练习题，用于举一反三训练。

## 原题信息
- 题目内容：{{question_content}}
- 选项：{{options}}
- 正确答案：{{answer}}
- 题目类型：{{question_type}}
- 所属知识点：{{knowledge_points}}

## 输出要求
请按以下JSON格式输出{{count}}道相似题目：

{
  "summary": "简要说明生成题目的设计思路",
  "examples": [
    {
      "question": "【变形题 1】题目内容...",
      "options": ["A. 选项A", "B. 选项B", "C. 选项C", "D. 选项D"],
      "answer": "正确答案（A/B/C/D）",
      "analysis": "详细解析..."
    }
  ],
  "key_points": ["训练目标1", "训练目标2"]
}

## 注意事项
1. 题目要与原题考查相同的知识点
2. 难度保持一致或略有递进
3. 不要简单改数字，要有一定的变化
4. 每道题都要有详细解析
5. 确保答案正确无误

请输出JSON：`

// GetQuestionAnalysisPrompt 获取题目解析提示词
func GetQuestionAnalysisPrompt() string {
	return QuestionAnalysisPrompt
}

// GetQuestionTipsPrompt 获取解题技巧提示词
func GetQuestionTipsPrompt() string {
	return QuestionTipsPrompt
}

// GetQuestionSimilarPrompt 获取相似题目提示词
func GetQuestionSimilarPrompt() string {
	return QuestionSimilarPrompt
}
