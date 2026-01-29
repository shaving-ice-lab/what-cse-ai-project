"""
命令行界面模块
"""

import sys
from pathlib import Path
from typing import Optional
import typer
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.syntax import Syntax
from loguru import logger

from .config import get_config, reload_config
from .task_parser import TaskParser, TaskType
from .content_generator import ContentGenerator
from .db_client import DBClient

# 配置 loguru
logger.remove()
logger.add(
    sys.stderr,
    format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{message}</cyan>",
    level="INFO",
)

app = typer.Typer(
    name="公考内容生成器",
    help="使用 AI API 生成公考学习内容",
    add_completion=False,
)

console = Console()


def print_banner():
    """打印横幅"""
    banner = """
+--------------------------------------------------------------+
|                    [*] 公考内容生成器 v1.0                    |
|                   Python API 版 - 快速生成                    |
+--------------------------------------------------------------+
    """
    console.print(banner, style="bold cyan")


def check_api_key() -> bool:
    """检查 API 密钥是否已配置"""
    config = get_config()
    if not config.validate_api_key():
        console.print(
            Panel(
                "[bold red]错误：API 密钥未配置！[/bold red]\n\n"
                "请按以下步骤配置：\n"
                "1. 复制 .env.example 为 .env\n"
                "2. 在 .env 中设置 OPENAI_API_KEY\n"
                "3. 可选：配置 OPENAI_BASE_URL 和 MODEL_NAME",
                title="配置错误",
                border_style="red",
            )
        )
        return False
    return True


def check_backend_connection(save_to_db: bool = True) -> bool:
    """检查后端服务连接"""
    if not save_to_db:
        return True
    
    config = get_config()
    client = DBClient()
    
    console.print(f"正在检查后端服务连接: {config.api.backend_url}...")
    
    if not client.check_connection():
        console.print(
            Panel(
                "[bold red]错误：后端服务未启动！[/bold red]\n\n"
                f"无法连接到: {config.api.backend_url}\n\n"
                "请确保后端服务已启动：\n"
                "  cd apps/server && go run main.go\n\n"
                "或者使用 --file 参数保存到文件：\n"
                "  python -m content_generator generate --file",
                title="连接错误",
                border_style="red",
            )
        )
        return False
    
    console.print("[green][OK] 后端服务连接正常[/green]")
    return True


@app.command("config")
def show_config():
    """显示当前配置"""
    print_banner()
    
    config = get_config()
    
    table = Table(title="当前配置", show_header=True, header_style="bold magenta")
    table.add_column("配置项", style="cyan")
    table.add_column("值", style="green")
    
    table.add_row("API Base URL", config.api.base_url)
    # 多模型显示
    if config.api.models:
        table.add_row("模型列表", config.api.model_list_str)
        table.add_row("模型数量", str(config.api.model_count))
        strategy_names = {
            "round_robin": "轮换 (round_robin)",
            "random": "随机 (random)",
            "primary_fallback": "主备 (primary_fallback)"
        }
        table.add_row("选择策略", strategy_names.get(config.api.model_strategy, config.api.model_strategy))
    else:
        table.add_row("模型", config.api.model)
    table.add_row("API Key", "已配置 [OK]" if config.validate_api_key() else "未配置 [X]")
    table.add_row("最大 Tokens", str(config.api.max_tokens))
    table.add_row("Temperature", str(config.api.temperature))
    table.add_row("", "")
    table.add_row("项目根目录", str(config.paths.project_root))
    table.add_row("任务文件", str(config.paths.todolist_path))
    table.add_row("输出目录", str(config.paths.output_path))
    table.add_row("", "")
    table.add_row("并发任务数", str(config.generation.concurrent_tasks))
    table.add_row("批量大小", str(config.generation.batch_size))
    
    console.print(table)


@app.command("progress")
def show_progress():
    """显示任务进度"""
    print_banner()
    
    config = get_config()
    parser = TaskParser()
    
    try:
        stats = parser.get_stats()
    except FileNotFoundError as e:
        console.print(f"[red]错误: {e}[/red]")
        raise typer.Exit(1)
    
    # 总体进度
    console.print(Panel(
        f"[bold]总进度: {stats.progress_bar} {stats.completed}/{stats.total} ({stats.percent:.1f}%)[/bold]\n"
        f"已完成: [green]{stats.completed}[/green] | 待处理: [yellow]{stats.pending}[/yellow]",
        title="[Progress] 任务进度",
        border_style="blue",
    ))
    
    # 按章节统计
    table = Table(title="按章节统计", show_header=True, header_style="bold magenta")
    table.add_column("章节", style="cyan", max_width=40)
    table.add_column("已完成", justify="right", style="green")
    table.add_column("待处理", justify="right", style="yellow")
    table.add_column("总数", justify="right")
    table.add_column("进度", justify="right")
    
    for section, data in stats.by_section.items():
        percent = (data["completed"] / data["total"] * 100) if data["total"] > 0 else 0
        table.add_row(
            section[:40],
            str(data["completed"]),
            str(data["pending"]),
            str(data["total"]),
            f"{percent:.0f}%",
        )
    
    console.print(table)
    console.print(f"\n任务文件: [dim]{config.paths.todolist_path}[/dim]")


@app.command("list")
def list_tasks(
    limit: int = typer.Option(10, "--limit", "-n", help="显示数量"),
    section: Optional[str] = typer.Option(None, "--section", "-s", help="按章节过滤"),
    show_completed: bool = typer.Option(False, "--completed", "-c", help="显示已完成任务"),
):
    """列出待处理任务"""
    print_banner()
    
    parser = TaskParser()
    
    try:
        tasks = parser.parse()
    except FileNotFoundError as e:
        console.print(f"[red]错误: {e}[/red]")
        raise typer.Exit(1)
    
    # 过滤
    if not show_completed:
        tasks = [t for t in tasks if not t.completed]
    
    if section:
        tasks = [t for t in tasks if t.section and section in t.section]
    
    tasks = tasks[:limit]
    
    if not tasks:
        console.print("[yellow]没有找到符合条件的任务[/yellow]")
        return
    
    table = Table(title=f"任务列表 (显示 {len(tasks)} 个)", show_header=True, header_style="bold magenta")
    table.add_column("行号", justify="right", style="dim")
    table.add_column("状态", justify="center")
    table.add_column("类型", style="cyan")
    table.add_column("标题", max_width=50)
    table.add_column("章节", style="dim", max_width=20)
    
    for task in tasks:
        status = "[OK]" if task.completed else "[ ]"
        table.add_row(
            str(task.line_number + 1),
            status,
            task.task_type.value,
            task.clean_title[:50],
            (task.section or "")[:20],
        )
    
    console.print(table)


@app.command("sections")
def list_sections():
    """列出所有章节"""
    print_banner()
    
    parser = TaskParser()
    
    try:
        sections = parser.list_sections()
    except FileNotFoundError as e:
        console.print(f"[red]错误: {e}[/red]")
        raise typer.Exit(1)
    
    console.print(Panel(
        "\n".join([f"  • {s}" for s in sections]),
        title="[Sections] 所有章节",
        border_style="blue",
    ))


@app.command("generate")
def generate_single(
    line_number: Optional[int] = typer.Option(None, "--line", "-l", help="指定任务行号"),
    no_mark: bool = typer.Option(False, "--no-mark", help="不自动标记完成"),
    save_file: bool = typer.Option(False, "--file", "-f", help="保存到文件而不是数据库"),
    save_both: bool = typer.Option(False, "--both", "-b", help="同时保存到数据库和文件"),
):
    """生成单个任务（默认直接导入数据库）"""
    print_banner()
    
    if not check_api_key():
        raise typer.Exit(1)
    
    # 确定保存模式
    save_to_db = not save_file or save_both
    save_to_file = save_file or save_both
    
    # 检查后端连接
    if not check_backend_connection(save_to_db):
        raise typer.Exit(1)
    
    parser = TaskParser()
    generator = ContentGenerator(save_to_db=save_to_db, save_to_file=save_to_file)
    
    try:
        if line_number is not None:
            # 查找指定行号的任务
            tasks = parser.parse()
            task = next((t for t in tasks if t.line_number == line_number), None)
            if not task:
                console.print(f"[red]错误: 找不到行号 {line_number} 的任务[/red]")
                raise typer.Exit(1)
        else:
            # 获取下一个待处理任务
            task = parser.get_next_task()
            if not task:
                console.print("[green][Done] 所有任务已完成！[/green]")
                return
        
        save_mode = "数据库" if save_to_db else "文件"
        if save_both:
            save_mode = "数据库 + 文件"
        
        console.print(Panel(
            f"[bold]{task.clean_title}[/bold]\n\n"
            f"类型: {task.task_type.value}\n"
            f"科目: {task.subject.value}\n"
            f"章节: {task.section or '无'}\n"
            f"小节: {task.subsection or '无'}\n"
            f"保存到: {save_mode}",
            title="[Task] 即将生成",
            border_style="cyan",
        ))
        
        # 确认
        if not typer.confirm("确认开始生成？"):
            console.print("[yellow]已取消[/yellow]")
            return
        
        # 生成
        result = generator.process_task(task, auto_mark_complete=not no_mark)
        
        if result["success"]:
            console.print(Panel(
                f"[green][OK] 生成成功！[/green]\n\n"
                f"文件: {result['filename']}\n"
                f"字数: {result['word_count']['chinese_chars']} 中文字\n"
                f"耗时: {result['duration']:.1f} 秒",
                title="完成",
                border_style="green",
            ))
        else:
            console.print(Panel(
                f"[red][FAIL] 生成失败[/red]\n\n"
                f"错误: {result['error']}",
                title="失败",
                border_style="red",
            ))
            raise typer.Exit(1)
            
    except FileNotFoundError as e:
        console.print(f"[red]错误: {e}[/red]")
        raise typer.Exit(1)


@app.command("run")
def run_continuous(
    max_tasks: int = typer.Option(5, "--max", "-m", help="最大任务数"),
    section: Optional[str] = typer.Option(None, "--section", "-s", help="按章节过滤"),
    no_mark: bool = typer.Option(False, "--no-mark", help="不自动标记完成"),
    save_file: bool = typer.Option(False, "--file", "-f", help="保存到文件而不是数据库"),
    save_both: bool = typer.Option(False, "--both", "-b", help="同时保存到数据库和文件"),
    yes: bool = typer.Option(False, "--yes", "-y", help="跳过确认直接开始"),
):
    """持续生成模式（默认直接导入数据库）"""
    print_banner()
    
    if not check_api_key():
        raise typer.Exit(1)
    
    # 确定保存模式
    save_to_db = not save_file or save_both
    save_to_file = save_file or save_both
    
    # 检查后端连接
    if not check_backend_connection(save_to_db):
        raise typer.Exit(1)
    
    generator = ContentGenerator(save_to_db=save_to_db, save_to_file=save_to_file)
    
    save_mode = "数据库" if save_to_db else "文件"
    if save_both:
        save_mode = "数据库 + 文件"
    
    console.print(Panel(
        f"[bold]持续生成模式[/bold]\n\n"
        f"最大任务数: {max_tasks}\n"
        f"章节过滤: {section or '无'}\n"
        f"自动标记: {'否' if no_mark else '是'}\n"
        f"保存到: {save_mode}",
        title="[Start] 启动配置",
        border_style="cyan",
    ))
    
    # 确认（如果传入 -y 则跳过）
    if not yes and not typer.confirm("确认开始？"):
        console.print("[yellow]已取消[/yellow]")
        return
    
    try:
        results = generator.run_continuous(
            max_tasks=max_tasks,
            section_filter=section,
            auto_mark_complete=not no_mark,
        )
        
        # 显示总结
        success_count = len([r for r in results if r["success"]])
        fail_count = len([r for r in results if not r["success"]])
        
        if fail_count > 0:
            console.print(f"\n[yellow]警告: {fail_count} 个任务失败[/yellow]")
            raise typer.Exit(1)
            
    except KeyboardInterrupt:
        console.print("\n[yellow]用户中断[/yellow]")
        raise typer.Exit(130)
    except FileNotFoundError as e:
        console.print(f"[red]错误: {e}[/red]")
        raise typer.Exit(1)


@app.command("mark")
def mark_complete(
    line_number: int = typer.Argument(..., help="任务行号"),
):
    """手动标记任务完成"""
    print_banner()
    
    parser = TaskParser()
    
    try:
        success = parser.mark_complete(line_number)
        
        if success:
            console.print(f"[green][OK] 已标记任务完成 (行 {line_number + 1})[/green]")
        else:
            console.print(f"[red][FAIL] 无法标记任务 (行 {line_number + 1})[/red]")
            raise typer.Exit(1)
            
    except FileNotFoundError as e:
        console.print(f"[red]错误: {e}[/red]")
        raise typer.Exit(1)


@app.command("set-file")
def set_todolist_file(
    file_path: str = typer.Argument(..., help="任务文件路径"),
):
    """切换任务文件"""
    print_banner()
    
    config = get_config()
    
    # 检查文件是否存在
    if Path(file_path).is_absolute():
        full_path = Path(file_path)
    else:
        full_path = config.paths.project_root / file_path
    
    if not full_path.exists():
        console.print(f"[red]错误: 文件不存在 {full_path}[/red]")
        raise typer.Exit(1)
    
    # 更新环境变量（仅在当前会话有效）
    import os
    os.environ["TODOLIST_FILE"] = file_path
    
    # 重新加载配置
    reload_config()
    
    console.print(f"[green][OK] 已切换到: {full_path}[/green]")
    
    # 显示新文件的统计
    parser = TaskParser()
    stats = parser.get_stats()
    console.print(f"\n任务统计: {stats.completed}/{stats.total} 已完成 ({stats.percent:.1f}%)")


@app.command("test-api")
def test_api():
    """测试 API 连接"""
    print_banner()
    
    if not check_api_key():
        raise typer.Exit(1)
    
    config = get_config()
    
    console.print(f"正在测试连接到 {config.api.base_url}...")
    if config.api.models:
        console.print(f"配置的模型: {config.api.model_list_str}")
        console.print(f"选择策略: {config.api.model_strategy}")
    else:
        console.print(f"使用模型: {config.api.model}")
    
    from .ai_client import AIClient
    
    client = AIClient()
    
    try:
        result = client.generate(
            system_prompt="你是一个测试助手。",
            user_prompt="请回复 'API 连接成功！' 这几个字。",
            json_mode=False,
            max_tokens=50,
        )
        
        if result.success:
            console.print(Panel(
                f"[green][OK] API 连接成功！[/green]\n\n"
                f"实际使用模型: {result.model_used}\n"
                f"响应: {result.content}\n"
                f"耗时: {result.duration:.2f} 秒\n"
                f"Token 使用: {result.usage}",
                title="测试结果",
                border_style="green",
            ))
        else:
            console.print(Panel(
                f"[red][FAIL] API 连接失败[/red]\n\n"
                f"尝试使用模型: {result.model_used}\n"
                f"错误: {result.error}",
                title="测试结果",
                border_style="red",
            ))
            raise typer.Exit(1)
            
    except Exception as e:
        console.print(f"[red]错误: {e}[/red]")
        raise typer.Exit(1)


# =====================================================
# 课程树初始化命令
# =====================================================

@app.command("init-tree")
def init_tree(
    max_level: int = typer.Option(5, "--max-level", "-l", help="最大处理层级 (1-6)"),
    subject: Optional[str] = typer.Option(None, "--subject", "-s", help="科目过滤 (xingce/shenlun/mianshi/gongji)"),
    use_llm: bool = typer.Option(True, "--use-llm/--no-llm", help="是否使用 LLM 生成描述"),
    dry_run: bool = typer.Option(False, "--dry-run", "-n", help="试运行（不导入数据库）"),
    batch_size: int = typer.Option(5, "--batch-size", "-b", help="批量生成时每批数量"),
):
    """
    初始化课程分类树
    
    从 todolist.md 解析完整的 6 层课程结构，
    使用 LLM 为每个节点生成描述信息，
    并将分类树导入数据库。
    
    示例：
    - python run_generator.py init-tree              # 初始化所有科目
    - python run_generator.py init-tree -s xingce   # 只初始化行测
    - python run_generator.py init-tree --no-llm    # 不使用 LLM，使用默认描述
    - python run_generator.py init-tree --dry-run   # 试运行，不导入数据库
    """
    print_banner()
    
    # 检查配置
    if use_llm and not check_api_key():
        raise typer.Exit(1)
    
    if not dry_run and not check_backend_connection():
        raise typer.Exit(1)
    
    from .tree_initializer import TreeInitializer
    
    console.print(Panel(
        f"[cyan]开始初始化课程分类树[/cyan]\n\n"
        f"最大层级: {max_level}\n"
        f"科目过滤: {subject or '全部'}\n"
        f"使用 LLM: {'是' if use_llm else '否'}\n"
        f"试运行: {'是' if dry_run else '否'}\n"
        f"批量大小: {batch_size}",
        title="初始化配置",
        border_style="cyan",
    ))
    
    try:
        initializer = TreeInitializer(
            use_llm=use_llm,
            batch_size=batch_size,
            save_to_file=True,
        )
        
        result = initializer.initialize(
            max_level=max_level,
            subject_filter=subject,
            dry_run=dry_run,
        )
        
        if result.success:
            console.print(Panel(
                f"[green][OK] 课程树初始化完成！[/green]\n\n"
                f"总分类数: {result.total_categories}\n"
                f"生成成功: {result.generated_count}\n"
                f"导入成功: {result.imported_count}\n"
                f"失败数量: {result.failed_count}\n"
                f"总耗时: {result.duration:.2f} 秒",
                title="初始化结果",
                border_style="green",
            ))
        else:
            console.print(Panel(
                f"[red][FAIL] 初始化失败[/red]\n\n"
                f"错误: {result.errors}",
                title="初始化结果",
                border_style="red",
            ))
            raise typer.Exit(1)
            
    except Exception as e:
        console.print(f"[red]错误: {e}[/red]")
        import traceback
        traceback.print_exc()
        raise typer.Exit(1)


@app.command("show-tree")
def show_tree(
    max_level: int = typer.Option(5, "--max-level", "-l", help="最大显示层级 (1-6)"),
    subject: Optional[str] = typer.Option(None, "--subject", "-s", help="科目过滤"),
):
    """
    显示课程分类树结构
    
    解析 todolist.md 并显示完整的层级结构。
    
    示例：
    - python run_generator.py show-tree              # 显示所有层级
    - python run_generator.py show-tree -l 3        # 只显示到第3层
    """
    print_banner()
    
    parser = TaskParser()
    
    try:
        tree_str = parser.print_tree(max_level)
        
        console.print(Panel(
            tree_str,
            title=f"课程分类树 (Level 1-{max_level})",
            border_style="cyan",
        ))
        
        # 显示统计
        all_categories = parser.get_all_categories_flat()
        level_counts = {}
        for cat in all_categories:
            level_counts[cat.level] = level_counts.get(cat.level, 0) + 1
        
        table = Table(title="层级统计")
        table.add_column("层级", style="cyan")
        table.add_column("数量", style="green")
        table.add_column("说明", style="yellow")
        
        level_names = {
            1: "科目 (§1 行测课程内容)",
            2: "模块 (1.1 言语理解与表达课程)",
            3: "分类 (逻辑填空课程)",
            4: "专题 (实词辨析精讲)",
            5: "课程组 (实词辨析基础方法)",
            6: "具体课程 (第1课：语素分析法)",
        }
        
        for level in range(1, 7):
            count = level_counts.get(level, 0)
            if count > 0 or level <= max_level:
                table.add_row(
                    f"Level {level}",
                    str(count),
                    level_names.get(level, ""),
                )
        
        console.print(table)
        console.print(f"\n总计: {len(all_categories)} 个分类节点")
        
    except Exception as e:
        console.print(f"[red]错误: {e}[/red]")
        raise typer.Exit(1)


@app.command("update-category")
def update_category(
    code: str = typer.Argument(..., help="分类代码"),
    use_llm: bool = typer.Option(True, "--use-llm/--no-llm", help="是否使用 LLM 重新生成描述"),
):
    """
    更新单个分类的描述信息
    
    示例：
    - python run_generator.py update-category xingce_yanyu
    """
    print_banner()
    
    if use_llm and not check_api_key():
        raise typer.Exit(1)
    
    if not check_backend_connection():
        raise typer.Exit(1)
    
    parser = TaskParser()
    
    # 查找分类
    category = parser.get_category_by_code(code)
    
    if not category:
        console.print(f"[red]错误: 未找到分类 {code}[/red]")
        raise typer.Exit(1)
    
    console.print(f"找到分类: {category.name} (Level {category.level})")
    
    from .tree_initializer import TreeInitializer
    
    initializer = TreeInitializer(use_llm=use_llm)
    
    try:
        # 生成描述
        desc = initializer.generate_description(category, None)
        
        console.print(Panel(
            f"[cyan]生成的描述:[/cyan]\n\n"
            f"名称: {desc.name}\n"
            f"简介: {desc.description}\n"
            f"详情: {desc.long_description[:100]}...\n"
            f"特点: {', '.join(desc.features[:3])}...\n"
            f"难度: {desc.difficulty}",
            title="生成结果",
            border_style="cyan",
        ))
        
        # 导入到数据库
        db_client = DBClient()
        result = db_client.import_category_tree([{
            "code": code,
            "name": desc.name,
            "level": category.level,
            "parent_code": category.parent_code,
            "subject": category.subject,
            "description": desc.description,
            "long_description": desc.long_description,
            "features": desc.features,
            "learning_objectives": desc.learning_objectives,
            "keywords": desc.keywords,
            "difficulty": desc.difficulty,
            "sort_order": category.sort_order,
        }])
        
        if result.get("success"):
            console.print(f"[green][OK] 已更新分类 {code}[/green]")
        else:
            console.print(f"[red][FAIL] 更新失败: {result.get('error')}[/red]")
            raise typer.Exit(1)
            
    except Exception as e:
        console.print(f"[red]错误: {e}[/red]")
        raise typer.Exit(1)


def main():
    """主入口"""
    app()


if __name__ == "__main__":
    main()
