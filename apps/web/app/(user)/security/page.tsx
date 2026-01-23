"use client";

import { useState } from "react";
import { Shield, Key, Smartphone, Mail } from "lucide-react";

export default function SecurityPage() {
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">账户安全</h1>
        <p className="text-gray-500 mt-1">管理您的账户安全设置</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Key className="w-5 h-5 mr-2" />
            密码设置
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">登录密码</p>
              <p className="text-sm text-gray-400">建议定期更换密码以保证账户安全</p>
            </div>
            <button
              onClick={() => setShowChangePassword(!showChangePassword)}
              className="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary/5"
            >
              修改密码
            </button>
          </div>

          {showChangePassword && (
            <div className="mt-4 pt-4 border-t space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">当前密码</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="请输入当前密码"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="请输入新密码"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="请再次输入新密码"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                  确认修改
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Smartphone className="w-5 h-5 mr-2" />
            手机绑定
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">已绑定手机：138****1234</p>
              <p className="text-sm text-gray-400">手机号用于登录和找回密码</p>
            </div>
            <button className="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary/5">
              更换手机
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            邮箱绑定
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">已绑定邮箱：user@example.com</p>
              <p className="text-sm text-gray-400">邮箱用于接收通知和找回密码</p>
            </div>
            <button className="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary/5">
              更换邮箱
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            账户注销
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">注销账户</p>
              <p className="text-sm text-gray-400">注销后账户数据将被永久删除，无法恢复</p>
            </div>
            <button className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50">
              注销账户
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
