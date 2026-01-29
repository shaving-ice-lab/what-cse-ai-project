"""
内容生成器模块 - 根据任务类型生成对应内容
"""

import json
import time
import re
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, List, Callable
from loguru import logger
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn

from .config import get_config, Config
from .task_parser import Task, TaskType, TaskParser, TaskStats
from .ai_client import AIClient, GenerationResult
from .prompts import get_course_prompt, get_question_prompt, get_material_prompt
from .db_client import DBClient, ImportResult


console = Console()


@dataclass
class WordCountStats:
    """字数统计"""
    total_chars: int = 0
    chinese_chars: int = 0
    english_words: int = 0
    numbers: int = 0
    
    @property
    def formatted(self) -> str:
        return f"[Words] {self.chinese_chars} 中文字 | {self.english_words} 英文词 | {self.total_chars} 总字符"


@dataclass
class SaveResult:
    """保存结果"""
    success: bool
    filepath: Optional[Path] = None
    filename: Optional[str] = None
    word_count: Optional[WordCountStats] = None
    error: Optional[str] = None


@dataclass
class GenerationProgress:
    """生成进度"""
    task_title: str
    stats: TaskStats
    word_count: Optional[WordCountStats] = None
    status: str = "generating"
    
    @property
    def progress_bar(self) -> str:
        return self.stats.progress_bar
    
    @property
    def display(self) -> str:
        status_icons = {
            "starting": "[>]",
            "generating": "[...]",
            "saving": "[S]",
            "completed": "[OK]",
            "error": "[X]",
        }
        icon = status_icons.get(self.status, "[...]")
        
        lines = [
            f"\n+--------------------------------------------------------------+",
            f"|  [Progress] 生成进度: {self.progress_bar} {self.stats.completed}/{self.stats.total} ({self.stats.percent:.0f}%)",
            f"|  [Task] 当前任务: {self.task_title[:40]}{'...' if len(self.task_title) > 40 else ''}",
        ]
        
        if self.word_count:
            lines.append(f"|  {self.word_count.formatted}")
        
        lines.extend([
            f"|  {icon} 状态: {self.status}",
            f"|  [Pending] 待处理: {self.stats.pending} 个任务",
            f"+--------------------------------------------------------------+",
        ])
        
        return "\n".join(lines)


class ContentGenerator:
    """内容生成器"""
    
    def __init__(
        self,
        config: Optional[Config] = None,
        task_parser: Optional[TaskParser] = None,
        ai_client: Optional[AIClient] = None,
        db_client: Optional[DBClient] = None,
        save_to_db: bool = True,
        save_to_file: bool = False,
    ):
        """
        初始化生成器
        
        Args:
            config: 配置对象
            task_parser: 任务解析器
            ai_client: AI 客户端
            db_client: 数据库客户端
            save_to_db: 是否保存到数据库（默认True）
            save_to_file: 是否保存到文件（默认False）
        """
        self.config = config or get_config()
        self.task_parser = task_parser or TaskParser()
        self.ai_client = ai_client or AIClient()
        self.db_client = db_client or DBClient()
        self.save_to_db = save_to_db
        self.save_to_file = save_to_file
        
        # 如果需要保存到文件，确保输出目录存在
        if self.save_to_file:
            self.config.ensure_output_dirs()
        
        # 回调函数
        self.on_progress: Optional[Callable[[GenerationProgress], None]] = None
    
    @staticmethod
    def count_words(obj: Any) -> WordCountStats:
        """统计字数"""
        text = json.dumps(obj, ensure_ascii=False) if not isinstance(obj, str) else obj
        
        chinese_chars = len(re.findall(r'[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]', text))
        english_words = len(re.findall(r'[a-zA-Z]+', text))
        numbers = len(re.findall(r'\d+', text))
        clean_text = re.sub(r'[{}\[\]":,]', '', text)
        total_chars = len(clean_text)
        
        return WordCountStats(
            total_chars=total_chars,
            chinese_chars=chinese_chars,
            english_words=english_words,
            numbers=numbers,
        )
    
    @staticmethod
    def generate_filename(
        prefix: str,
        parts: List[Optional[str]],
        suffix: str,
    ) -> str:
        """生成文件名"""
        safe_parts = []
        for p in parts:
            if p and p != '-':
                # 清理特殊字符
                clean = re.sub(r'[^a-zA-Z0-9\u4e00-\u9fa5.-]+', '-', p)
                clean = re.sub(r'-+', '-', clean)
                clean = clean.strip('-')[:20]
                if clean:
                    safe_parts.append(clean)
        
        name = '-'.join([prefix] + safe_parts)
        return f"{name}-{suffix}.json"
    
    def _get_task_order(self, task: Task, task_type: TaskType) -> int:
        """获取任务顺序号"""
        tasks = self.task_parser.parse()
        order = 0
        for t in tasks:
            if t.task_type == task_type:
                order += 1
                if t.line_number == task.line_number:
                    return order
        return 0
    
    def generate_course(
        self,
        task: Task,
        special_requirements: Optional[str] = None,
    ) -> GenerationResult:
        """
        生成课程内容
        
        Args:
            task: 任务对象
            special_requirements: 特殊要求
            
        Returns:
            生成结果
        """
        prompts = get_course_prompt(task, special_requirements)
        return self.ai_client.generate(
            system_prompt=prompts["system_prompt"],
            user_prompt=prompts["user_prompt"],
            json_mode=True,
        )
    
    def generate_questions(
        self,
        task: Task,
        category: Optional[str] = None,
        topic: Optional[str] = None,
        special_requirements: Optional[str] = None,
    ) -> GenerationResult:
        """
        生成题目内容
        
        Args:
            task: 任务对象
            category: 大类
            topic: 题型
            special_requirements: 特殊要求
            
        Returns:
            生成结果
        """
        prompts = get_question_prompt(task, category, topic, special_requirements)
        return self.ai_client.generate(
            system_prompt=prompts["system_prompt"],
            user_prompt=prompts["user_prompt"],
            json_mode=True,
        )
    
    def generate_materials(
        self,
        task: Task,
        category: Optional[str] = None,
        topic: Optional[str] = None,
        material_type: str = "quote",
        special_requirements: Optional[str] = None,
    ) -> GenerationResult:
        """
        生成素材内容
        
        Args:
            task: 任务对象
            category: 大类
            topic: 主题
            material_type: 素材类型
            special_requirements: 特殊要求
            
        Returns:
            生成结果
        """
        prompts = get_material_prompt(task, category, topic, material_type, special_requirements)
        return self.ai_client.generate(
            system_prompt=prompts["system_prompt"],
            user_prompt=prompts["user_prompt"],
            json_mode=True,
        )
    
    def save_course(
        self,
        task: Task,
        content: Dict[str, Any],
        auto_mark_complete: bool = True,
    ) -> SaveResult:
        """
        保存课程内容（支持直接导入数据库或保存到文件）
        
        Args:
            task: 任务对象
            content: 课程内容
            auto_mark_complete: 是否自动标记完成
            
        Returns:
            保存结果
        """
        try:
            # 获取任务顺序
            order = self._get_task_order(task, TaskType.COURSE)
            
            # 构建元数据
            metadata = {
                "generated_at": datetime.now().isoformat(),
                "line_number": task.line_number,
                "lesson_order": order,
                "section": task.section,
                "subsection": task.subsection,
                "parent_title": task.parent,
                "is_sub_lesson": task.indent > 0 and task.parent is not None,
            }
            
            # 统计字数
            word_count = self.count_words(content)
            
            filepath = None
            filename = None
            
            # 保存到数据库
            if self.save_to_db:
                import_result = self.db_client.import_course_lesson(content, metadata)
                if not import_result.success:
                    logger.error(f"导入数据库失败: {import_result.error}")
                    return SaveResult(success=False, error=import_result.error)
                logger.info(f"课程已导入数据库: {import_result.data}")
            
            # 保存到文件（可选）
            if self.save_to_file:
                order_prefix = str(order).zfill(3)
                filename = self.generate_filename(
                    order_prefix,
                    [
                        task.section,
                        task.subsection,
                        content.get("chapter_title", task.clean_title),
                    ],
                    str(int(time.time())),
                )
                
                content_with_metadata = {"_metadata": metadata, **content}
                filepath = self.config.paths.courses_dir / filename
                filepath.write_text(
                    json.dumps(content_with_metadata, ensure_ascii=False, indent=2),
                    encoding="utf-8",
                )
            
            # 标记任务完成
            if auto_mark_complete:
                self.task_parser.mark_complete(task.line_number)
            
            return SaveResult(
                success=True,
                filepath=filepath,
                filename=filename or f"course_{task.line_number}",
                word_count=word_count,
            )
            
        except Exception as e:
            logger.error(f"保存课程失败: {e}")
            return SaveResult(success=False, error=str(e))
    
    def save_questions(
        self,
        task: Task,
        batch_info: Dict[str, Any],
        questions: List[Dict[str, Any]],
        auto_mark_complete: bool = True,
    ) -> SaveResult:
        """
        保存题目内容（支持直接导入数据库或保存到文件）
        
        Args:
            task: 任务对象
            batch_info: 批次信息
            questions: 题目列表
            auto_mark_complete: 是否自动标记完成
            
        Returns:
            保存结果
        """
        try:
            # 获取任务顺序
            order = self._get_task_order(task, TaskType.QUESTION)
            
            # 统计字数
            word_count = self.count_words({"batch_info": batch_info, "questions": questions})
            
            filepath = None
            filename = None
            
            # 保存到数据库
            if self.save_to_db:
                import_result = self.db_client.import_questions(batch_info, questions)
                if not import_result.success:
                    logger.error(f"导入数据库失败: {import_result.error}")
                    return SaveResult(success=False, error=import_result.error)
                logger.info(f"题目已导入数据库: {import_result.data}")
            
            # 保存到文件（可选）
            if self.save_to_file:
                order_prefix = str(order).zfill(3)
                filename = self.generate_filename(
                    order_prefix,
                    [
                        task.section,
                        batch_info.get("category"),
                        batch_info.get("topic"),
                    ],
                    f"batch{batch_info.get('batch_number', 1)}",
                )
                
                content = {
                    "_metadata": {
                        "generated_at": datetime.now().isoformat(),
                        "line_number": task.line_number,
                        "task_order": order,
                        "section": task.section,
                        "subsection": task.subsection,
                    },
                    "batch_info": batch_info,
                    "questions": questions,
                }
                
                filepath = self.config.paths.questions_dir / filename
                filepath.write_text(
                    json.dumps(content, ensure_ascii=False, indent=2),
                    encoding="utf-8",
                )
            
            # 标记任务完成
            if auto_mark_complete:
                self.task_parser.mark_complete(task.line_number)
            
            return SaveResult(
                success=True,
                filepath=filepath,
                filename=filename or f"questions_{task.line_number}",
                word_count=word_count,
            )
            
        except Exception as e:
            logger.error(f"保存题目失败: {e}")
            return SaveResult(success=False, error=str(e))
    
    def save_materials(
        self,
        task: Task,
        batch_info: Dict[str, Any],
        materials: List[Dict[str, Any]],
        auto_mark_complete: bool = True,
    ) -> SaveResult:
        """
        保存素材内容（支持直接导入数据库或保存到文件）
        
        Args:
            task: 任务对象
            batch_info: 批次信息
            materials: 素材列表
            auto_mark_complete: 是否自动标记完成
            
        Returns:
            保存结果
        """
        try:
            # 获取任务顺序
            order = self._get_task_order(task, TaskType.MATERIAL)
            
            # 统计字数
            word_count = self.count_words({"batch_info": batch_info, "materials": materials})
            
            filepath = None
            filename = None
            
            # 保存到数据库
            if self.save_to_db:
                import_result = self.db_client.import_materials(batch_info, materials)
                if not import_result.success:
                    logger.error(f"导入数据库失败: {import_result.error}")
                    return SaveResult(success=False, error=import_result.error)
                logger.info(f"素材已导入数据库: {import_result.data}")
            
            # 保存到文件（可选）
            if self.save_to_file:
                order_prefix = str(order).zfill(3)
                filename = self.generate_filename(
                    order_prefix,
                    [
                        task.section,
                        batch_info.get("category"),
                        batch_info.get("topic"),
                    ],
                    f"batch{batch_info.get('batch_number', 1)}",
                )
                
                content = {
                    "_metadata": {
                        "generated_at": datetime.now().isoformat(),
                        "line_number": task.line_number,
                        "task_order": order,
                        "section": task.section,
                        "subsection": task.subsection,
                    },
                    "batch_info": batch_info,
                    "materials": materials,
                }
                
                filepath = self.config.paths.materials_dir / filename
                filepath.write_text(
                    json.dumps(content, ensure_ascii=False, indent=2),
                    encoding="utf-8",
                )
            
            # 标记任务完成
            if auto_mark_complete:
                self.task_parser.mark_complete(task.line_number)
            
            return SaveResult(
                success=True,
                filepath=filepath,
                filename=filename or f"materials_{task.line_number}",
                word_count=word_count,
            )
            
        except Exception as e:
            logger.error(f"保存素材失败: {e}")
            return SaveResult(success=False, error=str(e))
    
    def process_task(
        self,
        task: Task,
        auto_mark_complete: bool = True,
    ) -> Dict[str, Any]:
        """
        处理单个任务
        
        Args:
            task: 任务对象
            auto_mark_complete: 是否自动标记完成
            
        Returns:
            处理结果
        """
        stats = self.task_parser.get_stats()
        
        # 显示进度
        if self.on_progress:
            self.on_progress(GenerationProgress(
                task_title=task.clean_title,
                stats=stats,
                status="starting",
            ))
        
        console.print(f"\n[>] 开始生成: [bold cyan]{task.clean_title}[/bold cyan]")
        console.print(f"   类型: {task.task_type.value} | 科目: {task.subject.value}")
        
        # 根据任务类型生成内容
        if task.task_type == TaskType.COURSE:
            result = self.generate_course(task)
            if result.success and result.parsed_json:
                save_result = self.save_course(
                    task,
                    result.parsed_json,
                    auto_mark_complete,
                )
            else:
                return {
                    "success": False,
                    "error": result.error or "生成失败",
                    "task": task.to_dict(),
                }
                
        elif task.task_type == TaskType.QUESTION:
            result = self.generate_questions(task)
            if result.success and result.parsed_json:
                save_result = self.save_questions(
                    task,
                    result.parsed_json.get("batch_info", {}),
                    result.parsed_json.get("questions", []),
                    auto_mark_complete,
                )
            else:
                return {
                    "success": False,
                    "error": result.error or "生成失败",
                    "task": task.to_dict(),
                }
                
        elif task.task_type == TaskType.MATERIAL:
            result = self.generate_materials(task)
            if result.success and result.parsed_json:
                save_result = self.save_materials(
                    task,
                    result.parsed_json.get("batch_info", {}),
                    result.parsed_json.get("materials", []),
                    auto_mark_complete,
                )
            else:
                return {
                    "success": False,
                    "error": result.error or "生成失败",
                    "task": task.to_dict(),
                }
        else:
            return {
                "success": False,
                "error": f"不支持的任务类型: {task.task_type}",
                "task": task.to_dict(),
            }
        
        if not save_result.success:
            return {
                "success": False,
                "error": save_result.error,
                "task": task.to_dict(),
            }
        
        # 更新统计
        stats = self.task_parser.get_stats()
        
        # 显示完成进度
        if self.on_progress:
            self.on_progress(GenerationProgress(
                task_title=task.clean_title,
                stats=stats,
                word_count=save_result.word_count,
                status="completed",
            ))
        
        console.print(f"[OK] 已保存: [green]{save_result.filename}[/green]")
        if save_result.word_count:
            console.print(f"   {save_result.word_count.formatted}")
        console.print(f"   进度: {stats.progress_bar} {stats.completed}/{stats.total} ({stats.percent:.0f}%)")
        
        return {
            "success": True,
            "task": task.to_dict(),
            "filepath": str(save_result.filepath),
            "filename": save_result.filename,
            "word_count": {
                "chinese_chars": save_result.word_count.chinese_chars if save_result.word_count else 0,
                "english_words": save_result.word_count.english_words if save_result.word_count else 0,
                "total_chars": save_result.word_count.total_chars if save_result.word_count else 0,
            },
            "usage": result.usage,
            "duration": result.duration,
            "progress": {
                "completed": stats.completed,
                "pending": stats.pending,
                "total": stats.total,
                "percent": stats.percent,
            },
        }
    
    def run_continuous(
        self,
        max_tasks: int = 10,
        section_filter: Optional[str] = None,
        auto_mark_complete: bool = True,
    ) -> List[Dict[str, Any]]:
        """
        持续生成模式
        
        Args:
            max_tasks: 最大任务数
            section_filter: 章节过滤
            auto_mark_complete: 是否自动标记完成
            
        Returns:
            所有任务的处理结果
        """
        results = []
        
        console.print(f"\n[bold green][>] 开始持续生成模式[/bold green]")
        console.print(f"   最大任务数: {max_tasks}")
        if section_filter:
            console.print(f"   章节过滤: {section_filter}")
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TaskProgressColumn(),
            console=console,
        ) as progress:
            task_id = progress.add_task("生成进度", total=max_tasks)
            
            for i in range(max_tasks):
                # 获取下一个任务
                pending_tasks = self.task_parser.get_pending_tasks(
                    limit=1,
                    section_filter=section_filter,
                )
                
                if not pending_tasks:
                    console.print("\n[bold green][Done] 所有任务已完成！[/bold green]")
                    break
                
                task = pending_tasks[0]
                
                # 处理任务
                result = self.process_task(task, auto_mark_complete)
                results.append(result)
                
                progress.update(task_id, advance=1)
                
                if not result["success"]:
                    console.print(f"\n[bold red][FAIL] 任务失败: {result['error']}[/bold red]")
                    break
        
        # 显示总结
        console.print(f"\n[bold][Summary] 生成完成[/bold]")
        console.print(f"   成功: {len([r for r in results if r['success']])} 个")
        console.print(f"   失败: {len([r for r in results if not r['success']])} 个")
        
        return results
