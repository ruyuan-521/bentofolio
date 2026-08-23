import { NextResponse, type NextRequest } from "next/server";
import { initDb } from "@/lib/db/sqlite";
import * as GuestbookRepo from "@/lib/db/guestbook.repo";
import { getSessionUser } from "@/lib/auth/current";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 发言冷却：同一用户 30 秒一条 */
const POST_COOLDOWN_SEC = 30;
const MAX_CONTENT_LEN = 500;

// ------ GET /api/guestbook：公开留言列表 ------
export async function GET() {
  try {
    await initDb();
    const data = GuestbookRepo.listMessages(100);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    const e = err as Error;
    console.error(`[api/guestbook][GET] 异常: ${e.message}`);
    return NextResponse.json(
      { ok: false, message: "服务器异常" },
      { status: 500 }
    );
  }
}

// ------ POST /api/guestbook：留言（需登录） ------
export async function POST(req: NextRequest) {
  try {
    await initDb();
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, message: "请先登录再留言" },
        { status: 401 }
      );
    }

    const { content } = (await req.json()) as { content?: string };
    const trimmed = (content || "").trim();
    if (!trimmed) {
      return NextResponse.json(
        { ok: false, message: "留言内容不能为空" },
        { status: 400 }
      );
    }
    if (trimmed.length > MAX_CONTENT_LEN) {
      return NextResponse.json(
        { ok: false, message: `留言最多 ${MAX_CONTENT_LEN} 字` },
        { status: 400 }
      );
    }

    // 发言频率限制
    const last = GuestbookRepo.getLastMessageAt(user.uid);
    const now = Math.floor(Date.now() / 1000);
    if (last && now - last < POST_COOLDOWN_SEC) {
      const wait = POST_COOLDOWN_SEC - (now - last);
      return NextResponse.json(
        { ok: false, message: `留言太频繁，请 ${wait} 秒后再发` },
        { status: 429 }
      );
    }

    const msg = GuestbookRepo.createMessage({
      uid: user.uid,
      email: user.email,
      nickname: GuestbookRepo.nicknameFromEmail(user.email),
      content: trimmed,
    });
    return NextResponse.json({ ok: true, message: "留言成功", data: msg });
  } catch (err) {
    const e = err as Error;
    console.error(`[api/guestbook][POST] 异常: ${e.message}`);
    return NextResponse.json(
      { ok: false, message: "服务器异常，请稍后再试" },
      { status: 500 }
    );
  }
}
