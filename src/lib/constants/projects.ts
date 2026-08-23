/* ========== 📂 修改这里：你的项目展示 ========== */
/* 最多推荐 4~6 个项目，图片建议使用 16:9 或 4:3 比例 */
/* 图片可以放在 /public/projects/ 下，然后 image 字段写 "/projects/xxx.jpg" */
/* 或者直接用网络图片 URL（已配置 images.unsplash.com 白名单） */

export interface Project {
  title: string;
  description: string;
  tags: string[];
  image: string;
  liveUrl?: string;   /* 线上预览链接，可选 */
  githubUrl?: string; /* GitHub 仓库链接，可选 */
  featured?: boolean; /* 是否作为大卡片展示（最多设 1 个） */
}

/* 已填入从 GitHub 自动同步的 3 个真实仓库 + 当前主页项目 */
/* featured: true 表示大卡片展示，只能设 1 个 */
export const projects: Project[] = [
  {
    title: "DeautherC3 嵌入式项目",
    description:
      "面向 ESP32-C3 芯片的 WiFi Deauther 固件项目，使用 C++ 开发，基于嵌入式平台进行 802.11 管理帧测试与研究。项目涵盖硬件驱动、串口调试与低功耗优化。",
    tags: ["C++", "ESP32", "Embedded", "WiFi"],
    image: "/project-deautherc3.jpg",
    githubUrl: "https://github.com/ruyuan-521/DeautherC3",
    featured: true,
  },
  {
    title: "小猿口算自动答题",
    description:
      "基于 hdc 的鸿蒙真机自动化工具，自动玩小猿口算「比大小」PK：截图识别题目 + uinput 触控笔模拟手写 >、<、=，全程约 250ms/题，零 ROOT、拟人化防检测。",
    tags: ["Python", "OpenCV", "HarmonyOS", "自动化"],
    image: "/project-xiaoyuan-kousuan.jpg",
    githubUrl: "https://github.com/ruyuan-521/xiaoyuan-kousuan-auto",
  },
  {
    title: "AI 智能计算器 ai-calculator",
    description:
      "接入大语言模型的智能计算器网页，支持用自然语言描述数学问题（如「帮我算 3 道微积分题」「把这个公式展开」），自动推理并给出计算结果与解题步骤。前端使用纯 HTML/CSS/JS 构建。",
    tags: ["HTML", "LLM", "Calculator", "AI"],
    image:
      "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=800&q=80",
    liveUrl: "",
    githubUrl: "https://github.com/ruyuan-521/ai-calculator",
  },
  {
    title: "自动化机器人 robot",
    description:
      "基于 Python 开发的自动化脚本机器人，支持按预设规则完成定时任务、批量操作与命令式交互，可作为工作流中的助手节点。模块化结构方便后续扩展新功能。",
    tags: ["Python", "Automation", "Bot", "Scripting"],
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    githubUrl: "https://github.com/ruyuan-521/robot",
  },
  {
    title: "Bento 风格个人主页（本站）",
    description:
      "你正在看的这个个人作品集！基于 Next.js 15 + React 19 + Tailwind v4 + Motion 搭建的 Bento 便当盒网格主页，主打动画流畅、移动端完美响应、零后端即可部署。",
    tags: ["Next.js", "Tailwind v4", "Motion", "TypeScript"],
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    liveUrl: "",
    githubUrl: "",
  },
];
