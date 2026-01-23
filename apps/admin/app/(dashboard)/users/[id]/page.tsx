"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, Calendar, Shield, MapPin } from "lucide-react";
import Link from "next/link";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id;

  // Mock user data
  const user = {
    id: userId,
    nickname: "考公人",
    phone: "13812341234",
    email: "user@example.com",
    status: "active",
    created_at: "2024-10-15",
    profile: {
      real_name: "张三",
      gender: "男",
      education: "本科",
      major: "计算机科学与技术",
      school: "北京大学",
      graduation_year: 2023,
      political_status: "中共党员",
      current_location: "北京市",
    },
    preferences: {
      preferred_regions: ["北京", "上海", "广州"],
      preferred_position_types: ["国考", "省考"],
    },
    stats: {
      favorites_count: 25,
      match_count: 15,
      login_count: 120,
      last_login: "2024-12-20 10:30:00",
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">用户详情</h1>
          <p className="text-gray-500">ID: {userId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 基本信息 */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">基本信息</h2>
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">{user.nickname.charAt(0)}</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold">{user.nickname}</h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.status === "active"
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {user.status === "active" ? "正常" : "禁用"}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <Phone className="w-4 h-4 mr-3" />
              {user.phone}
            </div>
            <div className="flex items-center text-gray-600">
              <Mail className="w-4 h-4 mr-3" />
              {user.email}
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-3" />
              注册于 {user.created_at}
            </div>
          </div>
        </div>

        {/* 个人资料 */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">个人资料</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">真实姓名</span>
              <span className="text-gray-800">{user.profile.real_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">性别</span>
              <span className="text-gray-800">{user.profile.gender}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">学历</span>
              <span className="text-gray-800">{user.profile.education}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">专业</span>
              <span className="text-gray-800">{user.profile.major}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">毕业院校</span>
              <span className="text-gray-800">{user.profile.school}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">政治面貌</span>
              <span className="text-gray-800">{user.profile.political_status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">所在地</span>
              <span className="text-gray-800">{user.profile.current_location}</span>
            </div>
          </div>
        </div>

        {/* 使用统计 */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">使用统计</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-800">{user.stats.favorites_count}</div>
              <div className="text-gray-500 text-sm">收藏职位</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-800">{user.stats.match_count}</div>
              <div className="text-gray-500 text-sm">匹配次数</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-800">{user.stats.login_count}</div>
              <div className="text-gray-500 text-sm">登录次数</div>
            </div>
            <div className="text-sm text-gray-500">最后登录: {user.stats.last_login}</div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex space-x-4">
        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
          编辑用户
        </button>
        <button className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50">
          {user.status === "active" ? "禁用用户" : "启用用户"}
        </button>
      </div>
    </div>
  );
}
