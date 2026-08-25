import {
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Mail,
  Globe,
  Dribbble,
  Youtube,
} from "lucide-react";
import type { SocialLink } from "@/lib/constants/socials";

interface Props {
  platform: SocialLink["platform"];
  size?: number;
  strokeWidth?: number;
}

/* 微信官方 logo（lucide 没有微信图标，内嵌 SVG path） */
function WeChatLogo({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.431-1.185 3.222-1.724 4.843-1.536-.52-3.842-4.278-6.845-8.754-6.845zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.932a.272.272 0 0 0 .14.045c.134 0 .24-.111.24-.245 0-.06-.024-.12-.04-.178l-.326-1.237a.582.582 0 0 1 .178-.577c1.518-1.117 2.468-2.756 2.468-4.505 0-3.237-2.861-5.864-6.61-6.093a7.3 7.3 0 0 0-.601-.023zm-2.165 3.575c.535 0 .965.44.965.982a.974.974 0 0 1-.965.982.974.974 0 0 1-.964-.982c0-.542.43-.982.964-.982zm4.148 0c.535 0 .965.44.965.982a.974.974 0 0 1-.965.982.974.974 0 0 1-.964-.982c0-.542.43-.982.964-.982z" />
    </svg>
  );
}

/* 抖音官方 logo（lucide 没有，内嵌 SVG path，音符造型） */
function DouyinLogo({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.9 2.9 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

/* 社交平台图标映射（含 JSX，必须放在 .tsx 文件里） */
export function SocialIcon({ platform, size = 20, strokeWidth = 2 }: Props) {
  const props = { size, strokeWidth };
  switch (platform) {
    case "github":
      return <Github {...props} />;
    case "linkedin":
      return <Linkedin {...props} />;
    case "twitter":
      return <Twitter {...props} />;
    case "instagram":
      return <Instagram {...props} />;
    case "mail":
      return <Mail {...props} />;
    case "website":
      return <Globe {...props} />;
    case "dribbble":
      return <Dribbble {...props} />;
    case "youtube":
      return <Youtube {...props} />;
    case "wechat":
      return <WeChatLogo size={size} />;
    case "douyin":
      return <DouyinLogo size={size} />;
  }
}
