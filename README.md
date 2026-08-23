# 个人主页 · Yuan

基于 [bentofolio](https://github.com/ruyuan-521/bentofolio) 二次开发的 Bento 风格全中文个人主页，已上线 **[yuanru.fun](https://yuanru.fun)**。

不只是静态主页 —— 内置完整的后端能力：邮箱验证码登录、访客留言板、项目点赞、访问统计和管理后台。

## ✨ 功能特性

### 前台

- **Bento 网格布局**：Next.js 15 + React 19 + Tailwind CSS v4 + Motion 动画
- **全中文界面**：导航、项目展示、社交链接、联系方式全部汉化
- **深色 / 浅色主题切换**：CSS 变量双主题 + localStorage 持久化 + 首屏防闪烁
- **项目点赞**：每个项目卡片 ❤️ 一键点赞，IP+UA 哈希防重复
- **访客留言板**：登录后可留言（500 字上限、30 秒冷却、昵称自动脱敏）
- **响应式**：桌面 / 平板 / 手机完美适配

### 账号体系

- **邮箱验证码登录**：无密码，6 位数字验证码，10 分钟有效、一次性消耗
- **首次登录自动注册**：任何邮箱都能登录
- **管理员白名单**：`.env.local` 里 `ADMIN_EMAILS` 中的邮箱登录后即为管理员
- **JWT 会话**：`jose` 签发 HS256 令牌，HTTP-only Cookie 存储（防 XSS）

### 管理后台 `/admin`（仅管理员）

- **概览**：今日/累计 PV、UV、注册用户、留言数、获赞数 + 近 14 天访问趋势图
- **留言管理**：置顶 / 取消置顶 / 删除 / 恢复
- **用户列表**：注册时间、最后登录、角色

## 🛠 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Next.js 15（App Router / Route Handlers） |
| 前端 | React 19 + Tailwind CSS v4 + Motion |
| 数据库 | SQLite（sql.js 纯 WASM 实现，免编译依赖） |
| 认证 | jose（JWT）+ HTTP-only Cookie |
| 邮件 | Nodemailer（163 SMTP，SSL 465） |
| 语言 | TypeScript 全量类型检查 |

## 🚀 本地运行

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local 填入：
#   SMTP_PASS   - 163 邮箱的客户端授权码（不是登录密码）
#   JWT_SECRET  - 任意 32 位以上随机字符串
#   ADMIN_EMAILS - 管理员邮箱（逗号分隔可配多个）

# 3. 启动开发服务器
npm run dev
```

打开 http://localhost:3000 即可。

> 💡 没配 SMTP 时开发模式有兜底：验证码直接显示在登录弹窗底部，方便本地调试。

## 📦 生产部署

```bash
npm run build && npm start
```

数据库文件自动创建在 `data/app.db`（首次请求时自动迁移建表）。

### 服务器（Nginx + PM2）

```bash
pm2 start npm --name bentofolio -- start
pm2 save
```

Nginx 反代 `127.0.0.1:3000`，静态资源走 `/_next/static/`，HTTPS 用 Let's Encrypt（certbot 自动续期）。

## 📁 目录结构（核心）

```
src/
├── app/
│   ├── page.tsx              # 首页（Bento 布局 + 留言板）
│   ├── admin/page.tsx        # 管理后台
│   └── api/
│       ├── auth/             # 发送/校验验证码、会话、登出
│       ├── guestbook/        # 留言板 CRUD
│       ├── projects/likes/   # 项目点赞
│       ├── track/            # 访问统计上报
│       └── admin/            # 管理端数据接口
├── components/               # Navbar、LoginModal、GuestbookSection 等
├── hooks/                    # useAuth、useNavigation（Context）
└── lib/
    ├── db/                   # SQLite 单例 + 迁移 + 各表仓储
    ├── auth/                 # JWT 会话 + 权限校验
    ├── email/                # SMTP 发送 + 邮件模板
    └── constants/            # 项目/站点内容配置
```

## 🔒 隐私与安全

- 不存原始 IP：访客指纹为 IP+UA 的 SHA-256 截断哈希
- 验证码一次性消耗，旧验证码在新验证码签发时立即失效
- 发码接口 60 秒频率限制 + 统一响应文案（防邮箱枚举）
- 留言软删除（数据可恢复），内容长度与频率双重限制

## 📄 License

基于原 [bentofolio](https://github.com/ruyuan-521/bentofolio) 模板二次开发，仅供个人主页使用。
