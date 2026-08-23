/* ========== 🧭 修改这里：导航菜单项目 ========== */

export interface NavItem {
  label: string;
  href: string; /* 锚点链接：对应页面 section 的 id */
}

export const navItems: NavItem[] = [
  { label: "首页", href: "#home" },
  { label: "项目", href: "#projects" },
  { label: "关于", href: "#about" },
  { label: "联系", href: "#contact" },
];
