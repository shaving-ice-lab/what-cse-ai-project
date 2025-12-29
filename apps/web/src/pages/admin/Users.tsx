import { useState } from 'react'
import { Search, Filter, MoreVertical, Eye, Ban, UserCheck } from 'lucide-react'

interface User {
  id: number
  nickname: string
  phone: string
  email: string
  status: number
  created_at: string
  last_login: string
}

const mockUsers: User[] = [
  { id: 1, nickname: '考公人001', phone: '138****1234', email: 'user1@example.com', status: 1, created_at: '2024-10-01', last_login: '2024-11-15' },
  { id: 2, nickname: '考公人002', phone: '139****5678', email: 'user2@example.com', status: 1, created_at: '2024-10-05', last_login: '2024-11-14' },
  { id: 3, nickname: '考公人003', phone: '137****9012', email: 'user3@example.com', status: 0, created_at: '2024-10-10', last_login: '2024-11-10' },
  { id: 4, nickname: '考公人004', phone: '136****3456', email: 'user4@example.com', status: 1, created_at: '2024-10-15', last_login: '2024-11-13' },
  { id: 5, nickname: '考公人005', phone: '135****7890', email: 'user5@example.com', status: 1, created_at: '2024-10-20', last_login: '2024-11-12' },
]

export default function AdminUsers() {
  const [users] = useState<User[]>(mockUsers)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = users.filter(u => 
    u.nickname.includes(searchTerm) || u.phone.includes(searchTerm) || u.email.includes(searchTerm)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">用户管理</h1>
          <p className="text-gray-500 mt-1">管理系统注册用户</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索用户..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>筛选</span>
          </button>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">联系方式</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">注册时间</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">最后登录</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium">
                      {user.nickname.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-800">{user.nickname}</p>
                      <p className="text-xs text-gray-500">ID: {user.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-800">{user.phone}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === 1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {user.status === 1 ? '正常' : '禁用'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.created_at}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.last_login}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button className="p-1 hover:bg-gray-100 rounded" title="查看详情">
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded" title={user.status === 1 ? '禁用' : '启用'}>
                      {user.status === 1 ? <Ban className="w-4 h-4 text-gray-500" /> : <UserCheck className="w-4 h-4 text-gray-500" />}
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-4 border-t flex items-center justify-between">
          <p className="text-sm text-gray-500">共 {filteredUsers.length} 条记录</p>
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
