"use client";

import { useState } from "react";
import Link from "next/link";
import { Save, Globe, Shield, Bell, Database, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Textarea,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from "@what-cse/ui";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "公考智选",
    siteDescription: "公务员职位智能筛选系统",
    allowRegistration: true,
    requireEmailVerification: false,
    defaultPageSize: "20",
    crawlerInterval: "24",
    systemNotification: true,
    crawlerErrorNotification: true,
  });

  const handleSave = () => {
    console.log("Saving settings:", settings);
    // Save settings logic
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">系统设置</h1>
          <p className="text-muted-foreground">管理系统配置和偏好设置</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/settings/admins">
              <Users className="mr-2 h-4 w-4" />
              管理员管理
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 基本设置 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>基本设置</CardTitle>
                <CardDescription>配置站点基本信息</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">站点名称</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) =>
                  setSettings({ ...settings, siteName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">站点描述</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) =>
                  setSettings({ ...settings, siteDescription: e.target.value })
                }
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* 用户设置 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>用户设置</CardTitle>
                <CardDescription>配置用户注册和验证选项</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>允许用户注册</Label>
                <p className="text-sm text-muted-foreground">
                  关闭后新用户无法注册
                </p>
              </div>
              <Switch
                checked={settings.allowRegistration}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, allowRegistration: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>邮箱验证</Label>
                <p className="text-sm text-muted-foreground">
                  注册时要求验证邮箱
                </p>
              </div>
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, requireEmailVerification: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* 数据设置 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>数据设置</CardTitle>
                <CardDescription>配置数据处理参数</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pageSize">默认分页大小</Label>
              <Select
                value={settings.defaultPageSize}
                onValueChange={(value) =>
                  setSettings({ ...settings, defaultPageSize: value })
                }
              >
                <SelectTrigger id="pageSize">
                  <SelectValue placeholder="选择分页大小" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10条/页</SelectItem>
                  <SelectItem value="20">20条/页</SelectItem>
                  <SelectItem value="50">50条/页</SelectItem>
                  <SelectItem value="100">100条/页</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="crawlerInterval">爬虫运行间隔（小时）</Label>
              <Input
                id="crawlerInterval"
                type="number"
                min="1"
                max="168"
                value={settings.crawlerInterval}
                onChange={(e) =>
                  setSettings({ ...settings, crawlerInterval: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                设置爬虫自动运行的时间间隔，范围1-168小时
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 通知设置 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>通知设置</CardTitle>
                <CardDescription>配置系统通知选项</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>系统通知</Label>
                <p className="text-sm text-muted-foreground">
                  接收重要系统事件通知
                </p>
              </div>
              <Switch
                checked={settings.systemNotification}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, systemNotification: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>爬虫异常通知</Label>
                <p className="text-sm text-muted-foreground">
                  爬虫任务异常时发送通知
                </p>
              </div>
              <Switch
                checked={settings.crawlerErrorNotification}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, crawlerErrorNotification: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 保存按钮 */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          <Save className="mr-2 h-4 w-4" />
          保存设置
        </Button>
      </div>
    </div>
  );
}
