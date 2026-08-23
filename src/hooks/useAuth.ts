"use client";

import { useEffect, useState, useCallback } from "react";

export type MeInfo = {
  uid: number;
  email: string;
  role: "admin" | "user";
  isAdmin: boolean;
} | null;

export function useAuth() {
  const [me, setMe] = useState<MeInfo>(null);
  const [loading, setLoading] = useState(true);

  // ---------- 拉取当前会话 ----------
  const fetchMe = useCallback(async () => {
    try {
      setLoading(true);
      const r = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      const data = (await r.json()) as { ok: boolean; me: MeInfo };
      if (data.ok) setMe(data.me || null);
      else setMe(null);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // ---------- 发送验证码 ----------
  async function sendCode({
    email,
    purpose = "login",
  }: {
    email: string;
    purpose?: "login" | "reset-password";
  }): Promise<{ ok: boolean; message: string; devCode?: string; retryAfter?: number; cooldown?: number }> {
    const r = await fetch("/api/auth/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, purpose }),
    });
    return r.json() as Promise<any>;
  }

  // ---------- 校验并登录 ----------
  async function verifyCode({
    email,
    code,
    purpose = "login",
  }: {
    email: string;
    code: string;
    purpose?: "login" | "reset-password";
  }): Promise<{ ok: boolean; message: string; data?: MeInfo }> {
    const r = await fetch("/api/auth/verify-code", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, purpose }),
    });
    const res = (await r.json()) as any;
    if (res?.ok) await fetchMe(); // 登录成功立刻刷新 me
    return res;
  }

  // ---------- 登出 ----------
  async function logout(): Promise<boolean> {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setMe(null);
      return true;
    } catch {
      return false;
    }
  }

  return { me, loading, sendCode, verifyCode, logout, refresh: fetchMe };
}
