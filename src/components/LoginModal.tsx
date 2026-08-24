"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, Mail, ShieldCheck, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigation } from "@/hooks/useNavigation";
import { cn } from "@/lib/utils/cn";

export default function LoginModal() {
  const { showLogin, setShowLogin } = useNavigation();
  const open = showLogin;
  const onClose = () => setShowLogin(false);
  const { sendCode, verifyCode } = useAuth();

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [devCode, setDevCode] = useState<string | null>(null);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

  // 倒计时
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // ESC 关闭
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // 打开时重置到第一步（只在 open 变化时执行，不能依赖 step，
  // 否则发码成功 setStep("code") 会立刻被这里重置回 "email" —— 验证码输入界面闪现即消失的元凶）
  useEffect(() => {
    if (!open) return;
    setStep("email");
    setCode("");
    setStatus(null);
    setDevCode(null);
    setCooldown(0);
  }, [open]);

  // 聚焦当前步骤对应的输入框
  useEffect(() => {
    if (!open) return;
    if (step === "email") emailInputRef.current?.focus();
    else codeInputRef.current?.focus();
  }, [open, step]);

  // ---------- 第 1 步：请求发送验证码 ----------
  async function onSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const trimmed = email.trim();
    if (!trimmed) {
      setStatus({ type: "err", msg: "请输入邮箱" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus({ type: "err", msg: "邮箱格式不正确" });
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const r = await sendCode({ email: trimmed, purpose: "login" });
      if (!r.ok) {
        setStatus({ type: "err", msg: r.message });
        if (r.retryAfter) setCooldown(r.retryAfter);
      } else {
        setStatus({ type: "ok", msg: r.message });
        setStep("code");
        setCooldown(r.cooldown ?? 60);
        if (r.devCode) setDevCode(r.devCode); // 本地开发显示验证码
        setTimeout(() => codeInputRef.current?.focus(), 50);
      }
    } catch {
      setStatus({ type: "err", msg: "网络错误，请稍后再试" });
    } finally {
      setBusy(false);
    }
  }

  // ---------- 第 2 步：验证并登录 ----------
  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const trimmedCode = code.trim();
    if (trimmedCode.length !== 6) {
      setStatus({ type: "err", msg: "请输入 6 位验证码" });
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const r = await verifyCode({ email: email.trim(), code: trimmedCode, purpose: "login" });
      if (!r.ok) {
        setStatus({ type: "err", msg: r.message });
      } else {
        setStatus({ type: "ok", msg: "登录成功！" });
        setTimeout(() => onClose(), 600);
      }
    } catch {
      setStatus({ type: "err", msg: "网络错误，请稍后再试" });
    } finally {
      setBusy(false);
    }
  }

  // ---------- 重新发送 ----------
  async function onResend() {
    if (cooldown > 0 || busy) return;
    setBusy(true);
    setStatus(null);
    try {
      const r = await sendCode({ email: email.trim(), purpose: "login" });
      if (!r.ok) {
        setStatus({ type: "err", msg: r.message });
        if (r.retryAfter) setCooldown(r.retryAfter);
      } else {
        setStatus({ type: "ok", msg: r.message });
        setCooldown(r.cooldown ?? 60);
        if (r.devCode) setDevCode(r.devCode);
      }
    } catch {
      setStatus({ type: "err", msg: "网络错误，请稍后再试" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 遮罩 */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          {/* 弹框本体 */}
          <motion.div
            className="relative w-full max-w-[460px] rounded-3xl border border-border bg-card shadow-2xl overflow-hidden"
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* 头图装饰条 */}
            <div className="h-2 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500" />

            <div className="p-6 sm:p-8">
              {/* 顶部 */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-border text-xs text-text-muted mb-3">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                    邮箱验证码登录
                  </div>
                  <h3 className="text-2xl font-bold text-text tracking-tight">
                    {step === "email" ? "邮箱验证码登录" : "输入验证码"}
                  </h3>
                  <p className="mt-2 text-sm text-text-muted leading-relaxed">
                    {step === "email"
                      ? "输入你的邮箱，我会把 6 位数字验证码发送到该邮箱。首次登录将自动注册。"
                      : `验证码已发送到 ${email}，10 分钟内有效。`}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-text-muted hover:bg-white/5 hover:text-text transition-colors"
                  aria-label="关闭"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 状态提示 */}
              <AnimatePresence>
                {status && (
                  <motion.div
                    key={status.msg}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "mb-4 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2",
                      status.type === "ok"
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                    )}
                  >
                    {status.msg}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 表单 */}
              {step === "email" ? (
                <form onSubmit={onSendCode} className="space-y-4">
                  <label className="block">
                    <div className="flex items-center gap-1.5 text-xs text-text-muted mb-2">
                      <Mail className="w-3.5 h-3.5" />
                      邮箱地址
                    </div>
                    <input
                      ref={emailInputRef}
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={busy}
                      className="w-full px-4 py-3 bg-card-alt rounded-xl border border-border text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/50 transition-all disabled:opacity-60"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-sm font-medium shadow-lg shadow-sky-500/20 hover:brightness-110 disabled:opacity-60 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    {busy ? "正在发送…" : "发送验证码"}
                    <ArrowRight className="w-4 h-4 -mr-1" />
                  </button>
                </form>
              ) : (
                <form onSubmit={onVerify} className="space-y-4">
                  <label className="block">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs text-text-muted">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        6 位数字验证码
                      </div>
                      <button
                        type="button"
                        onClick={onResend}
                        disabled={cooldown > 0 || busy}
                        className="text-xs text-sky-400 hover:text-sky-300 disabled:text-text-muted disabled:opacity-60 transition-colors"
                      >
                        {cooldown > 0 ? `${cooldown}s 后重发` : "重新发送"}
                      </button>
                    </div>
                    <input
                      ref={codeInputRef}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="000000"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      disabled={busy}
                      className="w-full px-5 py-4 bg-card-alt rounded-2xl border border-border text-center text-3xl font-bold tracking-[16px] text-text placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/50 transition-all disabled:opacity-60 font-mono"
                    />
                  </label>
                  {/* 开发环境友好提示：把验证码直接展示出来，省得查邮箱 */}
                  {devCode && (
                    <div className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                      🛠️ 开发模式提示（仅本地显示）：本次验证码是{" "}
                      <code className="font-mono text-amber-200 tracking-widest">
                        {devCode}
                      </code>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-sm font-medium shadow-lg shadow-sky-500/20 hover:brightness-110 disabled:opacity-60 transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {busy ? "正在登录…" : "验证并登录"}
                    <ArrowRight className="w-4 h-4 -mr-1" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setStatus(null);
                      setDevCode(null);
                    }}
                    className="w-full text-xs text-text-muted hover:text-text transition-colors"
                  >
                    ← 换个邮箱
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
