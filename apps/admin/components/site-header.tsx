"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, Moon, Sun } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Input,
  Separator,
  SidebarTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@what-cse/ui";
import React from "react";

// 路由到面包屑映射
const routeMap: Record<string, string> = {
  "": "仪表盘",
  users: "用户管理",
  positions: "职位管理",
  pending: "待审核",
  announcements: "公告管理",
  create: "创建",
  crawlers: "爬虫管理",
  "list-pages": "列表页管理",
  dictionary: "数据字典",
  majors: "专业字典",
  regions: "地区字典",
  settings: "系统设置",
  admins: "管理员管理",
  logs: "系统日志",
};

export function SiteHeader() {
  const pathname = usePathname();

  // 生成面包屑项
  const generateBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    const breadcrumbs = [{ label: "首页", href: "/" }];

    let currentPath = "";
    paths.forEach((path, index) => {
      // 跳过动态路由参数（数字ID）
      if (/^\d+$/.test(path)) {
        breadcrumbs.push({ label: `#${path}`, href: currentPath + `/${path}` });
      } else {
        currentPath += `/${path}`;
        breadcrumbs.push({
          label: routeMap[path] || path,
          href: currentPath,
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={item.href}>
                <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && (
                  <BreadcrumbSeparator className={index === 0 ? "hidden md:block" : ""} />
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* 搜索框 */}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜索..."
            className="w-[200px] pl-8 lg:w-[280px]"
          />
        </div>

        {/* 移动端搜索按钮 */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="h-5 w-5" />
          <span className="sr-only">搜索</span>
        </Button>

        {/* 通知按钮 */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            3
          </span>
          <span className="sr-only">通知</span>
        </Button>

        {/* 主题切换 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">切换主题</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>浅色</DropdownMenuItem>
            <DropdownMenuItem>深色</DropdownMenuItem>
            <DropdownMenuItem>跟随系统</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
