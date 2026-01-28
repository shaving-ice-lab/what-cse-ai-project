"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  ArrowLeft,
  Save,
  RefreshCw,
  Settings,
  Check,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Badge,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@what-cse/ui";

// 通知类型配置
interface NotificationTypeConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  channels: {
    push: boolean;
    email: boolean;
    wechat: boolean;
    sms: boolean;
  };
}

// 提醒时间配置
interface ReminderConfig {
  registrationReminder: number; // 报名截止提醒（小时）
  examReminder: number; // 考试提醒（天）
  calendarReminder: number; // 日历事件提醒（分钟）
}

// 默认配置
const defaultNotificationTypes: NotificationTypeConfig[] = [
  {
    id: "announcement",
    name: "公告通知",
    description: "新公告发布时通知",
    icon: <Bell className="h-5 w-5 text-blue-500" />,
    enabled: true,
    channels: { push: true, email: false, wechat: false, sms: false },
  },
  {
    id: "position",
    name: "职位通知",
    description: "收藏职位状态变化时通知",
    icon: <Bell className="h-5 w-5 text-green-500" />,
    enabled: true,
    channels: { push: true, email: false, wechat: false, sms: false },
  },
  {
    id: "registration",
    name: "报名提醒",
    description: "报名截止日期提醒",
    icon: <Bell className="h-5 w-5 text-amber-500" />,
    enabled: true,
    channels: { push: true, email: true, wechat: false, sms: false },
  },
  {
    id: "calendar",
    name: "日历提醒",
    description: "日历事件提醒",
    icon: <Bell className="h-5 w-5 text-purple-500" />,
    enabled: true,
    channels: { push: true, email: false, wechat: false, sms: false },
  },
  {
    id: "subscription",
    name: "订阅推送",
    description: "订阅内容更新通知",
    icon: <Bell className="h-5 w-5 text-cyan-500" />,
    enabled: true,
    channels: { push: true, email: false, wechat: false, sms: false },
  },
  {
    id: "system",
    name: "系统消息",
    description: "系统维护、更新等通知",
    icon: <Settings className="h-5 w-5 text-gray-500" />,
    enabled: true,
    channels: { push: true, email: false, wechat: false, sms: false },
  },
];

const defaultReminderConfig: ReminderConfig = {
  registrationReminder: 24, // 报名截止前24小时
  examReminder: 3, // 考试前3天
  calendarReminder: 30, // 日历事件前30分钟
};

// 渠道图标
const ChannelIcon = ({ channel }: { channel: string }) => {
  switch (channel) {
    case "push":
      return <Bell className="h-4 w-4" />;
    case "email":
      return <Mail className="h-4 w-4" />;
    case "wechat":
      return <MessageSquare className="h-4 w-4" />;
    case "sms":
      return <Smartphone className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

// 渠道名称
const channelNames: Record<string, string> = {
  push: "站内通知",
  email: "邮件通知",
  wechat: "微信通知",
  sms: "短信通知",
};

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // 通知类型配置
  const [notificationTypes, setNotificationTypes] = useState<NotificationTypeConfig[]>(defaultNotificationTypes);

  // 提醒时间配置
  const [reminderConfig, setReminderConfig] = useState<ReminderConfig>(defaultReminderConfig);

  // 全局开关
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState("22:00");
  const [quietHoursEnd, setQuietHoursEnd] = useState("08:00");

  // 加载设置
  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: 从后端加载设置
      // const settings = await notificationApi.getSettings();
      // setNotificationTypes(settings.types);
      // setReminderConfig(settings.reminders);
      // setGlobalEnabled(settings.globalEnabled);
    } catch (err) {
      console.error("Failed to load notification settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // 保存设置
  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      // TODO: 保存设置到后端
      // await notificationApi.saveSettings({
      //   types: notificationTypes,
      //   reminders: reminderConfig,
      //   globalEnabled,
      //   quietHours: quietHoursEnabled ? { start: quietHoursStart, end: quietHoursEnd } : null,
      // });

      // 模拟保存
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("保存失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  // 切换通知类型开关
  const toggleTypeEnabled = (typeId: string) => {
    setNotificationTypes((types) =>
      types.map((t) => (t.id === typeId ? { ...t, enabled: !t.enabled } : t))
    );
  };

  // 切换渠道开关
  const toggleChannel = (typeId: string, channel: keyof NotificationTypeConfig["channels"]) => {
    setNotificationTypes((types) =>
      types.map((t) =>
        t.id === typeId
          ? { ...t, channels: { ...t.channels, [channel]: !t.channels[channel] } }
          : t
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">通知设置</h1>
            <p className="text-muted-foreground">管理通知偏好和提醒时间</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadSettings} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            刷新
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : saved ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                已保存
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                保存设置
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="types" className="space-y-6">
        <TabsList>
          <TabsTrigger value="types">通知类型</TabsTrigger>
          <TabsTrigger value="reminders">提醒时间</TabsTrigger>
          <TabsTrigger value="preferences">偏好设置</TabsTrigger>
        </TabsList>

        {/* 通知类型设置 */}
        <TabsContent value="types" className="space-y-4">
          {/* 全局开关 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">全局通知开关</CardTitle>
                  <CardDescription>关闭后将停止接收所有通知</CardDescription>
                </div>
                <Switch checked={globalEnabled} onCheckedChange={setGlobalEnabled} />
              </div>
            </CardHeader>
          </Card>

          {/* 通知类型列表 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">通知类型设置</CardTitle>
              <CardDescription>选择您想要接收的通知类型和渠道</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notificationTypes.map((type, index) => (
                <div key={type.id}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="space-y-4">
                    {/* 类型标题和开关 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">{type.icon}</div>
                        <div>
                          <div className="font-medium">{type.name}</div>
                          <div className="text-sm text-muted-foreground">{type.description}</div>
                        </div>
                      </div>
                      <Switch
                        checked={type.enabled && globalEnabled}
                        onCheckedChange={() => toggleTypeEnabled(type.id)}
                        disabled={!globalEnabled}
                      />
                    </div>

                    {/* 渠道设置 */}
                    {type.enabled && globalEnabled && (
                      <div className="ml-14 flex flex-wrap gap-3">
                        {(Object.keys(type.channels) as Array<keyof typeof type.channels>).map(
                          (channel) => (
                            <div
                              key={channel}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                                type.channels[channel]
                                  ? "bg-primary/10 border-primary text-primary"
                                  : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
                              }`}
                              onClick={() => toggleChannel(type.id, channel)}
                            >
                              <ChannelIcon channel={channel} />
                              <span className="text-sm font-medium">{channelNames[channel]}</span>
                              {type.channels[channel] && <Check className="h-3 w-3" />}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 提醒时间设置 */}
        <TabsContent value="reminders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">提醒时间设置</CardTitle>
              <CardDescription>设置各类提醒的提前通知时间</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 报名截止提醒 */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>报名截止提醒</Label>
                  <p className="text-sm text-muted-foreground">
                    在报名截止前多久发送提醒
                  </p>
                </div>
                <Select
                  value={String(reminderConfig.registrationReminder)}
                  onValueChange={(v) =>
                    setReminderConfig((prev) => ({
                      ...prev,
                      registrationReminder: Number(v),
                    }))
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">提前 6 小时</SelectItem>
                    <SelectItem value="12">提前 12 小时</SelectItem>
                    <SelectItem value="24">提前 1 天</SelectItem>
                    <SelectItem value="48">提前 2 天</SelectItem>
                    <SelectItem value="72">提前 3 天</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* 考试提醒 */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>考试时间提醒</Label>
                  <p className="text-sm text-muted-foreground">
                    在考试开始前多久发送提醒
                  </p>
                </div>
                <Select
                  value={String(reminderConfig.examReminder)}
                  onValueChange={(v) =>
                    setReminderConfig((prev) => ({ ...prev, examReminder: Number(v) }))
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">提前 1 天</SelectItem>
                    <SelectItem value="3">提前 3 天</SelectItem>
                    <SelectItem value="7">提前 7 天</SelectItem>
                    <SelectItem value="14">提前 14 天</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* 日历事件提醒 */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>日历事件提醒</Label>
                  <p className="text-sm text-muted-foreground">
                    在日历事件开始前多久发送提醒
                  </p>
                </div>
                <Select
                  value={String(reminderConfig.calendarReminder)}
                  onValueChange={(v) =>
                    setReminderConfig((prev) => ({
                      ...prev,
                      calendarReminder: Number(v),
                    }))
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">提前 10 分钟</SelectItem>
                    <SelectItem value="15">提前 15 分钟</SelectItem>
                    <SelectItem value="30">提前 30 分钟</SelectItem>
                    <SelectItem value="60">提前 1 小时</SelectItem>
                    <SelectItem value="120">提前 2 小时</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 偏好设置 */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">免打扰设置</CardTitle>
              <CardDescription>设置免打扰时间段，在此期间不会收到通知</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>启用免打扰</Label>
                  <p className="text-sm text-muted-foreground">
                    在指定时间段内暂停所有通知
                  </p>
                </div>
                <Switch checked={quietHoursEnabled} onCheckedChange={setQuietHoursEnabled} />
              </div>

              {quietHoursEnabled && (
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <Label>开始时间</Label>
                    <input
                      type="time"
                      value={quietHoursStart}
                      onChange={(e) => setQuietHoursStart(e.target.value)}
                      className="px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                  <span className="text-muted-foreground">至</span>
                  <div className="flex items-center gap-2">
                    <Label>结束时间</Label>
                    <input
                      type="time"
                      value={quietHoursEnd}
                      onChange={(e) => setQuietHoursEnd(e.target.value)}
                      className="px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">渠道可用性</CardTitle>
              <CardDescription>各通知渠道的当前状态</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* 站内通知 */}
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100">
                      <Bell className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">站内通知</div>
                      <div className="text-sm text-muted-foreground">始终可用</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                    可用
                  </Badge>
                </div>

                {/* 邮件通知 */}
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-100">
                      <Mail className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="font-medium">邮件通知</div>
                      <div className="text-sm text-muted-foreground">需配置邮箱</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                    待配置
                  </Badge>
                </div>

                {/* 微信通知 */}
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <MessageSquare className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">微信通知</div>
                      <div className="text-sm text-muted-foreground">需关注公众号</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                    未启用
                  </Badge>
                </div>

                {/* 短信通知 */}
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <Smartphone className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">短信通知</div>
                      <div className="text-sm text-muted-foreground">仅VIP用户</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                    未启用
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-2 p-4 rounded-lg bg-blue-50 text-blue-700">
                <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  部分通知渠道需要完成额外配置或升级会员才能使用。站内通知始终可用且免费。
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
