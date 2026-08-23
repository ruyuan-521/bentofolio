import { NextResponse } from "next/server";
import { initDb, getDb, getAll } from "@/lib/db/sqlite";
import { requireAdmin } from "@/lib/auth/current";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AdminUserRow = {
  id: number;
  email: string;
  role: "admin" | "user";
  created_at: number;
  last_login_at: number | null;
};

// ------ GET /api/admin/users：用户列表（仅管理员） ------
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { ok: false, message: "需要管理员权限" },
      { status: 403 }
    );
  }
  try {
    await initDb();
    const data = getAll<AdminUserRow>(
      getDb(),
      `SELECT id, email, role, created_at, last_login_at
       FROM users ORDER BY created_at DESC LIMIT 500`
    );
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    const e = err as Error;
    console.error(`[api/admin/users] 异常: ${e.message}`);
    return NextResponse.json(
      { ok: false, message: "服务器异常" },
      { status: 500 }
    );
  }
}
