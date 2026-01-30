"use client";

import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
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
} from "@what-cse/ui";
import React from "react";
import { NotificationBell } from "./NotificationBell";

// 路由到面包屑映射
const routeMap: Record<string, string> = {
  "": "仪表盘",
  users: "用户管理",
  positions: "职位管理",
  pending: "待审核",
  announcements: "公告管理",
  create: "创建",
  crawlers: "爬虫管理",
  fenbi: "粉笔爬虫",
  announcement: "公告爬虫",
  "wechat-rss": "公众号RSS",
  "list-pages": "列表页管理",
  dictionary: "数据字典",
  majors: "专业字典",
  regions: "地区字典",
  settings: "系统设置",
  admins: "管理员管理",
  llm: "LLM 配置",
  logs: "系统日志",
  notifications: "消息中心",
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
    <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4">
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

      <div className="ml-auto flex items-center gap-3">
        {/* 搜索框 - 简洁版本 */}
        <div className="relative hidden md:flex items-center group/search">
          {/* 搜索输入容器 */}
          <div className="relative flex items-center bg-stone-100/80 hover:bg-stone-100 focus-within:bg-white border border-transparent hover:border-stone-200 focus-within:border-stone-300 focus-within:shadow-sm rounded-xl transition-all duration-200 overflow-hidden">
            <Search className="w-[18px] h-[18px] text-stone-400 group-focus-within/search:text-stone-500 ml-3 flex-shrink-0 transition-colors duration-200" />
            <Input 
              type="search" 
              placeholder="搜索功能、用户、数据..." 
              className="h-9 w-[180px] lg:w-[220px] xl:w-[260px] py-2 pl-2.5 pr-2 bg-transparent border-0 text-sm text-stone-700 placeholder:text-stone-400 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-200" 
            />
            {/* 快捷键提示 */}
            <div className="hidden lg:flex items-center gap-0.5 px-2 py-1 mr-2.5 bg-stone-200/60 hover:bg-stone-200 rounded-md text-[10px] text-stone-400 font-medium tracking-wide cursor-pointer transition-colors">
              <kbd className="font-sans">⌘</kbd>
              <kbd className="font-sans">K</kbd>
            </div>
          </div>
        </div>

        {/* 移动端搜索按钮 */}
        <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 hover:bg-stone-100 active:bg-stone-200 transition-colors rounded-xl">
          <Search className="h-5 w-5 text-stone-600" />
          <span className="sr-only">搜索</span>
        </Button>

        {/* 通知铃铛 */}
        <NotificationBell refreshInterval={60000} previewCount={5} />
      </div>
    </header>
  );
}
