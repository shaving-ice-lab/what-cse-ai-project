"""
课程树初始化模块

负责从 todolist.md 解析完整的课程层级结构，
通过 LLM 为每个节点生成描述信息，
并将完整的课程树导入数据库。
"""

import json
import time
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field
from loguru import logger

from .config import get_config
from .task_parser import TaskParser, CategoryNode, Subject
from .ai_client import AIClient, GenerationResult
from .db_client import DBClient
from .prompts.category import (
    CATEGORY_SYSTEM_PROMPT,
    build_category_prompt,
    build_batch_category_prompt,
    DEFAULT_DESCRIPTIONS,
)


@dataclass
class InitializationResult:
    """初始化结果"""
    success: bool
    total_categories: int = 0
    generated_count: int = 0
    imported_count: int = 0
    failed_count: int = 0
    errors: List[str] = field(default_factory=list)
    duration: float = 0


@dataclass
class CategoryDescription:
    """分类描述数据"""
    name: str
    description: str
    long_description: str
    features: List[str]
    learning_objectives: List[str]
    keywords: List[str]
    difficulty: str
    icon_suggestion: Optional[str] = None
    color_suggestion: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "long_description": self.long_description,
            "features": self.features,
            "learning_objectives": self.learning_objectives,
            "keywords": self.keywords,
            "difficulty": self.difficulty,
            "icon_suggestion": self.icon_suggestion,
            "color_suggestion": self.color_suggestion,
        }


class TreeInitializer:
    """
    课程树初始化器
    
    主要功能：
    1. 解析 todolist.md 提取完整的 6 层课程结构
    2. 为每个分类节点调用 LLM 生成描述信息
    3. 将完整的课程树导入数据库
    """
    
    def __init__(
        self,
        todolist_path: Optional[Path] = None,
        use_llm: bool = True,
        batch_size: int = 5,
        save_to_file: bool = True,
    ):
        """
        初始化
        
        Args:
            todolist_path: todolist 文件路径
            use_llm: 是否使用 LLM 生成描述（False 则使用默认模板）
            batch_size: 批量生成时每批的数量
            save_to_file: 是否保存生成的分类到本地文件
        """
        self.config = get_config()
        self.parser = TaskParser(todolist_path)
        self.ai_client = AIClient() if use_llm else None
        self.db_client = DBClient()
        self.use_llm = use_llm
        self.batch_size = batch_size
        self.save_to_file = save_to_file
        
        # 输出目录
        self.output_dir = self.config.paths.output_path / "categories"
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def parse_tree(self) -> List[CategoryNode]:
        """
        解析课程树结构
        
        Returns:
            分类节点列表（树形结构）
        """
        logger.info("开始解析课程树结构...")
        tree = self.parser.parse_category_tree()
        
        # 统计
        all_nodes = self.parser.get_all_categories_flat()
        level_counts = {}
        for node in all_nodes:
            level_counts[node.level] = level_counts.get(node.level, 0) + 1
        
        logger.info(f"解析完成，共 {len(all_nodes)} 个分类节点")
        for level, count in sorted(level_counts.items()):
            logger.info(f"  Level {level}: {count} 个")
        
        return tree
    
    def generate_description(self, node: CategoryNode, parent_name: Optional[str] = None) -> CategoryDescription:
        """
        为单个分类节点生成描述
        
        Args:
            node: 分类节点
            parent_name: 父节点名称
            
        Returns:
            分类描述数据
        """
        if not self.use_llm or self.ai_client is None:
            # 使用默认描述
            return self._get_default_description(node)
        
        # 构建提示词
        user_prompt = build_category_prompt(
            name=node.name,
            level=node.level,
            parent_name=parent_name,
            subject=node.subject,
            estimated_duration=node.estimated_duration,
        )
        
        # 调用 LLM
        result = self.ai_client.generate(
            system_prompt=CATEGORY_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            json_mode=True,
            temperature=0.7,
            max_tokens=2000,
        )
        
        if result.success and result.parsed_json:
            data = result.parsed_json
            return CategoryDescription(
                name=data.get("name", node.name),
                description=data.get("description", ""),
                long_description=data.get("long_description", ""),
                features=data.get("features", []),
                learning_objectives=data.get("learning_objectives", []),
                keywords=data.get("keywords", []),
                difficulty=data.get("difficulty", "基础"),
                icon_suggestion=data.get("icon_suggestion"),
                color_suggestion=data.get("color_suggestion"),
            )
        else:
            logger.warning(f"LLM 生成失败: {result.error}，使用默认描述")
            return self._get_default_description(node)
    
    def generate_descriptions_batch(
        self, 
        nodes: List[Tuple[CategoryNode, Optional[str]]]
    ) -> List[CategoryDescription]:
        """
        批量生成分类描述
        
        Args:
            nodes: (节点, 父节点名称) 元组列表
            
        Returns:
            描述列表
        """
        if not self.use_llm or self.ai_client is None:
            return [self._get_default_description(node) for node, _ in nodes]
        
        # 构建批量提示词
        categories = []
        for node, parent_name in nodes:
            categories.append({
                "name": node.name,
                "level": node.level,
                "parent_name": parent_name,
                "estimated_duration": node.estimated_duration,
            })
        
        user_prompt = build_batch_category_prompt(categories)
        
        result = self.ai_client.generate(
            system_prompt=CATEGORY_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            json_mode=True,
            temperature=0.7,
            max_tokens=8000,
        )
        
        if result.success and result.parsed_json:
            descriptions = []
            data_list = result.parsed_json if isinstance(result.parsed_json, list) else []
            
            for i, (node, _) in enumerate(nodes):
                if i < len(data_list):
                    data = data_list[i]
                    descriptions.append(CategoryDescription(
                        name=data.get("name", node.name),
                        description=data.get("description", ""),
                        long_description=data.get("long_description", ""),
                        features=data.get("features", []),
                        learning_objectives=data.get("learning_objectives", []),
                        keywords=data.get("keywords", []),
                        difficulty=data.get("difficulty", "基础"),
                        icon_suggestion=data.get("icon_suggestion"),
                        color_suggestion=data.get("color_suggestion"),
                    ))
                else:
                    descriptions.append(self._get_default_description(node))
            
            return descriptions
        else:
            logger.warning(f"批量 LLM 生成失败: {result.error}，使用默认描述")
            return [self._get_default_description(node) for node, _ in nodes]
    
    def _get_default_description(self, node: CategoryNode) -> CategoryDescription:
        """获取默认描述"""
        # 尝试从预定义描述中获取
        if node.subject in DEFAULT_DESCRIPTIONS:
            default = DEFAULT_DESCRIPTIONS[node.subject]
            return CategoryDescription(
                name=default.get("name", node.name),
                description=default.get("description", f"{node.name}相关课程内容"),
                long_description=default.get("long_description", f"{node.name}是公考备考的重要内容，通过系统学习可以有效提升相关能力。"),
                features=default.get("features", ["系统性强", "方法实用", "配套练习丰富"]),
                learning_objectives=default.get("learning_objectives", ["掌握核心知识点", "提升解题能力"]),
                keywords=default.get("keywords", [node.name, node.subject]),
                difficulty=default.get("difficulty", "基础"),
            )
        
        # 生成通用默认描述
        return CategoryDescription(
            name=node.name,
            description=f"{node.name}相关课程内容",
            long_description=f"{node.name}是公考备考的重要组成部分，涵盖该领域的核心知识点和解题技巧。通过系统学习，可以全面掌握相关内容，提升考试成绩。",
            features=["内容系统全面", "方法技巧实用", "配套练习丰富", "难度循序渐进"],
            learning_objectives=["掌握核心知识点", "学会常用解题方法", "提升做题速度和正确率"],
            keywords=[node.name],
            difficulty="基础",
        )
    
    def _apply_description_to_node(self, node: CategoryNode, desc: CategoryDescription):
        """将描述应用到节点"""
        node.description = desc.description
        node.long_description = desc.long_description
        node.features = desc.features
        node.learning_objectives = desc.learning_objectives
        node.keywords = desc.keywords
        node.difficulty = desc.difficulty
    
    def initialize(
        self,
        max_level: int = 5,
        subject_filter: Optional[str] = None,
        dry_run: bool = False,
    ) -> InitializationResult:
        """
        执行课程树初始化
        
        Args:
            max_level: 最大处理层级（默认到 Level 5，不处理具体课程）
            subject_filter: 科目过滤（xingce, shenlun, mianshi, gongji）
            dry_run: 试运行（不实际导入数据库）
            
        Returns:
            初始化结果
        """
        start_time = time.time()
        result = InitializationResult(success=True)
        
        logger.info("=" * 60)
        logger.info("开始课程树初始化")
        logger.info(f"  使用 LLM: {self.use_llm}")
        logger.info(f"  最大层级: {max_level}")
        logger.info(f"  科目过滤: {subject_filter or '全部'}")
        logger.info(f"  试运行: {dry_run}")
        logger.info("=" * 60)
        
        # 1. 解析课程树
        tree = self.parse_tree()
        
        # 2. 获取所有需要处理的节点
        all_nodes = []
        
        def collect_nodes(node: CategoryNode, parent_name: Optional[str] = None):
            if node.level > max_level:
                return
            if subject_filter and node.subject != subject_filter:
                return
            
            all_nodes.append((node, parent_name))
            
            for child in node.children:
                collect_nodes(child, node.name)
        
        for root in tree:
            collect_nodes(root)
        
        result.total_categories = len(all_nodes)
        logger.info(f"需要处理 {result.total_categories} 个分类节点")
        
        if result.total_categories == 0:
            logger.warning("没有找到需要处理的分类节点")
            result.success = False
            return result
        
        # 3. 生成描述信息
        logger.info("开始生成分类描述...")
        
        if self.use_llm and self.batch_size > 1:
            # 批量生成
            for i in range(0, len(all_nodes), self.batch_size):
                batch = all_nodes[i:i + self.batch_size]
                logger.info(f"处理批次 {i // self.batch_size + 1}/{(len(all_nodes) - 1) // self.batch_size + 1}")
                
                try:
                    descriptions = self.generate_descriptions_batch(batch)
                    for (node, _), desc in zip(batch, descriptions):
                        self._apply_description_to_node(node, desc)
                        result.generated_count += 1
                except Exception as e:
                    logger.error(f"批量生成失败: {e}")
                    # 降级到单个生成
                    for node, parent_name in batch:
                        try:
                            desc = self.generate_description(node, parent_name)
                            self._apply_description_to_node(node, desc)
                            result.generated_count += 1
                        except Exception as e2:
                            logger.error(f"单个生成失败 [{node.name}]: {e2}")
                            result.failed_count += 1
                            result.errors.append(f"{node.name}: {str(e2)}")
                
                # 避免 API 限流
                if self.use_llm and i + self.batch_size < len(all_nodes):
                    time.sleep(1)
        else:
            # 单个生成
            for i, (node, parent_name) in enumerate(all_nodes):
                logger.info(f"处理 [{i + 1}/{len(all_nodes)}] {node.name}")
                
                try:
                    desc = self.generate_description(node, parent_name)
                    self._apply_description_to_node(node, desc)
                    result.generated_count += 1
                except Exception as e:
                    logger.error(f"生成失败 [{node.name}]: {e}")
                    result.failed_count += 1
                    result.errors.append(f"{node.name}: {str(e)}")
                
                # 避免 API 限流
                if self.use_llm and i + 1 < len(all_nodes):
                    time.sleep(0.5)
        
        logger.info(f"描述生成完成: 成功 {result.generated_count}, 失败 {result.failed_count}")
        
        # 4. 保存到本地文件
        if self.save_to_file:
            self._save_to_file(tree)
        
        # 5. 导入数据库
        if not dry_run:
            logger.info("开始导入数据库...")
            import_result = self._import_to_database(all_nodes)
            result.imported_count = import_result.get("imported", 0)
            if not import_result.get("success", False):
                result.errors.append(f"数据库导入失败: {import_result.get('error', '未知错误')}")
        else:
            logger.info("试运行模式，跳过数据库导入")
        
        result.duration = time.time() - start_time
        logger.info("=" * 60)
        logger.info(f"课程树初始化完成")
        logger.info(f"  总分类数: {result.total_categories}")
        logger.info(f"  生成成功: {result.generated_count}")
        logger.info(f"  导入成功: {result.imported_count}")
        logger.info(f"  失败数量: {result.failed_count}")
        logger.info(f"  总耗时: {result.duration:.2f}秒")
        logger.info("=" * 60)
        
        return result
    
    def _save_to_file(self, tree: List[CategoryNode]):
        """保存分类树到本地文件"""
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        
        # 保存完整树结构
        tree_file = self.output_dir / f"category_tree_{timestamp}.json"
        tree_data = [node.to_dict() for node in tree]
        with open(tree_file, "w", encoding="utf-8") as f:
            json.dump(tree_data, f, ensure_ascii=False, indent=2)
        logger.info(f"保存课程树到: {tree_file}")
        
        # 保存扁平列表（用于导入）
        flat_file = self.output_dir / f"category_flat_{timestamp}.json"
        all_nodes = []
        for root in tree:
            all_nodes.extend(root.flatten())
        
        flat_data = []
        for node in all_nodes:
            flat_data.append({
                "code": node.code,
                "name": node.name,
                "level": node.level,
                "parent_code": node.parent_code,
                "subject": node.subject,
                "task_type": node.task_type,
                "sort_order": node.sort_order,
                "estimated_duration": node.estimated_duration,
                "description": node.description,
                "long_description": node.long_description,
                "features": node.features,
                "learning_objectives": node.learning_objectives,
                "keywords": node.keywords,
                "difficulty": node.difficulty,
            })
        
        with open(flat_file, "w", encoding="utf-8") as f:
            json.dump(flat_data, f, ensure_ascii=False, indent=2)
        logger.info(f"保存扁平列表到: {flat_file}")
    
    def _import_to_database(self, nodes: List[Tuple[CategoryNode, Optional[str]]]) -> Dict[str, Any]:
        """导入分类到数据库"""
        try:
            # 准备导入数据
            categories = []
            for node, _ in nodes:
                categories.append({
                    "code": node.code,
                    "name": node.name,
                    "level": node.level,
                    "parent_code": node.parent_code,
                    "subject": node.subject,
                    "task_type": node.task_type,
                    "sort_order": node.sort_order,
                    "estimated_duration": node.estimated_duration,
                    "description": node.description,
                    "long_description": node.long_description,
                    "features": node.features,
                    "learning_objectives": node.learning_objectives,
                    "keywords": node.keywords,
                    "difficulty": node.difficulty,
                })
            
            # 调用 API 导入
            result = self.db_client.import_category_tree(categories)
            return result
            
        except Exception as e:
            logger.error(f"数据库导入异常: {e}")
            return {"success": False, "error": str(e)}
    
    def show_tree(self, max_level: int = 5) -> str:
        """
        显示课程树结构
        
        Args:
            max_level: 最大显示层级
            
        Returns:
            树形结构字符串
        """
        return self.parser.print_tree(max_level)
