/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  experimental: {},

  images: {
    remotePatterns: [
      { hostname: "images.unsplash.com" },
      { hostname: "avatars.githubusercontent.com" },
      { hostname: "cdn.deepseek.com" },
    ],
  },

  /**
   * 重点：sql.js 包含 .wasm 文件 + 原生 require 逻辑，webpack 打它容易炸。
   * 我们直接把 sql.js 和 nodemailer 标记为 server 层 externals：
   * 打包时不 bundle，运行时走真实 node_modules require()。
   * 这样 .wasm 加载完全交给真实 Node 环境，webpack 不插手。
   */
  webpack: (cfg, { isServer }) => {
    if (isServer) {
      cfg.externals = [
        ...(Array.isArray(cfg.externals) ? cfg.externals : []),
        "sql.js",
        "nodemailer",
        "nodemailer/lib/smtp-transport",
      ];
    }
    // 防止 webpack 扫描 require.resolve(xxx.wasm) 时报 wasm sync 错误
    cfg.experiments = { ...(cfg.experiments ?? {}), asyncWebAssembly: true };
    return cfg;
  },
};

export default nextConfig;
