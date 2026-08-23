"use client";

import { useEffect } from "react";

/**
 * 访问统计埋点：页面加载后向 /api/track 上报一次。
 * 30 分钟内同一会话只记一次，避免刷新/开发热更新刷数据。
 * 服务端用 IP+UA 哈希做 UV 去重，不存原始 IP。
 */
export default function VisitTracker() {
  useEffect(() => {
    const KEY = "__pv_ts";
    try {
      const last = Number(sessionStorage.getItem(KEY) || 0);
      if (Date.now() - last < 30 * 60 * 1000) return;
      sessionStorage.setItem(KEY, String(Date.now()));
    } catch {
      /* sessionStorage 不可用时也照常上报 */
    }
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: window.location.pathname }),
      keepalive: true,
    }).catch(() => {
      /* 静默失败，统计不影响用户 */
    });
  }, []);
  return null;
}
