"use client";

import {
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  ArrowUpRight,
  MoreHorizontal,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@what-cse/ui";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import Link from "next/link";

// 统计卡片数据
const stats = [
  {
    title: "总用户数",
    value: "12,345",
    change: "+12.5%",
    changeType: "up" as const,
    description: "较上月增长",
    icon: Users,
  },
  {
    title: "职位总数",
    value: "8,765",
    change: "+5.2%",
    changeType: "up" as const,
    description: "较上月增长",
    icon: Briefcase,
  },
  {
    title: "今日活跃",
    value: "2,156",
    change: "-3.1%",
    changeType: "down" as const,
    description: "较昨日下降",
    icon: Activity,
  },
  {
    title: "公告数量",
    value: "456",
    change: "+2.3%",
    changeType: "up" as const,
    description: "较上月增长",
    icon: FileText,
  },
];

// 访问量图表数据
const visitorChartData = [
  { month: "1月", desktop: 186, mobile: 80 },
  { month: "2月", desktop: 305, mobile: 200 },
  { month: "3月", desktop: 237, mobile: 120 },
  { month: "4月", desktop: 73, mobile: 190 },
  { month: "5月", desktop: 209, mobile: 130 },
  { month: "6月", desktop: 214, mobile: 140 },
];

const visitorChartConfig = {
  desktop: {
    label: "桌面端",
    color: "hsl(var(--primary))",
  },
  mobile: {
    label: "移动端",
    color: "hsl(var(--muted-foreground))",
  },
} satisfies ChartConfig;

// 用户注册趋势数据
const userTrendData = [
  { date: "周一", users: 120 },
  { date: "周二", users: 156 },
  { date: "周三", users: 189 },
  { date: "周四", users: 134 },
  { date: "周五", users: 201 },
  { date: "周六", users: 267 },
  { date: "周日", users: 243 },
];

const userTrendConfig = {
  users: {
    label: "新用户",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

// 最近活动数据
const recentActivities = [
  { id: 1, action: "新用户注册", user: "张***", time: "5分钟前", type: "user" },
  {
    id: 2,
    action: "发布公告",
    user: "管理员",
    time: "10分钟前",
    type: "announcement",
  },
  {
    id: 3,
    action: "更新职位数据",
    user: "系统",
    time: "30分钟前",
    type: "system",
  },
  {
    id: 4,
    action: "用户反馈处理",
    user: "管理员",
    time: "1小时前",
    type: "feedback",
  },
  {
    id: 5,
    action: "爬虫任务完成",
    user: "系统",
    time: "2小时前",
    type: "crawler",
  },
];

// 待处理任务
const pendingTasks = [
  {
    id: 1,
    title: "待审核职位",
    count: 23,
    priority: "high" as const,
    url: "/positions/pending",
  },
  {
    id: 2,
    title: "用户反馈",
    count: 12,
    priority: "medium" as const,
    url: "/feedback",
  },
  {
    id: 3,
    title: "数据异常",
    count: 3,
    priority: "low" as const,
    url: "/logs",
  },
];

// 最近用户
const recentUsers = [
  {
    id: 1,
    name: "张三",
    email: "zhang@example.com",
    status: "active",
    date: "2024-01-20",
  },
  {
    id: 2,
    name: "李四",
    email: "li@example.com",
    status: "active",
    date: "2024-01-19",
  },
  {
    id: 3,
    name: "王五",
    email: "wang@example.com",
    status: "inactive",
    date: "2024-01-18",
  },
  {
    id: 4,
    name: "赵六",
    email: "zhao@example.com",
    status: "active",
    date: "2024-01-17",
  },
  {
    id: 5,
    name: "孙七",
    email: "sun@example.com",
    status: "active",
    date: "2024-01-16",
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">仪表盘</h1>
        <p className="text-muted-foreground">欢迎回来，这里是您的管理后台概览</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stat.changeType === "up" ? (
                  <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span className={stat.changeType === "up" ? "text-emerald-500" : "text-red-500"}>
                  {stat.change}
                </span>
                <span className="ml-1">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 图表区域 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* 访问量趋势 */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>访问量趋势</CardTitle>
            <CardDescription>过去6个月的访问数据</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={visitorChartConfig} className="h-[300px] w-full">
              <AreaChart
                data={visitorChartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="desktop"
                  stackId="1"
                  stroke="var(--color-desktop)"
                  fill="var(--color-desktop)"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="mobile"
                  stackId="1"
                  stroke="var(--color-mobile)"
                  fill="var(--color-mobile)"
                  fillOpacity={0.4}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* 用户注册趋势 */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>用户注册</CardTitle>
            <CardDescription>本周新用户注册数</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={userTrendConfig} className="h-[300px] w-full">
              <BarChart data={userTrendData}>
                <CartesianGrid vertical={false} className="stroke-muted" />
                <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="users" fill="var(--color-users)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* 底部内容区 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* 最近用户 */}
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>最近用户</CardTitle>
              <CardDescription>最近注册的用户列表</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/users">
                查看全部
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户名</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>注册时间</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.status === "active" ? "default" : "secondary"}>
                        {user.status === "active" ? "正常" : "禁用"}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.date}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">操作</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>查看详情</DropdownMenuItem>
                          <DropdownMenuItem>编辑</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">删除</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 待处理任务和最近活动 */}
        <div className="lg:col-span-3 space-y-4">
          {/* 待处理任务 */}
          <Card>
            <CardHeader>
              <CardTitle>待处理任务</CardTitle>
              <CardDescription>需要您关注的任务</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingTasks.map((task) => (
                <Link
                  key={task.id}
                  href={task.url}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <span className="text-sm font-medium">{task.title}</span>
                  <Badge
                    variant={
                      task.priority === "high"
                        ? "destructive"
                        : task.priority === "medium"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {task.count}
                  </Badge>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* 最近活动 */}
          <Card>
            <CardHeader>
              <CardTitle>最近活动</CardTitle>
              <CardDescription>系统活动记录</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.user}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    {activity.time}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
