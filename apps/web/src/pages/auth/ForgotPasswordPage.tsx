import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "@/components/ui/toaster";

type Step = "email" | "verify" | "reset" | "success";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("请输入邮箱地址");
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API to send verification code
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("验证码已发送到您的邮箱");
      setStep("verify");
      startCountdown();
    } catch {
      toast.error("发送验证码失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      toast.error("请输入6位验证码");
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API to verify code
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStep("reset");
    } catch {
      toast.error("验证码错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      toast.error("密码至少需要6个字符");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("两次输入的密码不一致");
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API to reset password
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("密码重置成功");
      setStep("success");
    } catch {
      toast.error("密码重置失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-2xl font-bold text-center mb-6">
        {step === "success" ? "重置成功" : "找回密码"}
      </h1>

      {step === "email" && (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱地址</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="请输入注册邮箱"
            />
          </div>
          <p className="text-sm text-gray-500">我们将向您的邮箱发送验证码</p>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "发送中..." : "发送验证码"}
          </button>
        </form>
      )}

      {step === "verify" && (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">验证码</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength={6}
            />
          </div>
          <p className="text-sm text-gray-500">验证码已发送至 {email}</p>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "验证中..." : "验证"}
          </button>
          <button
            type="button"
            onClick={handleSendCode}
            disabled={countdown > 0 || loading}
            className="w-full py-2 text-primary hover:underline disabled:opacity-50 disabled:no-underline"
          >
            {countdown > 0 ? `${countdown}秒后可重新发送` : "重新发送验证码"}
          </button>
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="请输入新密码（至少6位）"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
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
            {loading ? "重置中..." : "重置密码"}
          </button>
        </form>
      )}

      {step === "success" && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-gray-600">您的密码已重置成功</p>
          <Link
            to="/login"
            className="block w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-center"
          >
            返回登录
          </Link>
        </div>
      )}

      {step !== "success" && (
        <p className="mt-4 text-center text-sm text-gray-600">
          想起密码了？
          <Link to="/login" className="text-primary hover:underline">
            返回登录
          </Link>
        </p>
      )}
    </div>
  );
}
