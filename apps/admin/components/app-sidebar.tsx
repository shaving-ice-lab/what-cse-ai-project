"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Settings,
  Bug,
  MapPin,
  GraduationCap,
  Shield,
  ScrollText,
  Database,
  HelpCircle,
  MessageCircle,
  Command,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@what-cse/ui";
import { NavMain, type NavItem } from "./nav-main";
import { NavSecondary, type NavSecondaryItem } from "./nav-secondary";
import { NavUser } from "./nav-user";

const navMainItems: NavItem[] = [
  {
    title: "仪表盘",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "用户管理",
    url: "/users",
    icon: Users,
  },
  {
    title: "职位管理",
    url: "/positions",
    icon: Briefcase,
    items: [
      { title: "全部职位", url: "/positions" },
      { title: "待审核", url: "/positions/pending" },
    ],
  },
  {
    title: "公告管理",
    url: "/announcements",
    icon: FileText,
  },
  {
    title: "爬虫管理",
    url: "/crawlers",
    icon: Bug,
  },
  {
    title: "列表页管理",
    url: "/list-pages",
    icon: ScrollText,
  },
  {
    title: "数据字典",
    url: "/dictionary",
    icon: Database,
    items: [
      { title: "专业字典", url: "/dictionary/majors" },
      { title: "地区字典", url: "/dictionary/regions" },
    ],
  },
  {
    title: "系统设置",
    url: "/settings",
    icon: Settings,
    items: [
      { title: "基本设置", url: "/settings" },
      { title: "管理员管理", url: "/settings/admins" },
    ],
  },
  {
    title: "系统日志",
    url: "/logs",
    icon: Shield,
  },
];

const navSecondaryItems: NavSecondaryItem[] = [
  {
    title: "帮助中心",
    url: "#",
    icon: HelpCircle,
  },
  {
    title: "反馈建议",
    url: "#",
    icon: MessageCircle,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">公考智选</span>
                  <span className="truncate text-xs">Admin Dashboard</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} />
        <NavSecondary items={navSecondaryItems} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
