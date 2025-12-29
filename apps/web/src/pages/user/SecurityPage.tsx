import { useState } from "react";
import { Shield, Key, Smartphone, Mail, Eye, EyeOff } from "lucide-react";
import { toast } from "@/components/ui/toaster";

export default function SecurityPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      toast.error("请输入当前密码");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("新密码至少需要6个字符");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("两次输入的密码不一致");
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API to change password
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("密码修改成功");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      toast.error("密码修改失败，请检查当前密码是否正确");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6" />
        <h1 className="text-2xl font-bold">账号安全</h1>
      </div>

      <div className="space-y-6">
        {/* 修改密码 */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold">修改密码</h2>
          </div>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">当前密码</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 pr-10"
                  placeholder="请输入当前密码"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 pr-10"
                  placeholder="请输入新密码（至少6位）"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="请再次输入新密码"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "修改中..." : "修改密码"}
            </button>
          </form>
        </section>

        {/* 绑定手机 */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold">绑定手机</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">当前绑定手机：138****8888</p>
              <p className="text-sm text-gray-400 mt-1">绑定手机可用于登录和找回密码</p>
            </div>
            <button className="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary/5">
              更换手机
            </button>
          </div>
        </section>

        {/* 绑定邮箱 */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold">绑定邮箱</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">当前绑定邮箱：user@example.com</p>
              <p className="text-sm text-gray-400 mt-1">绑定邮箱可用于接收重要通知和找回密码</p>
            </div>
            <button className="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary/5">
              更换邮箱
            </button>
          </div>
        </section>

        {/* 登录设备管理 */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">登录设备</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Windows PC - Chrome</p>
                <p className="text-sm text-gray-400">北京市 • 当前设备</p>
              </div>
              <span className="text-sm text-green-500">在线</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">iPhone 14 Pro - Safari</p>
                <p className="text-sm text-gray-400">北京市 • 2天前登录</p>
              </div>
              <button className="text-sm text-red-500 hover:underline">下线</button>
            </div>
          </div>
          <button className="mt-4 text-sm text-red-500 hover:underline">下线所有其他设备</button>
        </section>

        {/* 账号注销 */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-red-600">危险操作</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">注销账号</p>
              <p className="text-sm text-gray-400">注销后所有数据将被永久删除，无法恢复</p>
            </div>
            <button className="px-4 py-2 text-red-500 border border-red-500 rounded-lg hover:bg-red-50">
              注销账号
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
