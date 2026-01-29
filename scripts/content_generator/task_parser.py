"""
任务解析模块 - 从 todolist.md 读取和解析任务

支持解析完整的 6 层课程层级结构:
- Level 1: ## §1 行测课程内容 (major_section)
- Level 2: ### 1.1 言语理解与表达课程 (module)
- Level 3: #### 逻辑填空课程（45课时） (category)
- Level 4: ##### 实词辨析精讲（20课时） (topic)
- Level 5: **实词辨析基础方法（4课时）** (lesson_group)
- Level 6: - [ ] 第1课：语素分析法 (lesson/task)
"""

import re
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import List, Optional, Dict, Any, Tuple
from .config import get_config


class TaskType(Enum):
    """任务类型"""
    COURSE = "course"
    QUESTION = "question"
    MATERIAL = "material"
    EXAM = "exam"


class Subject(Enum):
    """科目"""
    XINGCE = "xingce"       # 行测
    SHENLUN = "shenlun"     # 申论
    MIANSHI = "mianshi"     # 面试
    GONGJI = "gongji"       # 公基


class CategoryLevel(Enum):
    """分类层级"""
    MAJOR_SECTION = 1  # §1 行测课程内容
    MODULE = 2         # 1.1 言语理解与表达课程
    CATEGORY = 3       # 逻辑填空课程（45课时）
    TOPIC = 4          # 实词辨析精讲（20课时）
    LESSON_GROUP = 5   # 实词辨析基础方法（4课时）
    LESSON = 6         # 第1课：语素分析法


# 科目关键词映射
SUBJECT_KEYWORDS: Dict[str, Subject] = {
    "言语理解": Subject.XINGCE,
    "数量关系": Subject.XINGCE,
    "判断推理": Subject.XINGCE,
    "资料分析": Subject.XINGCE,
    "常识判断": Subject.XINGCE,
    "行测": Subject.XINGCE,
    "申论": Subject.SHENLUN,
    "面试": Subject.MIANSHI,
    "公基": Subject.GONGJI,
    "公共基础": Subject.GONGJI,
}

# 科目代码到名称映射
SUBJECT_NAMES: Dict[str, str] = {
    "xingce": "行测",
    "shenlun": "申论",
    "mianshi": "面试",
    "gongji": "公共基础知识",
}


@dataclass
class CategoryNode:
    """
    课程分类节点，用于构建完整的课程目录树
    """
    name: str                                   # 分类名称
    code: str                                   # 分类代码（用于唯一标识）
    level: int                                  # 层级（1-6）
    line_number: int = 0                        # 在文件中的行号
    parent_code: Optional[str] = None           # 父分类代码
    subject: str = "xingce"                     # 科目
    task_type: str = "course"                   # 任务类型
    sort_order: int = 0                         # 排序顺序
    estimated_duration: Optional[str] = None   # 预计时长（从标题中提取）
    lesson_count: int = 0                       # 课时数量
    children: List["CategoryNode"] = field(default_factory=list)
    tasks: List["Task"] = field(default_factory=list)  # 该节点下的任务（仅 Level 5/6）
    
    # 用于 LLM 生成的描述字段（初始为空）
    description: Optional[str] = None
    long_description: Optional[str] = None
    features: List[str] = field(default_factory=list)
    learning_objectives: List[str] = field(default_factory=list)
    keywords: List[str] = field(default_factory=list)
    difficulty: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典（用于 API 调用）"""
        return {
            "name": self.name,
            "code": self.code,
            "level": self.level,
            "line_number": self.line_number,
            "parent_code": self.parent_code,
            "subject": self.subject,
            "task_type": self.task_type,
            "sort_order": self.sort_order,
            "estimated_duration": self.estimated_duration,
            "lesson_count": self.lesson_count,
            "description": self.description,
            "long_description": self.long_description,
            "features": self.features,
            "learning_objectives": self.learning_objectives,
            "keywords": self.keywords,
            "difficulty": self.difficulty,
            "children": [child.to_dict() for child in self.children],
        }
    
    def flatten(self) -> List["CategoryNode"]:
        """扁平化所有节点（用于批量导入）"""
        result = [self]
        for child in self.children:
            result.extend(child.flatten())
        return result
    
    def count_lessons(self) -> int:
        """递归计算课时数量"""
        if self.level >= 5:  # Level 5 和 6 直接返回任务数
            return len(self.tasks)
        total = 0
        for child in self.children:
            total += child.count_lessons()
        self.lesson_count = total
        return total


@dataclass
class Task:
    """任务数据类（表示具体的课程/题目任务）"""
    line_number: int                    # 行号（0-based）
    title: str                          # 任务标题
    completed: bool = False             # 是否已完成
    indent: int = 0                     # 缩进层级
    
    # 完整的 6 层层级信息
    major_section: Optional[str] = None     # Level 1: §1 行测课程内容
    module: Optional[str] = None            # Level 2: 1.1 言语理解与表达课程
    category: Optional[str] = None          # Level 3: 逻辑填空课程
    topic: Optional[str] = None             # Level 4: 实词辨析精讲
    lesson_group: Optional[str] = None      # Level 5: 实词辨析基础方法
    
    # 兼容旧字段（映射到新字段）
    section: Optional[str] = None           # = module (兼容)
    subsection: Optional[str] = None        # = topic (兼容)
    parent: Optional[str] = None            # = lesson_group (兼容)
    
    task_type: TaskType = TaskType.COURSE
    subject: Subject = Subject.XINGCE
    
    # 额外元数据
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    @property
    def clean_title(self) -> str:
        """获取清理后的标题（去除 markdown 格式）"""
        return re.sub(r'\*\*([^*]+)\*\*', r'\1', self.title).strip()
    
    @property
    def is_parent_task(self) -> bool:
        """是否是父级任务（包含 **）"""
        return "**" in self.title
    
    @property
    def full_path(self) -> str:
        """获取完整的层级路径"""
        parts = []
        if self.major_section:
            parts.append(self.major_section)
        if self.module:
            parts.append(self.module)
        if self.category:
            parts.append(self.category)
        if self.topic:
            parts.append(self.topic)
        if self.lesson_group:
            parts.append(self.lesson_group)
        return " > ".join(parts)
    
    @property
    def category_code(self) -> str:
        """生成分类代码（用于关联到数据库分类）"""
        return generate_category_code(
            self.subject.value,
            self.module,
            self.category,
            self.topic,
            self.lesson_group
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "line_number": self.line_number,
            "title": self.title,
            "clean_title": self.clean_title,
            "completed": self.completed,
            "indent": self.indent,
            # 完整层级
            "major_section": self.major_section,
            "module": self.module,
            "category": self.category,
            "topic": self.topic,
            "lesson_group": self.lesson_group,
            "full_path": self.full_path,
            "category_code": self.category_code,
            # 兼容旧字段
            "section": self.section,
            "subsection": self.subsection,
            "parent": self.parent,
            "task_type": self.task_type.value,
            "subject": self.subject.value,
        }


def generate_category_code(subject: str, *parts: Optional[str]) -> str:
    """
    生成分类代码
    
    Args:
        subject: 科目代码 (xingce, shenlun, etc.)
        *parts: 层级名称部分
        
    Returns:
        分类代码，如 "xingce_yanyu_luoji_shici"
    """
    code_parts = [subject]
    
    for part in parts:
        if not part:
            continue
        # 提取关键词生成代码
        clean = re.sub(r'[（(].*?[)）]', '', part)  # 移除括号内容
        clean = re.sub(r'[\d.]+\s*', '', clean)    # 移除数字
        clean = clean.strip()
        
        if not clean:
            continue
            
        # 生成拼音首字母或简化代码
        # 这里简化处理，取前几个关键字
        key_map = {
            "言语理解与表达": "yanyu",
            "言语理解": "yanyu",
            "数量关系": "shuliang",
            "判断推理": "panduan",
            "资料分析": "ziliao",
            "常识判断": "changshi",
            "逻辑填空": "luoji",
            "片段阅读": "pianduan",
            "语句表达": "yuju",
            "实词辨析": "shici",
            "成语辨析": "chengyu",
            "关联词": "guanlian",
            "主旨概括": "zhuzhi",
            "意图判断": "yitu",
            "细节理解": "xijie",
            "数学运算": "shuxue",
            "数字推理": "shuzi",
            "图形推理": "tuxing",
            "定义判断": "dingyi",
            "类比推理": "leibi",
            "逻辑判断": "luojipd",
            "综合分析": "zonghe",
            "文字资料": "wenzi",
            "表格资料": "biaoge",
            "图表资料": "tubiao",
            "政治常识": "zhengzhi",
            "经济常识": "jingji",
            "法律常识": "falv",
            "科技常识": "keji",
            "历史常识": "lishi",
            "地理常识": "dili",
            "文化常识": "wenhua",
            "归纳概括": "guina",
            "提出对策": "duice",
            "综合分析题": "fenxi",
            "应用文写作": "yingyong",
            "大作文": "zuowen",
            "结构化面试": "jiegou",
            "无领导小组": "wulingdao",
            "情景模拟": "qingjing",
            "演讲": "yanjiang",
            "综合分析题": "zonghe_mianshi",
            "人际关系": "renji",
            "组织管理": "zuzhi",
            "应急应变": "yingji",
            "自我认知": "ziwo",
        }
        
        code = None
        for key, val in key_map.items():
            if key in clean:
                code = val
                break
        
        if code:
            code_parts.append(code)
        else:
            # 使用简化的名称（取前10个字符的hash）
            simplified = clean[:20].replace(" ", "_").lower()
            # 移除特殊字符
            simplified = re.sub(r'[^\w\u4e00-\u9fff]', '', simplified)
            if simplified:
                code_parts.append(simplified[:15])
    
    return "_".join(code_parts)


def extract_duration(title: str) -> Tuple[Optional[str], int]:
    """
    从标题中提取时长信息
    
    Args:
        title: 标题文本
        
    Returns:
        (时长字符串, 课时数量) 元组
    """
    match = re.search(r'[（(](\d+)课时[)）]', title)
    if match:
        count = int(match.group(1))
        return f"{count}课时", count
    
    match = re.search(r'[（(](\d+)题[)）]', title)
    if match:
        count = int(match.group(1))
        return f"{count}题", count
    
    return None, 0


@dataclass
class TaskStats:
    """任务统计"""
    total: int = 0
    completed: int = 0
    pending: int = 0
    by_section: Dict[str, Dict[str, int]] = field(default_factory=dict)
    by_module: Dict[str, Dict[str, int]] = field(default_factory=dict)  # 新增：按模块统计
    
    @property
    def percent(self) -> float:
        """完成百分比"""
        return (self.completed / self.total * 100) if self.total > 0 else 0
    
    @property
    def progress_bar(self) -> str:
        """生成进度条"""
        width = 20
        filled = int(self.percent / 100 * width)
        empty = width - filled
        return f"[{'#' * filled}{'-' * empty}]"


class TaskParser:
    """
    任务解析器
    
    支持解析完整的 6 层课程层级结构
    """
    
    def __init__(self, todolist_path: Optional[Path] = None):
        """
        初始化解析器
        
        Args:
            todolist_path: 任务文件路径，如果为 None 则从配置读取
        """
        self.config = get_config()
        self.todolist_path = todolist_path or self.config.paths.todolist_path
        
        # 缓存
        self._content: Optional[str] = None
        self._lines: Optional[List[str]] = None
        self._tasks: Optional[List[Task]] = None
        self._category_tree: Optional[List[CategoryNode]] = None
        self._mtime: float = 0
    
    def _is_cache_valid(self) -> bool:
        """检查缓存是否有效"""
        if self._content is None:
            return False
        try:
            current_mtime = self.todolist_path.stat().st_mtime
            return current_mtime == self._mtime
        except:
            return False
    
    def _invalidate_cache(self) -> None:
        """清除缓存"""
        self._content = None
        self._lines = None
        self._tasks = None
        self._category_tree = None
        self._mtime = 0
    
    def _infer_subject(self, search_text: str) -> Subject:
        """推断科目"""
        for keyword, subject in SUBJECT_KEYWORDS.items():
            if keyword in search_text:
                return subject
        return Subject.XINGCE
    
    def _infer_task_type(self, search_text: str) -> TaskType:
        """推断任务类型"""
        if "课程" in search_text or "课时" in search_text:
            return TaskType.COURSE
        if "题库" in search_text or "题目" in search_text:
            return TaskType.QUESTION
        if "素材" in search_text:
            return TaskType.MATERIAL
        if "试卷" in search_text:
            return TaskType.EXAM
        return TaskType.COURSE
    
    def _load_file(self) -> None:
        """加载文件内容"""
        if not self.todolist_path.exists():
            raise FileNotFoundError(f"任务文件不存在: {self.todolist_path}")
        
        self._content = self.todolist_path.read_text(encoding="utf-8")
        self._lines = self._content.split("\n")
        self._mtime = self.todolist_path.stat().st_mtime
    
    def parse(self) -> List[Task]:
        """
        解析任务文件，返回任务列表
        
        支持完整的 6 层层级解析:
        - Level 1: ## §1 行测课程内容 (major_section)
        - Level 2: ### 1.1 言语理解与表达课程 (module)  
        - Level 3: #### 逻辑填空课程（45课时） (category)
        - Level 4: ##### 实词辨析精讲（20课时） (topic)
        - Level 5: **实词辨析基础方法（4课时）** (lesson_group)
        - Level 6: - [ ] 第1课：语素分析法 (lesson/task)
        
        Returns:
            任务列表
        """
        # 检查缓存
        if self._is_cache_valid() and self._tasks is not None:
            return self._tasks
        
        self._load_file()
        
        tasks: List[Task] = []
        
        # 6 层层级追踪
        current_major_section = ""   # Level 1: ## §1 xxx
        current_module = ""          # Level 2: ### 1.1 xxx
        current_category = ""        # Level 3: #### xxx
        current_topic = ""           # Level 4: ##### xxx
        current_lesson_group = ""    # Level 5: **xxx**
        
        for i, line in enumerate(self._lines):
            # Level 1: ## 开头的主章节 (如 ## §1 行测课程内容)
            if line.startswith("## ") and not line.startswith("### "):
                title = re.sub(r'^##\s*', '', line).strip()
                # 只有包含 §数字 的才是主章节
                if re.match(r'§\d+', title):
                    current_major_section = title
                    current_module = ""
                    current_category = ""
                    current_topic = ""
                    current_lesson_group = ""
                continue
            
            # Level 2: ### 开头的模块 (如 ### 1.1 言语理解与表达课程)
            if line.startswith("### ") and not line.startswith("#### "):
                current_module = re.sub(r'^###\s*', '', line).strip()
                current_category = ""
                current_topic = ""
                current_lesson_group = ""
                continue
            
            # Level 3: #### 开头的分类 (如 #### 逻辑填空课程（45课时）)
            if line.startswith("#### ") and not line.startswith("##### "):
                current_category = re.sub(r'^####\s*', '', line).strip()
                current_topic = ""
                current_lesson_group = ""
                continue
            
            # Level 4: ##### 开头的专题 (如 ##### 实词辨析精讲（20课时）)
            if line.startswith("##### "):
                current_topic = re.sub(r'^#####\s*', '', line).strip()
                current_lesson_group = ""
                continue
            
            # Level 5 & 6: 任务项 - [ ] 或 - [x]
            task_match = re.match(r'^(\s*)- \[([ xX])\]\s*(.+)$', line)
            if task_match:
                indent_str, status, title = task_match.groups()
                indent = len(indent_str)
                completed = status.lower() == 'x'
                
                # Level 5: 带 **粗体** 的是课程组
                if "**" in title:
                    current_lesson_group = re.sub(r'\*\*', '', title).strip()
                
                # 构建任务对象
                task = Task(
                    line_number=i,
                    title=title.strip(),
                    completed=completed,
                    indent=indent,
                    # 完整 6 层层级
                    major_section=current_major_section or None,
                    module=current_module or None,
                    category=current_category or None,
                    topic=current_topic or None,
                    lesson_group=current_lesson_group if indent > 0 else (
                        re.sub(r'\*\*', '', title).strip() if "**" in title else None
                    ),
                    # 兼容旧字段
                    section=current_module or None,
                    subsection=current_topic or None,
                    parent=current_lesson_group if indent > 0 else None,
                )
                
                # 推断科目和类型
                search_text = f"{current_major_section} {current_module} {current_category} {current_topic} {title}"
                task.subject = self._infer_subject(search_text)
                task.task_type = self._infer_task_type(search_text)
                
                tasks.append(task)
        
        self._tasks = tasks
        return tasks
    
    def parse_category_tree(self) -> List[CategoryNode]:
        """
        解析并构建完整的课程分类树
        
        Returns:
            根分类节点列表（按科目分组）
        """
        if self._is_cache_valid() and self._category_tree is not None:
            return self._category_tree
        
        self._load_file()
        
        # 根节点（按科目）
        roots: Dict[str, CategoryNode] = {}
        
        # 当前层级节点追踪
        current_nodes: Dict[int, CategoryNode] = {}  # level -> node
        sort_counters: Dict[int, int] = {i: 0 for i in range(1, 7)}  # 每层的排序计数
        
        for i, line in enumerate(self._lines):
            node: Optional[CategoryNode] = None
            level = 0
            
            # Level 1: ## §数字 开头的主章节
            if line.startswith("## ") and not line.startswith("### "):
                title = re.sub(r'^##\s*', '', line).strip()
                if re.match(r'§\d+', title):
                    level = 1
                    # 推断科目
                    subject = self._infer_subject(title).value
                    duration, count = extract_duration(title)
                    
                    node = CategoryNode(
                        name=title,
                        code=subject,
                        level=level,
                        line_number=i,
                        parent_code=None,
                        subject=subject,
                        task_type=self._infer_task_type(title).value,
                        sort_order=sort_counters[level],
                        estimated_duration=duration,
                    )
                    sort_counters[level] += 1
                    # 重置下级计数
                    for l in range(2, 7):
                        sort_counters[l] = 0
                    
                    # 添加为根节点
                    if subject not in roots:
                        roots[subject] = node
                    current_nodes[level] = node
            
            # Level 2: ### 开头的模块
            elif line.startswith("### ") and not line.startswith("#### "):
                title = re.sub(r'^###\s*', '', line).strip()
                level = 2
                parent = current_nodes.get(1)
                if parent:
                    duration, count = extract_duration(title)
                    code = generate_category_code(parent.subject, title)
                    
                    node = CategoryNode(
                        name=title,
                        code=code,
                        level=level,
                        line_number=i,
                        parent_code=parent.code,
                        subject=parent.subject,
                        task_type=self._infer_task_type(title).value,
                        sort_order=sort_counters[level],
                        estimated_duration=duration,
                    )
                    sort_counters[level] += 1
                    for l in range(3, 7):
                        sort_counters[l] = 0
                    
                    parent.children.append(node)
                    current_nodes[level] = node
            
            # Level 3: #### 开头的分类
            elif line.startswith("#### ") and not line.startswith("##### "):
                title = re.sub(r'^####\s*', '', line).strip()
                level = 3
                parent = current_nodes.get(2)
                if parent:
                    duration, count = extract_duration(title)
                    # 获取 Level 2 的名称用于生成代码
                    module_name = current_nodes.get(2).name if current_nodes.get(2) else None
                    code = generate_category_code(parent.subject, module_name, title)
                    
                    node = CategoryNode(
                        name=title,
                        code=code,
                        level=level,
                        line_number=i,
                        parent_code=parent.code,
                        subject=parent.subject,
                        task_type=self._infer_task_type(title).value,
                        sort_order=sort_counters[level],
                        estimated_duration=duration,
                    )
                    sort_counters[level] += 1
                    for l in range(4, 7):
                        sort_counters[l] = 0
                    
                    parent.children.append(node)
                    current_nodes[level] = node
            
            # Level 4: ##### 开头的专题
            elif line.startswith("##### "):
                title = re.sub(r'^#####\s*', '', line).strip()
                level = 4
                parent = current_nodes.get(3)
                if parent:
                    duration, count = extract_duration(title)
                    module_name = current_nodes.get(2).name if current_nodes.get(2) else None
                    category_name = current_nodes.get(3).name if current_nodes.get(3) else None
                    code = generate_category_code(parent.subject, module_name, category_name, title)
                    
                    node = CategoryNode(
                        name=title,
                        code=code,
                        level=level,
                        line_number=i,
                        parent_code=parent.code,
                        subject=parent.subject,
                        task_type=self._infer_task_type(title).value,
                        sort_order=sort_counters[level],
                        estimated_duration=duration,
                    )
                    sort_counters[level] += 1
                    for l in range(5, 7):
                        sort_counters[l] = 0
                    
                    parent.children.append(node)
                    current_nodes[level] = node
            
            # Level 5: 带 **粗体** 的任务项是课程组
            else:
                task_match = re.match(r'^(\s*)- \[([ xX])\]\s*(.+)$', line)
                if task_match:
                    indent_str, status, title = task_match.groups()
                    
                    if "**" in title:
                        # Level 5: 课程组
                        level = 5
                        clean_title = re.sub(r'\*\*', '', title).strip()
                        parent = current_nodes.get(4) or current_nodes.get(3) or current_nodes.get(2)
                        
                        if parent:
                            duration, count = extract_duration(clean_title)
                            module_name = current_nodes.get(2).name if current_nodes.get(2) else None
                            category_name = current_nodes.get(3).name if current_nodes.get(3) else None
                            topic_name = current_nodes.get(4).name if current_nodes.get(4) else None
                            code = generate_category_code(parent.subject, module_name, category_name, topic_name, clean_title)
                            
                            node = CategoryNode(
                                name=clean_title,
                                code=code,
                                level=level,
                                line_number=i,
                                parent_code=parent.code,
                                subject=parent.subject,
                                task_type=self._infer_task_type(clean_title).value,
                                sort_order=sort_counters[level],
                                estimated_duration=duration,
                            )
                            sort_counters[level] += 1
                            sort_counters[6] = 0
                            
                            parent.children.append(node)
                            current_nodes[level] = node
        
        self._category_tree = list(roots.values())
        
        # 计算课时数量
        for root in self._category_tree:
            root.count_lessons()
        
        return self._category_tree
    
    def get_all_categories_flat(self) -> List[CategoryNode]:
        """
        获取所有分类节点的扁平列表（用于批量导入）
        
        Returns:
            所有分类节点列表
        """
        tree = self.parse_category_tree()
        result = []
        for root in tree:
            result.extend(root.flatten())
        return result
    
    def get_pending_tasks(
        self, 
        limit: Optional[int] = None, 
        section_filter: Optional[str] = None,
        module_filter: Optional[str] = None,
        subject_filter: Optional[str] = None,
    ) -> List[Task]:
        """
        获取待处理任务
        
        Args:
            limit: 返回数量限制
            section_filter: 章节过滤（兼容旧接口，映射到 module）
            module_filter: 模块过滤（Level 2）
            subject_filter: 科目过滤
            
        Returns:
            待处理任务列表
        """
        tasks = self.parse()
        pending = [t for t in tasks if not t.completed]
        
        # 兼容旧参数
        if section_filter:
            module_filter = section_filter
        
        if module_filter:
            pending = [t for t in pending if t.module and module_filter in t.module]
        
        if subject_filter:
            pending = [t for t in pending if t.subject.value == subject_filter]
        
        if limit:
            pending = pending[:limit]
        
        return pending
    
    def get_next_task(self) -> Optional[Task]:
        """
        获取下一个待处理任务
        
        Returns:
            下一个任务，如果全部完成则返回 None
        """
        pending = self.get_pending_tasks(limit=1)
        return pending[0] if pending else None
    
    def get_stats(self) -> TaskStats:
        """
        获取任务统计
        
        Returns:
            任务统计信息
        """
        tasks = self.parse()
        
        stats = TaskStats(
            total=len(tasks),
            completed=len([t for t in tasks if t.completed]),
            pending=len([t for t in tasks if not t.completed]),
        )
        
        # 按章节统计（兼容旧逻辑，使用 module）
        for task in tasks:
            section = task.section or task.module or "未分类"
            if section not in stats.by_section:
                stats.by_section[section] = {"total": 0, "completed": 0, "pending": 0}
            
            stats.by_section[section]["total"] += 1
            if task.completed:
                stats.by_section[section]["completed"] += 1
            else:
                stats.by_section[section]["pending"] += 1
        
        # 新增：按模块统计
        for task in tasks:
            module = task.module or "未分类"
            if module not in stats.by_module:
                stats.by_module[module] = {"total": 0, "completed": 0, "pending": 0}
            
            stats.by_module[module]["total"] += 1
            if task.completed:
                stats.by_module[module]["completed"] += 1
            else:
                stats.by_module[module]["pending"] += 1
        
        return stats
    
    def mark_complete(self, line_number: int) -> bool:
        """
        标记任务为已完成
        
        Args:
            line_number: 任务行号
            
        Returns:
            是否成功标记
        """
        # 确保缓存有效
        if not self._is_cache_valid():
            self.parse()
        
        if self._lines is None:
            return False
        
        if line_number < 0 or line_number >= len(self._lines):
            return False
        
        line = self._lines[line_number]
        if "- [ ]" in line:
            self._lines[line_number] = line.replace("- [ ]", "- [x]")
            
            # 写回文件
            new_content = "\n".join(self._lines)
            self.todolist_path.write_text(new_content, encoding="utf-8")
            
            # 清除缓存
            self._invalidate_cache()
            return True
        
        return False
    
    def list_sections(self) -> List[str]:
        """
        列出所有章节（兼容旧接口）
        
        Returns:
            章节列表
        """
        return self.list_modules()
    
    def list_modules(self) -> List[str]:
        """
        列出所有模块（Level 2）
        
        Returns:
            模块列表
        """
        tasks = self.parse()
        modules = set()
        for task in tasks:
            if task.module:
                modules.add(task.module)
        return sorted(modules)
    
    def list_categories(self) -> List[str]:
        """
        列出所有分类（Level 3）
        
        Returns:
            分类列表
        """
        tasks = self.parse()
        categories = set()
        for task in tasks:
            if task.category:
                categories.add(task.category)
        return sorted(categories)
    
    def get_category_by_code(self, code: str) -> Optional[CategoryNode]:
        """
        根据代码查找分类节点
        
        Args:
            code: 分类代码
            
        Returns:
            分类节点，未找到返回 None
        """
        all_categories = self.get_all_categories_flat()
        for cat in all_categories:
            if cat.code == code:
                return cat
        return None
    
    def print_tree(self, max_level: int = 6) -> str:
        """
        打印课程树结构（用于调试）
        
        Args:
            max_level: 最大显示层级
            
        Returns:
            树形结构字符串
        """
        tree = self.parse_category_tree()
        lines = []
        
        def print_node(node: CategoryNode, indent: int = 0):
            if node.level > max_level:
                return
            prefix = "  " * indent
            duration = f" ({node.estimated_duration})" if node.estimated_duration else ""
            lines.append(f"{prefix}[L{node.level}] {node.name}{duration}")
            for child in node.children:
                print_node(child, indent + 1)
        
        for root in tree:
            print_node(root)
        
        return "\n".join(lines)
