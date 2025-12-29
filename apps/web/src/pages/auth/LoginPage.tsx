import { Link } from 'react-router-dom'

export default function LoginPage() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-2xl font-bold text-center mb-6">登录</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">手机号/邮箱</label>
          <input type="text" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="请输入手机号或邮箱" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input type="password" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="请输入密码" />
        </div>
        <button type="submit" className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90">登录</button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        还没有账号？<Link to="/register" className="text-primary hover:underline">立即注册</Link>
      </p>
    </div>
  )
}
