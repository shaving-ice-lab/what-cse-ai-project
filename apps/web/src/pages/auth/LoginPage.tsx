import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/components/ui/toaster";

type LoginMode = "password" | "code";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser, isAuthenticated } = useAuthStore();
  const [loginMode, setLoginMode] = useState<LoginMode>("password");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const savedAccount = localStorage.getItem("remembered_account");
    if (savedAccount) {
      setAccount(savedAccount);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    if (!account) {
      toast.error("请输入手机号或邮箱");
      return;
    }
    setCountdown(60);
    toast.success("验证码已发送");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      toast.error("请输入手机号或邮箱");
      return;
    }
    if (loginMode === "password" && !password) {
      toast.error("请输入密码");
      return;
    }
    if (loginMode === "code" && !verifyCode) {
      toast.error("请输入验证码");
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (rememberMe) {
        localStorage.setItem("remembered_account", account);
      } else {
        localStorage.removeItem("remembered_account");
      }

      setUser(
        {
          id: 1,
          nickname: "考公人",
          phone: account.includes("@") ? "" : account,
          email: account.includes("@") ? account : "",
          avatar: "",
        },
        "mock-token",
        "mock-refresh-token"
      );

      toast.success("登录成功");
      navigate("/");
    } catch {
      toast.error("登录失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-2xl font-bold text-center mb-6">登录</h1>

      <div className="flex mb-6 border-b">
        <button
          type="button"
          onClick={() => setLoginMode("password")}
          className={`flex-1 pb-3 text-center font-medium transition-colors ${
            loginMode === "password" ? "text-primary border-b-2 border-primary" : "text-gray-500"
          }`}
        >
          密码登录
        </button>
        <button
          type="button"
          onClick={() => setLoginMode("code")}
          className={`flex-1 pb-3 text-center font-medium transition-colors ${
            loginMode === "code" ? "text-primary border-b-2 border-primary" : "text-gray-500"
          }`}
        >
          验证码登录
        </button>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">手机号/邮箱</label>
          <input
            type="text"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="请输入手机号或邮箱"
          />
        </div>

        {loginMode === "password" ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="请输入密码"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">验证码</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                maxLength={6}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="请输入验证码"
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={countdown > 0}
                className="px-4 py-2 border rounded-lg text-primary hover:bg-primary/5 disabled:text-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {countdown > 0 ? `${countdown}s` : "获取验证码"}
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-600">记住账号</span>
          </label>
          <Link to="/forgot-password" className="text-sm text-primary hover:underline">
            忘记密码？
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "登录中..." : "登录"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        还没有账号？
        <Link to="/register" className="text-primary hover:underline">
          立即注册
        </Link>
      </p>
    </div>
  );
}
