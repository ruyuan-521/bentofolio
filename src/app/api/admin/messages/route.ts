import { NextResponse } from "next/server";
import { initDb } from "@/lib/db/sqlite";
import * as GuestbookRepo from "@/lib/db/guestbook.repo";
import { requireAdmin } from "@/lib/auth/current";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ------ GET /api/admin/messages：全部留言（含已删除，仅管理员） ------
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
    const data = GuestbookRepo.listAllForAdmin(300);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    const e = err as Error;
    console.error(`[api/admin/messages] 异常: ${e.message}`);
    return NextResponse.json(
      { ok: false, message: "服务器异常" },
      { status: 500 }
    );
  }
}
