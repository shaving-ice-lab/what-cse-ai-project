import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/toaster";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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
      toast.error("请输入手机号");
      return;
    }
    if (!validatePhone(phone)) {
      toast.error("请输入正确的手机号格式");
      return;
    }

    setCountdown(60);
    toast.success("验证码已发送，请注意查收");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone) {
      toast.error("请输入手机号");
      return;
    }
    if (!validatePhone(phone)) {
      toast.error("请输入正确的手机号格式");
      return;
    }
    if (!verifyCode) {
      toast.error("请输入验证码");
      return;
    }
    if (verifyCode.length !== 6) {
      toast.error("验证码格式不正确");
      return;
    }
    if (!password) {
      toast.error("请输入密码");
      return;
    }
    if (password.length < 6) {
      toast.error("密码长度至少6位");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("两次输入的密码不一致");
      return;
    }
    if (!agreedToTerms) {
      toast.error("请阅读并同意用户协议");
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("注册成功，请登录");
      navigate("/login");
    } catch {
      toast.error("注册失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-2xl font-bold text-center mb-6">注册</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={11}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="请输入手机号"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="请输入密码（至少6位）"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="请再次输入密码"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-600">
            我已阅读并同意
            <a href="/terms" className="text-primary hover:underline">
              《用户协议》
            </a>
            和
            <a href="/privacy" className="text-primary hover:underline">
              《隐私政策》
            </a>
          </span>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "注册中..." : "注册"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        已有账号？
        <Link to="/login" className="text-primary hover:underline">
          立即登录
        </Link>
      </p>
    </div>
  );
}
