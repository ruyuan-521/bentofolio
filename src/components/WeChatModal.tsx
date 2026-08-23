"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, Copy, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigation } from "@/hooks/useNavigation";
import { contactInfo } from "@/lib/constants/contact";
import { cn } from "@/lib/utils/cn";

/**
 * 微信二维码弹窗：点击社交区的微信图标后弹出。
 * 为什么不是"点击直接跳转微信"：浏览器安全策略屏蔽 weixin:// 协议，
 * 微信官方也不开放网页拉起加好友，所以业界通行做法是展示二维码 + 微信号复制。
 */
export default function WeChatModal() {
  const { showWechat, setShowWechat } = useNavigation();
  const open = showWechat;
  const onClose = () => setShowWechat(false);

  const [copied, setCopied] = useState(false);

  // ESC 关闭
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // 关闭时重置复制状态
  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(contactInfo.wechat);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 剪贴板被禁用时不报错，用户可手动选中文字复制
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 8, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="w-full max-w-sm rounded-3xl border border-border bg-card shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-[#07C160]/15 text-[#07C160] flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.431-1.185 3.222-1.724 4.843-1.536-.52-3.842-4.278-6.845-8.754-6.845zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.932a.272.272 0 0 0 .14.045c.134 0 .24-.111.24-.245 0-.06-.024-.12-.04-.178l-.326-1.237a.582.582 0 0 1 .178-.577c1.518-1.117 2.468-2.756 2.468-4.505 0-3.237-2.861-5.864-6.61-6.093a7.3 7.3 0 0 0-.601-.023zm-2.165 3.575c.535 0 .965.44.965.982a.974.974 0 0 1-.965.982.974.974 0 0 1-.964-.982c0-.542.43-.982.964-.982zm4.148 0c.535 0 .965.44.965.982a.974.974 0 0 1-.965.982.974.974 0 0 1-.964-.982c0-.542.43-.982.964-.982z" />
                  </svg>
                </span>
                <h2 className="text-lg font-bold">加我微信</h2>
              </div>
              <button
                onClick={onClose}
                aria-label="关闭"
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-muted hover:text-text hover:bg-white/[0.06] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* 二维码（白底卡片，保证任何主题下二维码都可扫） */}
            <div className="px-6 pb-2 flex justify-center">
              <div className="w-52 h-52 rounded-2xl bg-white p-3 shadow-inner">
                {/* 二维码图片：放 public/wechat-qr.jpg（微信「我」→ 二维码名片 → 保存到手机再传电脑） */}
                <img
                  src="/wechat-qr.jpg"
                  alt="微信二维码"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // 图片还没放时显示占位提示，不显示裂图
                    const el = e.currentTarget;
                    el.style.display = "none";
                    const holder = el.nextElementSibling as HTMLElement | null;
                    if (holder) holder.style.display = "flex";
                  }}
                />
                <div
                  className="w-full h-full rounded-xl border-2 border-dashed border-zinc-300 text-zinc-400 text-xs flex-col items-center justify-center text-center gap-1.5 leading-relaxed"
                  style={{ display: "none" }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="opacity-60">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.431-1.185 3.222-1.724 4.843-1.536-.52-3.842-4.278-6.845-8.754-6.845zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.932a.272.272 0 0 0 .14.045c.134 0 .24-.111.24-.245 0-.06-.024-.12-.04-.178l-.326-1.237a.582.582 0 0 1 .178-.577c1.518-1.117 2.468-2.756 2.468-4.505 0-3.237-2.861-5.864-6.61-6.093a7.3 7.3 0 0 0-.601-.023zm-2.165 3.575c.535 0 .965.44.965.982a.974.974 0 0 1-.965.982.974.974 0 0 1-.964-.982c0-.542.43-.982.964-.982zm4.148 0c.535 0 .965.44.965.982a.974.974 0 0 1-.965.982.974.974 0 0 1-.964-.982c0-.542.43-.982.964-.982z" />
                  </svg>
                  <span>
                    二维码图片待放置
                    <br />
                    public/wechat-qr.png
                  </span>
                </div>
              </div>
            </div>

            {/* 提示 + 微信号复制 */}
            <div className="px-6 pb-6 pt-3 space-y-3">
              <p className="text-xs text-text-muted text-center">
                用微信「扫一扫」扫描上方二维码，或复制微信号搜索添加
              </p>
              <button
                onClick={onCopy}
                className={cn(
                  "w-full py-3 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 transition-colors",
                  copied
                    ? "bg-[#07C160] text-white"
                    : "bg-card-alt border border-border text-text hover:border-[#07C160]/50 hover:text-[#07C160]"
                )}
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    已复制微信号
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    复制微信号：{contactInfo.wechat}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
