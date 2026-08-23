# ============================================================
# 多阶段 Dockerfile — 容器化部署（服务器有 Docker 时用这个最省心）
# 构建：docker build -t bentofolio:latest .
# 运行：docker run -d --name bentofolio -p 3000:3000 --restart unless-stopped bentofolio:latest
# ============================================================

# ---- 阶段 1：安装依赖（带 node_modules 的缓存层）----
FROM node:20-alpine AS deps
WORKDIR /app
# 用 apk 装 libc6-compat：Next.js standalone 产物依赖 glibc，alpine 默认 musl 会报 not found
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
# ci 比 install 更快更稳定，严格按 lockfile 装
RUN npm ci || npm install

# ---- 阶段 2：生产构建（跑 next build 生成 .next/standalone）----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Next.js 收集遥测可以关掉，构建更快
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- 阶段 3：最小化运行镜像（只有 standalone + static + public，50MB 左右）----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN apk add --no-cache libc6-compat tini
# 非 root 用户运行（安全最佳实践）
RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 nextjs

# 拷贝 standalone 产物（Next.js build 自动生成）
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# 拷贝静态资源（standalone 产物不包含 static 和 public）
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public      ./public

USER nextjs
EXPOSE 3000
# tini 作为 PID 1：正确传递信号，Node.js 能收到 SIGTERM 优雅退出
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
