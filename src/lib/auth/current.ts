import { cookies } from "next/headers";
import { readAuthCookie, verifySession, type SessionPayload } from "./session";

/**
 * 读取当前登录会话（从 HTTP-only Cookie 里的 JWT 解析出 uid/email/role）。
 * 未登录 / token 过期 / 任何异常 → 返回 null。
 * 仅可在服务端（API 路由 / RSC）调用。
 */
export async function getSessionUser(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = readAuthCookie(cookieStore);
    if (!token) return null;
    return await verifySession(token);
  } catch {
    return null;
  }
}

/**
 * 要求管理员会话：是管理员返回会话，否则返回 null（调用方回 403）。
 */
export async function requireAdmin(): Promise<SessionPayload | null> {
  const u = await getSessionUser();
  return u && u.role === "admin" ? u : null;
}
