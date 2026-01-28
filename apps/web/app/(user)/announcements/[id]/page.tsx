"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Share2,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  Briefcase,
  Users,
  Star,
  Download,
  Building2,
  Eye,
  AlertCircle,
  Check,
  GraduationCap,
  Search,
} from "lucide-react";
import type { AnnouncementDetail, AnnouncementPosition } from "@/services/api/announcement";

// 模拟数据
const mockAnnouncement: AnnouncementDetail = {
  id: 1,
  title: "2025年度中央机关及其直属机构考试录用公务员公告",
  exam_type: "公务员",
  source: "国家公务员局",
  source_url: "https://www.scs.gov.cn/",
  province: "全国",
  publish_date: "2024-10-15",
  registration_start: "2024-10-15",
  registration_end: "2024-10-24",
  exam_date: "2024-12-01",
  position_count: 3962,
  recruit_count: 39561,
  views: 128560,
  status: 1,
  created_at: "2024-10-15",
  summary: "根据公务员法和《公务员录用规定》等法律法规，国家公务员局将组织实施中央机关及其直属机构2025年度考试录用一级主任科员及以下和其他相当职级层次公务员工作。本次招考共有3962个职位，计划招录39561人。",
  content: `
    <h2>一、报考条件</h2>
    <p>（一）具有中华人民共和国国籍；</p>
    <p>（二）年龄在18周岁以上、35周岁以下，2025年应届硕士研究生和博士研究生（非在职）人员年龄可放宽到40周岁以下；</p>
    <p>（三）拥护中华人民共和国宪法，拥护中国共产党领导和社会主义制度；</p>
    <p>（四）具有良好的政治素质和道德品行；</p>
    <p>（五）具有正常履行职责的身体条件和心理素质；</p>
    <p>（六）具有符合职位要求的工作能力；</p>
    <p>（七）具有大学专科及以上文化程度；</p>
    <p>（八）具备中央公务员主管部门规定的拟任职位所要求的其他资格条件。</p>

    <h2>二、报考程序</h2>
    <h3>（一）职位查询</h3>
    <p>各招录机关的招考人数、具体职位、考试类别、资格条件等详见《中央机关及其直属机构2025年度考试录用公务员招考简章》。</p>
    <h3>（二）网上报名</h3>
    <p>报考者可在2024年10月15日8:00至10月24日18:00期间登录"中央机关及其直属机构2025年度考试录用公务员专题网站"进行网上报名。</p>
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
  attachments: [
    { id: 1, name: "2025年国考职位表.xlsx", url: "#", type: "xlsx", size: 2048000 },
    { id: 2, name: "报考指南.pdf", url: "#", type: "pdf", size: 1024000 },
    { id: 3, name: "专业分类目录.pdf", url: "#", type: "pdf", size: 512000 },
  ],
  timeline: [
    { date: "10月15日-10月24日", title: "网上报名", description: "考生需完成注册和职位报名", status: "completed" },
    { date: "10月25日-11月3日", title: "资格审查", description: "招录机关进行资格审查", status: "active" },
    { date: "11月4日-11月9日", title: "报名确认", description: "通过审查的考生完成报名确认", status: "pending" },
    { date: "11月25日", title: "打印准考证", description: "登录报名系统打印准考证", status: "pending" },
    { date: "12月1日", title: "笔试", description: "公共科目笔试", status: "pending" },
    { date: "待定", title: "面试", description: "各招录机关组织实施", status: "pending" },
  ],
};

// 模拟职位数据
const mockPositions: AnnouncementPosition[] = [
  { id: 1, position_name: "综合管理岗", department_name: "国家税务总局", recruit_count: 5, education: "本科", major: "法学类", work_location: "北京" },
  { id: 2, position_name: "信息技术岗", department_name: "海关总署", recruit_count: 3, education: "本科", major: "计算机类", work_location: "北京" },
  { id: 3, position_name: "财务管理岗", department_name: "财政部", recruit_count: 2, education: "硕士", major: "会计学", work_location: "北京" },
  { id: 4, position_name: "行政执法岗", department_name: "国家税务总局广东省税务局", recruit_count: 10, education: "本科", major: "不限", work_location: "广州" },
  { id: 5, position_name: "综合文秘岗", department_name: "中央办公厅", recruit_count: 1, education: "硕士", major: "中文类", work_location: "北京" },
  { id: 6, position_name: "法律顾问岗", department_name: "司法部", recruit_count: 2, education: "本科", major: "法学", work_location: "北京" },
];

export default function AnnouncementDetailPage() {
  const params = useParams();
  const [announcement, setAnnouncement] = useState<AnnouncementDetail | null>(mockAnnouncement);
  const [positions, setPositions] = useState<AnnouncementPosition[]>(mockPositions);
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showAllPositions, setShowAllPositions] = useState(false);

  // 格式化数字
  const formatNumber = (num: number) => {
    if (num >= 10000) return (num / 10000).toFixed(1) + "万";
    if (num >= 1000) return (num / 1000).toFixed(1) + "千";
    return num.toString();
  };

  // 格式化文件大小
  const formatSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
    return bytes + " B";
  };

  // 筛选职位
  const filteredPositions = positions.filter((p) => {
    if (!searchKeyword) return true;
    const keyword = searchKeyword.toLowerCase();
    return (
      p.position_name.toLowerCase().includes(keyword) ||
      (p.department_name?.toLowerCase().includes(keyword)) ||
      (p.work_location?.toLowerCase().includes(keyword)) ||
      (p.major?.toLowerCase().includes(keyword))
    );
  });

  const displayedPositions = showAllPositions ? filteredPositions : filteredPositions.slice(0, 5);

  if (!announcement) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AlertCircle className="w-16 h-16 text-stone-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-stone-700">公告不存在</h2>
        <Link href="/announcements" className="text-amber-600 hover:underline mt-4 inline-block">
          返回公告列表
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-b from-amber-50 to-stone-50 border-b border-stone-200/50">
        <div className="container mx-auto px-4 lg:px-6 py-6">
          <Link
            href="/announcements"
            className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回公告列表
          </Link>

          <div className="max-w-4xl">
            {/* Tags */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {announcement.exam_type && (
                <span className="px-3 py-1 text-sm font-medium rounded-lg bg-blue-100 text-blue-700">
                  {announcement.exam_type}
                </span>
              )}
              {announcement.province && (
                <span className="px-3 py-1 text-sm font-medium rounded-lg bg-stone-100 text-stone-600">
                  {announcement.province}
                </span>
              )}
              {announcement.registration_start && announcement.registration_end && (
                <span className="px-3 py-1 text-sm font-medium rounded-lg bg-emerald-100 text-emerald-700">
                  报名中
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-stone-800 leading-tight">
              {announcement.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500 mt-4">
              {announcement.source && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  {announcement.source}
                </span>
              )}
              {announcement.publish_date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {announcement.publish_date}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                {formatNumber(announcement.views || 0)} 次浏览
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-all ${
                  isFavorite
                    ? "bg-amber-50 border-amber-300 text-amber-700"
                    : "border-stone-200 text-stone-600 hover:bg-stone-50"
                }`}
              >
                <Star className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                {isFavorite ? "已收藏" : "收藏"}
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 transition-colors">
                <Share2 className="w-4 h-4" />
                分享
              </button>
              {announcement.source_url && (
                <a
                  href={announcement.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  查看原文
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Card */}
            {announcement.summary && (
              <div className="bg-amber-50 rounded-2xl border border-amber-100 p-6">
                <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  公告摘要
                </h3>
                <p className="text-amber-900/80 leading-relaxed">{announcement.summary}</p>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-stone-200/50 p-4 text-center shadow-card">
                <div className="flex items-center justify-center gap-1 text-stone-500 text-sm mb-2">
                  <Briefcase className="w-4 h-4" />
                  职位数
                </div>
                <div className="text-2xl font-bold text-stone-800">
                  {announcement.position_count || 0}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-stone-200/50 p-4 text-center shadow-card">
                <div className="flex items-center justify-center gap-1 text-amber-600 text-sm mb-2">
                  <Users className="w-4 h-4" />
                  招录人数
                </div>
                <div className="text-2xl font-bold text-amber-600">
                  {formatNumber(announcement.recruit_count || 0)}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-stone-200/50 p-4 text-center shadow-card">
                <div className="flex items-center justify-center gap-1 text-stone-500 text-sm mb-2">
                  <Eye className="w-4 h-4" />
                  浏览量
                </div>
                <div className="text-2xl font-bold text-stone-800">
                  {formatNumber(announcement.views || 0)}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6 lg:p-8">
              <h3 className="text-lg font-semibold text-stone-800 mb-4">公告详情</h3>
              <article
                className="prose prose-stone prose-lg max-w-none
                  prose-headings:font-serif prose-headings:text-stone-800 prose-headings:font-semibold
                  prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-stone-100
                  prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
                  prose-p:text-stone-600 prose-p:leading-relaxed
                  prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-stone-700
                  prose-li:text-stone-600"
                dangerouslySetInnerHTML={{ __html: announcement.content || "" }}
              />
            </div>

            {/* Related Positions */}
            <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card overflow-hidden">
              <div className="p-6 border-b border-stone-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-amber-500" />
                    关联职位
                    <span className="text-sm font-normal text-stone-500">
                      ({announcement.position_count || positions.length} 个)
                    </span>
                  </h3>
                  <Link
                    href={`/positions?announcement_id=${announcement.id}`}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                  >
                    查看全部
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                {/* Search */}
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="搜索职位名称、部门、专业..."
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div className="divide-y divide-stone-100">
                {displayedPositions.length > 0 ? (
                  displayedPositions.map((position) => (
                    <Link
                      key={position.id}
                      href={`/positions/${position.id}`}
                      className="block p-4 hover:bg-amber-50/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-stone-800 hover:text-amber-700">
                            {position.position_name}
                          </h4>
                          <p className="text-sm text-stone-500 mt-1">{position.department_name}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-stone-500">
                            {position.work_location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {position.work_location}
                              </span>
                            )}
                            {position.education && (
                              <span className="flex items-center gap-1">
                                <GraduationCap className="w-3 h-3" />
                                {position.education}
                              </span>
                            )}
                            {position.major && (
                              <span className="px-2 py-0.5 bg-stone-100 rounded text-stone-600">
                                {position.major}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg font-bold text-amber-600">{position.recruit_count}</div>
                          <div className="text-xs text-stone-500">招录人数</div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-8 text-center text-stone-500">
                    没有找到匹配的职位
                  </div>
                )}
              </div>

              {filteredPositions.length > 5 && !showAllPositions && (
                <div className="p-4 border-t border-stone-100 text-center">
                  <button
                    onClick={() => setShowAllPositions(true)}
                    className="text-sm font-medium text-amber-600 hover:text-amber-700"
                  >
                    显示更多职位 ({filteredPositions.length - 5} 个)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            {announcement.timeline && announcement.timeline.length > 0 && (
              <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-stone-800 mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  考试日程
                </h3>
                <div className="space-y-0">
                  {announcement.timeline.map((item, index) => (
                    <div
                      key={index}
                      className={`relative pl-8 pb-6 ${index === announcement.timeline!.length - 1 ? "" : "border-l-2 border-stone-200"} ml-2`}
                    >
                      {/* Status Indicator */}
                      <div
                        className={`absolute left-0 top-0 w-5 h-5 -translate-x-1/2 rounded-full border-2 flex items-center justify-center ${
                          item.status === "completed"
                            ? "bg-emerald-500 border-emerald-500"
                            : item.status === "active"
                            ? "bg-amber-500 border-amber-500 animate-pulse"
                            : "bg-white border-stone-300"
                        }`}
                      >
                        {item.status === "completed" && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="pt-0">
                        <p
                          className={`font-medium ${
                            item.status === "completed"
                              ? "text-emerald-700"
                              : item.status === "active"
                              ? "text-amber-700"
                              : "text-stone-800"
                          }`}
                        >
                          {item.title}
                        </p>
                        <p className="text-sm text-stone-500 mt-0.5">{item.date}</p>
                        {item.description && (
                          <p className="text-xs text-stone-400 mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            {announcement.attachments && announcement.attachments.length > 0 && (
              <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <Download className="w-5 h-5 text-amber-500" />
                  附件下载
                </h3>
                <div className="space-y-3">
                  {announcement.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.url}
                      className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl hover:bg-amber-50 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-white rounded-lg border border-stone-200 flex items-center justify-center text-xs font-medium text-stone-500 uppercase">
                        {attachment.type}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-stone-700 group-hover:text-amber-700 truncate transition-colors">
                          {attachment.name}
                        </p>
                        <p className="text-xs text-stone-400">{formatSize(attachment.size)}</p>
                      </div>
                      <Download className="w-4 h-4 text-stone-400 group-hover:text-amber-500" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Registration Guide */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200/50 p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                报名指南
              </h3>
              <ul className="space-y-3 text-sm text-blue-700">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-medium">1</span>
                  <span>仔细阅读公告和职位表，选择符合条件的职位</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-medium">2</span>
                  <span>在报名时间内登录官方网站进行注册和报名</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-medium">3</span>
                  <span>上传符合要求的证件照片</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-medium">4</span>
                  <span>等待资格审查通过后完成报名确认和缴费</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-medium">5</span>
                  <span>按时打印准考证并参加考试</span>
                </li>
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <Link
                href={`/positions?announcement_id=${announcement.id}`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-amber-md"
              >
                <FileText className="w-4 h-4" />
                查看相关职位
              </Link>
              {announcement.source_url && (
                <a
                  href={announcement.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-stone-50 text-stone-600 rounded-xl hover:bg-stone-100 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  查看官方原文
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
