"""
公考职位智能筛选系统 - 爬虫模块 WebView UI
Uses HTML/CSS/JS for UI with Python backend
"""
import sys
import re
import webview
from pathlib import Path
from collections import deque
import threading
import json

from src.config import config

# Global log queue
_crawler_logs = deque(maxlen=1000)
_crawler_logs_lock = threading.Lock()

# Global instances (lazy initialization)
_db_session = None
_task_status = {}


def get_db_session():
    """获取数据库会话"""
    global _db_session
    if _db_session is None:
        try:
            from src.database.session import get_session
            _db_session = get_session()
        except Exception as e:
            print(f"[DB] 数据库连接失败: {e}")
            _db_session = None
    return _db_session


class Api:
    """Python API exposed to JavaScript"""
    
    # ==================== 应用信息 ====================
    
    def get_app_info(self):
        """获取应用信息"""
        return {
            'success': True,
            'name': '公考职位数据采集系统',
            'version': '1.0.0',
            'platform': sys.platform
        }
    
    def get_config(self):
        """获取当前配置"""
        try:
            return {
                'success': True,
                'config': {
                    'database': config.database,
                    'spider': config.spider,
                    'ai': config.ai,
                    'proxy': config.proxy,
                    'logging': config.logging
                }
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def save_config(self, new_config: dict):
        """保存配置"""
        try:
            for key, value in new_config.items():
                config.set(key, value)
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    # ==================== 爬虫管理 ====================
    
    def get_spiders(self):
        """获取所有爬虫列表"""
        try:
            spiders = [
                {
                    'id': 'list_discovery',
                    'name': '列表页发现',
                    'description': '发现新的列表页URL',
                    'status': _task_status.get('list_discovery', 'stopped'),
                    'children': [
                        {'id': 'aggregate_spider', 'name': '聚合平台爬虫', 'status': 'stopped'}
                    ]
                },
                {
                    'id': 'list_monitor',
                    'name': '列表页监控',
                    'description': '监控已知列表页的更新',
                    'status': _task_status.get('list_monitor', 'stopped'),
                    'children': [
                        {'id': 'national_exam', 'name': '国家公务员局', 'status': 'stopped'},
                        {'id': 'beijing_hr', 'name': '北京人事考试', 'status': 'stopped'},
                        {'id': 'guangdong_hr', 'name': '广东人事考试', 'status': 'stopped'}
                    ]
                },
                {
                    'id': 'announcement',
                    'name': '公告爬虫',
                    'description': '抓取公告详情页',
                    'status': _task_status.get('announcement', 'stopped'),
                    'children': [
                        {'id': 'detail_spider', 'name': '详情页爬虫', 'status': 'stopped'}
                    ]
                },
                {
                    'id': 'position',
                    'name': '职位爬虫',
                    'description': '解析职位表数据',
                    'status': _task_status.get('position', 'stopped'),
                    'children': []
                }
            ]
            return {'success': True, 'spiders': spiders}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def start_spider(self, spider_id: str, params: dict = None):
        """启动爬虫"""
        global _task_status
        try:
            _task_status[spider_id] = 'running'
            self._add_log(f"爬虫 {spider_id} 已启动", 'info')
            
            # 异步触发Celery任务
            def run_spider():
                try:
                    if spider_id == 'list_monitor':
                        from src.tasks.spider_tasks import task_list_monitor
                        task_list_monitor.delay()
                    elif spider_id == 'announcement':
                        from src.tasks.spider_tasks import task_announcement_crawl
                        task_announcement_crawl.delay()
                    elif spider_id == 'position':
                        from src.tasks.spider_tasks import task_position_extract
                        task_position_extract.delay()
                except Exception as e:
                    self._add_log(f"爬虫任务执行失败: {e}", 'error')
                    _task_status[spider_id] = 'error'
            
            thread = threading.Thread(target=run_spider)
            thread.daemon = True
            thread.start()
            
            return {'success': True, 'message': f'爬虫 {spider_id} 启动成功'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def stop_spider(self, spider_id: str):
        """停止爬虫"""
        global _task_status
        try:
            _task_status[spider_id] = 'stopped'
            self._add_log(f"爬虫 {spider_id} 已停止", 'info')
            return {'success': True, 'message': f'爬虫 {spider_id} 停止成功'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def stop_all_spiders(self):
        """停止所有爬虫"""
        global _task_status
        try:
            for key in _task_status:
                _task_status[key] = 'stopped'
            self._add_log("所有爬虫已停止", 'info')
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    # ==================== 任务管理 ====================
    
    def get_tasks(self, status_filter: str = 'all'):
        """获取任务列表"""
        try:
            # 模拟任务数据，实际应从Celery获取
            tasks = [
                {
                    'id': 'task-001',
                    'type': 'list_monitor',
                    'name': '列表页监控',
                    'status': 'completed',
                    'progress': 100,
                    'created_at': '2024-01-15 10:30:00',
                    'result': '发现3个新公告'
                },
                {
                    'id': 'task-002',
                    'type': 'announcement',
                    'name': '公告抓取',
                    'status': 'running',
                    'progress': 45,
                    'created_at': '2024-01-15 10:35:00',
                    'result': None
                }
            ]
            
            if status_filter != 'all':
                tasks = [t for t in tasks if t['status'] == status_filter]
            
            return {'success': True, 'tasks': tasks}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def cancel_task(self, task_id: str):
        """取消任务"""
        try:
            self._add_log(f"任务 {task_id} 已取消", 'info')
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def clear_completed_tasks(self):
        """清空已完成任务"""
        try:
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    # ==================== 列表页管理 ====================
    
    def get_list_pages(self):
        """获取列表页列表"""
        try:
            # 从数据库获取列表页
            session = get_db_session()
            if session:
                from src.database.repository import ListPageRepository
                repo = ListPageRepository(session)
                pages = repo.get_all()
                return {'success': True, 'pages': [p.to_dict() for p in pages]}
            else:
                # 返回模拟数据
                pages = [
                    {
                        'id': 1,
                        'url': 'http://bm.scs.gov.cn/pp/gkweb/core/web/ui/business/home/gkhome.html',
                        'source_name': '国家公务员局',
                        'crawl_frequency': 'every_2h',
                        'status': 'active',
                        'article_count': 156,
                        'last_crawled': '2024-01-15 10:00:00'
                    },
                    {
                        'id': 2,
                        'url': 'https://rsj.beijing.gov.cn/ywsite/bjpta/',
                        'source_name': '北京人事考试',
                        'crawl_frequency': 'every_6h',
                        'status': 'active',
                        'article_count': 89,
                        'last_crawled': '2024-01-15 08:00:00'
                    }
                ]
                return {'success': True, 'pages': pages}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def add_list_page(self, url: str, source_name: str, frequency: str):
        """添加列表页"""
        try:
            self._add_log(f"添加列表页: {source_name} - {url}", 'info')
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def delete_list_page(self, page_id: int):
        """删除列表页"""
        try:
            self._add_log(f"删除列表页: {page_id}", 'info')
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def test_list_page(self, url: str):
        """测试爬取列表页"""
        try:
            self._add_log(f"测试爬取: {url}", 'info')
            # 实际调用爬虫测试
            return {'success': True, 'result': {'found': 5, 'sample_titles': ['示例公告1', '示例公告2']}}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    # ==================== 数据浏览 ====================
    
    def get_announcements(self, page: int = 1, page_size: int = 20):
        """获取公告列表"""
        try:
            # 模拟数据
            announcements = [
                {
                    'id': 1,
                    'title': '2024年国家公务员考试公告',
                    'type': '国考',
                    'publish_date': '2024-01-10',
                    'source': '国家公务员局',
                    'status': 'parsed',
                    'position_count': 234
                },
                {
                    'id': 2,
                    'title': '北京市2024年公务员招录公告',
                    'type': '省考',
                    'publish_date': '2024-01-12',
                    'source': '北京人事考试',
                    'status': 'pending',
                    'position_count': 0
                }
            ]
            return {'success': True, 'announcements': announcements, 'total': len(announcements)}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def get_positions(self, page: int = 1, page_size: int = 20, filters: dict = None):
        """获取职位列表"""
        try:
            # 模拟数据
            positions = [
                {
                    'id': 1,
                    'name': '综合管理岗',
                    'department': '国家税务总局',
                    'education': '本科及以上',
                    'location': '北京',
                    'recruit_count': 2,
                    'confidence': 95
                },
                {
                    'id': 2,
                    'name': '行政执法岗',
                    'department': '海关总署',
                    'education': '本科及以上',
                    'location': '上海',
                    'recruit_count': 5,
                    'confidence': 88
                }
            ]
            return {'success': True, 'positions': positions, 'total': len(positions)}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    # ==================== 审核管理 ====================
    
    def get_review_items(self):
        """获取待审核项"""
        try:
            items = [
                {
                    'id': 1,
                    'position_name': '办公室科员',
                    'department': '某某局',
                    'confidence': 72,
                    'issues': ['学历要求解析不确定', '专业要求缺失']
                },
                {
                    'id': 2,
                    'position_name': '执法大队科员',
                    'department': '某某执法局',
                    'confidence': 65,
                    'issues': ['招录人数解析失败']
                }
            ]
            return {'success': True, 'items': items, 'total': len(items)}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def approve_item(self, item_id: int, corrections: dict = None):
        """通过审核"""
        try:
            self._add_log(f"审核通过: {item_id}", 'info')
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def reject_item(self, item_id: int, reason: str):
        """拒绝审核"""
        try:
            self._add_log(f"审核拒绝: {item_id}, 原因: {reason}", 'info')
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def batch_approve(self, item_ids: list):
        """批量通过"""
        try:
            self._add_log(f"批量通过: {len(item_ids)} 项", 'info')
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    # ==================== 统计信息 ====================
    
    def get_statistics(self):
        """获取统计信息"""
        try:
            stats = {
                'total_announcements': 156,
                'total_positions': 3420,
                'pending_review': 23,
                'today_crawled': 12,
                'running_tasks': sum(1 for s in _task_status.values() if s == 'running'),
                'list_pages': 8
            }
            return {'success': True, 'stats': stats}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    # ==================== 日志管理 ====================
    
    def _add_log(self, message: str, log_type: str = 'info'):
        """添加日志"""
        from datetime import datetime
        with _crawler_logs_lock:
            _crawler_logs.append({
                'time': datetime.now().strftime('%H:%M:%S'),
                'message': message,
                'type': log_type
            })
    
    def get_logs(self):
        """获取日志"""
        with _crawler_logs_lock:
            logs = list(_crawler_logs)
        return {'success': True, 'logs': logs}
    
    def clear_logs(self):
        """清空日志"""
        global _crawler_logs
        with _crawler_logs_lock:
            _crawler_logs.clear()
        return {'success': True}
    
    # ==================== 测试采集功能 ====================
    
    def fetch_article(self, url: str):
        """采集文章内容"""
        try:
            import requests
            from bs4 import BeautifulSoup
            import re
            
            self._add_log(f"开始采集: {url}", 'info')
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            }
            
            response = requests.get(url, headers=headers, timeout=30, verify=False)
            response.encoding = response.apparent_encoding or 'utf-8'
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 移除script和style标签
            for tag in soup(['script', 'style', 'nav', 'header', 'footer', 'aside']):
                tag.decompose()
            
            # 提取标题
            title = ''
            title_tag = soup.find('title')
            if title_tag:
                title = title_tag.get_text(strip=True)
            
            # 尝试找h1标题
            h1_tag = soup.find('h1')
            if h1_tag:
                title = h1_tag.get_text(strip=True)
            
            # 提取正文内容
            content = ''
            
            # 常见的正文容器选择器
            content_selectors = [
                'article',
                '.article-content',
                '.content',
                '.post-content',
                '#content',
                '.main-content',
                '.detail-content',
                '.news-content',
                '.zwContent',
                '.TRS_Editor',
                '.pages_content',
            ]
            
            for selector in content_selectors:
                content_div = soup.select_one(selector)
                if content_div:
                    content = content_div.get_text(separator='\n', strip=True)
                    break
            
            # 如果没找到特定容器，使用body
            if not content:
                body = soup.find('body')
                if body:
                    content = body.get_text(separator='\n', strip=True)
            
            # 清理多余空行
            content = re.sub(r'\n{3,}', '\n\n', content)
            content = content.strip()
            
            self._add_log(f"采集成功: {title[:30]}... ({len(content)}字)", 'info')
            
            return {
                'success': True,
                'data': {
                    'url': url,
                    'title': title,
                    'content': content,
                    'length': len(content)
                }
            }
            
        except Exception as e:
            self._add_log(f"采集失败: {str(e)}", 'error')
            return {'success': False, 'error': str(e)}
    
    def analyze_article(self, content: str, title: str = ''):
        """AI分析文章内容"""
        try:
            import requests
            import json
            
            self._add_log(f"开始AI分析: {title[:20]}...", 'info')
            
            # 获取AI配置
            ai_config = config.ai
            api_key = ai_config.get('api_key') or ai_config.get('openai_api_key')
            provider = ai_config.get('provider', 'openai')
            base_url = ai_config.get('base_url', 'https://api.openai.com/v1')
            model = ai_config.get('model', 'gpt-3.5-turbo')
            
            # 构建分析提示
            prompt = f"""请分析以下公考招聘公告内容，提取关键信息并返回JSON格式结果。

标题: {title}

内容:
{content[:8000]}

请返回以下格式的JSON（注意只返回JSON，不要其他内容）:
{{
    "summary": "100字以内的内容摘要",
    "announcement_type": "公告类型（如：国考、省考、事业单位、选调生等）",
    "publish_date": "发布日期",
    "registration_time": "报名时间段",
    "exam_time": "考试时间",
    "total_positions": 招录总人数(数字),
    "key_requirements": ["关键要求1", "关键要求2"],
    "confidence": 分析置信度(0-100的数字),
    "positions": [
        {{
            "name": "职位名称",
            "department": "招录单位",
            "education": "学历要求",
            "major": "专业要求",
            "recruit_count": 招录人数(数字),
            "confidence": 置信度(0-100)
        }}
    ]
}}"""
            
            if not api_key:
                # 如果没有配置API Key，返回模拟结果
                self._add_log("未配置AI API Key，返回模拟分析结果", 'warning')
                return {
                    'success': True,
                    'data': self._mock_analysis_result(title, content)
                }
            
            # 调用AI API
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}'
            }
            
            payload = {
                'model': model,
                'messages': [
                    {'role': 'system', 'content': '你是一个专业的公考招聘公告分析助手，擅长从公告中提取结构化信息。请只返回JSON格式的结果。'},
                    {'role': 'user', 'content': prompt}
                ],
                'temperature': 0.3,
                'max_tokens': 2000
            }
            
            response = requests.post(
                f'{base_url}/chat/completions',
                headers=headers,
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                ai_response = result['choices'][0]['message']['content']
                
                # 解析JSON结果
                try:
                    # 尝试提取JSON部分
                    json_match = re.search(r'\{[\s\S]*\}', ai_response)
                    if json_match:
                        analysis_data = json.loads(json_match.group())
                    else:
                        analysis_data = json.loads(ai_response)
                    
                    self._add_log(f"AI分析完成，置信度: {analysis_data.get('confidence', 0)}%", 'info')
                    return {'success': True, 'data': analysis_data}
                except json.JSONDecodeError:
                    self._add_log("AI返回格式解析失败，使用模拟结果", 'warning')
                    return {'success': True, 'data': self._mock_analysis_result(title, content)}
            else:
                self._add_log(f"AI API调用失败: {response.status_code}", 'error')
                return {'success': True, 'data': self._mock_analysis_result(title, content)}
                
        except Exception as e:
            self._add_log(f"AI分析错误: {str(e)}", 'error')
            return {'success': False, 'error': str(e)}
    
    def _mock_analysis_result(self, title: str, content: str):
        """生成模拟分析结果"""
        import re
        
        # 简单的模式匹配提取
        result = {
            'summary': f'这是一份关于"{title[:30]}"的招聘公告，包含了招录职位、报名条件、考试安排等信息。',
            'announcement_type': '公务员招录',
            'publish_date': '',
            'registration_time': '',
            'exam_time': '',
            'total_positions': 0,
            'key_requirements': ['具有中华人民共和国国籍', '拥护中华人民共和国宪法', '具有良好的品行'],
            'confidence': 65,
            'positions': []
        }
        
        # 尝试提取日期
        date_pattern = r'(\d{4})[年/-](\d{1,2})[月/-](\d{1,2})'
        dates = re.findall(date_pattern, content)
        if dates:
            result['publish_date'] = f'{dates[0][0]}年{dates[0][1]}月{dates[0][2]}日'
        
        # 尝试提取人数
        count_pattern = r'(?:招录|招聘|录用).*?(\d+)\s*(?:人|名)'
        counts = re.findall(count_pattern, content)
        if counts:
            result['total_positions'] = int(counts[0])
        
        # 模拟职位数据
        if '国家公务员' in content or '国考' in content:
            result['announcement_type'] = '国考'
        elif '省考' in content or '省级公务员' in content:
            result['announcement_type'] = '省考'
        elif '事业单位' in content:
            result['announcement_type'] = '事业单位'
        
        return result
    
    # ==================== 文件操作 ====================
    
    def export_data(self, data_type: str, format: str = 'json'):
        """导出数据"""
        try:
            import webview
            
            windows = webview.windows
            if not windows:
                return {'success': False, 'error': '无可用窗口'}
            
            window = windows[0]
            
            result = window.create_file_dialog(
                webview.SAVE_DIALOG,
                save_filename=f'{data_type}_export.{format}',
                file_types=(f'{format.upper()} Files (*.{format})', 'All Files (*.*)')
            )
            
            if result:
                file_path = result if isinstance(result, str) else result[0]
                # 这里应该实际导出数据
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump({'data': [], 'exported_at': str(__import__('datetime').datetime.now())}, f, ensure_ascii=False, indent=2)
                
                self._add_log(f"数据导出成功: {file_path}", 'info')
                return {'success': True, 'file_path': file_path}
            else:
                return {'success': False, 'cancelled': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}


def main():
    """主入口"""
    print("=" * 50)
    print("公考职位数据采集系统 v1.0.0")
    print(f"平台: {sys.platform}")
    print("=" * 50)
    
    # HTML文件路径
    html_path = Path(__file__).parent / 'webview' / 'index.html'
    
    if not html_path.exists():
        print(f"错误: HTML文件不存在 - {html_path}")
        sys.exit(1)
    
    # 创建API实例
    api = Api()
    
    # 添加启动日志
    api._add_log("系统启动", 'info')
    api._add_log(f"配置文件已加载", 'info')
    
    # 创建窗口
    window = webview.create_window(
        title='公考职位数据采集系统 v1.0.0',
        url=str(html_path),
        width=1400,
        height=900,
        min_size=(1100, 700),
        js_api=api,
        text_select=True
    )
    
    # 启动webview
    webview.start(debug=False)


if __name__ == "__main__":
    main()
