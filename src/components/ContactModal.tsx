"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useNavigation } from "@/hooks/useNavigation";
import { contactInfo } from "@/lib/constants/contact";
import { siteContent } from "@/lib/constants/siteContent";
import { socialLinks, platformColors } from "@/lib/constants/socials";
import { SocialIcon } from "@/components/SocialIcon";
import { X, Mail, MapPin, Phone, Send, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function ContactModal() {
  const { showContact, setShowContact, setShowWechat } = useNavigation();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyFallback, setCopyFallback] = useState<string | null>(null);

  /* ESC 关闭 */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowContact(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setShowContact]);

  /* 重置 sent/copied/fallback 每次打开弹窗时 */
  useEffect(() => {
    if (showContact) {
      setSent(false);
      setCopied(false);
      setCopyFallback(null);
    }
  }, [showContact]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const subjectPlain = `来自网站的留言：${form.name || "访客"}`;
    const bodyPlain = `${form.message}\n\n— ${form.name} (${form.email})`;
    const mailText = `收件人：${contactInfo.email}\n主题：${subjectPlain}\n\n${bodyPlain}\n`;

    // Step 1：先把内容写到剪贴板 —— 无论 mailto 成功与否，
    // 用户都可以去 mail.163.com 写邮件页面直接 Ctrl+V 粘贴，这是 100% 可靠的后备
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(mailText);
        setCopied(true);
      } else {
        // 老浏览器没有 clipboard API：用 execCommand + textarea 兜底
        const ta = document.createElement("textarea");
        ta.value = mailText;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
      }
    } catch {
      // 剪贴板被浏览器拒绝（非 HTTPS / 用户没授权）→ 在成功态展示文本让用户手动复制
      setCopied(false);
      setCopyFallback(mailText);
    }

    // Step 2：标记成功，然后立即关弹窗（最关键！）
    // 只要弹窗先关了，就算 mailto 触发 Windows「选默认应用」对话框，
    // 用户也能看见对话框；而且页面滚动不会被遮罩锁住，永远不会"卡死"
    setSent(true);

    // 留 1.2 秒让用户看到「已复制」的成功反馈，
    // 之后自动关闭弹窗（不强制，用户也可以提前点「知道了」关闭）
    const closeMs = 1500;
    const closeTimer = setTimeout(() => {
      setShowContact(false);
    }, closeMs);

    // Step 3：setTimeout 0 之后再异步触发 mailto，
    // 确保 React 已经完成了"关弹窗"的 render，浏览器不被协议同步握手卡住渲染
    setTimeout(() => {
      const subject = encodeURIComponent(subjectPlain);
      const body = encodeURIComponent(bodyPlain);
      try {
        // 用 window.open(..., '_blank') 而不是 location.href / 当前页 <a> 点击：
        // 这样即使邮件客户端的协议处理要挂 1~2 秒，当前主页面也是完全可用的
        const mailtoUrl = `mailto:${contactInfo.email}?subject=${subject}&body=${body}`;
        const win = window.open(mailtoUrl, "_blank", "noopener,noreferrer");
        // 如果 window.open 被拦截（少见，mailto 是安全协议），降级成临时 <a target=_blank>
        if (!win) {
          const link = document.createElement("a");
          link.href = mailtoUrl;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          // 不删也没关系，下一次渲染刷新就没了，保险起见 500ms 后清
          setTimeout(() => link.remove(), 500);
        }
      } catch {
        /* mailto 失败忽略 —— 剪贴板后备已经保证用户能发邮件 */
      }
    }, 0);

    // 组件卸载 / 再次打开弹窗时清 timer
    return () => clearTimeout(closeTimer);
  };

  const closeNow = () => {
    setSent(false);
    setCopied(false);
    setCopyFallback(null);
    setForm({ name: "", email: "", message: "" });
    setShowContact(false);
  };

  return (
    <AnimatePresence>
      {showContact && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 pb-[12vh] md:pb-6"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-bg/80 backdrop-blur-xl"
            onClick={() => setShowContact(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="relative w-full max-w-3xl max-h-[92vh] md:max-h-[88vh] overflow-y-auto
                       rounded-t-[2rem] md:rounded-[2rem] border border-border bg-card shadow-2xl"
          >
            {/* 顶部把手（移动端视觉） */}
            <div className="md:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* 关闭按钮 */}
            <button
              onClick={() => setShowContact(false)}
              aria-label="关闭联系弹窗"
              className="absolute top-4 right-4 w-9 h-9 rounded-full border border-border bg-card-alt hover:border-white/20 transition-colors flex items-center justify-center z-10"
            >
              <X size={18} />
            </button>

            <div className="p-6 md:p-10 grid md:grid-cols-5 gap-8">
              {/* 左：信息 */}
              <aside className="md:col-span-2 space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-text-muted mb-2">
                    打个招呼
                  </p>
                  <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-2">
                    {contactInfo.ctaText}
                  </h2>
                  <p className="text-sm text-text-muted">
                    聊聊你的项目或者随便打个招呼吧——
                    我会尽快回复你。
                  </p>
                </div>

                <div className="space-y-3 text-sm">
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-card-alt border border-border hover:border-white/20 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-mail/10 text-mail flex items-center justify-center shrink-0">
                      <Mail size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-widest text-text-muted">
                        邮箱
                      </p>
                      <p className="truncate font-medium">{contactInfo.email}</p>
                    </div>
                  </a>

                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-card-alt border border-border">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-text-muted">
                        位置
                      </p>
                      <p className="font-medium">{contactInfo.location}</p>
                    </div>
                  </div>

                  {contactInfo.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-card-alt border border-border">
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                        <Phone size={16} />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-widest text-text-muted">
                          电话
                        </p>
                        <p className="font-medium">{contactInfo.phone}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-text-muted mb-3">
                    也可以通过这里找到我
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {socialLinks
                      .filter((s) => s.url)
                      .map((s) => (
                        <a
                          key={s.platform}
                          href={s.platform === "wechat" ? undefined : s.url}
                          target={s.platform === "wechat" ? undefined : "_blank"}
                          rel="noreferrer noopener"
                          aria-label={s.label}
                          title={s.label}
                          onClick={
                            s.platform === "wechat"
                              ? (e) => {
                                  e.preventDefault();
                                  setShowWechat(true);
                                }
                              : undefined
                          }
                          style={{ ["--hover" as never]: platformColors[s.platform] }}
                          className={cn(
                            "w-10 h-10 rounded-xl border border-border bg-card-alt",
                            "flex items-center justify-center",
                            "hover:border-[var(--hover)] hover:text-[var(--hover)] transition-colors"
                          )}
                        >
                          <SocialIcon platform={s.platform} />
                        </a>
                      ))}
                  </div>
                </div>
              </aside>

              {/* 右：表单 / 成功态 */}
              <div className="md:col-span-3 space-y-4">
                {sent ? (
                  <div className="space-y-4 pt-2">
                    <div
                      className={cn(
                        "rounded-2xl p-5 border flex items-start gap-3",
                        copied
                          ? "bg-green-500/10 border-green-500/30"
                          : "bg-yellow-500/10 border-yellow-500/30"
                      )}
                    >
                      <div
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                          copied ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"
                        )}
                      >
                        <Check size={18} />
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <p className="font-semibold text-base">
                          {copied ? "留言内容已复制 ✅" : "请手动复制下面的留言内容"}
                        </p>
                        <p className="text-text-muted leading-relaxed">
                          如果电脑弹出了邮件客户端，按「发送」即可；
                          <br />
                          如果<strong>没有弹出</strong>（大多数浏览器默认如此）：
                          <br />
                          打开 <a href="https://mail.163.com" target="_blank" rel="noreferrer noopener" className="underline underline-offset-4 hover:text-text">mail.163.com</a> →
                          登录 → 写邮件 → <kbd className="px-1.5 py-0.5 rounded-md border border-border bg-card-alt text-xs">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 rounded-md border border-border bg-card-alt text-xs">V</kbd> 粘贴 → 发送
                        </p>
                      </div>
                    </div>

                    {!copied && copyFallback && (
                      <div className="space-y-2">
                        <p className="text-xs text-text-muted">内容（点文字区 → Ctrl+A 全选 → Ctrl+C 复制）：</p>
                        <textarea
                          readOnly
                          value={copyFallback}
                          rows={8}
                          onFocus={(e) => e.currentTarget.select()}
                          className="w-full px-4 py-3 rounded-2xl bg-card-alt border border-border text-sm font-mono resize-y focus:outline-none focus:border-white/30"
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={closeNow}
                      className="w-full py-4 rounded-2xl font-semibold text-sm md:text-base
                                 bg-text text-bg hover:bg-text-muted transition-colors
                                 flex items-center justify-center gap-2"
                    >
                      知道了，关闭
                    </button>
                  </div>
                ) : (
                  <form onSubmit={submit} className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">
                        你的名字
                      </label>
                      <input
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="张三"
                        className="w-full px-4 py-3.5 rounded-2xl bg-card-alt border border-border focus:border-white/30 outline-none transition-colors placeholder:text-text-muted/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">
                        邮箱
                      </label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="zhangsan@example.com"
                        className="w-full px-4 py-3.5 rounded-2xl bg-card-alt border border-border focus:border-white/30 outline-none transition-colors placeholder:text-text-muted/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">
                        留言内容
                      </label>
                      <textarea
                        required
                        rows={6}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="说说你的项目或想法..."
                        className="w-full px-4 py-3.5 rounded-2xl bg-card-alt border border-border focus:border-white/30 outline-none transition-colors resize-none placeholder:text-text-muted/50"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-4 rounded-2xl font-semibold text-sm md:text-base transition-all
                                 bg-text text-bg hover:bg-text-muted
                                 flex items-center justify-center gap-2"
                    >
                      <Send size={18} />
                      发送消息（自动复制到剪贴板）
                    </button>
                    <p className="text-center text-xs text-text-muted/80 leading-relaxed">
                      💡 推荐：现在多数人用网页版邮箱。点发送后内容会<strong>自动复制</strong>，
                      打开 mail.163.com 写邮件页面直接粘贴即可。
                    </p>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
