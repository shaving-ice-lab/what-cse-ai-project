"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validatePhone = (phone: string) => {
    return /^1[3-9]\d{9}$/.test(phone);
  };

  const handleSendCode = async () => {
    if (!phone) {
      alert("请输入手机号");
      return;
    }
    if (!validatePhone(phone)) {
      alert("请输入正确的手机号格式");
      return;
    }

    setCountdown(60);
    alert("验证码已发送，请注意查收");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone) {
      alert("请输入手机号");
      return;
    }
    if (!validatePhone(phone)) {
      alert("请输入正确的手机号格式");
      return;
    }
    if (!verifyCode) {
      alert("请输入验证码");
      return;
    }
    if (!newPassword) {
      alert("请输入新密码");
      return;
    }
    if (newPassword.length < 6) {
      alert("密码长度至少6位");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("两次输入的密码不一致");
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("密码重置成功，请登录");
      router.push("/login");
    } catch {
      alert("重置失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-2xl font-bold text-center mb-6">找回密码</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={11}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="请输入注册时使用的手机号"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">验证码</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
              maxLength={6}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="请输入6位验证码"
            />
            <button
              type="button"
              onClick={handleSendCode}
              disabled={countdown > 0}
              className="px-4 py-2 border rounded-lg text-primary hover:bg-primary/5 disabled:text-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {countdown > 0 ? `${countdown}s后重发` : "获取验证码"}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="请输入新密码（至少6位）"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="请再次输入新密码"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "提交中..." : "重置密码"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        想起密码了？
        <Link href="/login" className="text-primary hover:underline">
          返回登录
        </Link>
      </p>
    </div>
  );
}
