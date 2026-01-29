"""
课程分类描述生成提示词

用于为课程目录树的每个节点生成丰富的描述信息
"""

from typing import Dict, Any, Optional, List


CATEGORY_SYSTEM_PROMPT = """你是一位资深的公务员考试辅导专家，拥有20年的教学经验。

你的任务是为公考课程分类节点生成详细的描述信息，这些信息将用于：
1. 前端页面展示，帮助学员了解课程内容
2. 搜索引擎优化，提高课程的可发现性
3. 学习路径规划，帮助学员选择合适的课程

请根据分类名称和层级信息，生成准确、专业、吸引人的描述内容。

## 输出要求

请严格按照以下 JSON 格式输出，不要包含任何其他内容：

```json
{
  "name": "分类简称（2-8个字，简洁明了）",
  "description": "一句话描述（30-50字，概括核心内容和价值）",
  "long_description": "详细介绍（150-250字，包含：1.该分类的核心内容 2.在考试中的重要性 3.学习该分类能获得的能力提升 4.适合的学习人群）",
  "features": [
    "特点1：具体的功能或亮点（15-25字）",
    "特点2：具体的功能或亮点（15-25字）",
    "特点3：具体的功能或亮点（15-25字）",
    "特点4：具体的功能或亮点（15-25字）"
  ],
  "learning_objectives": [
    "学习目标1：具体可衡量的目标（15-30字）",
    "学习目标2：具体可衡量的目标（15-30字）",
    "学习目标3：具体可衡量的目标（15-30字）"
  ],
  "keywords": ["关键词1", "关键词2", "关键词3", "关键词4", "关键词5"],
  "difficulty": "基础/进阶/提高/冲刺",
  "icon_suggestion": "建议的图标名称（如 book, calculator, brain 等）",
  "color_suggestion": "建议的主题色（如 #6366f1, #10b981 等）"
}
```

## 不同层级的描述侧重点

### Level 1 (科目层级，如"行测课程内容")
- 强调该科目在公考中的整体地位和重要性
- 介绍该科目包含的主要模块
- 说明学习该科目的整体策略

### Level 2 (模块层级，如"言语理解与表达课程")
- 强调该模块在科目中的占比和分值
- 介绍该模块的核心题型
- 说明该模块的学习方法和技巧

### Level 3 (分类层级，如"逻辑填空课程")
- 强调该分类的考查频率和难度特点
- 介绍该分类的核心考点
- 说明该分类与其他分类的关系

### Level 4 (专题层级，如"实词辨析精讲")
- 强调该专题的具体知识点
- 介绍该专题的常见题型
- 说明该专题的易错点和提分技巧

### Level 5 (课程组层级，如"实词辨析基础方法")
- 强调该课程组的学习目标
- 介绍包含的具体课程
- 说明学习顺序和方法建议

## 内容要求

1. **准确性**：描述必须符合公考实际情况，数据和信息要准确
2. **专业性**：使用专业术语，体现教学经验
3. **吸引力**：语言生动，能激发学员的学习兴趣
4. **实用性**：提供具体可行的学习建议
5. **差异化**：不同层级的描述要有明显的区分度

## 注意事项

- 不要使用"等等"、"..."这样的模糊表述
- 不要出现占位符或示例内容
- 不要使用过于口语化的表达
- 确保JSON格式正确，可以被直接解析
"""


def build_category_prompt(
    name: str,
    level: int,
    parent_name: Optional[str] = None,
    subject: str = "xingce",
    siblings: Optional[List[str]] = None,
    estimated_duration: Optional[str] = None,
) -> str:
    """
    构建分类描述生成的用户提示词
    
    Args:
        name: 分类名称
        level: 分类层级 (1-5)
        parent_name: 父分类名称
        subject: 科目代码
        siblings: 同级分类名称列表
        estimated_duration: 预计时长
        
    Returns:
        用户提示词
    """
    subject_names = {
        "xingce": "行政职业能力测验（行测）",
        "shenlun": "申论",
        "mianshi": "面试",
        "gongji": "公共基础知识",
    }
    
    level_names = {
        1: "科目",
        2: "模块",
        3: "分类",
        4: "专题",
        5: "课程组",
    }
    
    subject_full = subject_names.get(subject, subject)
    level_name = level_names.get(level, f"Level {level}")
    
    prompt_parts = [
        f"请为以下公考课程分类生成详细的描述信息：",
        f"",
        f"## 分类信息",
        f"- **分类名称**：{name}",
        f"- **所属科目**：{subject_full}",
        f"- **层级类型**：{level_name}（Level {level}）",
    ]
    
    if parent_name:
        prompt_parts.append(f"- **父级分类**：{parent_name}")
    
    if estimated_duration:
        prompt_parts.append(f"- **预计时长**：{estimated_duration}")
    
    if siblings:
        siblings_str = "、".join(siblings[:5])  # 最多显示5个
        if len(siblings) > 5:
            siblings_str += f"等{len(siblings)}个"
        prompt_parts.append(f"- **同级分类**：{siblings_str}")
    
    prompt_parts.extend([
        f"",
        f"请根据以上信息，生成该分类的详细描述。确保：",
        f"1. 描述内容与分类名称和层级相匹配",
        f"2. 突出该分类在公考备考中的重要性",
        f"3. 提供具体实用的学习建议",
        f"4. 严格按照JSON格式输出",
    ])
    
    return "\n".join(prompt_parts)


def build_batch_category_prompt(categories: List[Dict[str, Any]]) -> str:
    """
    构建批量分类描述生成的用户提示词
    
    Args:
        categories: 分类信息列表，每个包含 name, level, parent_name, subject 等
        
    Returns:
        用户提示词
    """
    prompt_parts = [
        "请为以下公考课程分类批量生成描述信息。",
        "",
        "## 分类列表",
        "",
    ]
    
    for i, cat in enumerate(categories, 1):
        prompt_parts.append(f"### 分类 {i}")
        prompt_parts.append(f"- 名称：{cat.get('name', '')}")
        prompt_parts.append(f"- 层级：Level {cat.get('level', 1)}")
        if cat.get('parent_name'):
            prompt_parts.append(f"- 父级：{cat.get('parent_name')}")
        if cat.get('estimated_duration'):
            prompt_parts.append(f"- 时长：{cat.get('estimated_duration')}")
        prompt_parts.append("")
    
    prompt_parts.extend([
        "## 输出要求",
        "",
        "请输出一个JSON数组，每个元素对应一个分类的描述信息，格式如下：",
        "",
        "```json",
        "[",
        "  {",
        '    "index": 1,',
        '    "name": "...",',
        '    "description": "...",',
        '    "long_description": "...",',
        '    "features": ["...", "...", "...", "..."],',
        '    "learning_objectives": ["...", "...", "..."],',
        '    "keywords": ["...", "...", "...", "...", "..."],',
        '    "difficulty": "基础/进阶/提高/冲刺",',
        '    "icon_suggestion": "...",',
        '    "color_suggestion": "#..."',
        "  },",
        "  ...",
        "]",
        "```",
        "",
        "确保：",
        "1. 数组长度与分类数量一致",
        "2. index 字段与分类编号对应",
        "3. 每个分类的描述要有差异化",
    ])
    
    return "\n".join(prompt_parts)


# 预定义的分类描述模板（用于快速生成或降级）
DEFAULT_DESCRIPTIONS = {
    "xingce": {
        "name": "行测",
        "description": "行政职业能力测验，全面考查考生的综合素质和行政能力。",
        "long_description": "行政职业能力测验（简称行测）是公务员考试的核心科目之一，主要测查考生的言语理解与表达、数量关系、判断推理、资料分析、常识判断等多方面能力。行测题量大、时间紧，需要考生具备快速准确的解题能力和良好的心理素质。通过系统学习，可以掌握各题型的解题技巧，提高做题速度和正确率。",
        "features": ["五大模块全覆盖", "题量大时间紧", "技巧性强", "可短期提分"],
        "learning_objectives": ["掌握各模块核心解题方法", "提升做题速度至每题50秒", "正确率达到80%以上"],
        "keywords": ["行测", "公务员考试", "行政能力", "逻辑思维", "言语理解"],
        "difficulty": "进阶",
    },
    "shenlun": {
        "name": "申论",
        "description": "申论是公务员考试的主观题科目，考查政策理解和文字表达能力。",
        "long_description": "申论是公务员考试中的主观性科目，主要测查考生阅读理解能力、综合分析能力、提出和解决问题能力、文字表达能力等。申论试卷通常包含给定资料和作答要求，要求考生在理解材料的基础上进行归纳概括、提出对策、综合分析和撰写文章。申论考试注重考查考生的政策理论水平和对社会热点问题的分析能力。",
        "features": ["主观性强", "材料分析为核心", "写作能力要求高", "需关注时政热点"],
        "learning_objectives": ["掌握材料阅读和信息提取技巧", "学会规范的申论答题格式", "提升大作文写作水平"],
        "keywords": ["申论", "材料分析", "公文写作", "政策理解", "综合分析"],
        "difficulty": "提高",
    },
    "mianshi": {
        "name": "面试",
        "description": "公务员面试是对考生综合素质和实际工作能力的全面考查。",
        "long_description": "公务员面试是公务员录用考试的重要环节，主要采用结构化面试和无领导小组讨论等形式。面试重点考查考生的综合分析能力、计划组织协调能力、人际交往能力、应变能力、言语表达能力等。面试成绩在总成绩中占比较高，是决定最终录用的关键环节。通过系统训练，可以显著提升面试表现。",
        "features": ["现场即兴作答", "考查综合素质", "需要大量练习", "心理素质很重要"],
        "learning_objectives": ["掌握各类题型答题框架", "提升语言表达流畅度", "培养临场应变能力"],
        "keywords": ["面试", "结构化", "无领导", "综合分析", "人际关系"],
        "difficulty": "提高",
    },
    "gongji": {
        "name": "公基",
        "description": "公共基础知识涵盖政治、法律、经济、科技等多领域知识。",
        "long_description": "公共基础知识（简称公基）是事业单位考试和部分公务员考试的重要科目，内容涵盖政治理论、法律常识、经济知识、科技人文、公文写作等多个领域。公基知识点繁多，需要考生进行系统性记忆和理解。通过构建知识框架和掌握记忆技巧，可以有效提高学习效率和考试成绩。",
        "features": ["知识面广", "记忆量大", "时政性强", "需要系统学习"],
        "learning_objectives": ["构建完整的知识体系", "掌握高效记忆方法", "关注时政热点动态"],
        "keywords": ["公基", "政治理论", "法律常识", "经济知识", "科技人文"],
        "difficulty": "基础",
    },
}
