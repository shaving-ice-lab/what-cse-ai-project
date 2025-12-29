import { Link } from 'react-router-dom'

export default function RegisterPage() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-2xl font-bold text-center mb-6">注册</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
          <input type="text" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="请输入手机号" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input type="password" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="请输入密码（至少6位）" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
          <input type="password" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="请再次输入密码" />
        </div>
        <button type="submit" className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90">注册</button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        已有账号？<Link to="/login" className="text-primary hover:underline">立即登录</Link>
      </p>
    </div>
  )
}
