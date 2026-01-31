import type { Metadata } from "next";
import Script from "next/script";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "公考智选 - 管理后台",
  description: "公务员职位智能筛选系统管理后台",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body suppressHydrationWarning>
        {process.env.NODE_ENV !== "production" && (
          <Script
            id="strip-cursor-ref"
            strategy="beforeInteractive"
          >{`(function(){try{var strip=function(){var nodes=document.querySelectorAll('[data-cursor-ref]');for(var i=0;i<nodes.length;i++){nodes[i].removeAttribute('data-cursor-ref');}};strip();var observer=new MutationObserver(strip);observer.observe(document.documentElement,{attributes:true,subtree:true,attributeFilter:['data-cursor-ref']});setTimeout(function(){observer.disconnect();},1000);}catch(e){}})();`}</Script>
        )}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
