import { Outlet, Link } from 'react-router-dom'
import { Search, Bell, User, Menu } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

export default function UserLayout() {
  const { isAuthenticated, user, logout } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary">公考智选</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-gray-600 hover:text-primary">首页</Link>
              <Link to="/positions" className="text-gray-600 hover:text-primary">职位查询</Link>
              <Link to="/match" className="text-gray-600 hover:text-primary">智能匹配</Link>
              <Link to="/announcements" className="text-gray-600 hover:text-primary">公告资讯</Link>
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
              
              {isAuthenticated ? (
                <>
                  <Link to="/notifications" className="p-2 hover:bg-gray-100 rounded-full relative">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </Link>
                  <div className="relative group">
                    <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg">
                      <User className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-600">{user?.nickname || '用户'}</span>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">个人中心</Link>
                      <Link to="/favorites" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">我的收藏</Link>
                      <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">退出登录</button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login" className="px-4 py-2 text-sm text-gray-600 hover:text-primary">登录</Link>
                  <Link to="/register" className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90">注册</Link>
                </div>
              )}

              <button className="md:hidden p-2 hover:bg-gray-100 rounded-full">
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">关于我们</h3>
              <p className="text-sm">公考职位智能筛选系统，帮助考生快速找到合适的职位。</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">快速链接</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/positions" className="hover:text-white">职位查询</Link></li>
                <li><Link to="/match" className="hover:text-white">智能匹配</Link></li>
                <li><Link to="/announcements" className="hover:text-white">公告资讯</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">帮助中心</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">使用指南</a></li>
                <li><a href="#" className="hover:text-white">常见问题</a></li>
                <li><a href="#" className="hover:text-white">联系我们</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">关注我们</h3>
              <p className="text-sm">微信公众号: 公考智选</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
            <p>© 2024 公考职位智能筛选系统. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
