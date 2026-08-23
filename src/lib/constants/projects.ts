/* ========== 📂 修改这里：你的项目展示 ========== */
/* 最多推荐 4~6 个项目，图片建议使用 16:9 或 4:3 比例 */
/* 图片可以放在 /public/projects/ 下，然后 image 字段写 "/projects/xxx.jpg" */
/* 或者直接用网络图片 URL（已配置 images.unsplash.com 白名单） */

export interface Project {
  slug: string;        /* 详情页路径：/projects/[slug] */
  title: string;
  description: string;
  details?: string[];  /* 详情页：项目亮点 */
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
    slug: "deautherc3",
    title: "DeautherC3 嵌入式项目",
    description:
      "面向 ESP32-C3 芯片的 WiFi Deauther 固件项目，使用 C++ 开发，基于嵌入式平台进行 802.11 管理帧测试与研究。项目涵盖硬件驱动、串口调试与低功耗优化。",
    details: [
      "基于 ESP32-C3 RISC-V 单核处理器，主频 160MHz，板载 WiFi 802.11 b/g/n",
      "完整实现 802.11 管理帧（Deauth / Disassociation）的构造与发送，用于安全测试研究",
      "串口命令行交互界面，支持扫描、选择目标、调整发包速率等操作",
      "针对 C3 芯片做了低功耗优化，支持 Light Sleep 模式延长续航",
      "提供完整编译烧录文档，Arduino IDE / PlatformIO 一键构建",
    ],
    tags: ["C++", "ESP32", "Embedded", "WiFi"],
    image: "/project-deautherc3.jpg",
    githubUrl: "https://github.com/ruyuan-521/DeautherC3",
    featured: true,
  },
  {
    slug: "xiaoyuan-kousuan-auto",
    title: "小猿口算自动答题",
    description:
      "基于 hdc 的鸿蒙真机自动化工具，自动玩小猿口算「比大小」PK：截图识别题目 + uinput 触控笔模拟手写 >、<、=，全程约 250ms/题，零 ROOT、拟人化防检测。",
    details: [
      "通过鸿蒙官方 hdc 工具链实现截图与触控注入，全程无需 ROOT 权限",
      "OpenCV 模板匹配识别题目数字，准确率 100%，单题识别耗时 < 80ms",
      "uinput 虚拟触控笔模拟手写轨迹（>、<、= 三种符号），带拟人化笔迹抖动防检测",
      "端到端单题耗时约 250ms，实测连胜率 95%+",
      "支持分辨率自适应，换机型只需重新标定屏幕坐标",
    ],
    tags: ["Python", "OpenCV", "HarmonyOS", "自动化"],
    image: "/project-xiaoyuan-kousuan.jpg",
    githubUrl: "https://github.com/ruyuan-521/xiaoyuan-kousuan-auto",
  },
  {
    slug: "ai-calculator",
    title: "AI 智能计算器 ai-calculator",
    description:
      "接入大语言模型的智能计算器网页，支持用自然语言描述数学问题（如「帮我算 3 道微积分题」「把这个公式展开」），自动推理并给出计算结果与解题步骤。前端使用纯 HTML/CSS/JS 构建。",
    details: [
      "自然语言输入：直接说「帮我算 3 道微积分题」，无需记公式语法",
      "接入大语言模型 API，自动推理并返回计算结果 + 完整解题步骤",
      "支持 LaTeX 公式渲染，数学表达式显示专业美观",
      "纯前端实现（HTML/CSS/JS），无需后端服务器，静态托管即可运行",
    ],
    tags: ["HTML", "LLM", "Calculator", "AI"],
    image:
      "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=800&q=80",
    liveUrl: "",
    githubUrl: "https://github.com/ruyuan-521/ai-calculator",
  },
  {
    slug: "robot",
    title: "自动化机器人 robot",
    description:
      "基于 Python 开发的自动化脚本机器人，支持按预设规则完成定时任务、批量操作与命令式交互，可作为工作流中的助手节点。模块化结构方便后续扩展新功能。",
    details: [
      "规则驱动：按预设规则自动执行定时任务、批量文件操作与命令交互",
      "模块化插件架构，新功能只需实现统一接口即可挂载",
      "内置日志与异常恢复，长时运行任务中断自动重试",
      "可作为工作流引擎的助手节点，被其他系统调用",
    ],
    tags: ["Python", "Automation", "Bot", "Scripting"],
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    githubUrl: "https://github.com/ruyuan-521/robot",
  },
  {
    slug: "bentofolio",
    title: "Bento 风格个人主页（本站）",
    description:
      "你正在看的这个个人作品集！基于 Next.js 15 + React 19 + Tailwind v4 + Motion 搭建的 Bento 便当盒网格主页，主打动画流畅、移动端完美响应、零后端即可部署。",
    details: [
      "Next.js 15 App Router + React 19 + Tailwind CSS v4 + Motion 动画全家桶",
      "邮箱验证码登录（163 SMTP + JWT HTTP-only Cookie）+ SQLite 持久化",
      "访客留言板、项目点赞、PV/UV 访问统计、管理后台（留言管理 + 数据看板）",
      "深浅双主题切换，暗色优先设计，移动端完美响应式",
      "一键部署脚本（deploy.sh）：拉代码 → 构建 → PM2 零宕机重载 → 健康检查",
    ],
    tags: ["Next.js", "Tailwind v4", "Motion", "TypeScript"],
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    liveUrl: "https://yuanru.fun",
    githubUrl: "https://github.com/ruyuan-521/bentofolio",
  },
];
