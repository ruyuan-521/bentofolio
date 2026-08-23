/* ========== 🔗 修改这里：社交链接 ========== */
/* 平台类型 platform 可选：github | linkedin | twitter | instagram | mail | website | dribbble | youtube */
/* 链接留空 "" 则该按钮不会显示 */

export interface SocialLink {
  platform:
    | "github"
    | "linkedin"
    | "twitter"
    | "instagram"
    | "mail"
    | "website"
    | "dribbble"
    | "youtube";
  label: string;
  url: string;
}

/* TODO: 把 url 改成你自己的链接，不要的可以删掉整个对象 */
export const socialLinks: SocialLink[] = [
  {
    platform: "github",
    label: "GitHub 主页",
    url: "https://github.com/ruyuan-521",
  },
  {
    platform: "twitter",
    label: "X / 推特",
    url: "https://x.com/your-username",
  },
  {
    platform: "mail",
    label: "邮箱",
    url: "mailto:13585010039@163.com",
  },
  /*
  {
    platform: "linkedin",
    label: "领英",
    url: "https://linkedin.com/in/your-username",
  },
  {
    platform: "website",
    label: "个人博客",
    url: "https://your-blog.com",
  },
  {
    platform: "youtube",
    label: "YouTube 频道",
    url: "https://youtube.com/@your-channel",
  },
  {
    platform: "instagram",
    label: "Instagram（照片墙）",
    url: "https://instagram.com/your-username",
  },
  */
];

/* 颜色映射（对应平台主色，用于悬浮渐变） */
export const platformColors: Record<SocialLink["platform"], string> = {
  github: "#ffffff",
  linkedin: "#0A66C2",
  twitter: "#1DA1F2",
  instagram: "#E1306C",
  mail: "#ef4444",
  website: "#ffffff",
  dribbble: "#EA4C89",
  youtube: "#FF0000",
};
