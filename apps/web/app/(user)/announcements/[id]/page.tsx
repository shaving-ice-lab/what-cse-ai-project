"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Bell,
  Share2,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

const mockAnnouncement = {
  id: 1,
  title: "2024年度中央机关及其直属机构考试录用公务员公告",
  type: "招考公告",
  source: "国家公务员局",
  region: "全国",
  exam_type: "国考",
  publish_date: "2024-10-15",
  content: `
    <p>根据公务员法和《公务员录用规定》等法律法规，国家公务员局将组织实施中央机关及其直属机构2024年度考试录用一级主任科员及以下和其他相当职级层次公务员工作。现将有关事项公告如下：</p>

    <h2>一、报考条件</h2>
    <p>（一）具有中华人民共和国国籍；</p>
    <p>（二）18周岁以上、35周岁以下，2024年应届硕士研究生和博士研究生（非在职）人员年龄可放宽到40周岁以下；</p>
    <p>（三）拥护中华人民共和国宪法，拥护中国共产党领导和社会主义制度；</p>
    <p>（四）具有良好的政治素质和道德品行；</p>
    <p>（五）具有正常履行职责的身体条件和心理素质；</p>
    <p>（六）具有符合职位要求的工作能力；</p>
    <p>（七）具有大学专科及以上文化程度；</p>
    <p>（八）具备中央公务员主管部门规定的拟任职位所要求的其他资格条件。</p>

    <h2>二、报考程序</h2>
    <h3>（一）职位查询</h3>
    <p>各招录机关的招考人数、具体职位、考试类别、资格条件等详见《中央机关及其直属机构2024年度考试录用公务员招考简章》。</p>
    <h3>（二）网上报名</h3>
    <p>报考者可在2024年10月15日8:00至10月24日18:00期间登录"中央机关及其直属机构2024年度考试录用公务员专题网站"进行网上报名。</p>
    <p>报考者应仔细阅读《报考指南》，熟悉公务员招考的相关政策，并按照本公告及招考简章的规定，选择与自己条件相符的招考职位。</p>

    <h2>三、考试内容</h2>
    <h3>（一）笔试</h3>
    <p>公共科目笔试包括行政职业能力测验和申论两科，满分各为100分。公共科目笔试全部采用闭卷考试的方式。</p>
    <p>行政职业能力测验主要包括常识判断、言语理解与表达、数量关系、判断推理和资料分析等部分。申论主要测查从事机关工作应当具备的基本能力。</p>
    <h3>（二）面试和专业能力测试</h3>
    <p>面试和专业能力测试由招录机关组织实施。面试时间、地点等事项详见招录机关在其网站上发布的公告。</p>

    <h2>四、体检和考察</h2>
    <p>根据考试综合成绩从高到低的顺序，按照面试人选与计划录用人数的规定比例确定体检和考察人选，并依次进行体检和考察。</p>
  `,
  related_positions: [
    { id: 1, name: "综合管理岗", department: "国家税务总局" },
    { id: 2, name: "信息技术岗", department: "海关总署" },
    { id: 3, name: "财务管理岗", department: "财政部" },
  ],
  timeline: [
    { date: "10月15日-10月24日", title: "网上报名", status: "completed" },
    { date: "10月25日-11月3日", title: "资格审查", status: "active" },
    { date: "11月26日", title: "笔试", status: "pending" },
    { date: "待定", title: "面试", status: "pending" },
  ],
};

export default function AnnouncementDetailPage() {
  const params = useParams();

  return (
    <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 pb-24 lg:pb-8">
      {/* Back Button */}
      <Link
        href="/announcements"
        className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回公告列表
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6 lg:p-8">
            {/* Tags */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 text-sm font-medium rounded-lg bg-blue-100 text-blue-700">
                {mockAnnouncement.type}
              </span>
              <span className="px-3 py-1 text-sm font-medium rounded-lg bg-stone-100 text-stone-600">
                {mockAnnouncement.exam_type}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-stone-800 mb-6">
              {mockAnnouncement.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500 pb-6 border-b border-stone-100">
              <span className="flex items-center gap-1.5">
                <Bell className="w-4 h-4" />
                {mockAnnouncement.source}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {mockAnnouncement.region}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {mockAnnouncement.publish_date}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-4">
              <button className="flex items-center gap-2 px-4 py-2.5 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 transition-colors">
                <Share2 className="w-4 h-4" />
                分享
              </button>
              <Link
                href={`/positions?exam_type=${mockAnnouncement.exam_type}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-amber-md"
              >
                <FileText className="w-4 h-4" />
                查看相关职位
              </Link>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6 lg:p-8">
            <article
              className="prose prose-stone prose-lg max-w-none
                prose-headings:font-serif prose-headings:text-stone-800 prose-headings:font-semibold
                prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-stone-100
                prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
                prose-p:text-stone-600 prose-p:leading-relaxed
                prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-stone-700
                prose-li:text-stone-600"
              dangerouslySetInnerHTML={{ __html: mockAnnouncement.content }}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6 sticky top-24">
            <h3 className="text-lg font-semibold text-stone-800 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              考试日程
            </h3>
            <div className="space-y-0">
              {mockAnnouncement.timeline.map((item, index) => (
                <div key={index} className={`timeline-item ${item.status}`}>
                  <div>
                    <p className="font-medium text-stone-800">{item.title}</p>
                    <p className="text-sm text-stone-500 mt-0.5">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related Positions */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6">
            <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              相关职位
            </h3>
            <div className="space-y-3">
              {mockAnnouncement.related_positions.map((position) => (
                <Link
                  key={position.id}
                  href={`/positions/${position.id}`}
                  className="block p-4 rounded-xl border border-stone-100 hover:border-amber-200 hover:bg-amber-50/30 transition-colors group"
                >
                  <p className="font-medium text-stone-800 group-hover:text-amber-700 transition-colors">
                    {position.name}
                  </p>
                  <p className="text-sm text-stone-500 mt-1">{position.department}</p>
                </Link>
              ))}
            </div>
            <Link
              href="/positions"
              className="flex items-center justify-center gap-1 mt-4 py-2 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
            >
              查看更多职位
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* External Link */}
          <a
            href="#"
            className="flex items-center justify-center gap-2 p-4 bg-stone-50 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            查看官方原文
          </a>
        </div>
      </div>
    </div>
  );
}
