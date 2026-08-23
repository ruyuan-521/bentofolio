import { NextResponse, type NextRequest } from "next/server";
import { initDb } from "@/lib/db/sqlite";
import * as StatsRepo from "@/lib/db/stats.repo";
import { visitorHash } from "@/lib/visitor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ------ POST /api/track：页面访问上报（fire-and-forget，前端不关心结果） ------
export async function POST(req: NextRequest) {
  try {
    await initDb();
    const { path = "/" } = (await req.json()) as { path?: string };
    const h = visitorHash(req);
    StatsRepo.recordPageView(StatsRepo.todayStr(), h, path || "/");
    return NextResponse.json({ ok: true });
  } catch (err) {
    // 统计失败不影响用户，静默
    const e = err as Error;
    console.error(`[api/track] 异常: ${e.message}`);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
