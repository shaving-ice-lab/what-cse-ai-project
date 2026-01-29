#!/usr/bin/env python3
"""
快速启动脚本 - 从 scripts 目录运行

使用方法:
    python run_generator.py --help
    python run_generator.py config
    python run_generator.py progress
    python run_generator.py run -m 10
"""

import sys
from pathlib import Path

# 添加 content_generator 到路径
sys.path.insert(0, str(Path(__file__).parent))

from content_generator.cli import main

if __name__ == "__main__":
    main()
