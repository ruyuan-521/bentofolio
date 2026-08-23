"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  MessageSquareHeart,
  Send,
  Pin,
  PinOff,
  Trash2,
  LogIn,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigation } from "@/hooks/useNavigation";
import { cn } from "@/lib/utils/cn";

type Msg = {
  id: number;
  uid: number;
  nickname: string;
  content: string;
  is_pinned: number;
  created_at: number;
};

/** 相对时间：3 分钟前 / 2 小时前 / 5 天前 / 超过 30 天显示日期 */
function timeAgo(ts: number): string {
  const diff = Math.floor(Date.now() / 1000) - ts;
  if (diff < 60) return "刚刚";
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)} 天前`;
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function GuestbookSection() {
  const { me, loading: meLoading } = useAuth();
  const { setShowLogin } = useNavigation();

  const [list, setList] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ type: "ok" | "err"; msg: string } | null>(
    null
  );

  const isAdmin = !!me?.isAdmin;

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/guestbook", { cache: "no-store" });
      const data = await r.json();
      if (data.ok) setList(data.data || []);
    } catch {
      /* 网络错误保持旧列表 */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const c = content.trim();
    if (!c || busy) return;
    setBusy(true);
    setStatus(null);
    try {
      const r = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: c }),
      });
      const data = await r.json();
      if (data.ok) {
        setContent("");
        setStatus({ type: "ok", msg: "留言成功！" });
        await load();
      } else {
        setStatus({ type: "err", msg: data.message || "留言失败" });
      }
    } catch {
      setStatus({ type: "err", msg: "网络错误，请稍后再试" });
    } finally {
      setBusy(false);
    }
  }

  async function adminAction(id: number, action: "pin" | "unpin" | "delete") {
    try {
      if (action === "delete") {
        if (!confirm("确定删除这条留言吗？")) return;
        await fetch(`/api/guestbook/${id}`, { method: "DELETE" });
      } else {
        await fetch(`/api/guestbook/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPinned: action === "pin" }),
        });
      }
      await load();
    } catch {
      /* 忽略 */
    }
  }

  return (
    <motion.section
      id="guestbook"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5 }}
      className="mt-10 scroll-mt-24 md:scroll-mt-28"
    >
      <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
        {/* 头部 */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-text-muted mb-2">
              留言板
            </p>
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2.5">
              <MessageSquareHeart className="w-6 h-6 text-sky-400" />
              给我留句话
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              登录之后就能留言，说点什么都可以 —— 已有 {list.length} 条留言
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          {/* 左：输入区 */}
          <div className="md:col-span-2">
            {meLoading ? (
              <div className="h-36 rounded-2xl bg-card-alt border border-border animate-pulse" />
            ) : me ? (
              <form onSubmit={onSubmit} className="space-y-3">
                <textarea
                  rows={5}
                  maxLength={500}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`以 ${me.email} 的身份留言…（最多 500 字）`}
                  className="w-full px-4 py-3 rounded-2xl bg-card-alt border border-border text-sm text-text
                             placeholder:text-text-muted/50 focus:outline-none focus:border-sky-400/50
                             focus:ring-2 focus:ring-sky-400/20 transition-all resize-none"
                />
                {status && (
                  <div
                    className={cn(
                      "px-3.5 py-2 rounded-xl text-xs",
                      status.type === "ok"
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                    )}
                  >
                    {status.msg}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted tabular-nums">
                    {content.length}/500
                  </span>
                  <button
                    type="submit"
                    disabled={busy || !content.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                               bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-sm font-medium
                               shadow-lg shadow-sky-500/20 hover:brightness-110
                               disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="w-4 h-4" />
                    {busy ? "发送中…" : "发表留言"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="rounded-2xl border border-border bg-card-alt p-6 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <LogIn className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium text-sm">登录后即可留言</p>
                  <p className="mt-1 text-xs text-text-muted leading-relaxed">
                    邮箱验证码登录，无需密码，首次登录自动注册
                  </p>
                </div>
                <button
                  onClick={() => setShowLogin(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                             bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-sm font-medium
                             shadow-lg shadow-sky-500/20 hover:brightness-110 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  去登录
                </button>
              </div>
            )}
          </div>

          {/* 右：留言列表 */}
          <div className="md:col-span-3">
            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-20 rounded-2xl bg-card-alt border border-border animate-pulse"
                  />
                ))}
              </div>
            ) : list.length === 0 ? (
              <div className="h-full min-h-[180px] rounded-2xl border border-dashed border-border flex flex-col items-center justify-center text-center p-6">
                <MessageSquareHeart className="w-8 h-8 text-text-muted/50 mb-3" />
                <p className="text-sm text-text-muted">
                  还没有留言，来做第一个留言的人吧！
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 -mr-1">
                {list.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "rounded-2xl border p-4 transition-colors",
                      m.is_pinned
                        ? "border-sky-500/30 bg-sky-500/[0.04]"
                        : "border-border bg-card-alt"
                    )}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {(m.nickname || "?").slice(0, 1).toUpperCase()}
                      </span>
                      <span className="text-sm font-medium truncate">
                        {m.nickname}
                      </span>
                      {m.is_pinned ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 text-[10px] border border-sky-500/20">
                          <Pin className="w-2.5 h-2.5" /> 置顶
                        </span>
                      ) : null}
                      <span className="ml-auto text-xs text-text-muted shrink-0">
                        {timeAgo(m.created_at)}
                      </span>
                      {isAdmin && (
                        <span className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() =>
                              adminAction(
                                m.id,
                                m.is_pinned ? "unpin" : "pin"
                              )
                            }
                            title={m.is_pinned ? "取消置顶" : "置顶"}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                          >
                            {m.is_pinned ? (
                              <PinOff className="w-3.5 h-3.5" />
                            ) : (
                              <Pin className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => adminAction(m.id, "delete")}
                            title="删除"
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-text whitespace-pre-wrap break-words">
                      {m.content}
                    </p>
                  </div>
                ))}
                {isAdmin && (
                  <p className="text-center text-[11px] text-text-muted/60 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    管理员模式：可置顶 / 删除留言
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
