"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Bell, Share2 } from "lucide-react";

export default function AnnouncementDetailPage() {
  const params = useParams();
  const id = params.id;

  return (
    <div className="container mx-auto py-6 px-4">
      <Link
        href="/announcements"
        className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回公告列表
      </Link>

      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                招考公告
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                国考
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              2024年度中央机关及其直属机构考试录用公务员公告
            </h1>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Share2 className="w-4 h-4" />
            <span>分享</span>
          </button>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6 pb-6 border-b">
          <span className="flex items-center space-x-1">
            <Bell className="w-4 h-4" />
            <span>国家公务员局</span>
          </span>
          <span className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>全国</span>
          </span>
          <span className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>2024-10-15</span>
          </span>
        </div>

        <div className="prose max-w-none">
          <p>
            根据公务员法和《公务员录用规定》等法律法规，国家公务员局将组织实施中央机关及其直属机构2024年度考试录用一级主任科员及以下和其他相当职级层次公务员工作。
          </p>

          <h2>一、报考条件</h2>
          <p>（一）具有中华人民共和国国籍；</p>
          <p>
            （二）18周岁以上、35周岁以下，2024年应届硕士研究生和博士研究生（非在职）人员年龄可放宽到40周岁以下；
          </p>
          <p>（三）拥护中华人民共和国宪法，拥护中国共产党领导和社会主义制度；</p>
          <p>（四）具有良好的政治素质和道德品行；</p>
          <p>（五）具有正常履行职责的身体条件和心理素质；</p>
          <p>（六）具有符合职位要求的工作能力；</p>
          <p>（七）具有大学专科及以上文化程度；</p>
          <p>（八）具备中央公务员主管部门规定的拟任职位所要求的其他资格条件。</p>

          <h2>二、报考程序</h2>
          <p>
            （一）职位查询。各招录机关的招考人数、具体职位、考试类别、资格条件等详见《中央机关及其直属机构2024年度考试录用公务员招考简章》。
          </p>
          <p>
            （二）网上报名。报考者可在2024年10月15日8:00至10月24日18:00期间登录"中央机关及其直属机构2024年度考试录用公务员专题网站"进行网上报名。
          </p>

          <h2>三、考试内容</h2>
          <p>公共科目笔试包括行政职业能力测验和申论两科。</p>
        </div>
      </div>
    </div>
  );
}
