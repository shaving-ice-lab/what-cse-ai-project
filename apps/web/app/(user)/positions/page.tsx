"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  RefreshCw,
  Download,
  Star,
  Scale,
  Flame,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  Eye,
  Clock,
  Users,
  Target,
  BarChart3,
  Activity,
  Award,
  SlidersHorizontal,
  Check,
  RotateCcw,
} from "lucide-react";

// 筛选配置
const filterConfig = {
  examType: { label: "考试类型", options: ["国考", "省考", "事业单位", "选调生", "军队文职", "三支一扶"] },
  province: { label: "省份", options: ["北京", "上海", "广东", "江苏", "浙江", "山东", "四川", "湖北", "河南", "陕西", "福建", "湖南", "安徽", "河北", "辽宁", "天津", "重庆"] },
  city: { label: "城市", options: ["全部", "省会", "地级市", "县级市"] },
  level: { label: "职位层级", options: ["中央", "省级", "市级", "县级", "乡镇", "街道"] },
  deptType: { label: "部门类型", options: ["党委机关", "政府机关", "人大机关", "政协机关", "法院", "检察院", "群团组织", "参公单位"] },
  positionType: { label: "职位类别", options: ["综合管理类", "行政执法类", "专业技术类", "司法类", "公安类"] },
  education: { label: "学历要求", options: ["不限", "大专", "本科", "硕士", "博士"] },
  degree: { label: "学位要求", options: ["不限", "学士", "硕士", "博士"] },
  majorType: { label: "专业大类", options: ["不限", "哲学", "经济学", "法学", "教育学", "文学", "历史学", "理学", "工学", "农学", "医学", "管理学", "艺术学"] },
  political: { label: "政治面貌", options: ["不限", "中共党员", "共青团员", "群众"] },
  workExp: { label: "基层经历", options: ["不限", "无要求", "1年", "2年", "3年", "5年及以上"] },
  gender: { label: "性别要求", options: ["不限", "男", "女"] },
  identity: { label: "身份要求", options: ["不限", "应届生", "在职人员", "服务基层项目人员", "退役军人"] },
  ageRange: { label: "年龄限制", options: ["不限", "18-25岁", "18-30岁", "18-35岁", "18-40岁", "40岁以上"] },
};

// 数值筛选配置
const rangeFilters = {
  recruit: { label: "招录人数", min: 1, max: 50, step: 1 },
  ratio: { label: "竞争比", min: 0, max: 500, step: 10 },
  match: { label: "匹配度", min: 0, max: 100, step: 5 },
  score: { label: "分数线", min: 100, max: 160, step: 5 },
};

// 快捷筛选
const quickFilters = [
  { id: "highMatch", label: "高匹配≥80%", icon: Award },
  { id: "lowComp", label: "低竞争≤50", icon: Target },
  { id: "moreRecruit", label: "多招录≥3人", icon: Users },
  { id: "hot", label: "热门岗位", icon: Flame },
  { id: "rising", label: "热度上升", icon: TrendingUp },
  { id: "fav", label: "我的收藏", icon: Star },
];

// 模拟数据
const positions = [
  { id: 1, code: "GK2024001", name: "科员（一）", dept: "国家税务总局北京市税务局", examType: "国考", level: "中央", deptType: "政府机关", positionType: "综合管理类", province: "北京", city: "东城区", edu: "本科", degree: "学士", majorType: "管理学", major: "会计学", recruit: 3, apply: 360, ratio: 120, match: 95, trend: 12.5, political: "党员", workExp: "不限", age: "35", gender: "不限", identity: "不限", score: 135, hot: true, fav: true, updated: "10:30" },
  { id: 2, code: "GK2024002", name: "综合管理岗", dept: "海关总署广州海关", examType: "国考", level: "中央", deptType: "政府机关", positionType: "综合管理类", province: "广东", city: "广州", edu: "本科", degree: "学士", majorType: "工学", major: "计算机类", recruit: 2, apply: 180, ratio: 90, match: 88, trend: -5.2, political: "不限", workExp: "不限", age: "35", gender: "不限", identity: "不限", score: 130, hot: false, fav: false, updated: "10:28" },
  { id: 3, code: "GK2024003", name: "信息技术岗", dept: "财政部驻北京专员办", examType: "国考", level: "中央", deptType: "政府机关", positionType: "专业技术类", province: "北京", city: "海淀区", edu: "硕士", degree: "硕士", majorType: "工学", major: "软件工程", recruit: 1, apply: 85, ratio: 85, match: 72, trend: 8.3, political: "不限", workExp: "2年", age: "35", gender: "男", identity: "不限", score: 140, hot: false, fav: false, updated: "10:25" },
  { id: 4, code: "SK2024001", name: "执法岗", dept: "广东省市场监督管理局", examType: "省考", level: "省级", deptType: "政府机关", positionType: "行政执法类", province: "广东", city: "深圳", edu: "本科", degree: "学士", majorType: "法学", major: "法学类", recruit: 5, apply: 420, ratio: 84, match: 65, trend: -12.8, political: "不限", workExp: "不限", age: "30", gender: "不限", identity: "不限", score: 125, hot: true, fav: false, updated: "10:22" },
  { id: 5, code: "GK2024004", name: "文秘岗", dept: "中共中央办公厅", examType: "国考", level: "中央", deptType: "党委机关", positionType: "综合管理类", province: "北京", city: "西城区", edu: "硕士", degree: "硕士", majorType: "文学", major: "中文类", recruit: 2, apply: 560, ratio: 280, match: 58, trend: 25.6, political: "党员", workExp: "不限", age: "28", gender: "不限", identity: "应届生", score: 145, hot: true, fav: false, updated: "10:20" },
  { id: 6, code: "GK2024005", name: "数据分析师", dept: "国家统计局上海调查总队", examType: "国考", level: "中央", deptType: "政府机关", positionType: "专业技术类", province: "上海", city: "浦东", edu: "本科", degree: "学士", majorType: "理学", major: "统计学", recruit: 4, apply: 240, ratio: 60, match: 82, trend: 3.1, political: "不限", workExp: "不限", age: "35", gender: "不限", identity: "不限", score: 128, hot: false, fav: true, updated: "10:18" },
  { id: 7, code: "SK2024002", name: "基层科员", dept: "江苏省南京市玄武区政府", examType: "省考", level: "县级", deptType: "政府机关", positionType: "综合管理类", province: "江苏", city: "南京", edu: "本科", degree: "学士", majorType: "不限", major: "不限", recruit: 8, apply: 320, ratio: 40, match: 78, trend: -2.4, political: "不限", workExp: "不限", age: "35", gender: "不限", identity: "不限", score: 120, hot: false, fav: false, updated: "10:15" },
  { id: 8, code: "SY2024001", name: "网络安全工程师", dept: "公安部第三研究所", examType: "事业单位", level: "中央", deptType: "参公单位", positionType: "专业技术类", province: "北京", city: "朝阳区", edu: "硕士", degree: "硕士", majorType: "工学", major: "信息安全", recruit: 2, apply: 68, ratio: 34, match: 91, trend: 18.9, political: "党员", workExp: "3年", age: "40", gender: "不限", identity: "在职人员", score: 142, hot: true, fav: true, updated: "10:12" },
  { id: 9, code: "GK2024006", name: "审计专员", dept: "审计署驻广州特派办", examType: "国考", level: "中央", deptType: "政府机关", positionType: "专业技术类", province: "广东", city: "广州", edu: "本科", degree: "学士", majorType: "管理学", major: "审计学", recruit: 3, apply: 210, ratio: 70, match: 85, trend: 6.7, political: "党员", workExp: "不限", age: "35", gender: "不限", identity: "不限", score: 132, hot: false, fav: false, updated: "10:10" },
  { id: 10, code: "GK2024007", name: "外事翻译", dept: "外交部", examType: "国考", level: "中央", deptType: "政府机关", positionType: "专业技术类", province: "北京", city: "朝阳区", edu: "硕士", degree: "硕士", majorType: "文学", major: "英语", recruit: 1, apply: 890, ratio: 890, match: 45, trend: 35.2, political: "党员", workExp: "不限", age: "28", gender: "不限", identity: "应届生", score: 150, hot: true, fav: false, updated: "10:08" },
  { id: 11, code: "SK2024003", name: "乡镇公务员", dept: "浙江省杭州市余杭区乡镇", examType: "省考", level: "乡镇", deptType: "政府机关", positionType: "综合管理类", province: "浙江", city: "杭州", edu: "大专", degree: "不限", majorType: "不限", major: "不限", recruit: 15, apply: 180, ratio: 12, match: 92, trend: -8.5, political: "不限", workExp: "不限", age: "35", gender: "不限", identity: "不限", score: 115, hot: false, fav: false, updated: "10:05" },
  { id: 12, code: "GK2024008", name: "法官助理", dept: "最高人民法院", examType: "国考", level: "中央", deptType: "法院", positionType: "司法类", province: "北京", city: "东城区", edu: "硕士", degree: "硕士", majorType: "法学", major: "法学", recruit: 5, apply: 1200, ratio: 240, match: 68, trend: 15.3, political: "党员", workExp: "不限", age: "35", gender: "不限", identity: "不限", score: 148, hot: true, fav: false, updated: "10:02" },
  { id: 13, code: "XD2024001", name: "选调生", dept: "山东省委组织部", examType: "选调生", level: "省级", deptType: "党委机关", positionType: "综合管理类", province: "山东", city: "济南", edu: "本科", degree: "学士", majorType: "不限", major: "不限", recruit: 100, apply: 2500, ratio: 25, match: 75, trend: 5.2, political: "党员", workExp: "不限", age: "28", gender: "不限", identity: "应届生", score: 125, hot: true, fav: false, updated: "09:58" },
  { id: 14, code: "JD2024001", name: "军队文职", dept: "陆军工程大学", examType: "军队文职", level: "中央", deptType: "参公单位", positionType: "专业技术类", province: "江苏", city: "南京", edu: "硕士", degree: "硕士", majorType: "工学", major: "土木工程", recruit: 3, apply: 120, ratio: 40, match: 70, trend: 2.1, political: "不限", workExp: "不限", age: "35", gender: "不限", identity: "不限", score: 135, hot: false, fav: false, updated: "09:55" },
  { id: 15, code: "SZ2024001", name: "三支一扶", dept: "四川省人社厅", examType: "三支一扶", level: "乡镇", deptType: "政府机关", positionType: "综合管理类", province: "四川", city: "成都", edu: "本科", degree: "学士", majorType: "不限", major: "不限", recruit: 50, apply: 800, ratio: 16, match: 80, trend: -3.5, political: "不限", workExp: "不限", age: "30", gender: "不限", identity: "应届生", score: 110, hot: false, fav: false, updated: "09:52" },
  { id: 16, code: "GK2024009", name: "财务科员", dept: "中国人民银行上海总部", examType: "国考", level: "中央", deptType: "政府机关", positionType: "综合管理类", province: "上海", city: "浦东", edu: "本科", degree: "学士", majorType: "经济学", major: "金融学", recruit: 2, apply: 450, ratio: 225, match: 87, trend: 8.9, political: "不限", workExp: "不限", age: "35", gender: "不限", identity: "不限", score: 138, hot: true, fav: false, updated: "09:48" },
  { id: 17, code: "GK2024010", name: "检察官助理", dept: "最高人民检察院", examType: "国考", level: "中央", deptType: "检察院", positionType: "司法类", province: "北京", city: "东城区", edu: "硕士", degree: "硕士", majorType: "法学", major: "法学", recruit: 3, apply: 680, ratio: 227, match: 72, trend: 11.2, political: "党员", workExp: "不限", age: "35", gender: "不限", identity: "不限", score: 146, hot: true, fav: false, updated: "09:45" },
  { id: 18, code: "SK2024004", name: "城管执法", dept: "深圳市城市管理局", examType: "省考", level: "市级", deptType: "政府机关", positionType: "行政执法类", province: "广东", city: "深圳", edu: "本科", degree: "学士", majorType: "不限", major: "不限", recruit: 20, apply: 380, ratio: 19, match: 85, trend: -2.1, political: "不限", workExp: "不限", age: "30", gender: "不限", identity: "不限", score: 118, hot: false, fav: false, updated: "09:42" },
  { id: 19, code: "GK2024011", name: "政策研究", dept: "国务院发展研究中心", examType: "国考", level: "中央", deptType: "政府机关", positionType: "综合管理类", province: "北京", city: "西城区", edu: "博士", degree: "博士", majorType: "经济学", major: "经济学", recruit: 1, apply: 320, ratio: 320, match: 52, trend: 18.5, political: "党员", workExp: "不限", age: "35", gender: "不限", identity: "不限", score: 155, hot: true, fav: false, updated: "09:38" },
  { id: 20, code: "SK2024005", name: "社区民警", dept: "杭州市公安局", examType: "省考", level: "市级", deptType: "政府机关", positionType: "公安类", province: "浙江", city: "杭州", edu: "本科", degree: "学士", majorType: "不限", major: "不限", recruit: 30, apply: 520, ratio: 17, match: 78, trend: -5.8, political: "党员", workExp: "不限", age: "30", gender: "男", identity: "不限", score: 122, hot: false, fav: false, updated: "09:35" },
  { id: 21, code: "SY2024002", name: "高校辅导员", dept: "北京大学", examType: "事业单位", level: "中央", deptType: "参公单位", positionType: "综合管理类", province: "北京", city: "海淀区", edu: "硕士", degree: "硕士", majorType: "教育学", major: "教育学", recruit: 5, apply: 280, ratio: 56, match: 76, trend: 3.2, political: "党员", workExp: "不限", age: "30", gender: "不限", identity: "应届生", score: 130, hot: false, fav: false, updated: "09:32" },
  { id: 22, code: "GK2024012", name: "海事执法", dept: "交通运输部海事局", examType: "国考", level: "中央", deptType: "政府机关", positionType: "行政执法类", province: "上海", city: "浦东", edu: "本科", degree: "学士", majorType: "工学", major: "航海技术", recruit: 4, apply: 95, ratio: 24, match: 89, trend: 1.5, political: "不限", workExp: "不限", age: "35", gender: "不限", identity: "不限", score: 125, hot: false, fav: true, updated: "09:28" },
  { id: 23, code: "SK2024006", name: "税务科员", dept: "江苏省税务局", examType: "省考", level: "省级", deptType: "政府机关", positionType: "综合管理类", province: "江苏", city: "南京", edu: "本科", degree: "学士", majorType: "管理学", major: "会计学", recruit: 10, apply: 680, ratio: 68, match: 83, trend: 4.6, political: "不限", workExp: "不限", age: "35", gender: "不限", identity: "不限", score: 128, hot: false, fav: false, updated: "09:25" },
  { id: 24, code: "GK2024013", name: "气象预报员", dept: "中国气象局", examType: "国考", level: "中央", deptType: "参公单位", positionType: "专业技术类", province: "北京", city: "海淀区", edu: "硕士", degree: "硕士", majorType: "理学", major: "大气科学", recruit: 2, apply: 45, ratio: 23, match: 94, trend: -1.2, political: "不限", workExp: "不限", age: "35", gender: "不限", identity: "不限", score: 132, hot: false, fav: false, updated: "09:22" },
  { id: 25, code: "SK2024007", name: "环保监察", dept: "广东省生态环境厅", examType: "省考", level: "省级", deptType: "政府机关", positionType: "行政执法类", province: "广东", city: "广州", edu: "本科", degree: "学士", majorType: "工学", major: "环境工程", recruit: 6, apply: 210, ratio: 35, match: 81, trend: 2.8, political: "不限", workExp: "不限", age: "35", gender: "不限", identity: "不限", score: 124, hot: false, fav: false, updated: "09:18" },
  { id: 26, code: "GK2024014", name: "国际合作", dept: "商务部", examType: "国考", level: "中央", deptType: "政府机关", positionType: "综合管理类", province: "北京", city: "东城区", edu: "硕士", degree: "硕士", majorType: "经济学", major: "国际贸易", recruit: 2, apply: 520, ratio: 260, match: 62, trend: 15.3, political: "党员", workExp: "不限", age: "35", gender: "不限", identity: "不限", score: 142, hot: true, fav: false, updated: "09:15" },
  { id: 27, code: "SY2024003", name: "医院管理", dept: "北京协和医院", examType: "事业单位", level: "中央", deptType: "参公单位", positionType: "综合管理类", province: "北京", city: "东城区", edu: "硕士", degree: "硕士", majorType: "管理学", major: "公共管理", recruit: 2, apply: 180, ratio: 90, match: 74, trend: 5.6, political: "不限", workExp: "2年", age: "35", gender: "不限", identity: "不限", score: 135, hot: false, fav: false, updated: "09:12" },
  { id: 28, code: "SK2024008", name: "交通执法", dept: "上海市交通委", examType: "省考", level: "市级", deptType: "政府机关", positionType: "行政执法类", province: "上海", city: "黄浦", edu: "本科", degree: "学士", majorType: "不限", major: "不限", recruit: 15, apply: 320, ratio: 21, match: 86, trend: -3.4, political: "不限", workExp: "不限", age: "30", gender: "不限", identity: "不限", score: 120, hot: false, fav: false, updated: "09:08" },
  { id: 29, code: "GK2024015", name: "知识产权", dept: "国家知识产权局", examType: "国考", level: "中央", deptType: "政府机关", positionType: "专业技术类", province: "北京", city: "海淀区", edu: "硕士", degree: "硕士", majorType: "法学", major: "知识产权", recruit: 3, apply: 280, ratio: 93, match: 79, trend: 7.2, political: "不限", workExp: "不限", age: "35", gender: "不限", identity: "不限", score: 136, hot: false, fav: false, updated: "09:05" },
  { id: 30, code: "XD2024002", name: "定向选调", dept: "河南省委组织部", examType: "选调生", level: "省级", deptType: "党委机关", positionType: "综合管理类", province: "河南", city: "郑州", edu: "硕士", degree: "硕士", majorType: "不限", major: "不限", recruit: 50, apply: 1200, ratio: 24, match: 77, trend: 3.8, political: "党员", workExp: "不限", age: "28", gender: "不限", identity: "应届生", score: 128, hot: false, fav: false, updated: "09:02" },
  { id: 31, code: "GK2024016", name: "边检民警", dept: "国家移民管理局", examType: "国考", level: "中央", deptType: "政府机关", positionType: "公安类", province: "广东", city: "深圳", edu: "本科", degree: "学士", majorType: "不限", major: "不限", recruit: 20, apply: 580, ratio: 29, match: 84, trend: 2.1, political: "党员", workExp: "不限", age: "30", gender: "不限", identity: "不限", score: 126, hot: false, fav: false, updated: "08:58" },
  { id: 32, code: "SK2024009", name: "市场监管", dept: "浙江省市场监管局", examType: "省考", level: "省级", deptType: "政府机关", positionType: "行政执法类", province: "浙江", city: "杭州", edu: "本科", degree: "学士", majorType: "法学", major: "法学类", recruit: 8, apply: 360, ratio: 45, match: 80, trend: -1.8, political: "不限", workExp: "不限", age: "35", gender: "不限", identity: "不限", score: 123, hot: false, fav: false, updated: "08:55" },
  { id: 33, code: "GK2024017", name: "档案管理", dept: "中央档案馆", examType: "国考", level: "中央", deptType: "参公单位", positionType: "综合管理类", province: "北京", city: "西城区", edu: "本科", degree: "学士", majorType: "管理学", major: "档案学", recruit: 2, apply: 120, ratio: 60, match: 88, trend: 0.5, political: "党员", workExp: "不限", age: "35", gender: "不限", identity: "不限", score: 128, hot: false, fav: false, updated: "08:52" },
  { id: 34, code: "SY2024004", name: "科研助理", dept: "中科院物理所", examType: "事业单位", level: "中央", deptType: "参公单位", positionType: "专业技术类", province: "北京", city: "海淀区", edu: "博士", degree: "博士", majorType: "理学", major: "物理学", recruit: 3, apply: 35, ratio: 12, match: 96, trend: -0.8, political: "不限", workExp: "不限", age: "35", gender: "不限", identity: "不限", score: 145, hot: false, fav: true, updated: "08:48" },
  { id: 35, code: "SK2024010", name: "应急管理", dept: "四川省应急管理厅", examType: "省考", level: "省级", deptType: "政府机关", positionType: "综合管理类", province: "四川", city: "成都", edu: "本科", degree: "学士", majorType: "工学", major: "安全工程", recruit: 5, apply: 180, ratio: 36, match: 82, trend: 4.2, political: "不限", workExp: "不限", age: "35", gender: "不限", identity: "不限", score: 125, hot: false, fav: false, updated: "08:45" },
];

type SortKey = "match" | "ratio" | "recruit" | "apply" | "trend" | "score";

// 多选下拉组件
function MultiSelect({ label, options, selected, onChange, className = "" }: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt]);
  };
  return (
    <div className={`relative ${className}`}>
      <button onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 px-2 py-1 text-sm border rounded transition-colors ${
          selected.length > 0 ? "bg-amber-50 border-amber-300 text-amber-700" : "bg-white border-stone-200 text-stone-600 hover:border-stone-300"
        }`}>
        {label}{selected.length > 0 && <span className="px-1 py-0.5 bg-amber-500 text-white text-xs rounded">{selected.length}</span>}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-warm-lg z-50 min-w-[160px] max-h-[240px] overflow-y-auto">
            {options.map(opt => (
              <button key={opt} onClick={() => toggle(opt)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-stone-50 ${selected.includes(opt) ? "text-amber-600" : "text-stone-700"}`}>
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${selected.includes(opt) ? "bg-amber-500 border-amber-500" : "border-stone-300"}`}>
                  {selected.includes(opt) && <Check className="w-3 h-3 text-white" />}
                </div>
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// 范围滑块组件
function RangeFilter({ label, min, max, value, onChange }: {
  label: string;
  min: number;
  max: number;
  value: [number, number];
  onChange: (val: [number, number]) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-stone-500 w-16">{label}</span>
      <input type="number" value={value[0]} onChange={e => onChange([+e.target.value, value[1]])}
        className="w-14 px-1 py-0.5 text-xs border border-stone-200 rounded-lg text-center focus:border-amber-500 outline-none" min={min} max={max} />
      <span className="text-stone-400">-</span>
      <input type="number" value={value[1]} onChange={e => onChange([value[0], +e.target.value])}
        className="w-14 px-1 py-0.5 text-xs border border-stone-200 rounded-lg text-center focus:border-amber-500 outline-none" min={min} max={max} />
    </div>
  );
}

export default function PositionsPage() {
  // 筛选状态
  const [filters, setFilters] = useState<Record<string, string[]>>({
    examType: [], province: [], city: [], level: [], deptType: [], positionType: [],
    education: [], degree: [], majorType: [], political: [], workExp: [], gender: [], identity: [], ageRange: [],
  });
  const [ranges, setRanges] = useState({
    recruit: [1, 50] as [number, number],
    ratio: [0, 500] as [number, number],
    match: [0, 100] as [number, number],
    score: [100, 160] as [number, number],
  });
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("match");
  const [sortAsc, setSortAsc] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([1, 6, 8]);
  const [compareList, setCompareList] = useState<number[]>([]);

  // 更新筛选
  const updateFilter = (key: string, val: string[]) => setFilters(prev => ({ ...prev, [key]: val }));
  const updateRange = (key: string, val: [number, number]) => setRanges(prev => ({ ...prev, [key]: val }));
  const toggleQuick = (id: string) => setActiveQuickFilters(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);

  // 重置筛选
  const resetFilters = () => {
    setFilters({ examType: [], province: [], city: [], level: [], deptType: [], positionType: [], education: [], degree: [], majorType: [], political: [], workExp: [], gender: [], identity: [], ageRange: [] });
    setRanges({ recruit: [1, 50], ratio: [0, 500], match: [0, 100], score: [100, 160] });
    setActiveQuickFilters([]);
    setSearchQuery("");
  };

  // 活跃筛选数量
  const activeFilterCount = Object.values(filters).filter(v => v.length > 0).length + 
    activeQuickFilters.length + 
    (ranges.recruit[0] !== 1 || ranges.recruit[1] !== 50 ? 1 : 0) +
    (ranges.ratio[0] !== 0 || ranges.ratio[1] !== 500 ? 1 : 0) +
    (ranges.match[0] !== 0 || ranges.match[1] !== 100 ? 1 : 0) +
    (ranges.score[0] !== 100 || ranges.score[1] !== 160 ? 1 : 0);

  // 筛选和排序数据
  const filteredData = useMemo(() => {
    let data = [...positions];

    // 文本搜索
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(p => p.name.includes(q) || p.dept.includes(q) || p.code.includes(q) || p.major.includes(q));
    }

    // 多选筛选
    if (filters.examType.length) data = data.filter(p => filters.examType.includes(p.examType));
    if (filters.province.length) data = data.filter(p => filters.province.includes(p.province));
    if (filters.level.length) data = data.filter(p => filters.level.includes(p.level));
    if (filters.deptType.length) data = data.filter(p => filters.deptType.includes(p.deptType));
    if (filters.positionType.length) data = data.filter(p => filters.positionType.includes(p.positionType));
    if (filters.education.length) data = data.filter(p => filters.education.includes(p.edu));
    if (filters.degree.length) data = data.filter(p => filters.degree.includes(p.degree));
    if (filters.majorType.length) data = data.filter(p => filters.majorType.includes(p.majorType));
    if (filters.political.length) data = data.filter(p => filters.political.includes(p.political));
    if (filters.workExp.length) data = data.filter(p => filters.workExp.includes(p.workExp));
    if (filters.gender.length) data = data.filter(p => filters.gender.includes(p.gender));
    if (filters.identity.length) data = data.filter(p => filters.identity.includes(p.identity));

    // 范围筛选
    data = data.filter(p => p.recruit >= ranges.recruit[0] && p.recruit <= ranges.recruit[1]);
    data = data.filter(p => p.ratio >= ranges.ratio[0] && p.ratio <= ranges.ratio[1]);
    data = data.filter(p => p.match >= ranges.match[0] && p.match <= ranges.match[1]);
    data = data.filter(p => p.score >= ranges.score[0] && p.score <= ranges.score[1]);

    // 快捷筛选
    if (activeQuickFilters.includes("highMatch")) data = data.filter(p => p.match >= 80);
    if (activeQuickFilters.includes("lowComp")) data = data.filter(p => p.ratio <= 50);
    if (activeQuickFilters.includes("moreRecruit")) data = data.filter(p => p.recruit >= 3);
    if (activeQuickFilters.includes("hot")) data = data.filter(p => p.hot);
    if (activeQuickFilters.includes("rising")) data = data.filter(p => p.trend > 0);
    if (activeQuickFilters.includes("fav")) data = data.filter(p => favorites.includes(p.id));

    // 排序
    data.sort((a, b) => sortAsc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]);

    return data;
  }, [filters, ranges, activeQuickFilters, searchQuery, sortKey, sortAsc, favorites]);

  // 统计
  const stats = useMemo(() => ({
    total: filteredData.length,
    recruit: filteredData.reduce((s, p) => s + p.recruit, 0),
    apply: filteredData.reduce((s, p) => s + p.apply, 0),
    avgRatio: filteredData.length ? Math.round(filteredData.reduce((s, p) => s + p.ratio, 0) / filteredData.length) : 0,
    highMatch: filteredData.filter(p => p.match >= 80).length,
    hot: filteredData.filter(p => p.hot).length,
  }), [filteredData]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const toggleFav = (id: number) => setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  const toggleCompare = (id: number) => setCompareList(prev => prev.includes(id) ? prev.filter(c => c !== id) : prev.length >= 4 ? prev : [...prev, id]);

  const ratioColor = (r: number) => r <= 30 ? "text-emerald-600" : r <= 60 ? "text-green-500" : r <= 100 ? "text-amber-500" : r <= 200 ? "text-orange-500" : "text-red-600";
  const ratioBg = (r: number) => r <= 30 ? "bg-emerald-50" : r <= 60 ? "bg-green-50" : r <= 100 ? "bg-amber-50" : r <= 200 ? "bg-orange-50" : "bg-red-50";
  const matchColor = (m: number) => m >= 90 ? "text-emerald-600" : m >= 80 ? "text-green-500" : m >= 70 ? "text-amber-500" : m >= 60 ? "text-orange-500" : "text-stone-500";
  const matchBg = (m: number) => m >= 90 ? "bg-emerald-500" : m >= 80 ? "bg-green-500" : m >= 70 ? "bg-amber-500" : m >= 60 ? "bg-orange-500" : "bg-stone-400";

  return (
    <div className="min-h-screen text-stone-800">
      {/* 筛选区域 */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-stone-200/50 sticky top-0 z-30 shadow-warm-sm">
        <div className="max-w-[1800px] mx-auto">
          {/* 主筛选行 */}
          <div className="flex items-center gap-2 px-3 py-2 flex-wrap">
            {/* 搜索 */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索代码/职位/部门/专业"
                className="w-48 pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
            </div>

            <div className="h-6 w-px bg-stone-200" />

            {/* 主要筛选器 */}
            <MultiSelect label="考试类型" options={filterConfig.examType.options} selected={filters.examType} onChange={v => updateFilter("examType", v)} />
            <MultiSelect label="省份" options={filterConfig.province.options} selected={filters.province} onChange={v => updateFilter("province", v)} />
            <MultiSelect label="职位层级" options={filterConfig.level.options} selected={filters.level} onChange={v => updateFilter("level", v)} />
            <MultiSelect label="学历要求" options={filterConfig.education.options} selected={filters.education} onChange={v => updateFilter("education", v)} />
            <MultiSelect label="专业大类" options={filterConfig.majorType.options} selected={filters.majorType} onChange={v => updateFilter("majorType", v)} />
            <MultiSelect label="政治面貌" options={filterConfig.political.options} selected={filters.political} onChange={v => updateFilter("political", v)} />

            <div className="flex-1" />

            {/* 高级筛选按钮 */}
            <button onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-1 px-2 py-1 text-sm border rounded-lg transition-colors ${
                showAdvanced ? "bg-amber-50 border-amber-300 text-amber-700" : "bg-white border-stone-200 text-stone-600 hover:border-stone-300"
              }`}>
              <SlidersHorizontal className="w-4 h-4" />
              高级筛选
              {activeFilterCount > 0 && <span className="px-1 py-0.5 bg-amber-500 text-white text-xs rounded">{activeFilterCount}</span>}
            </button>

            {/* 重置 */}
            {activeFilterCount > 0 && (
              <button onClick={resetFilters} className="flex items-center gap-1 px-2 py-1 text-sm text-stone-500 hover:text-stone-700">
                <RotateCcw className="w-3 h-3" />重置
              </button>
            )}

            {/* 工具按钮 */}
            <button className="p-1.5 text-stone-500 hover:bg-stone-100 rounded-lg"><RefreshCw className="w-4 h-4" /></button>
            <button className="p-1.5 text-stone-500 hover:bg-stone-100 rounded-lg"><Download className="w-4 h-4" /></button>
          </div>

          {/* 高级筛选面板 */}
          {showAdvanced && (
            <div className="border-t border-stone-100 bg-stone-50/50">
              {/* 第二行筛选器 */}
              <div className="flex items-center gap-2 px-3 py-2 flex-wrap">
                <span className="text-xs text-stone-500 font-medium">更多条件:</span>
                <MultiSelect label="部门类型" options={filterConfig.deptType.options} selected={filters.deptType} onChange={v => updateFilter("deptType", v)} />
                <MultiSelect label="职位类别" options={filterConfig.positionType.options} selected={filters.positionType} onChange={v => updateFilter("positionType", v)} />
                <MultiSelect label="学位要求" options={filterConfig.degree.options} selected={filters.degree} onChange={v => updateFilter("degree", v)} />
                <MultiSelect label="基层经历" options={filterConfig.workExp.options} selected={filters.workExp} onChange={v => updateFilter("workExp", v)} />
                <MultiSelect label="身份要求" options={filterConfig.identity.options} selected={filters.identity} onChange={v => updateFilter("identity", v)} />
                <MultiSelect label="性别要求" options={filterConfig.gender.options} selected={filters.gender} onChange={v => updateFilter("gender", v)} />
                <MultiSelect label="年龄限制" options={filterConfig.ageRange.options} selected={filters.ageRange} onChange={v => updateFilter("ageRange", v)} />
              </div>

              {/* 数值范围筛选 */}
              <div className="flex items-center gap-4 px-3 py-2 border-t border-stone-100 flex-wrap">
                <span className="text-xs text-stone-500 font-medium">数值范围:</span>
                <RangeFilter label="招录人数" min={1} max={100} value={ranges.recruit} onChange={v => updateRange("recruit", v)} />
                <RangeFilter label="竞争比" min={0} max={1000} value={ranges.ratio} onChange={v => updateRange("ratio", v)} />
                <RangeFilter label="匹配度" min={0} max={100} value={ranges.match} onChange={v => updateRange("match", v)} />
                <RangeFilter label="分数线" min={80} max={180} value={ranges.score} onChange={v => updateRange("score", v)} />
              </div>

              {/* 快捷筛选 */}
              <div className="flex items-center gap-2 px-3 py-2 border-t border-stone-100 flex-wrap">
                <span className="text-xs text-stone-500 font-medium">快捷筛选:</span>
                {quickFilters.map(qf => (
                  <button key={qf.id} onClick={() => toggleQuick(qf.id)}
                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg border transition-colors ${
                      activeQuickFilters.includes(qf.id)
                        ? "bg-amber-50 border-amber-300 text-amber-700"
                        : "bg-white border-stone-200 text-stone-600 hover:border-stone-300"
                    }`}>
                    <qf.icon className="w-3 h-3" />{qf.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 已选筛选标签 */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 border-t border-stone-100 bg-amber-50/50 flex-wrap">
              <span className="text-xs text-stone-500">已选:</span>
              {Object.entries(filters).map(([key, vals]) => vals.map(v => (
                <span key={`${key}-${v}`} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-700">
                  {v}
                  <button onClick={() => updateFilter(key, vals.filter(x => x !== v))} className="text-stone-400 hover:text-stone-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )))}
              {activeQuickFilters.map(qf => (
                <span key={qf} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 border border-amber-200 rounded-lg text-xs text-amber-700">
                  {quickFilters.find(q => q.id === qf)?.label}
                  <button onClick={() => toggleQuick(qf)} className="text-amber-400 hover:text-amber-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* 对比栏 */}
          {compareList.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 border-t border-stone-100 bg-emerald-50">
              <Scale className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-emerald-700">已选 {compareList.length}/4 个职位</span>
              <button className="px-2 py-0.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700">开始对比</button>
              <button onClick={() => setCompareList([])} className="text-emerald-600 hover:text-emerald-700 text-xs">清除</button>
            </div>
          )}
        </div>
      </div>

      {/* 数据表格 */}
      <div className="max-w-[1800px] mx-auto px-4 py-4">
        <div className="bg-white border border-stone-200/50 rounded-2xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-stone-50">
              <tr>
                <th className="px-1.5 py-2.5 text-left font-semibold text-stone-600 border-b border-stone-200 w-8">
                  <input type="checkbox" className="rounded border-stone-300" />
                </th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-stone-600 border-b border-stone-200">代码</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-stone-600 border-b border-stone-200 min-w-[140px]">职位名称</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-stone-600 border-b border-stone-200 min-w-[180px]">招录单位</th>
                <th className="px-1.5 py-2.5 text-center font-semibold text-stone-600 border-b border-stone-200">类型</th>
                <th className="px-1.5 py-2.5 text-center font-semibold text-stone-600 border-b border-stone-200">层级</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-stone-600 border-b border-stone-200">地区</th>
                <th className="px-1.5 py-2.5 text-center font-semibold text-stone-600 border-b border-stone-200">学历</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-stone-600 border-b border-stone-200">专业</th>
                <th className="px-1.5 py-2.5 text-center font-semibold text-stone-600 border-b border-stone-200 cursor-pointer hover:bg-stone-100 rounded-lg" onClick={() => handleSort("recruit")}>
                  招录{sortKey === "recruit" && (sortAsc ? <ArrowUp className="w-3 h-3 inline" /> : <ArrowDown className="w-3 h-3 inline" />)}
                </th>
                <th className="px-1.5 py-2.5 text-center font-semibold text-stone-600 border-b border-stone-200 cursor-pointer hover:bg-stone-100 rounded-lg" onClick={() => handleSort("ratio")}>
                  竞争{sortKey === "ratio" && (sortAsc ? <ArrowUp className="w-3 h-3 inline" /> : <ArrowDown className="w-3 h-3 inline" />)}
                </th>
                <th className="px-1.5 py-2.5 text-center font-semibold text-stone-600 border-b border-stone-200 cursor-pointer hover:bg-stone-100 rounded-lg" onClick={() => handleSort("match")}>
                  匹配{sortKey === "match" && (sortAsc ? <ArrowUp className="w-3 h-3 inline" /> : <ArrowDown className="w-3 h-3 inline" />)}
                </th>
                <th className="px-1.5 py-2.5 text-center font-semibold text-stone-600 border-b border-stone-200 cursor-pointer hover:bg-stone-100 rounded-lg" onClick={() => handleSort("trend")}>
                  热度{sortKey === "trend" && (sortAsc ? <ArrowUp className="w-3 h-3 inline" /> : <ArrowDown className="w-3 h-3 inline" />)}
                </th>
                <th className="px-1.5 py-2.5 text-center font-semibold text-stone-600 border-b border-stone-200 cursor-pointer hover:bg-stone-100 rounded-lg" onClick={() => handleSort("score")}>
                  分数{sortKey === "score" && (sortAsc ? <ArrowUp className="w-3 h-3 inline" /> : <ArrowDown className="w-3 h-3 inline" />)}
                </th>
                <th className="px-1.5 py-2.5 text-center font-semibold text-stone-600 border-b border-stone-200">要求</th>
                <th className="px-1.5 py-2.5 text-center font-semibold text-stone-600 border-b border-stone-200 w-16">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((p, idx) => (
                <tr key={p.id} className={`border-b border-stone-100 hover:bg-amber-50/50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-stone-50/30"}`}>
                  <td className="px-1.5 py-1.5">
                    <input type="checkbox" checked={compareList.includes(p.id)} onChange={() => toggleCompare(p.id)} className="rounded border-stone-300" />
                  </td>
                  <td className="px-1.5 py-1.5 font-mono text-xs text-stone-500">{p.code}</td>
                  <td className="px-1.5 py-1.5">
                    <div className="flex items-center gap-1">
                      {p.hot && <Flame className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                      {favorites.includes(p.id) && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />}
                      <Link href={`/positions/${p.id}`} className="font-medium text-stone-800 hover:text-amber-600 truncate">{p.name}</Link>
                    </div>
                  </td>
                  <td className="px-1.5 py-1.5">
                    <div className="truncate text-stone-700" title={p.dept}>{p.dept}</div>
                  </td>
                  <td className="px-1.5 py-1.5 text-center">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                      p.examType === "国考" ? "bg-blue-100 text-blue-700" :
                      p.examType === "省考" ? "bg-emerald-100 text-emerald-700" :
                      p.examType === "事业单位" ? "bg-violet-100 text-violet-700" :
                      p.examType === "选调生" ? "bg-amber-100 text-amber-700" :
                      p.examType === "军队文职" ? "bg-slate-100 text-slate-700" :
                      "bg-orange-100 text-orange-700"
                    }`}>{p.examType}</span>
                  </td>
                  <td className="px-1.5 py-1.5 text-center text-xs text-stone-600">{p.level}</td>
                  <td className="px-1.5 py-1.5 text-stone-700 text-xs">{p.province} {p.city}</td>
                  <td className="px-1.5 py-1.5 text-center text-stone-600">{p.edu}</td>
                  <td className="px-1.5 py-1.5">
                    <span className={`text-xs truncate ${p.major === "不限" ? "text-emerald-600 font-medium" : "text-stone-600"}`} title={p.major}>
                      {p.major.length > 6 ? p.major.slice(0, 6) + "…" : p.major}
                    </span>
                  </td>
                  <td className="px-1.5 py-1.5 text-center">
                    <span className={`font-mono font-bold ${p.recruit >= 5 ? "text-emerald-600" : p.recruit >= 3 ? "text-green-500" : "text-stone-700"}`}>{p.recruit}</span>
                  </td>
                  <td className="px-1.5 py-1.5 text-center">
                    <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${ratioColor(p.ratio)} ${ratioBg(p.ratio)}`}>{p.ratio}:1</span>
                  </td>
                  <td className="px-1.5 py-1.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className={`font-mono font-bold ${matchColor(p.match)}`}>{p.match}%</span>
                      <div className="w-8 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${matchBg(p.match)}`} style={{ width: `${p.match}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-1.5 py-1.5 text-center">
                    <span className={`font-mono text-xs flex items-center justify-center gap-0.5 ${p.trend > 0 ? "text-red-500" : p.trend < 0 ? "text-emerald-500" : "text-stone-400"}`}>
                      {p.trend > 0 ? <ArrowUp className="w-3 h-3" /> : p.trend < 0 ? <ArrowDown className="w-3 h-3" /> : null}
                      {p.trend > 0 ? "+" : ""}{p.trend.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-1.5 py-1.5 text-center font-mono text-amber-600 text-xs">{p.score}</td>
                  <td className="px-1.5 py-1.5">
                    <div className="flex flex-wrap gap-0.5 justify-center">
                      {p.political !== "不限" && <span className="px-1 py-0.5 bg-red-50 text-red-600 rounded text-xs">{p.political}</span>}
                      {p.workExp !== "不限" && <span className="px-1 py-0.5 bg-amber-50 text-amber-600 rounded text-xs">{p.workExp}</span>}
                      {p.identity !== "不限" && <span className="px-1 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">{p.identity}</span>}
                    </div>
                  </td>
                  <td className="px-1.5 py-1.5">
                    <div className="flex items-center justify-center gap-0.5">
                      <button onClick={() => toggleFav(p.id)} className={`p-1 rounded-lg transition-colors ${favorites.includes(p.id) ? "text-amber-500" : "text-stone-400 hover:text-amber-500"}`}>
                        <Star className={`w-4 h-4 ${favorites.includes(p.id) ? "fill-current" : ""}`} />
                      </button>
                      <Link href={`/positions/${p.id}`} className="p-1 rounded-lg text-stone-400 hover:text-amber-600">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>

          {/* 底部状态栏 */}
          <div className="bg-stone-50 border-t border-stone-200 px-3 py-2.5 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-stone-600">
            <span>共 <b className="text-stone-800">{filteredData.length}</b> 条</span>
            <span>招录 <b className="text-emerald-600">{stats.recruit}</b> 人</span>
            <span>均竞争 <b className="text-amber-600">{stats.avgRatio}:1</b></span>
          </div>
          <div className="flex items-center gap-2 text-stone-400">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span>实时更新</span>
            <Clock className="w-4 h-4" />
            <span>2 分钟前</span>
          </div>
        </div>
        </div>

        {filteredData.length === 0 && (
          <div className="bg-white p-12 text-center rounded-2xl border border-stone-200/50 shadow-card mt-4">
            <Filter className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-700 mb-2">暂无符合条件的职位</h3>
            <p className="text-stone-500 mb-4">请调整筛选条件或搜索关键词</p>
            <button onClick={resetFilters} className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 shadow-amber-md">重置筛选</button>
          </div>
        )}
      </div>
    </div>
  );
}
