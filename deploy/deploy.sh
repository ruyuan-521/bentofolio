#!/usr/bin/env bash
# ============================================================
# 一键部署脚本（Linux 服务器上执行：bash deploy/deploy.sh）
# 流程：git 拉最新 → 装依赖 → 构建 → 用 PM2 reload 0 宕机重启
# ============================================================
set -euo pipefail

# ===== 配置区（按你的服务器情况改） =====
APP_DIR="/var/www/bentofolio"     # 代码在服务器上存放的位置
GIT_REPO="git@github.com:ruyuan-521/bentofolio.git"  # 改成你自己的仓库地址（或 HTTPS）
BRANCH="main"                     # 要部署的分支
APP_NAME="bentofolio"             # 必须和 ecosystem.config.js 里的 name 一致
PM2="pm2"
# ========================================

# 彩色输出
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()    { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERR ]${NC} $1"; exit 1; }

trap 'error "❌ 部署失败，请查看上方日志定位问题"' ERR

info "========================================================"
info "  Bentofolio 个人主页一键部署"
info "  代码目录: $APP_DIR | 分支: $BRANCH"
info "========================================================"

# --- Step 0: 检查环境 ---
command -v git     >/dev/null 2>&1 || error "请先安装 git"
command -v node    >/dev/null 2>&1 || error "请先安装 Node.js 20+"
command -v npm     >/dev/null 2>&1 || error "请先安装 npm"
command -v $PM2    >/dev/null 2>&1 || {
  warn "未检测到 PM2，自动全局安装: npm i -g pm2"
  npm i -g pm2
}

# --- Step 1: 拉代码（没目录就第一次 clone）---
if [ -d "$APP_DIR/.git" ]; then
  info "📥 拉取最新代码 (git pull)"
  cd "$APP_DIR"
  git fetch origin $BRANCH
  git reset --hard origin/$BRANCH
  git clean -fd
else
  info "📥 首次部署，克隆仓库"
  mkdir -p "$(dirname "$APP_DIR")"
  git clone -b $BRANCH $GIT_REPO "$APP_DIR"
  cd "$APP_DIR"
fi

# --- Step 2: 安装依赖 ----
info "📦 安装 npm 依赖"
[ -f .env.production ] && info "  → 检测到 .env.production，使用生产环境变量"
npm ci --omit=dev || npm install --omit=dev

# --- Step 3: 生产构建（standalone 模式）---
info "🏗️  执行 next build（standalone 模式，会生成 .next/standalone）"
npm run build

# --- Step 3.5: standalone 产物整理（Next.js 官方强制要求，否则静态资源 404）---
# .next/standalone/ 里只有 server.js + 精简 node_modules，没有 public 和 static
# 必须手动复制过去，server.js 才能正确提供 /user-big-avatar.jpg 和 /_next/static/*
info "📦 整理 standalone 产物（复制 public + .next/static 到 .next/standalone）"
[ -d ".next/standalone" ] || error ".next/standalone 不存在，build 可能失败了"
rm -rf .next/standalone/public .next/standalone/.next/static
cp -r public            .next/standalone/public
cp -r .next/static      .next/standalone/.next/static
mkdir -p logs           # PM2 日志目录

# --- Step 4: 0 宕机 reload PM2 ----
if $PM2 describe "$APP_NAME" >/dev/null 2>&1; then
  info "🔄 应用已在运行，执行 PM2 reload（0 秒宕机热重载）"
  $PM2 reload "$APP_NAME" --update-env
else
  info "🚀 首次启动应用"
  $PM2 start ecosystem.config.js --env production
  info "💾 保存 PM2 进程列表，服务器重启后自动拉起"
  $PM2 save
  # 没设置过 startup 的话提醒一下（不要强执行，因为需要 root 权限）
  if ! $PM2 startup | grep -q "Found init system"; then
    warn "如果要开启【开机自动启动】，请切到 root 执行："
    warn "   $($PM2 startup | tail -n 1)"
  fi
fi

# --- Step 5: 健康检查 ----
info "⏳ 等待应用启动（最长 20s）..."
for i in $(seq 1 20); do
  if curl -sf http://127.0.0.1:3000 >/dev/null; then
    info "✅ 健康检查通过，端口 3000 正常响应"
    break
  fi
  sleep 1
  [ $i -eq 20 ] && error "应用启动 20s 内未就绪，请检查：pm2 logs $APP_NAME --lines 200"
done

info ""
info "🎉 部署成功！！"
info "   Nginx 配置放好后，访问: https://你的域名.com"
info "   常用命令："
info "     看日志 → pm2 logs $APP_NAME --lines 200"
info "     重启   → pm2 restart $APP_NAME"
info "     状态   → pm2 status"
