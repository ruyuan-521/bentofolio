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
  }
}
