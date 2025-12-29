import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Building2,
  FileText,
  Download,
  Share2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Announcement {
  id: string;
  title: string;
  type: string;
  source: string;
  sourceUrl: string;
  publishDate: string;
  province: string;
  city: string;
  content: string;
  attachments: { name: string; url: string }[];
  relatedPositionCount: number;
}

const mockAnnouncement: Announcement = {
  id: "1",
  title: "2024年度国家公务员考试招录公告",
  type: "国考",
  source: "国家公务员局",
  sourceUrl: "https://www.scs.gov.cn",
  publishDate: "2024-10-14",
  province: "全国",
  city: "",
  content: `
    <h2>一、报考条件</h2>
    <p>（一）具有中华人民共和国国籍；</p>
    <p>（二）18周岁以上、35周岁以下（1988年10月至2006年10月期间出生），2024年应届硕士研究生和博士研究生（非在职）人员年龄可放宽到40周岁以下（1983年10月以后出生）；</p>
    <p>（三）拥护中华人民共和国宪法，拥护中国共产党领导和社会主义制度；</p>
    <p>（四）具有良好的政治素质和道德品行；</p>
    <p>（五）具有正常履行职责的身体条件和心理素质；</p>
    <p>（六）具有符合职位要求的工作能力；</p>
    <p>（七）具有大学专科及以上文化程度；</p>
    <p>（八）具备中央公务员主管部门规定的拟任职位所要求的其他资格条件。</p>
    
    <h2>二、报名时间</h2>
    <p>报名时间为2024年10月15日8:00至10月24日18:00。</p>
    
    <h2>三、考试时间</h2>
    <p>公共科目笔试时间为2024年12月1日。</p>
    <p>上午 9:00—11:00 行政职业能力测验</p>
    <p>下午 14:00—17:00 申论</p>
    
    <h2>四、考试内容</h2>
    <p>笔试包括公共科目和专业科目。公共科目包括行政职业能力测验和申论两科。</p>
  `,
  attachments: [
    { name: "2024年国考职位表.xlsx", url: "#" },
    { name: "报考指南.pdf", url: "#" },
    { name: "考试大纲.pdf", url: "#" },
  ],
  relatedPositionCount: 39561,
};

export default function AnnouncementDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const announcement = mockAnnouncement;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: announcement.title,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("链接已复制到剪贴板");
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "国考":
        return "bg-red-100 text-red-700";
      case "省考":
        return "bg-blue-100 text-blue-700";
      case "事业单位":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回列表
        </Button>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Badge className={getTypeColor(announcement.type)}>{announcement.type}</Badge>
            <h1 className="text-2xl font-bold leading-tight flex-1">{announcement.title}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {announcement.publishDate}
            </span>
            <span className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {announcement.source}
            </span>
            {announcement.province && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {announcement.province}
                {announcement.city && ` · ${announcement.city}`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              分享
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(announcement.sourceUrl, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              查看原文
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate(`/positions?announcementId=${id}`)}
            >
              <FileText className="h-4 w-4 mr-2" />
              查看 {announcement.relatedPositionCount} 个职位
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>公告内容</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: announcement.content }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">附件下载</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {announcement.attachments.length > 0 ? (
                announcement.attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.url}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
                    download
                  >
                    <Download className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm flex-1 truncate">{attachment.name}</span>
                  </a>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">暂无附件</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">重要时间节点</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">报名开始</span>
                  <span className="font-medium">2024-10-15</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">报名截止</span>
                  <span className="font-medium">2024-10-24</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">笔试时间</span>
                  <span className="font-medium">2024-12-01</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">相关信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">招录职位</span>
                  <span className="font-medium">{announcement.relatedPositionCount} 个</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">考试类型</span>
                  <span className="font-medium">{announcement.type}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
