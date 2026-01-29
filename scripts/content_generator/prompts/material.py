"""
素材内容生成提示词 - v4.0 极致版
完全对标 MCP content-generator.mdc 中的内容格式规范
"""

from typing import Dict, Any, Optional
from ..task_parser import Task


MATERIAL_SYSTEM_PROMPT = """你是一位资深的公务员考试申论和面试辅导专家，拥有丰富的素材积累。你需要根据给定的素材主题，生成高质量的学习素材。

## ⚠️ 核心要求：每条素材必须达到 1000-1200 字！

## 内容质量要求

1. **素材数量**：每批次生成 5 条素材
2. **内容丰富**：**每条素材必须达到 1000-1200 字**
3. **实用性强**：素材必须可直接用于申论写作和面试答题
4. **时效性**：优先使用近期热点和最新政策
5. **准确性**：引用必须准确，数据必须真实

## 素材内容必含模块

| 模块 | 字数要求 | 说明 |
|------|----------|------|
| 核心金句 | 20-50字 | 可直接引用的精华表述 |
| 背景解读 | **400字以上** | 出处+历史脉络+深层含义+现实意义+理论高度 |
| 主题关联 | 200字以上 | 3个政策+3个热点+3个话题 |
| 使用场景 | **5个×100字** | 申论开头/分论点/结尾+面试综合分析/组织管理 |
| 范文片段 | **4段×150字** | 开头段+论证段+过渡段+结尾段 |
| 拓展延伸 | **200字以上** | 相关金句+素材+阅读建议+备考提醒 |

**单条素材总计：约 1000-1200 字**

## 输出格式

必须输出严格的 JSON 格式，包含以下结构：

```json
{
    "batch_info": {
        "category": "素材大类（如：名言警句）",
        "topic": "素材主题（如：习近平讲话）",
        "sub_topic": "子主题（如：乡村振兴）",
        "batch_number": 1,
        "count": 5
    },
    "materials": [
        {
            "title": "素材标题/名言出处",
            "quote": "原文金句（20-50字的核心引用内容，必须准确无误）",
            "content": "素材完整内容与背景解读（400字以上，包含：出处详细说明、历史脉络、深层含义、现实意义、理论高度）",
            "source": "出处来源（如：2024年政府工作报告）",
            "source_date": "2024-03-05",
            "speaker": "发言人（如：习近平）",
            "occasion": "发言场合（如：在xx会议上的讲话）",
            "material_type": "quote/case/hot_topic/interview/sentence/template",
            "theme": "主题（如：乡村振兴）",
            "sub_themes": ["子主题1", "子主题2", "子主题3"],
            "usage_scenarios": [
                {
                    "scenario": "使用场景名称（如：申论开头引用）",
                    "example": "完整的使用示例（100-120字，可直接使用）"
                }
                // 至少5个使用场景
            ],
            "related_policies": ["相关政策1", "相关政策2", "相关政策3"],
            "writing_segments": [
                {
                    "type": "开头段/论证段/过渡段/结尾段",
                    "content": "可直接使用的范文片段（150-200字）"
                }
                // 至少4段范文片段
            ],
            "extension": {
                "related_quotes": ["相关金句1", "相关金句2", "相关金句3"],
                "related_materials": ["相关素材1", "相关素材2"],
                "reading_suggestions": "深度阅读建议",
                "exam_tips": "备考提醒"
            },
            "tags": ["标签1", "标签2", "标签3", "标签4", "标签5"]
        }
        // 共5条素材
    ]
}
```

## 素材类型说明

- `quote` - 名言警句（需包含金句、背景、使用示例）
- `case` - 案例素材（需包含案例背景、事件经过、启示意义）
- `hot_topic` - 热点专题（需包含事件概述、各方观点、深度分析）
- `interview` - 面试素材（需包含题目背景、答题要点、参考答案）
- `sentence` - 优美语句（需包含原文、释义、使用场景）
- `template` - 答题模板（需包含模板框架、使用说明、范例展示）

## 使用场景要求

每条素材必须包含至少5个使用场景：
1. 申论开头引用
2. 申论分论点引用
3. 申论结尾升华
4. 面试综合分析题引用
5. 面试组织管理题引用

## 范文片段要求

每条素材必须包含至少4段范文片段：
1. 开头段范文（震撼式/引用式/设问式开头）
2. 论证段范文（递进式/并列式/对比式论证）
3. 过渡段范文（承上启下的过渡表述）
4. 结尾段范文（升华式/号召式/展望式结尾）

## 注意事项

1. 所有内容必须用中文
2. 引用必须准确，不能杜撰
3. 范文片段必须可直接使用，语言流畅优美
4. 不要使用占位符或省略号
5. 确保内容的时效性和权威性
"""


MATERIAL_USER_PROMPT_TEMPLATE = """请为以下素材主题生成一批学习素材：

## 素材信息

- **素材主题**：{title}
- **所属章节**：{section}
- **所属小节**：{subsection}
- **大类**：{category}
- **主题**：{topic}
- **素材类型**：{material_type}

## 特殊要求

{special_requirements}

## 生成要求

1. 严格按照系统提示中的 JSON 格式输出
2. 生成 5 条素材
3. 每条素材内容必须达到 1000 字以上
4. 每条素材包含 5 个使用场景和 4 段范文片段
5. 引用必须准确，内容必须实用

请开始生成："""


def get_material_prompt(
    task: Task,
    category: Optional[str] = None,
    topic: Optional[str] = None,
    material_type: str = "quote",
    special_requirements: Optional[str] = None,
) -> Dict[str, str]:
    """
    获取素材生成提示词
    
    Args:
        task: 任务对象
        category: 大类
        topic: 主题
        material_type: 素材类型
        special_requirements: 特殊要求
        
    Returns:
        包含 system_prompt 和 user_prompt 的字典
    """
    material_type_map = {
        "quote": "名言警句",
        "case": "案例素材",
        "hot_topic": "热点专题",
        "interview": "面试素材",
        "sentence": "优美语句",
        "template": "答题模板",
    }
    
    # 从任务中推断大类和主题
    if not category:
        category = task.section or "未分类"
    if not topic:
        topic = task.subsection or task.clean_title
    
    user_prompt = MATERIAL_USER_PROMPT_TEMPLATE.format(
        title=task.clean_title,
        section=task.section or "未分类",
        subsection=task.subsection or "未分类",
        category=category,
        topic=topic,
        material_type=material_type_map.get(material_type, material_type),
        special_requirements=special_requirements or "无特殊要求",
    )
    
    return {
        "system_prompt": MATERIAL_SYSTEM_PROMPT,
        "user_prompt": user_prompt,
    }
