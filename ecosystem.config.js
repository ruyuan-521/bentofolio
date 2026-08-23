/**
 * PM2 进程管理器配置 — 生产部署推荐（自动重启 + 开机自启 + 负载均衡）
 *
 * ⚠️  【standalone 模式说明】
 * Next.js output:'standalone' 构建完成后，.next/standalone/ 目录会生成：
 *   - server.js (Node 入口)
 *   - node_modules/ (最小化运行时依赖，无需整个项目 node_modules)
 *
 * 同时，必须【手动】把 public 和 .next/static 拷到 standalone 目录里（deploy.sh 已自动做）：
 *   cp -r public           .next/standalone/public
 *   cp -r .next/static     .next/standalone/.next/static
 *
 * 服务器上的用法：
 *   1. 第一次部署：    pm2 start ecosystem.config.js --env production
 *   2. 热重载代码后：  pm2 reload bentofolio        (0 秒宕机)
 *   3. 查看日志：      pm2 logs bentofolio --lines 200
 *   4. 设置开机自启：  pm2 startup && pm2 save
 *   5. 停止/重启：     pm2 restart bentofolio | pm2 stop bentofolio
 *
 * 安装 PM2：npm i -g pm2
 */
module.exports = {
  apps: [
    {
      name: "bentofolio",
      script: "server.js",
      // Next.js standalone 输出的入口文件（next build 会自动生成在 .next/standalone/）
      // 如果没有开启 standalone，去掉下面 cwd，然后 script 改成：
      //   script: "./node_modules/next/dist/bin/next",
      //   args:   "start -p 3000 -H 0.0.0.0",

      args: "",
      cwd: "./.next/standalone", // server.js 就位于这个目录

      instances: 1, // 个人站 1 个实例够用，需要压测时改成 "max" 自动占满 CPU 核心
      exec_mode: "fork", // instances=1 时用 fork；改成 cluster 才能跑多个实例负载均衡

      // ===== 端口和监听地址（环境变量覆盖）=====
      env: {
        NODE_ENV: "production",
        HOSTNAME: "0.0.0.0", // 必须 0.0.0.0，否则 Nginx/公网访问不到
        PORT: 3000,         // 默认端口，Nginx 反代到这个端口
      },

      // ===== 崩溃自动重启 =====
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      min_uptime: "30s",
      kill_timeout: 5000,

      // ===== 内存溢出保护 =====
      max_memory_restart: "512M", // 个人站 512M 足够，超出自动重启防泄漏

      // ===== 日志轮转（cwd 是 .next/standalone，所以 ../../logs 回到项目根的 logs/）=====
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "../../logs/pm2-error.log",
      out_file:   "../../logs/pm2-out.log",
      merge_logs: true,
      max_size:   "10M",
      retain:     10,
    },
  ],
};
