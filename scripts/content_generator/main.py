#!/usr/bin/env python3
"""
公考内容生成器 - 主入口

使用方法:
    # 查看帮助
    python -m content_generator --help
    
    # 查看配置
    python -m content_generator config
    
    # 测试 API 连接
    python -m content_generator test-api
    
    # 查看进度
    python -m content_generator progress
    
    # 列出待处理任务
    python -m content_generator list
    python -m content_generator list -n 20  # 显示20个
    python -m content_generator list -s "言语理解"  # 按章节过滤
    
    # 生成单个任务
    python -m content_generator generate  # 自动选择下一个
    python -m content_generator generate -l 87  # 指定行号
    
    # 持续生成模式
    python -m content_generator run  # 默认5个
    python -m content_generator run -m 10  # 生成10个
    python -m content_generator run -s "言语理解" -m 5  # 只生成言语理解章节
    
    # 手动标记任务完成
    python -m content_generator mark 87
    
    # 切换任务文件
    python -m content_generator set-file docs/fenbi-development-todolist.md
"""

from .cli import main

if __name__ == "__main__":
    main()
