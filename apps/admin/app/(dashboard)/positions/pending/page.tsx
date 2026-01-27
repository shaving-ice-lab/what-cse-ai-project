"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Check,
  X,
  Eye,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@what-cse/ui";
import { adminApi } from "@/services/api";

interface PendingPosition {
  id: number;
  position_name: string;
  department_name: string;
  position_code?: string;
  recruit_count: number;
  work_location?: string;
  education_min?: string;
  major_specific?: string[];
  major_unlimited: boolean;
  political_status?: string;
  other_requirements?: string;
  parse_source: string;
  parse_confidence: number;
  announcement_id?: number;
  announcement_title?: string;
  created_at: string;
}

// Mock data for development
const mockPendingPositions: PendingPosition[] = [
  {
    id: 1,
    position_name: "综合管理岗",
    department_name: "国家税务总局北京市税务局",
    position_code: "300110001001",
    recruit_count: 2,
    work_location: "北京市朝阳区",
    education_min: "本科及以上",
    major_specific: ["计算机科学与技术", "软件工程"],
    major_unlimited: false,
    political_status: "中共党员",
    other_requirements: "具有2年以上工作经验",
    parse_source: "excel",
    parse_confidence: 92,
    announcement_id: 1,
    announcement_title: "2024年国家公务员考试公告",
    created_at: "2024-12-20T10:30:00Z",
  },
  {
    id: 2,
    position_name: "行政执法岗",
    department_name: "海关总署上海海关",
    position_code: "300110001002",
    recruit_count: 5,
    work_location: "上海市浦东新区",
    education_min: "本科及以上",
    major_specific: ["法学", "行政管理"],
    major_unlimited: false,
    political_status: "不限",
    parse_source: "ai",
    parse_confidence: 78,
    announcement_id: 1,
    announcement_title: "2024年国家公务员考试公告",
    created_at: "2024-12-20T10:35:00Z",
  },
  {
    id: 3,
    position_name: "财务管理岗",
    department_name: "财政部预算司",
    recruit_count: 1,
    work_location: "北京市西城区",
    education_min: "硕士研究生及以上",
    major_unlimited: true,
    parse_source: "html_table",
    parse_confidence: 65,
    announcement_id: 2,
    announcement_title: "2024年中央机关招录公告",
    created_at: "2024-12-20T11:00:00Z",
  },
];

export default function PendingPositionsPage() {
  const [positions, setPositions] = useState<PendingPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [confidenceFilter, setConfidenceFilter] = useState<string>("all");
  const [selectedPositions, setSelectedPositions] = useState<number[]>([]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Dialog states
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectPosition, setRejectPosition] = useState<PendingPosition | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const res = await adminApi.getPendingPositions();
      // setPositions(res.positions);

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500));
      setPositions(mockPendingPositions);
    } catch (error) {
      console.error("Failed to fetch pending positions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleApprove = async (positionId: number) => {
    setProcessing(true);
    try {
      // TODO: Call API to approve position
      await new Promise((resolve) => setTimeout(resolve, 500));
      setPositions((prev) => prev.filter((p) => p.id !== positionId));
    } catch (error) {
      console.error("Failed to approve position:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectPosition) return;
    setProcessing(true);
    try {
      // TODO: Call API to reject position
      await new Promise((resolve) => setTimeout(resolve, 500));
      setPositions((prev) => prev.filter((p) => p.id !== rejectPosition.id));
      setIsRejectDialogOpen(false);
      setRejectPosition(null);
      setRejectReason("");
    } catch (error) {
      console.error("Failed to reject position:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleBatchApprove = async () => {
    if (selectedPositions.length === 0) return;
    setProcessing(true);
    try {
      // TODO: Call API to batch approve
      await new Promise((resolve) => setTimeout(resolve, 500));
      setPositions((prev) => prev.filter((p) => !selectedPositions.includes(p.id)));
      setSelectedPositions([]);
    } catch (error) {
      console.error("Failed to batch approve:", error);
    } finally {
      setProcessing(false);
    }
  };

  const openRejectDialog = (position: PendingPosition) => {
    setRejectPosition(position);
    setIsRejectDialogOpen(true);
  };

  const toggleSelectAll = () => {
    if (selectedPositions.length === filteredPositions.length) {
      setSelectedPositions([]);
    } else {
      setSelectedPositions(filteredPositions.map((p) => p.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedPositions((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 85) {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
          {confidence}% 高
        </Badge>
      );
    } else if (confidence >= 70) {
      return (
        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
          {confidence}% 中
        </Badge>
      );
    } else {
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{confidence}% 低</Badge>;
    }
  };

  const getParseSourceBadge = (source: string) => {
    const sources: Record<string, { label: string; className: string }> = {
      excel: { label: "Excel", className: "bg-green-100 text-green-700" },
      pdf: { label: "PDF", className: "bg-blue-100 text-blue-700" },
      html_table: { label: "HTML", className: "bg-purple-100 text-purple-700" },
      ai: { label: "AI提取", className: "bg-orange-100 text-orange-700" },
      word: { label: "Word", className: "bg-indigo-100 text-indigo-700" },
    };

    const sourceInfo = sources[source] || { label: source, className: "bg-gray-100 text-gray-700" };
    return (
      <Badge variant="outline" className={sourceInfo.className}>
        {sourceInfo.label}
      </Badge>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("zh-CN");
  };

  // Filter positions
  const filteredPositions = positions.filter((position) => {
    const matchesSearch =
      searchKeyword === "" ||
      position.position_name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      position.department_name.toLowerCase().includes(searchKeyword.toLowerCase());

    const matchesConfidence =
      confidenceFilter === "all" ||
      (confidenceFilter === "high" && position.parse_confidence >= 85) ||
      (confidenceFilter === "medium" &&
        position.parse_confidence >= 70 &&
        position.parse_confidence < 85) ||
      (confidenceFilter === "low" && position.parse_confidence < 70);

    return matchesSearch && matchesConfidence;
  });

  // Stats
  const highConfidenceCount = positions.filter((p) => p.parse_confidence >= 85).length;
  const lowConfidenceCount = positions.filter((p) => p.parse_confidence < 70).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">待审核职位</h1>
          <p className="text-muted-foreground">审核AI提取的职位数据</p>
        </div>
        <div className="flex gap-2">
          <Link href="/positions">
            <Button variant="outline">返回职位管理</Button>
          </Link>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            刷新
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待审核</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">高置信度</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{highConfidenceCount}</div>
            <p className="text-xs text-muted-foreground">≥85% 可快速审核</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">低置信度</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowConfidenceCount}</div>
            <p className="text-xs text-muted-foreground">&lt;70% 需仔细审核</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已选择</CardTitle>
            <Check className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{selectedPositions.length}</div>
            {selectedPositions.length > 0 && (
              <Button
                size="sm"
                className="mt-2 w-full"
                onClick={handleBatchApprove}
                disabled={processing}
              >
                {processing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                批量通过
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索职位名称或部门..."
            className="pl-9"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>
        <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="筛选置信度" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="high">高置信度 (≥85%)</SelectItem>
            <SelectItem value="medium">中置信度 (70-84%)</SelectItem>
            <SelectItem value="low">低置信度 (&lt;70%)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 职位列表 */}
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={
                        selectedPositions.length === filteredPositions.length &&
                        filteredPositions.length > 0
                      }
                      onChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>职位信息</TableHead>
                  <TableHead className="hidden md:table-cell">来源公告</TableHead>
                  <TableHead>置信度</TableHead>
                  <TableHead className="hidden lg:table-cell">解析来源</TableHead>
                  <TableHead className="w-[120px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPositions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {positions.length === 0 ? "暂无待审核职位" : "没有符合条件的职位"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPositions.map((position) => (
                    <>
                      <TableRow
                        key={position.id}
                        className={expandedRow === position.id ? "border-b-0" : ""}
                      >
                        <TableCell>
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={selectedPositions.includes(position.id)}
                            onChange={() => toggleSelect(position.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {position.position_name}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() =>
                                  setExpandedRow(expandedRow === position.id ? null : position.id)
                                }
                              >
                                {expandedRow === position.id ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {position.department_name}
                            </div>
                            {position.position_code && (
                              <div className="text-xs text-muted-foreground">
                                代码: {position.position_code}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-sm max-w-xs truncate">
                            {position.announcement_title || "-"}
                          </div>
                        </TableCell>
                        <TableCell>{getConfidenceBadge(position.parse_confidence)}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {getParseSourceBadge(position.parse_source)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              onClick={() => handleApprove(position.id)}
                              disabled={processing}
                              title="通过"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => openRejectDialog(position)}
                              disabled={processing}
                              title="拒绝"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Link href={`/positions/${position.id}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="查看详情"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedRow === position.id && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-muted/30 p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">招录人数</div>
                                <div className="font-medium">{position.recruit_count}人</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">工作地点</div>
                                <div className="font-medium">{position.work_location || "-"}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">学历要求</div>
                                <div className="font-medium">{position.education_min || "-"}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">政治面貌</div>
                                <div className="font-medium">
                                  {position.political_status || "-"}
                                </div>
                              </div>
                              <div className="md:col-span-2">
                                <div className="text-muted-foreground">专业要求</div>
                                <div className="font-medium">
                                  {position.major_unlimited
                                    ? "不限"
                                    : position.major_specific?.join("、") || "-"}
                                </div>
                              </div>
                              <div className="md:col-span-2">
                                <div className="text-muted-foreground">其他条件</div>
                                <div className="font-medium">
                                  {position.other_requirements || "-"}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>拒绝职位</DialogTitle>
            <DialogDescription>
              拒绝职位 "{rejectPosition?.position_name}"，请填写拒绝原因。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reject_reason">拒绝原因</Label>
              <Textarea
                id="reject_reason"
                placeholder="请输入拒绝原因..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !rejectReason.trim()}
            >
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              确认拒绝
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
