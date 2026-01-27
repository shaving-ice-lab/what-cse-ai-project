"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@what-cse/ui";

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

// 收缩状态下的带子菜单项
function CollapsedNavItem({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: (url: string) => boolean;
}) {
  const hasActiveChild = item.items?.some((sub) => isActive(sub.url)) ?? false;

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton isActive={hasActiveChild}>
            {item.icon && <item.icon />}
            <span className="sr-only">{item.title}</span>
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={8}
          className="min-w-[180px] z-50"
        >
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            {item.title}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.items?.map((subItem) => (
            <DropdownMenuItem
              key={subItem.title}
              asChild
              className={
                isActive(subItem.url) ? "bg-accent text-accent-foreground" : "cursor-pointer"
              }
            >
              <Link href={subItem.url}>{subItem.title}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

// 展开状态下的带子菜单项
function ExpandedNavItem({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: (url: string) => boolean;
}) {
  return (
    <Collapsible
      asChild
      defaultOpen={item.items?.some((sub) => isActive(sub.url))}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items?.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton asChild isActive={isActive(subItem.url)}>
                  <Link href={subItem.url}>
                    <span>{subItem.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // 精确匹配：用于子菜单项，避免前缀误匹配
  const isActiveExact = (url: string) => {
    if (url === "/") return pathname === "/";
    // 只使用精确匹配
    return pathname === url;
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>管理菜单</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) =>
          item.items && item.items.length > 0 ? (
            isCollapsed ? (
              <CollapsedNavItem key={item.title} item={item} isActive={isActiveExact} />
            ) : (
              <ExpandedNavItem key={item.title} item={item} isActive={isActiveExact} />
            )
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title} isActive={isActiveExact(item.url)}>
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
