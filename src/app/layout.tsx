import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "渊 · Yuan — 个人 AI 开发者作品集",
  description:
    "一名 AI 开发者的个人主页：展示 AI 应用、Agent 项目、技术栈与联系方式，Bento 网格风格。",
  keywords: ["AI", "LLM", "个人主页", "作品集", "开发者", "渊", "Yuan", "Portfolio"],
  authors: [{ name: "渊 · Yuan" }],
  openGraph: {
    title: "渊 · Yuan — 个人 AI 开发者作品集",
    description:
      "一名 AI 开发者的个人主页：展示 AI 应用、Agent 项目、技术栈与联系方式，Bento 网格风格。",
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "渊 · Yuan — 个人 AI 开发者作品集",
    description:
      "一名 AI 开发者的个人主页：展示 AI 应用、Agent 项目、技术栈与联系方式，Bento 网格风格。",
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * 隐藏 Next.js 开发模式下自动注入到页面左下角的圆形 "N" 按钮（Dev Indicator）。
 * —— 因为不同 Next.js 版本给它的 className / data 属性差异较大，直接用 CSS 选择器很难稳定命中，
 *    所以这里用一小段 JS：基于「fixed 定位 + 视口左下角 + 正方形小尺寸 + innerText === "N" 或内部仅含 SVG」
 *    的几何特征精准找到并隐藏它。重试 8 次 + MutationObserver 双重保险，绝对不会误伤你自己写的页面内容。
 *    注：生产构建（npm run build）后 Next.js 本身就不会注入这个指示器，所以线上部署不会跑这段逻辑。
 */
const hideNextDevIndicator = `(function(){
  function hide(el){ try{ el.style.display='none'; el.style.visibility='hidden'; el.style.opacity='0'; el.style.pointerEvents='none'; el.setAttribute('data-hidden-by-layout','1'); }catch(e){} }
  function isDevIndicator(el){
    var s; try{ s=window.getComputedStyle(el); }catch(e){ return false; }
    if(!s || s.position!=='fixed') return false;
    var r=el.getBoundingClientRect();
    if(r.width<15||r.width>100||r.height<15||r.height>100) return false;
    if(r.left>40) return false;
    if(r.top<window.innerHeight-60) return false;
    var txt=(el.innerText||el.textContent||'').trim();
    if(txt==='N') return true;
    if(txt==='' && el.querySelector && el.querySelector('svg')) return true;
    return false;
  }
  function scan(){
    var all=document.querySelectorAll('*');
    for(var i=0;i<all.length;i++){ try{ if(isDevIndicator(all[i])) hide(all[i]); }catch(e){} }
  }
  for(var t=0;t<8;t++) setTimeout(scan, 150 + t*250);
  try{
    var ob=new MutationObserver(function(){ scan(); });
    ob.observe(document.documentElement, { childList:true, subtree:true, attributes:false });
    setTimeout(function(){ ob.disconnect(); }, 15000);
  }catch(e){}
})();`;

/**
 * 主题防闪烁：在首屏渲染前同步读取 localStorage 并给 <html> 加 light 类。
 * 必须是内联同步脚本（放在 body 第一个子元素），否则浅色用户会先看到一帧深色。
 */
const applyThemeEarly = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.add('light');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: applyThemeEarly }} />
        {children}
        <Analytics />
        <Script id="hide-next-dev-n-button" strategy="afterInteractive">
          {hideNextDevIndicator}
        </Script>
      </body>
    </html>
  );
}
