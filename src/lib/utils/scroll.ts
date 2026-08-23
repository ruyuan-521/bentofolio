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
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  // 同步地址栏 hash（replaceState 不会触发浏览器原生锚点滚动）
  history.replaceState(null, "", href);
}
