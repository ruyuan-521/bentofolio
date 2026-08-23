"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  LayoutDashboard,
  MessageSquareHeart,
  Users,
  Pin,
  PinOff,
  Trash2,
  Eye,
  EyeOff,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils/cn";

type Tab = "overview" | "messages" | "users";

type Overview = {
  totalPv: number;
  totalUv: number;
  todayPv: number;
  todayUv: number;
  totalUsers: number;
  totalMessages: number;
  totalLikes: number;
};

type Daily = { day: string; pv: number; uv: number };

type AdminMsg = {
  id: number;
  uid: number;
  email: string;
  nickname: string;
  content: string;
  is_pinned: number;
  is_deleted: number;
  created_at: number;
};

type AdminUser = {
  id: number;
  email: string;
  role: "admin" | "user";
  created_at: number;
  last_login_at: number | null;
};

function fmtTs(ts: number | null): string {
  if (!ts) return "—";
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

export default function AdminPage() {
  const { me, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [daily, setDaily] = useState<Daily[]>([]);
  const [msgs, setMsgs] = useState<AdminMsg[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [fetching, setFetching] = useState(false);

  const loadAll = useCallback(async () => {
    setFetching(true);
    try {
      const [s, m, u] = await Promise.all([
        fetch("/api/admin/stats", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/admin/messages", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/admin/users", { cache: "no-store" }).then((r) => r.json()),
      ]);
      if (s.ok) {
        setOverview(s.overview);
        setDaily(s.daily || []);
      }
      if (m.ok) setMsgs(m.data || []);
      if (u.ok) setUsers(u.data || []);
    } catch {
      /* 网络错误保持旧数据 */
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (me?.isAdmin) loadAll();
  }, [me?.isAdmin, loadAll]);

  async function msgAction(
    id: number,
    action: "pin" | "unpin" | "delete" | "restore"
  ) {
    if (action === "delete" && !confirm("确定删除这条留言吗？")) return;
    if (action === "delete") {
      await fetch(`/api/guestbook/${id}`, { method: "DELETE" });
    } else if (action === "restore") {
      await fetch(`/api/guestbook/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: false }),
      });
    } else {
      await fetch(`/api/guestbook/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: action === "pin" }),
      });
    }
    loadAll();
  }

  // ---------- 加载中 ----------
  if (loading) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex items-center gap-3 text-text-muted">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm">正在验证身份…</span>
        </div>
      </main>
    );
  }

  // ---------- 非管理员 ----------
  if (!me?.isAdmin) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center px-5">
        <div className="max-w-md w-full rounded-3xl border border-border bg-card p-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold mb-2">需要管理员权限</h1>
          <p className="text-sm text-text-muted leading-relaxed mb-6">
            {me
              ? "当前账号是普通用户，无法访问管理后台。"
              : "你还没有登录，请先用管理员邮箱登录。"}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-sm font-medium shadow-lg shadow-sky-500/20 hover:brightness-110 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            返回主页
          </Link>
        </div>
      </main>
    );
  }

  const maxPv = Math.max(1, ...daily.map((d) => d.pv));

  return (
    <main className="min-h-screen bg-bg text-text">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-8">
        {/* 头部 */}
        <header className="flex flex-wrap items-center gap-4 justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-10 h-10 rounded-xl border border-border bg-card flex items-center justify-center text-text-muted hover:text-text transition-colors"
              title="返回主页"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                管理后台
                <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 text-[10px] font-medium border border-sky-500/20">
                  管理员
                </span>
              </h1>
              <p className="text-xs text-text-muted mt-0.5">{me.email}</p>
            </div>
          </div>
          <button
            onClick={loadAll}
            disabled={fetching}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-text-muted hover:text-text hover:bg-white/[0.04] disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", fetching && "animate-spin")} />
            刷新数据
          </button>
        </header>

        {/* Tabs */}
        <nav className="flex gap-1 p-1 rounded-2xl border border-border bg-card mb-8 w-fit">
          {(
            [
              { key: "overview", label: "概览", icon: LayoutDashboard },
              { key: "messages", label: "留言管理", icon: MessageSquareHeart },
              { key: "users", label: "用户列表", icon: Users },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all",
                tab === key
                  ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/20"
                  : "text-text-muted hover:text-text"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        {/* ---------- 概览 ---------- */}
        {tab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {overview ? (
                (
                  [
                    { label: "今日访问 (PV)", value: overview.todayPv, sub: `今日访客 ${overview.todayUv} 人` },
                    { label: "累计访问 (PV)", value: overview.totalPv, sub: `累计访客 ${overview.totalUv} 人` },
                    { label: "注册用户", value: overview.totalUsers, sub: "邮箱验证码登录" },
                    { label: "留言数", value: overview.totalMessages, sub: `获赞 ${overview.totalLikes} 次` },
                  ] as const
                ).map((c) => (
                  <div
                    key={c.label}
                    className="rounded-2xl border border-border bg-card p-5"
                  >
                    <p className="text-xs text-text-muted mb-2">{c.label}</p>
                    <p className="text-3xl font-bold tabular-nums bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                      {c.value}
                    </p>
                    <p className="text-[11px] text-text-muted mt-1.5">{c.sub}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-4 h-32 rounded-2xl bg-card border border-border animate-pulse" />
              )}
            </div>

            {/* 近 14 天趋势 */}
            <div className="rounded-3xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold">近 14 天访问趋势</h2>
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <i className="w-3 h-3 rounded-sm bg-sky-500/80 inline-block" />
                    PV 访问量
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="w-3 h-3 rounded-sm bg-emerald-500/80 inline-block" />
                    UV 访客数
                  </span>
                </div>
              </div>
              <div className="flex items-end gap-1.5 h-40">
                {daily.map((d) => (
                  <div
                    key={d.day}
                    className="flex-1 flex flex-col items-center gap-1 group"
                    title={`${d.day}：PV ${d.pv} / UV ${d.uv}`}
                  >
                    <div className="w-full flex items-end justify-center gap-0.5 h-full">
                      <div
                        className="w-1/2 max-w-3 bg-sky-500/80 rounded-t group-hover:bg-sky-400 transition-colors"
                        style={{ height: `${(d.pv / maxPv) * 100}%` }}
                      />
                      <div
                        className="w-1/2 max-w-3 bg-emerald-500/80 rounded-t group-hover:bg-emerald-400 transition-colors"
                        style={{ height: `${(d.uv / maxPv) * 100}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-text-muted tabular-nums">
                      {d.day.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------- 留言管理 ---------- */}
        {tab === "messages" && (
          <div className="space-y-3">
            {msgs.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border p-12 text-center text-sm text-text-muted">
                还没有任何留言
              </div>
            ) : (
              msgs.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "rounded-2xl border p-4 md:p-5",
                    m.is_deleted
                      ? "border-rose-500/20 bg-rose-500/[0.03] opacity-70"
                      : m.is_pinned
                      ? "border-sky-500/30 bg-sky-500/[0.04]"
                      : "border-border bg-card"
                  )}
                >
                  <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                    <span className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
                      {(m.nickname || "?").slice(0, 1).toUpperCase()}
                    </span>
                    <span className="text-sm font-medium">{m.nickname}</span>
                    <span className="text-xs text-text-muted">{m.email}</span>
                    {m.is_pinned ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 text-[10px] border border-sky-500/20">
                        <Pin className="w-2.5 h-2.5" /> 置顶
                      </span>
                    ) : null}
                    {m.is_deleted ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[10px] border border-rose-500/20">
                        <EyeOff className="w-2.5 h-2.5" /> 已删除
                      </span>
                    ) : null}
                    <span className="ml-auto text-xs text-text-muted">
                      {fmtTs(m.created_at)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-text whitespace-pre-wrap break-words">
                    {m.content}
                  </p>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/60">
                    {m.is_deleted ? (
                      <button
                        onClick={() => msgAction(m.id, "restore")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> 恢复显示
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            msgAction(m.id, m.is_pinned ? "unpin" : "pin")
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-sky-400 hover:bg-sky-500/10 transition-colors"
                        >
                          {m.is_pinned ? (
                            <>
                              <PinOff className="w-3.5 h-3.5" /> 取消置顶
                            </>
                          ) : (
                            <>
                              <Pin className="w-3.5 h-3.5" /> 置顶
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => msgAction(m.id, "delete")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> 删除
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ---------- 用户列表 ---------- */}
        {tab === "users" && (
          <div className="rounded-3xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-text-muted bg-white/[0.02]">
                    <th className="px-5 py-3.5 font-medium">用户</th>
                    <th className="px-5 py-3.5 font-medium">角色</th>
                    <th className="px-5 py-3.5 font-medium">注册时间</th>
                    <th className="px-5 py-3.5 font-medium">最后登录</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-12 text-center text-text-muted"
                      >
                        暂无用户
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-border/50 last:border-0 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                              {u.email.slice(0, 1).toUpperCase()}
                            </span>
                            <span className="text-text">{u.email}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          {u.role === "admin" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 text-[11px] border border-sky-500/20">
                              <ShieldCheck className="w-3 h-3" /> 管理员
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 text-text-muted text-[11px] border border-border">
                              <Users className="w-3 h-3" /> 用户
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-text-muted tabular-nums text-xs">
                          {fmtTs(u.created_at)}
                        </td>
                        <td className="px-5 py-3.5 text-text-muted tabular-nums text-xs">
                          {fmtTs(u.last_login_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
