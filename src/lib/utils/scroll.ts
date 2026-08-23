/**
 * 站内锚点滚动。
 *
 * ⚠️ 历史：
 * 1) CSS scroll-behavior:smooth + 原生 <a href="#xxx">：Chromium 会持续抢滚动控制权（bug 来源，已弃用）
 * 2) scrollIntoView({behavior:"smooth"})：浏览器自带动画同样无法被用户滚轮可靠打断——
 *    实测桌面 Chrome 点击导航后立刻向上划，只能划一点点，动画会不断把页面拽回目标位置。
 * 3) 现方案（本文件）：自绘 requestAnimationFrame 动画，wheel/touchstart/keydown
 *    任何用户输入都能立刻取消动画，滚动控制权 100% 交给用户。
 */

let stopAnim: (() => void) | null = null;

export function scrollToHash(href: string) {
  if (typeof document === "undefined") return;
  const el = document.querySelector(href);
  if (!el) return;
  // 同步地址栏 hash（replaceState 不会触发浏览器原生锚点滚动）
  history.replaceState(null, "", href);

  // 上一次动画还在跑的话先停掉
  stopAnim?.();

  const startY = window.scrollY;
  // scroll-mt-24/md:scroll-mt-28 通过 getComputedStyle 读取当前生效值
  const marginTop =
    parseFloat(getComputedStyle(el).scrollMarginTop || "0") || 0;
  const targetY = startY + el.getBoundingClientRect().top - marginTop;
  const dist = Math.abs(targetY - startY);

  // 距离太近没有动画意义，直接跳
  if (dist < 4) return;

  // 尊重系统"减弱动态效果"设置
  let reduced = false;
  try {
    reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    /* ignore */
  }
  if (reduced) {
    window.scrollTo(0, targetY);
    return;
  }

  const duration = Math.min(700, 180 + dist * 0.25);
  const t0 = performance.now();
  let raf = 0;
  let stopped = false;

  const stop = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    window.removeEventListener("wheel", stop);
    window.removeEventListener("touchstart", stop);
    window.removeEventListener("keydown", stop);
    if (stopAnim === stop) stopAnim = null;
  };
  stopAnim = stop;

  // 任何用户输入（滚轮/手指/键盘方向键）立刻交还滚动控制权
  window.addEventListener("wheel", stop, { passive: true });
  window.addEventListener("touchstart", stop, { passive: true });
  window.addEventListener("keydown", stop);

  const ease = (t: number) => 1 - Math.pow(1 - t, 3); // easeOutCubic
  const step = (now: number) => {
    if (stopped) return;
    const t = Math.min(1, (now - t0) / duration);
    window.scrollTo(0, startY + (targetY - startY) * ease(t));
    if (t < 1) raf = requestAnimationFrame(step);
    else stop();
  };
  raf = requestAnimationFrame(step);
}
