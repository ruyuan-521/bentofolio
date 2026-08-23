import { NextResponse } from "next/server";
import { initDb } from "@/lib/db/sqlite";
import * as StatsRepo from "@/lib/db/stats.repo";
import { requireAdmin } from "@/lib/auth/current";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ------ GET /api/admin/stats：概览统计 + 近 14 天趋势（仅管理员） ------
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
    return NextResponse.json({
      ok: true,
      overview: StatsRepo.getOverview(),
      daily: StatsRepo.getDailyStats(14),
    });
  } catch (err) {
    const e = err as Error;
    console.error(`[api/admin/stats] 异常: ${e.message}`);
    return NextResponse.json(
      { ok: false, message: "服务器异常" },
      { status: 500 }
    );
  }
}
