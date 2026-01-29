"""
任务解析模块 - 从 todolist.md 读取和解析任务
"""

import re
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import List, Optional, Dict, Any
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


@dataclass
class Task:
    """任务数据类"""
    line_number: int                    # 行号（0-based）
    title: str                          # 任务标题
    completed: bool = False             # 是否已完成
    indent: int = 0                     # 缩进层级
    section: Optional[str] = None       # 所属章节
    subsection: Optional[str] = None    # 所属小节
    parent: Optional[str] = None        # 父级任务标题
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
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "line_number": self.line_number,
            "title": self.title,
            "clean_title": self.clean_title,
            "completed": self.completed,
            "indent": self.indent,
            "section": self.section,
            "subsection": self.subsection,
            "parent": self.parent,
            "task_type": self.task_type.value,
            "subject": self.subject.value,
        }


@dataclass
class TaskStats:
    """任务统计"""
    total: int = 0
    completed: int = 0
    pending: int = 0
    by_section: Dict[str, Dict[str, int]] = field(default_factory=dict)
    
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
    """任务解析器"""
    
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
        self._mtime = 0
    
    def _infer_subject(self, task: Task) -> Subject:
        """推断任务科目"""
        search_text = f"{task.section or ''} {task.subsection or ''} {task.title}"
        
        for keyword, subject in SUBJECT_KEYWORDS.items():
            if keyword in search_text:
                return subject
        
        return Subject.XINGCE
    
    def _infer_task_type(self, task: Task) -> TaskType:
        """推断任务类型"""
        search_text = f"{task.section or ''} {task.subsection or ''}"
        
        if "课程" in search_text or "课时" in search_text:
            return TaskType.COURSE
        if "题库" in search_text or "题目" in search_text:
            return TaskType.QUESTION
        if "素材" in search_text:
            return TaskType.MATERIAL
        if "试卷" in search_text:
            return TaskType.EXAM
        
        return TaskType.COURSE
    
    def parse(self) -> List[Task]:
        """
        解析任务文件
        
        Returns:
            任务列表
        """
        # 检查缓存
        if self._is_cache_valid() and self._tasks is not None:
            return self._tasks
        
        # 读取文件
        if not self.todolist_path.exists():
            raise FileNotFoundError(f"任务文件不存在: {self.todolist_path}")
        
        self._content = self.todolist_path.read_text(encoding="utf-8")
        self._lines = self._content.split("\n")
        self._mtime = self.todolist_path.stat().st_mtime
        
        tasks: List[Task] = []
        current_section = ""
        current_subsection = ""
        last_parent_task = ""
        
        for i, line in enumerate(self._lines):
            # 检测章节标题 (## 或 ###)
            if line.startswith("## ") or line.startswith("### "):
                current_section = re.sub(r'^#+\s*', '', line).strip()
                current_subsection = ""
                continue
            
            # 检测小节标题 (#### 或 #####)
            if line.startswith("#### ") or line.startswith("##### "):
                current_subsection = re.sub(r'^#+\s*', '', line).strip()
                continue
            
            # 检测任务项 - [ ] 或 - [x] 或 - [X]
            task_match = re.match(r'^(\s*)- \[([ xX])\]\s*(.+)$', line)
            if task_match:
                indent_str, status, title = task_match.groups()
                indent = len(indent_str)
                completed = status.lower() == 'x'
                
                # 判断是否是父级任务
                if "**" in title:
                    last_parent_task = re.sub(r'\*\*', '', title).strip()
                
                task = Task(
                    line_number=i,
                    title=title.strip(),
                    completed=completed,
                    indent=indent,
                    section=current_section or None,
                    subsection=current_subsection or None,
                    parent=last_parent_task if indent > 0 else None,
                )
                
                # 推断科目和类型
                task.subject = self._infer_subject(task)
                task.task_type = self._infer_task_type(task)
                
                tasks.append(task)
        
        self._tasks = tasks
        return tasks
    
    def get_pending_tasks(self, limit: Optional[int] = None, section_filter: Optional[str] = None) -> List[Task]:
        """
        获取待处理任务
        
        Args:
            limit: 返回数量限制
            section_filter: 章节过滤
            
        Returns:
            待处理任务列表
        """
        tasks = self.parse()
        pending = [t for t in tasks if not t.completed]
        
        if section_filter:
            pending = [t for t in pending if t.section and section_filter in t.section]
        
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
        
        # 按章节统计
        for task in tasks:
            section = task.section or "未分类"
            if section not in stats.by_section:
                stats.by_section[section] = {"total": 0, "completed": 0, "pending": 0}
            
            stats.by_section[section]["total"] += 1
            if task.completed:
                stats.by_section[section]["completed"] += 1
            else:
                stats.by_section[section]["pending"] += 1
        
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
        列出所有章节
        
        Returns:
            章节列表
        """
        tasks = self.parse()
        sections = set()
        for task in tasks:
            if task.section:
                sections.add(task.section)
        return sorted(sections)
