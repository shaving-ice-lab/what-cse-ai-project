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
} from "lucide-react";
import { toast } from "@/components/ui/toaster";

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

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setProfile({ ...profile, [name]: value });
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">个人中心</h1>
          <p className="text-gray-500 mt-1">管理您的个人信息和报考条件</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          <span>{isEditing ? "保存" : "编辑"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">{profile.nickname}</h2>
              <p className="text-gray-500 mt-1">
                {profile.education} · {profile.major}
              </p>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center space-x-3 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{profile.phone}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{profile.current_location}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              基本信息
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">真实姓名</label>
                <input
                  type="text"
                  name="real_name"
                  value={profile.real_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">性别</label>
                <input
                  type="text"
                  name="gender"
                  value={profile.gender}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">政治面貌</label>
                <input
                  type="text"
                  name="political_status"
                  value={profile.political_status}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">工作年限</label>
                <input
                  type="text"
                  name="work_years"
                  value={profile.work_years === 0 ? "应届毕业生" : `${profile.work_years}年`}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <GraduationCap className="w-5 h-5 mr-2" />
              教育背景
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">学历</label>
                <input
                  type="text"
                  name="education"
                  value={profile.education}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">学位</label>
                <input
                  type="text"
                  name="degree"
                  value={profile.degree}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">毕业院校</label>
                <input
                  type="text"
                  name="school"
                  value={profile.school}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">专业</label>
                <input
                  type="text"
                  name="major"
                  value={profile.major}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">毕业年份</label>
                <input
                  type="text"
                  name="graduation_year"
                  value={profile.graduation_year}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              报考偏好
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">意向地区</label>
                <input
                  type="text"
                  value="北京、上海、广东"
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">考试类型</label>
                <input
                  type="text"
                  value="国考、省考"
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>

          <CertificateManager isEditing={isEditing} />
        </div>
      </div>
    </div>
  );
}

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
  {
    id: 3,
    name: "普通话二级甲等",
    issuer: "国家语委",
    issueDate: "2021-05",
    expiryDate: "",
    certificateNo: "PSC-2021-XXXXX",
  },
];

function CertificateManager({ isEditing }: { isEditing: boolean }) {
  const [certificates, setCertificates] = useState<Certificate[]>(MOCK_CERTIFICATES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCert, setNewCert] = useState({
    name: "",
    issuer: "",
    issueDate: "",
    expiryDate: "",
    certificateNo: "",
  });

  const handleAdd = () => {
    if (!newCert.name || !newCert.issuer) {
      toast.error("请填写证书名称和发证机构");
      return;
    }
    const newId = Math.max(...certificates.map((c) => c.id), 0) + 1;
    setCertificates((prev) => [...prev, { id: newId, ...newCert }]);
    setNewCert({ name: "", issuer: "", issueDate: "", expiryDate: "", certificateNo: "" });
    setShowAddModal(false);
    toast.success("证书添加成功");
  };

  const handleDelete = (id: number) => {
    if (!confirm("确定要删除这个证书吗？")) return;
    setCertificates((prev) => prev.filter((c) => c.id !== id));
    toast.success("证书已删除");
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Award className="w-5 h-5 mr-2" />
          证书管理
        </h3>
        {isEditing && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary border border-primary rounded-lg hover:bg-primary/5"
          >
            <Plus className="w-4 h-4" />
            添加证书
          </button>
        )}
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>暂无证书信息</p>
          {isEditing && <p className="text-sm mt-1">点击上方按钮添加证书</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-800">{cert.name}</h4>
                  {cert.certificateNo && (
                    <span className="text-xs text-gray-400">#{cert.certificateNo}</span>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  <span>{cert.issuer}</span>
                  {cert.issueDate && <span className="ml-2">· 发证日期: {cert.issueDate}</span>}
                  {cert.expiryDate && <span className="ml-2">· 有效期至: {cert.expiryDate}</span>}
                </div>
              </div>
              {isEditing && (
                <button
                  onClick={() => handleDelete(cert.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">添加证书</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">证书名称 *</label>
                <input
                  type="text"
                  value={newCert.name}
                  onChange={(e) => setNewCert((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="例如：英语六级证书"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">发证机构 *</label>
                <input
                  type="text"
                  value={newCert.issuer}
                  onChange={(e) => setNewCert((prev) => ({ ...prev, issuer: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="例如：教育部考试中心"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">发证日期</label>
                  <input
                    type="month"
                    value={newCert.issueDate}
                    onChange={(e) => setNewCert((prev) => ({ ...prev, issueDate: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">有效期至</label>
                  <input
                    type="month"
                    value={newCert.expiryDate}
                    onChange={(e) =>
                      setNewCert((prev) => ({ ...prev, expiryDate: e.target.value }))
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="永久有效可留空"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">证书编号</label>
                <input
                  type="text"
                  value={newCert.certificateNo}
                  onChange={(e) =>
                    setNewCert((prev) => ({ ...prev, certificateNo: e.target.value }))
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="选填"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
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
