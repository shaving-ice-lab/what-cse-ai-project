"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Briefcase, MapPin, GraduationCap, Users, Clock } from "lucide-react";

export default function PositionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const positionId = params.id;

  // Mock position data
  const position = {
    id: positionId,
    name: "科员（一）",
    department_name: "国家税务总局北京市税务局",
    position_code: "100110001001",
    exam_type: "国考",
    year: 2025,
    work_location: "北京市东城区",
    recruit_count: 3,
    education_requirement: "本科及以上",
    degree_requirement: "学士及以上",
    major_requirement: "计算机类、数学类、统计学类",
    political_status_requirement: "不限",
    base_work_experience: "无限制",
    other_requirements: "具有良好的沟通能力和团队协作精神",
    remark: "该岗位需要参加专业能力测试",
    status: "published",
    registration_count: 156,
    review_pass_count: 120,
    created_at: "2024-10-15",
    updated_at: "2024-11-20",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{position.name}</h1>
            <p className="text-gray-500">{position.department_name}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            position.status === "published"
              ? "bg-green-100 text-green-600"
              : "bg-yellow-100 text-yellow-600"
          }`}
        >
          {position.status === "published" ? "已发布" : "待审核"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 基本信息 */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">基本信息</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">职位代码</span>
              <span className="text-gray-800 font-mono">{position.position_code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">考试类型</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                {position.exam_type}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">招录年份</span>
              <span className="text-gray-800">{position.year}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">工作地点</span>
              <span className="text-gray-800">{position.work_location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">招录人数</span>
              <span className="text-gray-800">{position.recruit_count}人</span>
            </div>
          </div>
        </div>

        {/* 报名统计 */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">报名统计</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{position.registration_count}</div>
              <div className="text-gray-500 text-sm">报名人数</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{position.review_pass_count}</div>
              <div className="text-gray-500 text-sm">审核通过</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">
                {Math.round(position.registration_count / position.recruit_count)}:1
              </div>
              <div className="text-gray-500 text-sm">竞争比</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-orange-600">
                {Math.round((position.review_pass_count / position.registration_count) * 100)}%
              </div>
              <div className="text-gray-500 text-sm">审核通过率</div>
            </div>
          </div>
        </div>

        {/* 招录要求 */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">招录要求</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">学历</span>
              <span className="text-gray-800">{position.education_requirement}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">学位</span>
              <span className="text-gray-800">{position.degree_requirement}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-500">专业</span>
              <span className="text-gray-800 text-right max-w-[200px]">
                {position.major_requirement}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">政治面貌</span>
              <span className="text-gray-800">{position.political_status_requirement}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">基层工作经验</span>
              <span className="text-gray-800">{position.base_work_experience}</span>
            </div>
          </div>
        </div>

        {/* 其他信息 */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">其他信息</h2>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm text-gray-500 mb-1">其他要求</h4>
              <p className="text-gray-800">{position.other_requirements || "无"}</p>
            </div>
            <div>
              <h4 className="text-sm text-gray-500 mb-1">备注</h4>
              <p className="text-gray-800">{position.remark || "无"}</p>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm text-gray-500">
                <span>创建时间: {position.created_at}</span>
                <span>更新时间: {position.updated_at}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex space-x-4">
        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
          编辑职位
        </button>
        {position.status === "pending" && (
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
            审核通过
          </button>
        )}
        <button className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50">
          删除职位
        </button>
      </div>
    </div>
  );
}
