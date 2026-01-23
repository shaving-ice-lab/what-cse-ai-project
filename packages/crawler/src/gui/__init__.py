"""GUI管理界面模块

注意: GUI已迁移至WebView方式实现
请使用项目根目录的 main.py 启动GUI:
    python main.py

旧的PyQt6 GUI (main_window.py) 已废弃
"""

def run_gui():
    """启动GUI (已迁移到WebView)"""
    import sys
    from pathlib import Path
    
    # 导入新的main模块
    main_path = Path(__file__).parent.parent.parent / 'main.py'
    print(f"GUI已迁移至WebView方式，请运行: python {main_path}")
    print("或直接运行: python main.py")
    sys.exit(0)

__all__ = ["run_gui"]
