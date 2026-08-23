/**
 * 站内锚点平滑滚动。
 *
 * ⚠️ 不要用 CSS `scroll-behavior: smooth` + 原生 <a href="#xxx"> 做锚点跳转：
 * Chromium 有个老 bug——原生锚点触发的平滑滚动会持续抢夺滚动控制权，
 * 用户往上划时会被"按回"目标位置，表现为点了导航之后滑不上去。
 * JS scrollIntoView 是一次性的滚动，用户手势随时可以打断，没有这个问题。
 * （section 上的 scroll-mt-* 类对 scrollIntoView 同样生效，顶部间隙不受影响）
 */
export function scrollToHash(href: string) {
  if (typeof document === "undefined") return;
  const el = document.querySelector(href);
  if (!el) return;
  /* 触屏设备用瞬时滚动：移动端浏览器上平滑滚动动画会和手指滑动抢滚动控制权，
     表现为「点了导航之后往上划划不动」；桌面（鼠标/触控板）保留平滑动画 */
  const isTouch =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;
  el.scrollIntoView({ behavior: isTouch ? "auto" : "smooth", block: "start" });
  // 同步地址栏 hash（replaceState 不会触发浏览器原生锚点滚动）
  history.replaceState(null, "", href);
}
