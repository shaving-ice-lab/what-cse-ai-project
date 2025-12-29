import { useState } from 'react'
import { Search, Filter, Plus, Edit2, Trash2, Eye } from 'lucide-react'

interface Position {
  id: number
  position_name: string
  department_name: string
  exam_type: string
  year: number
  recruit_count: number
  status: number
  created_at: string
}

const mockPositions: Position[] = [
  { id: 1, position_name: '综合管理岗', department_name: '国家税务总局北京市税务局', exam_type: '国考', year: 2024, recruit_count: 3, status: 1, created_at: '2024-10-01' },
  { id: 2, position_name: '信息技术岗', department_name: '海关总署广州海关', exam_type: '国考', year: 2024, recruit_count: 2, status: 1, created_at: '2024-10-05' },
  { id: 3, position_name: '财务管理岗', department_name: '财政部驻北京专员办', exam_type: '国考', year: 2024, recruit_count: 1, status: 0, created_at: '2024-10-10' },
  { id: 4, position_name: '法律事务岗', department_name: '最高人民法院', exam_type: '国考', year: 2024, recruit_count: 2, status: 1, created_at: '2024-10-15' },
  { id: 5, position_name: '行政执法岗', department_name: '北京市公安局', exam_type: '省考', year: 2024, recruit_count: 5, status: 1, created_at: '2024-10-20' },
]

export default function AdminPositions() {
  const [positions] = useState<Position[]>(mockPositions)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredPositions = positions.filter(p => 
    p.position_name.includes(searchTerm) || p.department_name.includes(searchTerm)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">职位管理</h1>
          <p className="text-gray-500 mt-1">管理公务员考试职位数据</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          <span>添加职位</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索职位..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <select className="px-3 py-2 border rounded-lg text-sm">
              <option>全部类型</option>
              <option>国考</option>
              <option>省考</option>
            </select>
            <select className="px-3 py-2 border rounded-lg text-sm">
              <option>全部年份</option>
              <option>2024</option>
              <option>2023</option>
            </select>
            <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              <span>更多筛选</span>
            </button>
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">职位名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">招录单位</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">考试类型</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">招录人数</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredPositions.map((position) => (
              <tr key={position.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-800">{position.position_name}</p>
                  <p className="text-xs text-gray-500">ID: {position.id}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-800 max-w-xs truncate">{position.department_name}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                    {position.exam_type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">{position.recruit_count}人</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    position.status === 1 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {position.status === 1 ? '已发布' : '草稿'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button className="p-1 hover:bg-gray-100 rounded" title="查看">
                      <Eye className="w-4 h-4 text-gray-500" />
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
          <p className="text-sm text-gray-500">共 {filteredPositions.length} 条记录</p>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50">上一页</button>
            <button className="px-3 py-1 bg-primary text-white rounded text-sm">1</button>
            <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50">下一页</button>
          </div>
        </div>
      </div>
    </div>
  )
}
