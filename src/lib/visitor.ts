import { createHash } from "crypto";
import type { NextRequest } from "next/server";

/**
 * 匿名访客指纹：IP + User-Agent 的 SHA-256 哈希（截断 32 位十六进制）。
 * 用途：点赞防重（一人一赞）、UV 统计。
 * 隐私：不存原始 IP，只存不可逆哈希。
 */
export function visitorHash(req: NextRequest): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local";
  const ua = req.headers.get("user-agent") || "";
  return createHash("sha256").update(`${ip}|${ua}`).digest("hex").slice(0, 32);
}
