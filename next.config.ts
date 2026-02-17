import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 启用严格模式
  reactStrictMode: true,

  // 服务器端外部包
  serverExternalPackages: ['socket.io'],

  // Turbopack 配置
  turbopack: {
    // 空配置以消除警告
  },

  // 环境变量 (服务器端)
  env: {
    // 确保环境变量在服务器端可用
    CLAUDE_PATH_ROOT: process.env.CLAUDE_PATH_ROOT,
    CLAUDE_TEAMS_PATH: process.env.CLAUDE_TEAMS_PATH,
    CLAUDE_TASKS_PATH: process.env.CLAUDE_TASKS_PATH,
    CLAUDE_INBOX_PATH: process.env.CLAUDE_INBOX_PATH,
  },
};

export default nextConfig;
