"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

/**
 * 暗/亮主题切换。
 * 原理：切换 <html> 上的 light 类，globals.css 里两套 CSS 变量随之切换。
 * 持久化：localStorage("theme")，layout 里有防闪烁的内联脚本提前应用。
 */
export default function ThemeToggle() {
  const [light, setLight] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
    setMounted(true);
  }, []);

  function toggle() {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem("theme", next ? "light" : "dark");
    } catch {
      /* localStorage 不可用就只切当次 */
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={light ? "切换到深色模式" : "切换到浅色模式"}
      title={light ? "切换到深色模式" : "切换到浅色模式"}
      className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-muted hover:text-text hover:bg-white/[0.06] transition-colors"
    >
      {/* 深色模式显示太阳（点击切亮色）；浅色模式显示月亮（点击切深色）。
          mounted 前渲染占位避免水合不一致 */}
      {mounted ? (
        light ? (
          <Moon className="w-4 h-4" />
        ) : (
          <Sun className="w-4 h-4" />
        )
      ) : (
        <span className="w-4 h-4" />
      )}
    </button>
  );
}
