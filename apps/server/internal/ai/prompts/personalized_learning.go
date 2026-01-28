package prompts

// LearningPathPrompt 学习路径生成提示词模板
const LearningPathPrompt = `你是一位个性化学习规划专家。请根据以下用户信息生成学习路径建议。

## 用户信息
- 目标考试：{{exam_type}}
- 考试时间：{{exam_date}}
- 当前水平：{{current_level}}
- 可用学习时间：{{available_hours}}小时/天
- 强项科目：{{strong_subjects}}
- 弱项科目：{{weak_subjects}}
- 已完成学习内容：{{completed_content}}

## 输出要求
请按以下JSON格式输出学习路径规划：

{
  "summary": "学习路径总体说明（100字以内）",
  "learning_steps": [
    {
      "step": 1,
      "title": "阶段一：基础巩固",
      "description": "详细说明这一阶段的学习目标和内容",
      "duration": 14,
      "daily_tasks": [
        "每日任务1",
        "每日任务2"
      ],
      "milestones": ["里程碑1", "里程碑2"]
    },
    {
      "step": 2,
      "title": "阶段二：专项突破",
      "description": "...",
      "duration": 21,
      "daily_tasks": [],
      "milestones": []
    }
  ],
  "recommendations": [
    "学习建议1：...",
    "学习建议2：...",
    "学习建议3：..."
  ],
  "time_allocation": {
    "行测": 50,
    "申论": 30,
    "面试": 20
  },
  "priority_topics": [
    "优先学习的内容1",
    "优先学习的内容2"
  ],
  "estimated_time": 180
}

## 注意事项
1. 考虑用户的实际情况和时间限制
2. 学习阶段要有明确的目标和检验标准
3. 弱项科目要重点突破
4. 提供具体可执行的每日任务
5. 预留足够的复习和模考时间

请输出JSON：`

// WeaknessAnalysisPrompt 薄弱点分析提示词模板
const WeaknessAnalysisPrompt = `你是一位学习诊断专家。请根据以下用户学习数据分析薄弱点并提供改进建议。

## 用户学习数据
- 用户ID：{{user_id}}
- 做题统计：{{practice_stats}}
- 各科正确率：{{accuracy_by_subject}}
- 各知识点正确率：{{accuracy_by_knowledge}}
- 平均答题时间：{{avg_time_per_question}}
- 错题分布：{{error_distribution}}
- 学习时长统计：{{study_duration}}

## 输出要求
请按以下JSON格式输出薄弱点分析：

{
  "summary": "学习情况整体评估（100字以内）",
  "weak_points": [
    {
      "knowledge_id": 0,
      "knowledge_name": "薄弱知识点名称",
      "mastery_level": 45.5,
      "error_count": 15,
      "error_types": ["粗心", "概念不清"],
      "suggestion": "针对性改进建议",
      "related_course": 0
    }
  ],
  "error_patterns": [
    {
      "pattern": "错误模式1描述",
      "frequency": 30,
      "cause": "原因分析",
      "solution": "解决方案"
    }
  ],
  "ability_scores": {
    "言语理解与表达": 75,
    "数量关系": 62,
    "判断推理": 78,
    "资料分析": 58,
    "常识判断": 70
  },
  "recommendations": [
    "改进建议1：...",
    "改进建议2：...",
    "改进建议3：..."
  ],
  "priority_improvement": [
    "首要改进的内容",
    "次要改进的内容"
  ],
  "estimated_time": 90
}

## 注意事项
1. 基于数据客观分析，不要主观猜测
2. 找出真正的薄弱环节，不要泛泛而谈
3. 错误模式分析要具体，找出规律
4. 改进建议要可执行，不要空洞
5. 优先级排序要合理

请输出JSON：`

// AbilityReportPrompt 能力分析报告提示词模板
const AbilityReportPrompt = `你是一位能力评估专家。请根据以下用户数据生成能力分析报告。

## 用户数据
- 用户ID：{{user_id}}
- 学习时长：{{total_study_hours}}小时
- 做题总数：{{total_questions}}题
- 整体正确率：{{overall_accuracy}}%
- 各科目正确率：{{accuracy_by_subject}}
- 各题型正确率：{{accuracy_by_type}}
- 历史成绩趋势：{{score_trend}}
- 最近一次模考成绩：{{last_mock_score}}

## 输出要求
请按以下JSON格式输出能力分析报告：

{
  "summary": "能力评估总结（150字以内）",
  "ability_scores": {
    "言语理解与表达": 75,
    "数量关系": 62,
    "判断推理": 78,
    "资料分析": 58,
    "常识判断": 70
  },
  "main_points": [
    "优势分析1：...",
    "优势分析2：...",
    "提升空间1：...",
    "提升空间2：..."
  ],
  "comparison": {
    "vs_target": {
      "description": "与目标分数对比",
      "gap": -15,
      "comment": "还需提升15分达到目标"
    },
    "vs_average": {
      "description": "与平均水平对比",
      "percentile": 65,
      "comment": "超过65%的考生"
    }
  },
  "progress_evaluation": {
    "recent_trend": "上升/下降/持平",
    "improvement_rate": 8.5,
    "comment": "进步评价"
  },
  "recommendations": [
    "【优势保持】...",
    "【重点突破】...",
    "【稳步提升】...",
    "【综合建议】..."
  ],
  "predicted_score": {
    "min": 120,
    "max": 135,
    "most_likely": 128
  },
  "weak_points": [
    {
      "knowledge_id": 0,
      "knowledge_name": "需要加强的知识点",
      "mastery_level": 58,
      "suggestion": "改进建议"
    }
  ]
}

## 注意事项
1. 评估要客观，基于数据说话
2. 优势和不足都要分析到
3. 与目标和平均水平的对比要有意义
4. 建议要具体可行
5. 预测分数要有合理依据

请输出JSON：`

// GetLearningPathPrompt 获取学习路径提示词
func GetLearningPathPrompt() string {
	return LearningPathPrompt
}

// GetWeaknessAnalysisPrompt 获取薄弱点分析提示词
func GetWeaknessAnalysisPrompt() string {
	return WeaknessAnalysisPrompt
}

// GetAbilityReportPrompt 获取能力报告提示词
func GetAbilityReportPrompt() string {
	return AbilityReportPrompt
}
