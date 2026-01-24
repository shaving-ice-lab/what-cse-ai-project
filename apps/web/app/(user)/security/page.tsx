"use client";

import { useState } from "react";
import {
  Shield,
  Key,
  Smartphone,
  Mail,
  Eye,
  EyeOff,
  AlertTriangle,
  Check,
  Loader2,
  ChevronRight,
} from "lucide-react";

export default function SecurityPage() {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      alert("请填写所有密码字段");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      alert("两次输入的新密码不一致");
      return;
    }
    if (passwords.new.length < 8) {
      alert("新密码长度至少8位");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setShowChangePassword(false);
    setPasswords({ current: "", new: "", confirm: "" });
    alert("密码修改成功");
  };

  return (
    <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 pb-24 lg:pb-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-serif font-bold text-stone-800 flex items-center gap-3">
          <Shield className="w-8 h-8 text-amber-500" />
          账户安全
        </h1>
        <p className="text-stone-500 mt-1">管理您的账户安全设置</p>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* Password Section */}
        <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card overflow-hidden">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Key className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-stone-800">密码设置</h3>
                <p className="text-sm text-stone-500 mt-1">
                  建议定期更换密码以保证账户安全
                </p>
              </div>
              <button
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="px-4 py-2 text-amber-600 border border-amber-300 rounded-xl hover:bg-amber-50 transition-colors font-medium"
              >
                修改密码
              </button>
            </div>
          </div>

          {showChangePassword && (
            <div className="border-t border-stone-100 p-6 bg-stone-50/50 animate-fade-in">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-stone-700">
                    当前密码
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwords.current}
                      onChange={(e) =>
                        setPasswords((prev) => ({ ...prev, current: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      placeholder="请输入当前密码"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-stone-700">
                    新密码
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwords.new}
                      onChange={(e) =>
                        setPasswords((prev) => ({ ...prev, new: e.target.value }))
                      }
                      className="w-full px-4 py-3 pr-12 bg-white border border-stone-200 rounded-xl text-stone-800 outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      placeholder="请输入新密码（至少8位）"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-stone-700">
                    确认新密码
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwords.confirm}
                      onChange={(e) =>
                        setPasswords((prev) => ({ ...prev, confirm: e.target.value }))
                      }
                      className="w-full px-4 py-3 pr-12 bg-white border border-stone-200 rounded-xl text-stone-800 outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      placeholder="请再次输入新密码"
                    />
                    {passwords.confirm && passwords.new === passwords.confirm && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Check className="w-5 h-5 text-emerald-500" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowChangePassword(false);
                      setPasswords({ current: "", new: "", confirm: "" });
                    }}
                    className="px-5 py-2.5 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-100 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 disabled:opacity-60 transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        修改中...
                      </>
                    ) : (
                      "确认修改"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Phone Binding */}
        <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-stone-800">手机绑定</h3>
              <p className="text-sm text-stone-500 mt-1">
                已绑定手机：<span className="text-stone-700">138****1234</span>
              </p>
              <p className="text-xs text-stone-400 mt-1">手机号用于登录和找回密码</p>
            </div>
            <button className="px-4 py-2 text-stone-600 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors">
              更换手机
            </button>
          </div>
        </div>

        {/* Email Binding */}
        <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-stone-800">邮箱绑定</h3>
              <p className="text-sm text-stone-500 mt-1">
                已绑定邮箱：<span className="text-stone-700">user@example.com</span>
              </p>
              <p className="text-xs text-stone-400 mt-1">邮箱用于接收通知和找回密码</p>
            </div>
            <button className="px-4 py-2 text-stone-600 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors">
              更换邮箱
            </button>
          </div>
        </div>

        {/* Account Deletion */}
        <div className="bg-white rounded-2xl border border-red-200 shadow-card p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-stone-800">账户注销</h3>
              <p className="text-sm text-stone-500 mt-1">
                注销后账户数据将被永久删除，无法恢复
              </p>
            </div>
            <button className="px-4 py-2 text-red-600 border border-red-300 rounded-xl hover:bg-red-50 transition-colors">
              注销账户
            </button>
          </div>
        </div>

        {/* Security Tips */}
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6">
          <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            安全建议
          </h3>
          <ul className="space-y-3">
            {[
              "定期更换密码，使用包含大小写字母、数字和特殊符号的强密码",
              "不要在公共设备上保存登录信息",
              "注意保护个人手机号和邮箱的安全",
              "遇到可疑信息请及时联系客服",
            ].map((tip, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-amber-700"
              >
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
