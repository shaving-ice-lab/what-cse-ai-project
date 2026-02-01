"use client";

import { useState, useEffect, useCallback } from "react";
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
  ChevronRight,
  Loader2,
  X,
  Calendar,
  Building2,
  Flag,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@what-cse/ui";
import {
  userApi,
  type UserProfileResponse,
  type UpdateProfileParams,
  type UserCertificate,
  type CertificateParams,
} from "@/services/api/user";
import { useAuthStore } from "@/stores/authStore";

// Quick Links for user actions
const quickLinks = [
  { href: "/vip", label: "VIP会员", icon: "👑", highlight: true },
  { href: "/favorites", label: "我的收藏", icon: "❤️" },
  { href: "/history", label: "浏览历史", icon: "🕒" },
  { href: "/notifications", label: "消息通知", icon: "🔔" },
  { href: "/security", label: "账号安全", icon: "🔒" },
];

// 选项配置
const educationOptions = ["大专", "本科", "硕士研究生", "博士研究生"];
const degreeOptions = ["无", "学士", "硕士", "博士"];
const politicalStatusOptions = ["中共党员", "中共党员或共青团员", "共青团员", "群众"];
const schoolTypeOptions = ["985", "211", "双一流", "普通本科", "大专"];
const identityTypeOptions = ["应届生", "社会人员", "服务基层人员"];
const certTypeOptions = ["语言证书", "职业资格", "技能证书", "学历证书", "其他"];

export default function ProfilePage() {
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddCertModal, setShowAddCertModal] = useState(false);
  const [newCert, setNewCert] = useState<CertificateParams>({
    cert_type: "",
    cert_name: "",
    cert_level: "",
  });

  // 表单数据
  const [formData, setFormData] = useState<UpdateProfileParams>({});

  // 获取用户档案
  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const data = await userApi.getProfile();
      setProfileData(data);
      // 初始化表单数据
      if (data.profile) {
        setFormData({
          nickname: data.user?.nickname || "",
          gender: data.profile.gender || "",
          birth_date: data.profile.birth_date || "",
          hukou_province: data.profile.hukou_province || "",
          hukou_city: data.profile.hukou_city || "",
          current_province: data.profile.current_province || "",
          current_city: data.profile.current_city || "",
          political_status: data.profile.political_status || "",
          education: data.profile.education || "",
          degree: data.profile.degree || "",
          major: data.profile.major || "",
          major_category: data.profile.major_category || "",
          school: data.profile.school || "",
          school_type: data.profile.school_type || "",
          graduate_year: data.profile.graduate_year,
          is_fresh_graduate: data.profile.is_fresh_graduate || false,
          work_years: data.profile.work_years || 0,
          grassroots_exp_years: data.profile.grassroots_exp_years || 0,
          identity_type: data.profile.identity_type || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("获取用户信息失败");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await userApi.updateProfile(formData);
      toast.success("保存成功");
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleAddCertificate = async () => {
    if (!newCert.cert_type || !newCert.cert_name) {
      toast.error("请填写证书类型和名称");
      return;
    }

    try {
      await userApi.addCertificate(newCert);
      toast.success("添加证书成功");
      setShowAddCertModal(false);
      setNewCert({ cert_type: "", cert_name: "", cert_level: "" });
      fetchProfile();
    } catch (error) {
      console.error("Failed to add certificate:", error);
      toast.error("添加证书失败");
    }
  };

  const handleDeleteCertificate = async (id: number) => {
    if (!confirm("确定要删除这个证书吗？")) return;

    try {
      await userApi.deleteCertificate(id);
      toast.success("删除成功");
      fetchProfile();
    } catch (error) {
      console.error("Failed to delete certificate:", error);
      toast.error("删除失败");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <User className="w-16 h-16 mx-auto text-stone-300 mb-4" />
        <h2 className="text-xl font-semibold text-stone-700 mb-2">请先登录</h2>
        <p className="text-stone-500 mb-6">登录后可以管理您的个人信息</p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
        >
          立即登录
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Loader2 className="w-12 h-12 mx-auto text-amber-500 animate-spin mb-4" />
        <p className="text-stone-500">加载中...</p>
      </div>
    );
  }

  const user = profileData?.user;
  const profile = profileData?.profile;
  const certificates = profileData?.certificates || [];

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
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-amber-md hover:shadow-amber-lg disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              保存中...
            </>
          ) : isEditing ? (
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
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center ring-4 ring-amber-500/20 overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="头像" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-amber-600" />
                  )}
                </div>
                {isEditing && (
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-amber-md hover:bg-amber-600 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Name & Info */}
              <h2 className="text-xl font-semibold text-stone-800">
                {user?.nickname || "未设置昵称"}
              </h2>
              <p className="text-stone-500 mt-1">
                {profile?.education || "未设置学历"} · {profile?.major || "未设置专业"}
              </p>

              {/* Profile Completeness */}
              <div className="mt-4 p-3 bg-stone-50 rounded-xl">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-stone-500">资料完整度</span>
                  <span className="font-medium text-amber-600">
                    {profile?.profile_completeness || 0}%
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
                    style={{ width: `${profile?.profile_completeness || 0}%` }}
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="mt-6 space-y-3 text-left">
                <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                  <Phone className="w-4 h-4 text-stone-400" />
                  <span className="text-stone-600">{user?.phone || "未绑定手机"}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                  <Mail className="w-4 h-4 text-stone-400" />
                  <span className="text-stone-600">{user?.email || "未绑定邮箱"}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                  <MapPin className="w-4 h-4 text-stone-400" />
                  <span className="text-stone-600">
                    {profile?.current_province
                      ? `${profile.current_province} ${profile.current_city || ""}`
                      : "未设置现居地"}
                  </span>
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
                  className={`flex items-center justify-between p-3 rounded-xl transition-colors group ${
                    (link as { highlight?: boolean }).highlight
                      ? "bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100"
                      : "hover:bg-stone-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{link.icon}</span>
                    <span
                      className={`font-medium ${
                        (link as { highlight?: boolean }).highlight
                          ? "text-amber-700"
                          : "text-stone-700"
                      }`}
                    >
                      {link.label}
                    </span>
                  </div>
                  {(link as { highlight?: boolean }).highlight ? (
                    <span className="px-2 py-0.5 text-xs bg-amber-500 text-white rounded-full font-medium">
                      开通
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-500 transition-colors" />
                  )}
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
                <label className="block text-sm font-medium text-stone-500">昵称</label>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none transition-all disabled:opacity-60 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  placeholder="请输入昵称"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-500">性别</label>
                <select
                  name="gender"
                  value={formData.gender || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none transition-all disabled:opacity-60 focus:bg-white focus:border-amber-500"
                >
                  <option value="">请选择</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-500">出生日期</label>
                <input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none transition-all disabled:opacity-60 focus:bg-white focus:border-amber-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-500">政治面貌</label>
                <select
                  name="political_status"
                  value={formData.political_status || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none transition-all disabled:opacity-60 focus:bg-white focus:border-amber-500"
                >
                  <option value="">请选择</option>
                  {politicalStatusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-500">身份类型</label>
                <select
                  name="identity_type"
                  value={formData.identity_type || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none transition-all disabled:opacity-60 focus:bg-white focus:border-amber-500"
                >
                  <option value="">请选择</option>
                  {identityTypeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 flex items-end">
                <label className="flex items-center gap-2 text-sm font-medium text-stone-500 cursor-pointer px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl w-full">
                  <input
                    type="checkbox"
                    name="is_fresh_graduate"
                    checked={formData.is_fresh_graduate || false}
                    onChange={handleCheckboxChange}
                    disabled={!isEditing}
                    className="rounded border-stone-300 text-amber-500 focus:ring-amber-500 disabled:opacity-60"
                  />
                  应届毕业生
                </label>
              </div>
            </div>
          </div>

          {/* Work Experience */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6">
            <h3 className="text-lg font-semibold text-stone-800 mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-500" />
              工作经历
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-500">工作年限</label>
                <select
                  name="work_years"
                  value={formData.work_years || 0}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none transition-all disabled:opacity-60 focus:bg-white focus:border-amber-500"
                >
                  <option value={0}>无工作经验/应届</option>
                  <option value={1}>1年</option>
                  <option value={2}>2年</option>
                  <option value={3}>3年</option>
                  <option value={4}>4年</option>
                  <option value={5}>5年及以上</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-500">基层工作年限</label>
                <select
                  name="grassroots_exp_years"
                  value={formData.grassroots_exp_years || 0}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none transition-all disabled:opacity-60 focus:bg-white focus:border-amber-500"
                >
                  <option value={0}>无基层工作经验</option>
                  <option value={1}>1年</option>
                  <option value={2}>2年</option>
                  <option value={3}>3年及以上</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location Info */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6">
            <h3 className="text-lg font-semibold text-stone-800 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-500" />
              地域信息
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-500">户籍省份</label>
                <input
                  type="text"
                  name="hukou_province"
                  value={formData.hukou_province || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none transition-all disabled:opacity-60 focus:bg-white focus:border-amber-500"
                  placeholder="如：北京市"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-500">户籍城市</label>
                <input
                  type="text"
                  name="hukou_city"
                  value={formData.hukou_city || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none transition-all disabled:opacity-60 focus:bg-white focus:border-amber-500"
                  placeholder="如：朝阳区"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-500">现居省份</label>
                <input
                  type="text"
                  name="current_province"
                  value={formData.current_province || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none transition-all disabled:opacity-60 focus:bg-white focus:border-amber-500"
                  placeholder="如：上海市"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-500">现居城市</label>
                <input
                  type="text"
                  name="current_city"
                  value={formData.current_city || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none transition-all disabled:opacity-60 focus:bg-white focus:border-amber-500"
                  placeholder="如：浦东新区"
                />
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
                  value={formData.education || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none transition-all disabled:opacity-60 focus:bg-white focus:border-amber-500"
                >
                  <option value="">请选择</option>
                  {educationOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-500">学位</label>
                <select
                  name="degree"
                  value={formData.degree || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none transition-all disabled:opacity-60 focus:bg-white focus:border-amber-500"
                >
                  <option value="">请选择</option>
                  {degreeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-500">毕业院校</label>
                <input
                  type="text"
                  name="school"
                  value={formData.school || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none transition-all disabled:opacity-60 focus:bg-white focus:border-amber-500"
                  placeholder="请输入毕业院校"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-500">学校类型</label>
                <select
                  name="school_type"
                  value={formData.school_type || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none transition-all disabled:opacity-60 focus:bg-white focus:border-amber-500"
                >
                  <option value="">请选择</option>
                  {schoolTypeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-500">专业名称</label>
                <input
                  type="text"
                  name="major"
                  value={formData.major || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none transition-all disabled:opacity-60 focus:bg-white focus:border-amber-500"
                  placeholder="请输入专业名称"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-500">专业大类</label>
                <input
                  type="text"
                  name="major_category"
                  value={formData.major_category || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none transition-all disabled:opacity-60 focus:bg-white focus:border-amber-500"
                  placeholder="如：工学、管理学"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-500">毕业年份</label>
                <input
                  type="number"
                  name="graduate_year"
                  value={formData.graduate_year || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none transition-all disabled:opacity-60 focus:bg-white focus:border-amber-500"
                  placeholder="如：2024"
                  min={1990}
                  max={2030}
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
                {isEditing && <p className="text-sm text-stone-400 mt-1">点击上方按钮添加证书</p>}
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
                        <h4 className="font-medium text-stone-800">{cert.cert_name}</h4>
                        <div className="flex items-center gap-2 text-sm text-stone-500 mt-0.5">
                          <span>{cert.cert_type}</span>
                          {cert.cert_level && (
                            <>
                              <span>·</span>
                              <span>{cert.cert_level}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => handleDeleteCertificate(cert.id)}
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

      {/* Add Certificate Modal */}
      {showAddCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-stone-800">添加证书</h3>
              <button
                onClick={() => setShowAddCertModal(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-500">证书类型 *</label>
                <select
                  value={newCert.cert_type}
                  onChange={(e) => setNewCert((prev) => ({ ...prev, cert_type: e.target.value }))}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none focus:bg-white focus:border-amber-500"
                >
                  <option value="">请选择</option>
                  {certTypeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-500">证书名称 *</label>
                <input
                  type="text"
                  value={newCert.cert_name}
                  onChange={(e) => setNewCert((prev) => ({ ...prev, cert_name: e.target.value }))}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none focus:bg-white focus:border-amber-500"
                  placeholder="如：英语六级证书"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-500">证书等级</label>
                <input
                  type="text"
                  value={newCert.cert_level || ""}
                  onChange={(e) => setNewCert((prev) => ({ ...prev, cert_level: e.target.value }))}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 outline-none focus:bg-white focus:border-amber-500"
                  placeholder="如：425分以上"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddCertModal(false)}
                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddCertificate}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
