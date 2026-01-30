"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@what-cse/ui";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";

// Pages that need full height without padding (for internal scrolling)
const fullHeightPages = ["/learning/manager", "/learning/content"];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullHeight = fullHeightPages.some(p => pathname.startsWith(p));

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <SiteHeader />
        <main className={isFullHeight ? "flex-1 overflow-hidden" : "flex-1 overflow-auto p-4 md:p-6"}>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
