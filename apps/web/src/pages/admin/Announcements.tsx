import { useState } from 'react'
import { Search, Plus, Edit2, Trash2, Eye, ExternalLink } from 'lucide-react'

interface Announcement {
  id: number
  title: string
  type: string
  source: string
  publish_date: string
  status: number
  views: number
}

const mockAnnouncements: Announcement[] = [
  { id: 1, title: '2024年度中央机关及其直属机构考试录用公务员公告', type: '招考公告', source: '国家公务员局', publish_date: '2024-10-15', status: 1, views: 12580 },
  { id: 2, title: '2024年北京市公务员考试报名入口已开放', type: '报名通知', source: '北京市人社局', publish_date: '2024-11-01', status: 1, views: 8920 },
  { id: 3, title: '关于2024年度公务员考试时间安排的公告', type: '时间公告', source: '人力资源社会保障部', publish_date: '2024-10-20', status: 1, views: 6540 },
  { id: 4, title: '广东省2024年考试录用公务员公告', type: '招考公告', source: '广东省人社厅', publish_date: '2024-11-10', status: 0, views: 0 },
  { id: 5, title: '2024年国考笔试成绩查询通知', type: '成绩公告', source: '国家公务员局', publish_date: '2024-11-05', status: 1, views: 15680 },
]

const typeColors: Record<string, string> = {
  '招考公告': 'bg-blue-100 text-blue-600',
  '报名通知': 'bg-green-100 text-green-600',
  '时间公告': 'bg-yellow-100 text-yellow-600',
  '成绩公告': 'bg-purple-100 text-purple-600',
}

export default function AdminAnnouncements() {
  const [announcements] = useState<Announcement[]>(mockAnnouncements)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredAnnouncements = announcements.filter(a => 
    a.title.includes(searchTerm) || a.source.includes(searchTerm)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">公告管理</h1>
          <p className="text-gray-500 mt-1">管理考试公告与政策解读</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          <span>发布公告</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索公告..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <select className="px-3 py-2 border rounded-lg text-sm">
              <option>全部类型</option>
              <option>招考公告</option>
              <option>报名通知</option>
              <option>时间公告</option>
              <option>成绩公告</option>
            </select>
            <select className="px-3 py-2 border rounded-lg text-sm">
              <option>全部状态</option>
              <option>已发布</option>
              <option>草稿</option>
            </select>
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">标题</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">来源</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">发布日期</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">浏览量</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredAnnouncements.map((announcement) => (
              <tr key={announcement.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-800 max-w-md truncate">{announcement.title}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    typeColors[announcement.type] || 'bg-gray-100 text-gray-600'
                  }`}>
                    {announcement.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{announcement.source}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{announcement.publish_date}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    announcement.status === 1 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {announcement.status === 1 ? '已发布' : '草稿'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{announcement.views.toLocaleString()}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button className="p-1 hover:bg-gray-100 rounded" title="预览">
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded" title="查看原文">
                      <ExternalLink className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded" title="编辑">
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded" title="删除">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-4 border-t flex items-center justify-between">
          <p className="text-sm text-gray-500">共 {filteredAnnouncements.length} 条记录</p>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50">上一页</button>
            <button className="px-3 py-1 bg-primary text-white rounded text-sm">1</button>
            <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50">下一页</button>
          </div>
        </div>
      </div>
    </div>
  )
}
