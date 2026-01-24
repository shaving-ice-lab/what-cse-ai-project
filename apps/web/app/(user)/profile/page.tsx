"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Edit2,
  Save,
  Award,
  Plus,
  Trash2,
  Camera,
  Shield,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface UserProfile {
  nickname: string;
  phone: string;
  email: string;
  real_name: string;
  gender: string;
  education: string;
  degree: string;
  major: string;
  school: string;
  graduation_year: number;
  political_status: string;
  work_years: number;
  current_location: string;
}

const mockProfile: UserProfile = {
  nickname: "考公人",
  phone: "138****1234",
  email: "user@example.com",
  real_name: "张三",
  gender: "男",
  education: "本科",
  degree: "学士",
  major: "计算机科学与技术",
  school: "北京大学",
  graduation_year: 2024,
  political_status: "中共党员",
  work_years: 0,
  current_location: "北京市",
};

interface Certificate {
  id: number;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  certificateNo: string;
}

const MOCK_CERTIFICATES: Certificate[] = [
  {
    id: 1,
    name: "英语六级证书",
    issuer: "教育部考试中心",
    issueDate: "2023-06",
    expiryDate: "",
    certificateNo: "CET6-2023-XXXXX",
  },
  {
    id: 2,
    name: "计算机二级证书",
    issuer: "教育部考试中心",
    issueDate: "2022-09",
    expiryDate: "",
    certificateNo: "NCRE2-2022-XXXXX",
  },
];

// Quick Links for user actions
const quickLinks = [
  { href: "/favorites", label: "我的收藏", icon: "❤️", count: 12 },
  { href: "/history", label: "浏览历史", icon: "🕒", count: 45 },
  { href: "/notifications", label: "消息通知", icon: "🔔", count: 3 },
  { href: "/security", label: "账号安全", icon: "🔒" },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>(MOCK_CERTIFICATES);
  const [showAddCertModal, setShowAddCertModal] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSave = () => {
    setIsEditing(false);
    // Save to backend
  };

  const handleDeleteCert = (id: number) => {
    if (confirm("确定要删除这个证书吗？")) {
      setCertificates((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 pb-24 lg:pb-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-stone-800">个人中心</h1>
          <p className="text-stone-500 mt-1">管理您的个人信息和报考条件</p>
        </div>
        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-amber-md hover:shadow-amber-lg"
        >
          {isEditing ? (
            <>
              <Save className="w-4 h-4" />
              保存
            </>
          ) : (
            <>
              <Edit2 className="w-4 h-4" />
              编辑
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          {/* Avatar Card */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6">
            <div className="text-center">
              {/* Avatar */}
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center ring-4 ring-amber-500/20">
                  <User className="w-12 h-12 text-amber-600" />
                </div>
                {isEditing && (
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-amber-md hover:bg-amber-600 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Name & Info */}
              <h2 className="text-xl font-semibold text-stone-800">{profile.nickname}</h2>
              <p className="text-stone-500 mt-1">
                {profile.education} · {profile.major}
              </p>

              {/* Contact Info */}
              <div className="mt-6 space-y-3 text-left">
                <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                  <Phone className="w-4 h-4 text-stone-400" />
                  <span className="text-stone-600">{profile.phone}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                  <Mail className="w-4 h-4 text-stone-400" />
                  <span className="text-stone-600">{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                  <MapPin className="w-4 h-4 text-stone-400" />
                  <span className="text-stone-600">{profile.current_location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-4">
            <div className="space-y-1">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{link.icon}</span>
                    <span className="font-medium text-stone-700">{link.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {link.count !== undefined && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                        {link.count}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-500 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6">
            <h3 className="text-lg font-semibold text-stone-800 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-amber-500" />
              基本信息
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-500">真实姓名</label>
                <input
                  type="text"
                  name="real_name"
                  value={profile.real_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none transition-all disabled:opacity-60 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-500">性别</label>
                <select
                  name="gender"
                  value={profile.gender}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none transition-all disabled:opacity-60 focus:bg-white focus:border-amber-500"
                >
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-500">政治面貌</label>
                <select
                  name="political_status"
                  value={profile.political_status}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none transition-all disabled:opacity-60 focus:bg-white focus:border-amber-500"
                >
                  <option value="中共党员">中共党员</option>
                  <option value="共青团员">共青团员</option>
                  <option value="群众">群众</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-500">工作年限</label>
                <select
                  name="work_years"
                  value={profile.work_years}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none transition-all disabled:opacity-60 focus:bg-white focus:border-amber-500"
                >
                  <option value="0">应届毕业生</option>
                  <option value="1">1年</option>
                  <option value="2">2年</option>
                  <option value="3">3年及以上</option>
                </select>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6">
            <h3 className="text-lg font-semibold text-stone-800 mb-6 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-amber-500" />
              教育背景
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-500">学历</label>
                <select
                  name="education"
                  value={profile.education}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none transition-all disabled:opacity-60 focus:bg-white focus:border-amber-500"
                >
                  <option value="大专">大专</option>
                  <option value="本科">本科</option>
                  <option value="硕士">硕士研究生</option>
                  <option value="博士">博士研究生</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-500">学位</label>
                <select
                  name="degree"
                  value={profile.degree}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none transition-all disabled:opacity-60 focus:bg-white focus:border-amber-500"
                >
                  <option value="学士">学士</option>
                  <option value="硕士">硕士</option>
                  <option value="博士">博士</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-500">毕业院校</label>
                <input
                  type="text"
                  name="school"
                  value={profile.school}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none transition-all disabled:opacity-60 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-500">专业</label>
                <input
                  type="text"
                  name="major"
                  value={profile.major}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none transition-all disabled:opacity-60 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-500">毕业年份</label>
                <input
                  type="number"
                  name="graduation_year"
                  value={profile.graduation_year}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none transition-all disabled:opacity-60 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>
          </div>

          {/* Certificates */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                证书管理
              </h3>
              {isEditing && (
                <button
                  onClick={() => setShowAddCertModal(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-amber-600 border border-amber-500 rounded-lg hover:bg-amber-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  添加证书
                </button>
              )}
            </div>

            {certificates.length === 0 ? (
              <div className="text-center py-8">
                <Award className="w-12 h-12 mx-auto text-stone-200 mb-3" />
                <p className="text-stone-500">暂无证书信息</p>
                {isEditing && (
                  <p className="text-sm text-stone-400 mt-1">点击上方按钮添加证书</p>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between p-4 bg-stone-50 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Award className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-stone-800">{cert.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-stone-500 mt-0.5">
                          <span>{cert.issuer}</span>
                          <span>·</span>
                          <span>{cert.issueDate}</span>
                        </div>
                      </div>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => handleDeleteCert(cert.id)}
                        className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
