import { NextResponse, type NextRequest } from "next/server";
import { initDb } from "@/lib/db/sqlite";
import * as LikesRepo from "@/lib/db/likes.repo";
import { visitorHash } from "@/lib/visitor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ------ GET /api/projects/likes：所有项目点赞数 + 当前访客是否点过 ------
export async function GET(req: NextRequest) {
  try {
    await initDb();
    const h = visitorHash(req);
    return NextResponse.json({
      ok: true,
      counts: LikesRepo.getLikeCounts(),
      liked: LikesRepo.getLikedKeys(h),
    });
  } catch (err) {
    const e = err as Error;
    console.error(`[api/projects/likes][GET] 异常: ${e.message}`);
    return NextResponse.json(
      { ok: false, message: "服务器异常" },
      { status: 500 }
    );
  }
}

// ------ POST /api/projects/likes：切换点赞（游客可点，IP+UA 防重） ------
export async function POST(req: NextRequest) {
  try {
    await initDb();
    const { key } = (await req.json()) as { key?: string };
    const projectKey = (key || "").trim();
    if (!projectKey || projectKey.length > 100) {
      return NextResponse.json(
        { ok: false, message: "参数无效" },
        { status: 400 }
      );
    }
    const h = visitorHash(req);
    const result = LikesRepo.toggleLike(projectKey, h);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const e = err as Error;
    console.error(`[api/projects/likes][POST] 异常: ${e.message}`);
    return NextResponse.json(
      { ok: false, message: "服务器异常" },
      { status: 500 }
    );
  }
}
