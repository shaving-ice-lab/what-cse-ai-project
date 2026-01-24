import Link from "next/link";
import { Briefcase, Target, Shield, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "智能匹配",
    description: "根据您的条件精准匹配合适职位",
  },
  {
    icon: Briefcase,
    title: "海量职位",
    description: "覆盖国考、省考、事业单位等",
  },
  {
    icon: Shield,
    title: "数据安全",
    description: "严格保护您的个人隐私信息",
  },
  {
    icon: TrendingUp,
    title: "实时更新",
    description: "第一时间获取最新招考信息",
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900" />
        
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          {/* Amber Glow */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl" />
          
          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-amber-lg">
              <span className="text-white font-bold text-2xl">智</span>
            </div>
            <span className="text-2xl font-serif font-bold text-white">公考智选</span>
          </Link>

          {/* Tagline */}
          <h1 className="text-4xl xl:text-5xl font-serif font-bold text-white mb-4 leading-tight">
            开启你的
            <br />
            <span className="text-gradient-amber">公考智选</span>之旅
          </h1>
          <p className="text-lg text-stone-400 mb-12 max-w-md leading-relaxed">
            智能匹配，精准定位。让每一位考生都能找到最适合自己的公务员岗位。
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/30 transition-colors">
                  <feature.icon className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">{feature.title}</h3>
                  <p className="text-sm text-stone-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-12 mt-12 pt-12 border-t border-white/10">
            <div>
              <p className="text-3xl font-display font-bold text-amber-400">10,000+</p>
              <p className="text-sm text-stone-400 mt-1">职位数据</p>
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-amber-400">50,000+</p>
              <p className="text-sm text-stone-400 mt-1">注册用户</p>
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-amber-400">95%</p>
              <p className="text-sm text-stone-400 mt-1">匹配准确率</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Panel */}
      <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-50">
        {/* Mobile Header */}
        <header className="lg:hidden p-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-amber">
              <span className="text-white font-bold text-lg">智</span>
            </div>
            <span className="text-xl font-serif font-bold text-stone-800">公考智选</span>
          </Link>
        </header>

        {/* Form Container */}
        <main className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-center">
          <p className="text-sm text-stone-500">
            © 2024 公考智选. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
