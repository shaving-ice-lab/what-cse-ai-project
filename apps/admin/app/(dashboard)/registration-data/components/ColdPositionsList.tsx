"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  MapPin,
  Users,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  TrendingDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@what-cse/ui";
import { registrationDataApi } from "@/services/registration-data-api";
import type { ColdPosition, ColdPositionsResponse } from "@/types/registration-data";

export function ColdPositionsList() {
  const [activeTab, setActiveTab] = useState<"no-applicant" | "low-competition">("no-applicant");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ColdPositionsResponse | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let result: ColdPositionsResponse;
      
      if (activeTab === "no-applicant") {
        result = await registrationDataApi.getNoApplicantPositions(page, pageSize);
      } else {
        result = await registrationDataApi.getLowCompetitionPositions(10, page, pageSize);
      }
      
      setData(result);
    } catch (err) {
      console.error("Failed to fetch cold positions:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 切换 tab 时重置页码
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          冷门岗位推荐
        </CardTitle>
        <CardDescription>
          发现低竞争的"捡漏"机会，这些岗位可能更容易上岸
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "no-applicant" | "low-competition")}>
          <TabsList className="mb-4">
            <TabsTrigger value="no-applicant" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              无人报考
            </TabsTrigger>
            <TabsTrigger value="low-competition" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              低竞争比（&lt;10:1）
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : data && data.positions.length > 0 ? (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>职位名称</TableHead>
                        <TableHead>招录单位</TableHead>
                        <TableHead className="text-center">招录</TableHead>
                        <TableHead className="text-center">报名/过审</TableHead>
                        <TableHead className="text-center">竞争比</TableHead>
                        <TableHead>地点</TableHead>
                        <TableHead>学历</TableHead>
                        <TableHead className="w-[80px]">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.positions.map((position) => (
                        <TableRow key={position.position_id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{position.position_name}</div>
                              <div className="flex gap-1 mt-1">
                                {position.is_unlimited_major && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-green-50 text-green-700 border-green-200"
                                  >
                                    不限专业
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <span className="truncate block" title={position.department_name}>
                              {position.department_name}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-semibold">{position.recruit_count}</span>
                            <span className="text-muted-foreground text-xs ml-1">人</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-blue-600 font-medium">{position.apply_count}</span>
                              <span className="text-muted-foreground">/</span>
                              <span className="text-green-600 font-medium">{position.pass_count}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {position.competition_ratio > 0 ? (
                              <Badge
                                variant="secondary"
                                className="bg-green-50 text-green-700"
                              >
                                {position.competition_ratio.toFixed(1)}:1
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">
                                暂无
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-muted-foreground text-sm">
                              <MapPin className="h-3 w-3" />
                              {position.province}
                              {position.city && `·${position.city}`}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <GraduationCap className="h-3 w-3 text-muted-foreground" />
                              {position.education || "-"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/positions/${position.position_id}`}>
                                查看
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* 分页 */}
                <div className="flex items-center justify-between px-2 py-4">
                  <p className="text-sm text-muted-foreground">
                    共 <span className="font-medium">{data.total}</span> 条记录
                    {totalPages > 1 && (
                      <span className="ml-2">
                        第 {page}/{totalPages} 页
                      </span>
                    )}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page <= 1 || loading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      上一页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= totalPages || loading}
                    >
                      下一页
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>暂无{activeTab === "no-applicant" ? "无人报考" : "低竞争比"}的职位</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
