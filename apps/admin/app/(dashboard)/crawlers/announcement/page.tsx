"use client";

import { Construction } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@what-cse/ui";

export default function AnnouncementCrawlerPage() {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">公告爬虫</h1>
          <p className="text-muted-foreground">公告数据采集管理</p>
        </div>
      </div>

      {/* 空状态提示 */}
      <Card>
        <CardHeader>
          <CardTitle>功能开发中</CardTitle>
          <CardDescription>公告爬虫功能正在开发中</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Construction className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">
              页面建设中
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              公告数据采集功能正在开发中，敬请期待...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
