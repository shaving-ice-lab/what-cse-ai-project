"""主窗口"""

import sys
from typing import Optional

from loguru import logger

try:
    from PyQt6.QtWidgets import (
        QApplication,
        QMainWindow,
        QWidget,
        QVBoxLayout,
        QHBoxLayout,
        QTabWidget,
        QMenuBar,
        QMenu,
        QToolBar,
        QStatusBar,
        QSplitter,
        QTreeWidget,
        QTreeWidgetItem,
        QTableWidget,
        QTableWidgetItem,
        QTextEdit,
        QPushButton,
        QLabel,
        QMessageBox,
        QDialog,
        QLineEdit,
        QComboBox,
        QSpinBox,
        QProgressBar,
        QHeaderView,
    )
    from PyQt6.QtCore import Qt, QTimer, pyqtSignal, QThread
    from PyQt6.QtGui import QAction, QIcon

    HAS_PYQT = True
except ImportError:
    HAS_PYQT = False
    logger.warning("PyQt6未安装，GUI功能不可用")


if HAS_PYQT:

    class MainWindow(QMainWindow):
        """爬虫管理主窗口"""

        def __init__(self):
            super().__init__()
            self.setWindowTitle("公考职位数据采集系统")
            self.setMinimumSize(1400, 900)

            self._init_ui()
            self._init_menu()
            self._init_toolbar()
            self._init_statusbar()
            self._init_timer()

            logger.info("GUI主窗口初始化完成")

        def _init_ui(self):
            """初始化UI"""
            central_widget = QWidget()
            self.setCentralWidget(central_widget)

            main_layout = QHBoxLayout(central_widget)

            # 创建分割器
            splitter = QSplitter(Qt.Orientation.Horizontal)

            # 左侧：爬虫项目树
            left_panel = self._create_spider_tree()
            splitter.addWidget(left_panel)

            # 中间：主内容区
            center_panel = self._create_center_panel()
            splitter.addWidget(center_panel)

            # 右侧：日志面板
            right_panel = self._create_log_panel()
            splitter.addWidget(right_panel)

            # 设置分割比例
            splitter.setSizes([250, 800, 350])

            main_layout.addWidget(splitter)

        def _create_spider_tree(self) -> QWidget:
            """创建爬虫项目树"""
            widget = QWidget()
            layout = QVBoxLayout(widget)

            label = QLabel("爬虫项目")
            label.setStyleSheet("font-weight: bold; font-size: 14px;")
            layout.addWidget(label)

            self.spider_tree = QTreeWidget()
            self.spider_tree.setHeaderLabels(["名称", "状态"])
            self.spider_tree.setColumnWidth(0, 150)

            # 添加示例项目
            root_items = [
                (
                    "列表页发现",
                    [
                        ("聚合平台爬虫", "停止"),
                    ],
                ),
                (
                    "列表页监控",
                    [
                        ("国家公务员局", "运行中"),
                        ("北京人事考试", "停止"),
                        ("广东人事考试", "停止"),
                    ],
                ),
                (
                    "公告爬虫",
                    [
                        ("详情页爬虫", "停止"),
                    ],
                ),
            ]

            for root_name, children in root_items:
                root = QTreeWidgetItem([root_name])
                for child_name, status in children:
                    child = QTreeWidgetItem([child_name, status])
                    root.addChild(child)
                self.spider_tree.addTopLevelItem(root)

            self.spider_tree.expandAll()
            layout.addWidget(self.spider_tree)

            # 操作按钮
            btn_layout = QHBoxLayout()
            btn_start = QPushButton("启动")
            btn_stop = QPushButton("停止")
            btn_config = QPushButton("配置")
            btn_layout.addWidget(btn_start)
            btn_layout.addWidget(btn_stop)
            btn_layout.addWidget(btn_config)
            layout.addLayout(btn_layout)

            return widget

        def _create_center_panel(self) -> QWidget:
            """创建中间内容区"""
            widget = QWidget()
            layout = QVBoxLayout(widget)

            # Tab页
            self.tab_widget = QTabWidget()

            # 任务监控Tab
            task_tab = self._create_task_monitor_tab()
            self.tab_widget.addTab(task_tab, "任务监控")

            # 数据浏览Tab
            data_tab = self._create_data_browser_tab()
            self.tab_widget.addTab(data_tab, "数据浏览")

            # 列表页管理Tab
            list_tab = self._create_list_page_tab()
            self.tab_widget.addTab(list_tab, "列表页管理")

            # 待审核Tab
            review_tab = self._create_review_tab()
            self.tab_widget.addTab(review_tab, "待审核")

            # 设置Tab
            settings_tab = self._create_settings_tab()
            self.tab_widget.addTab(settings_tab, "系统设置")

            layout.addWidget(self.tab_widget)

            return widget

        def _create_task_monitor_tab(self) -> QWidget:
            """创建任务监控Tab"""
            widget = QWidget()
            layout = QVBoxLayout(widget)

            # 工具栏
            toolbar = QHBoxLayout()
            toolbar.addWidget(QPushButton("刷新"))
            toolbar.addWidget(QPushButton("清空已完成"))
            toolbar.addStretch()
            toolbar.addWidget(QLabel("状态筛选:"))
            status_combo = QComboBox()
            status_combo.addItems(["全部", "运行中", "已完成", "失败"])
            toolbar.addWidget(status_combo)
            layout.addLayout(toolbar)

            # 任务表格
            self.task_table = QTableWidget()
            self.task_table.setColumnCount(6)
            self.task_table.setHorizontalHeaderLabels(
                ["任务ID", "类型", "名称", "状态", "进度", "创建时间"]
            )
            self.task_table.horizontalHeader().setSectionResizeMode(
                QHeaderView.ResizeMode.Stretch
            )
            layout.addWidget(self.task_table)

            return widget

        def _create_data_browser_tab(self) -> QWidget:
            """创建数据浏览Tab"""
            widget = QWidget()
            layout = QVBoxLayout(widget)

            # 子Tab
            sub_tabs = QTabWidget()

            # 公告数据
            announcement_widget = QWidget()
            ann_layout = QVBoxLayout(announcement_widget)
            self.announcement_table = QTableWidget()
            self.announcement_table.setColumnCount(5)
            self.announcement_table.setHorizontalHeaderLabels(
                ["标题", "类型", "发布日期", "来源", "状态"]
            )
            ann_layout.addWidget(self.announcement_table)
            sub_tabs.addTab(announcement_widget, "公告数据")

            # 职位数据
            position_widget = QWidget()
            pos_layout = QVBoxLayout(position_widget)
            self.position_table = QTableWidget()
            self.position_table.setColumnCount(6)
            self.position_table.setHorizontalHeaderLabels(
                ["职位名称", "部门", "学历", "地点", "人数", "置信度"]
            )
            pos_layout.addWidget(self.position_table)
            sub_tabs.addTab(position_widget, "职位数据")

            layout.addWidget(sub_tabs)

            return widget

        def _create_list_page_tab(self) -> QWidget:
            """创建列表页管理Tab"""
            widget = QWidget()
            layout = QVBoxLayout(widget)

            # 工具栏
            toolbar = QHBoxLayout()
            toolbar.addWidget(QPushButton("添加列表页"))
            toolbar.addWidget(QPushButton("测试爬取"))
            toolbar.addStretch()
            layout.addLayout(toolbar)

            # 列表页表格
            self.list_page_table = QTableWidget()
            self.list_page_table.setColumnCount(6)
            self.list_page_table.setHorizontalHeaderLabels(
                ["URL", "来源", "频率", "状态", "文章数", "最近爬取"]
            )
            layout.addWidget(self.list_page_table)

            return widget

        def _create_review_tab(self) -> QWidget:
            """创建待审核Tab"""
            widget = QWidget()
            layout = QVBoxLayout(widget)

            # 统计信息
            stats_layout = QHBoxLayout()
            stats_layout.addWidget(QLabel("待审核: 0"))
            stats_layout.addWidget(QLabel("低置信度: 0"))
            stats_layout.addStretch()
            stats_layout.addWidget(QPushButton("批量通过"))
            layout.addLayout(stats_layout)

            # 审核表格
            self.review_table = QTableWidget()
            self.review_table.setColumnCount(5)
            self.review_table.setHorizontalHeaderLabels(
                ["职位名称", "部门", "置信度", "问题", "操作"]
            )
            layout.addWidget(self.review_table)

            return widget

        def _create_settings_tab(self) -> QWidget:
            """创建设置Tab"""
            widget = QWidget()
            layout = QVBoxLayout(widget)

            # 数据库配置
            db_group = QWidget()
            db_layout = QVBoxLayout(db_group)
            db_layout.addWidget(QLabel("数据库配置"))

            form_layout = QHBoxLayout()
            form_layout.addWidget(QLabel("MySQL Host:"))
            form_layout.addWidget(QLineEdit("localhost"))
            form_layout.addWidget(QLabel("Port:"))
            form_layout.addWidget(QSpinBox())
            db_layout.addLayout(form_layout)

            layout.addWidget(db_group)

            # AI配置
            ai_group = QWidget()
            ai_layout = QVBoxLayout(ai_group)
            ai_layout.addWidget(QLabel("AI配置"))

            ai_form = QHBoxLayout()
            ai_form.addWidget(QLabel("Provider:"))
            provider_combo = QComboBox()
            provider_combo.addItems(["OpenAI", "Anthropic", "智谱"])
            ai_form.addWidget(provider_combo)
            ai_layout.addLayout(ai_form)

            layout.addWidget(ai_group)
            layout.addStretch()

            # 保存按钮
            layout.addWidget(QPushButton("保存配置"))

            return widget

        def _create_log_panel(self) -> QWidget:
            """创建日志面板"""
            widget = QWidget()
            layout = QVBoxLayout(widget)

            label = QLabel("运行日志")
            label.setStyleSheet("font-weight: bold; font-size: 14px;")
            layout.addWidget(label)

            # 日志级别筛选
            filter_layout = QHBoxLayout()
            filter_layout.addWidget(QLabel("级别:"))
            level_combo = QComboBox()
            level_combo.addItems(["全部", "INFO", "WARNING", "ERROR"])
            filter_layout.addWidget(level_combo)
            filter_layout.addStretch()
            filter_layout.addWidget(QPushButton("清空"))
            layout.addLayout(filter_layout)

            # 日志文本框
            self.log_text = QTextEdit()
            self.log_text.setReadOnly(True)
            self.log_text.setStyleSheet("font-family: monospace;")
            layout.addWidget(self.log_text)

            return widget

        def _init_menu(self):
            """初始化菜单栏"""
            menubar = self.menuBar()

            # 文件菜单
            file_menu = menubar.addMenu("文件")
            file_menu.addAction("导出数据")
            file_menu.addAction("导入数据")
            file_menu.addSeparator()
            file_menu.addAction("退出", self.close)

            # 爬虫菜单
            spider_menu = menubar.addMenu("爬虫")
            spider_menu.addAction("启动全部")
            spider_menu.addAction("停止全部")
            spider_menu.addSeparator()
            spider_menu.addAction("添加爬虫")

            # 工具菜单
            tool_menu = menubar.addMenu("工具")
            tool_menu.addAction("清空缓存")
            tool_menu.addAction("重建索引")

            # 帮助菜单
            help_menu = menubar.addMenu("帮助")
            help_menu.addAction("文档")
            help_menu.addAction("关于")

        def _init_toolbar(self):
            """初始化工具栏"""
            toolbar = QToolBar()
            self.addToolBar(toolbar)

            toolbar.addAction("启动")
            toolbar.addAction("停止")
            toolbar.addSeparator()
            toolbar.addAction("刷新")

        def _init_statusbar(self):
            """初始化状态栏"""
            self.statusbar = QStatusBar()
            self.setStatusBar(self.statusbar)

            self.statusbar.showMessage("就绪")

            # 添加永久组件
            self.status_label = QLabel("运行中任务: 0")
            self.statusbar.addPermanentWidget(self.status_label)

        def _init_timer(self):
            """初始化定时器"""
            self.refresh_timer = QTimer()
            self.refresh_timer.timeout.connect(self._refresh_data)
            self.refresh_timer.start(5000)  # 5秒刷新

        def _refresh_data(self):
            """刷新数据"""
            # TODO: 从数据库刷新数据
            pass

        def log(self, message: str, level: str = "INFO"):
            """添加日志"""
            from datetime import datetime

            timestamp = datetime.now().strftime("%H:%M:%S")
            self.log_text.append(f"[{timestamp}] [{level}] {message}")

        def closeEvent(self, event):
            """关闭事件"""
            reply = QMessageBox.question(
                self,
                "确认退出",
                "确定要退出吗？",
                QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No,
            )

            if reply == QMessageBox.StandardButton.Yes:
                event.accept()
            else:
                event.ignore()

    def run_gui():
        """运行GUI"""
        app = QApplication(sys.argv)
        window = MainWindow()
        window.show()
        sys.exit(app.exec())

else:

    class MainWindow:
        def __init__(self):
            raise ImportError("PyQt6未安装，无法使用GUI")

    def run_gui():
        raise ImportError("PyQt6未安装，无法使用GUI")
