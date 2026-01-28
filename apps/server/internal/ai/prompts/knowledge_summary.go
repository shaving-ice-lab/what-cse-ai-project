package prompts

// KnowledgeSummaryPrompt 知识点总结提示词模板
const KnowledgeSummaryPrompt = `你是一位公考知识体系专家。请根据以下知识点信息生成学习总结。

## 知识点信息
- 知识点名称：{{knowledge_name}}
- 所属分类：{{category}}
- 描述说明：{{description}}
- 重要程度：{{importance}}（1-5，5最重要）
- 出题频率：{{frequency}}

## 输出要求
请按以下JSON格式输出知识点总结：

{
  "definition": "知识点的精确定义（50-100字）",
  "main_points": [
    "要点1：...",
    "要点2：...",
    "要点3：...",
    "要点4：...",
    "要点5：..."
  ],
  "mnemonics": "记忆口诀或助记方法（朗朗上口，便于记忆）",
  "common_types": ["常见题型1", "常见题型2", "常见题型3"],
  "key_formulas": ["公式1", "公式2"],
  "memory_methods": [
    "联想记忆法：...",
    "对比记忆法：...",
    "图表记忆法：..."
  ],
  "exam_focus": ["高频考点1", "高频考点2"],
  "difficulty_points": ["难点1", "难点2"],
  "related_knowledge": ["相关知识点1", "相关知识点2"]
}

## 注意事项
1. 定义要准确精炼，抓住核心概念
2. 要点覆盖全面，重点突出
3. 记忆口诀要押韵或有规律，便于背诵
4. 结合公考实际，突出应试重点
5. 关联相关知识点，构建知识网络

请输出JSON：`

// KnowledgeMindmapPrompt 知识点思维导图数据提示词模板
const KnowledgeMindmapPrompt = `你是一位知识可视化专家。请根据以下知识点信息生成思维导图结构数据。

## 知识点信息
- 知识点名称：{{knowledge_name}}
- 所属分类：{{category}}
- 描述说明：{{description}}
- 子知识点：{{sub_points}}

## 输出要求
请按以下JSON格式输出思维导图数据结构：

{
  "mindmap_data": {
    "root": {
      "id": "root",
      "label": "{{knowledge_name}}",
      "color": "#ff6b6b",
      "children": [
        {
          "id": "1",
          "label": "分支1名称",
          "color": "#4ecdc4",
          "children": [
            {
              "id": "1-1",
              "label": "子节点1",
              "color": "#45b7d1"
            },
            {
              "id": "1-2",
              "label": "子节点2",
              "color": "#45b7d1"
            }
          ]
        },
        {
          "id": "2",
          "label": "分支2名称",
          "color": "#96ceb4",
          "children": []
        }
      ]
    }
  },
  "summary": "思维导图内容摘要"
}

## 注意事项
1. 层级结构清晰，不超过4层
2. 每个分支3-5个节点为宜
3. 使用不同颜色区分不同分支
4. 节点标签简洁明了，不超过10字
5. 确保 id 唯一且符合层级关系

请输出JSON：`

// KnowledgeExamplesPrompt 知识点例题解析提示词模板
const KnowledgeExamplesPrompt = `你是一位公考题库专家。请根据以下知识点信息生成{{count}}道经典例题及详细解析。

## 知识点信息
- 知识点名称：{{knowledge_name}}
- 所属分类：{{category}}
- 描述说明：{{description}}
- 核心概念：{{key_concepts}}

## 输出要求
请按以下JSON格式输出经典例题：

{
  "summary": "例题设计思路说明",
  "examples": [
    {
      "question": "【典型例题 1】\n\n题目内容...",
      "options": ["A. 选项A", "B. 选项B", "C. 选项C", "D. 选项D"],
      "answer": "B",
      "analysis": "【解析】\n详细解题过程...\n\n【解题模板】\n1. 第一步：...\n2. 第二步：...\n\n【易错提醒】\n..."
    }
  ],
  "key_points": [
    "典型题型覆盖",
    "详细解题步骤",
    "解题模板总结",
    "易错点提醒"
  ],
  "tips": [
    "解题技巧1：...",
    "解题技巧2：...",
    "解题技巧3：..."
  ]
}

## 注意事项
1. 题目要典型，能代表该知识点的考查方式
2. 难度由易到难递进
3. 解析要详细，包含解题思路和步骤
4. 提供解题模板，便于学生套用
5. 指出易错点和常见陷阱
6. 确保答案正确

请输出JSON：`

// GetKnowledgeSummaryPrompt 获取知识点总结提示词
func GetKnowledgeSummaryPrompt() string {
	return KnowledgeSummaryPrompt
}

// GetKnowledgeMindmapPrompt 获取知识点思维导图提示词
func GetKnowledgeMindmapPrompt() string {
	return KnowledgeMindmapPrompt
}

// GetKnowledgeExamplesPrompt 获取知识点例题提示词
func GetKnowledgeExamplesPrompt() string {
	return KnowledgeExamplesPrompt
}
