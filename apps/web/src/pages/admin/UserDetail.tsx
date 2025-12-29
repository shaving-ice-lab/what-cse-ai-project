import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Briefcase,
  Heart,
  Eye,
  Bell,
  Ban,
  UserCheck,
} from "lucide-react";
import { toast } from "@/components/ui/toaster";

interface UserProfile {
  id: number;
  nickname: string;
  phone: string;
  email: string;
  avatar: string;
  status: number;
  createdAt: string;
  lastLogin: string;
  profile: {
    gender: string;
    birthDate: string;
    hukouProvince: string;
    hukouCity: string;
    politicalStatus: string;
    education: string;
    major: string;
    school: string;
    graduationDate: string;
    isFreshGraduate: boolean;
    workYears: number;
  };
  stats: {
    favorites: number;
    views: number;
    notifications: number;
  };
}

const MOCK_USER: UserProfile = {
  id: 1,
  nickname: "考公人001",
  phone: "13812341234",
  email: "user1@example.com",
  avatar: "",
  status: 1,
  createdAt: "2024-10-01 10:30:00",
  lastLogin: "2024-11-15 14:20:00",
  profile: {
    gender: "男",
    birthDate: "2000-05-15",
    hukouProvince: "北京市",
    hukouCity: "北京市",
    politicalStatus: "中共党员",
    education: "本科",
    major: "计算机科学与技术",
    school: "北京大学",
    graduationDate: "2024-07",
    isFreshGraduate: true,
    workYears: 0,
  },
  stats: {
    favorites: 25,
    views: 156,
    notifications: 8,
  },
};

export default function AdminUserDetail() {
  const { id } = useParams();
  const [user] = useState<UserProfile>(MOCK_USER);
  const [loading, setLoading] = useState(false);

  const handleToggleStatus = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success(user.status === 1 ? "用户已禁用" : "用户已启用");
    } catch {
      toast.error("操作失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/users" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">用户详情</h1>
            <p className="text-gray-500 mt-1">用户ID: {id}</p>
          </div>
        </div>
        <button
          onClick={handleToggleStatus}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            user.status === 1
              ? "bg-red-50 text-red-600 hover:bg-red-100"
              : "bg-green-50 text-green-600 hover:bg-green-100"
          }`}
        >
          {user.status === 1 ? <Ban className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          {user.status === 1 ? "禁用用户" : "启用用户"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 基本信息卡片 */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl font-bold">
              {user.nickname.charAt(0)}
            </div>
            <h2 className="text-xl font-semibold mt-4">{user.nickname}</h2>
            <span
              className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                user.status === 1 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
              }`}
            >
              {user.status === 1 ? "正常" : "已禁用"}
            </span>
          </div>
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{user.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>注册于 {user.createdAt}</span>
            </div>
          </div>
        </div>

        {/* 用户资料 */}
        <div className="lg:col-span-2 bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            个人资料
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">性别</label>
              <p className="font-medium">{user.profile.gender || "-"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">出生日期</label>
              <p className="font-medium">{user.profile.birthDate || "-"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">政治面貌</label>
              <p className="font-medium">{user.profile.politicalStatus || "-"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">户籍所在地</label>
              <p className="font-medium">
                {user.profile.hukouProvince} {user.profile.hukouCity}
              </p>
            </div>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            教育背景
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">最高学历</label>
              <p className="font-medium">{user.profile.education || "-"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">毕业院校</label>
              <p className="font-medium">{user.profile.school || "-"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">所学专业</label>
              <p className="font-medium">{user.profile.major || "-"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">毕业时间</label>
              <p className="font-medium">{user.profile.graduationDate || "-"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">应届生身份</label>
              <p className="font-medium">{user.profile.isFreshGraduate ? "是" : "否"}</p>
            </div>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            工作经历
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">工作年限</label>
              <p className="font-medium">{user.profile.workYears}年</p>
            </div>
          </div>
        </div>
      </div>

      {/* 用户行为统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <Heart className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">收藏职位</p>
              <p className="text-2xl font-bold">{user.stats.favorites}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Eye className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">浏览记录</p>
              <p className="text-2xl font-bold">{user.stats.views}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Bell className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">未读通知</p>
              <p className="text-2xl font-bold">{user.stats.notifications}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 登录日志 */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">登录日志</h3>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">时间</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">IP地址</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">设备</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="px-4 py-3 text-sm">2024-11-15 14:20:00</td>
              <td className="px-4 py-3 text-sm">192.168.1.100</td>
              <td className="px-4 py-3 text-sm">Windows PC - Chrome</td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs">成功</span>
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm">2024-11-14 09:15:00</td>
              <td className="px-4 py-3 text-sm">192.168.1.101</td>
              <td className="px-4 py-3 text-sm">iPhone - Safari</td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs">成功</span>
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm">2024-11-13 18:30:00</td>
              <td className="px-4 py-3 text-sm">10.0.0.50</td>
              <td className="px-4 py-3 text-sm">Android - App</td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs">失败</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
