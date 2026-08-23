import { NextResponse, type NextRequest } from "next/server";
import { initDb } from "@/lib/db/sqlite";
import * as GuestbookRepo from "@/lib/db/guestbook.repo";
import { requireAdmin } from "@/lib/auth/current";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

// ------ PATCH /api/guestbook/[id]：置顶/取消置顶（仅管理员） ------
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json(
        { ok: false, message: "需要管理员权限" },
        { status: 403 }
      );
    }
    await initDb();
    const { id } = await ctx.params;
    const msgId = Number(id);
    if (!Number.isInteger(msgId) || msgId <= 0) {
      return NextResponse.json(
        { ok: false, message: "留言 ID 无效" },
        { status: 400 }
      );
    }
    const { isPinned, isDeleted } = (await req.json()) as {
      isPinned?: boolean;
      isDeleted?: boolean;
    };
    if (typeof isPinned === "boolean") {
      GuestbookRepo.setMessagePinned(msgId, isPinned);
    }
    if (typeof isDeleted === "boolean") {
      GuestbookRepo.setMessageDeleted(msgId, isDeleted);
    }
    return NextResponse.json({ ok: true, message: "操作成功" });
  } catch (err) {
    const e = err as Error;
    console.error(`[api/guestbook/:id][PATCH] 异常: ${e.message}`);
    return NextResponse.json(
      { ok: false, message: "服务器异常" },
      { status: 500 }
    );
  }
}

// ------ DELETE /api/guestbook/[id]：删除留言（软删除，仅管理员） ------
export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json(
        { ok: false, message: "需要管理员权限" },
        { status: 403 }
      );
    }
    await initDb();
    const { id } = await ctx.params;
    const msgId = Number(id);
    if (!Number.isInteger(msgId) || msgId <= 0) {
      return NextResponse.json(
        { ok: false, message: "留言 ID 无效" },
        { status: 400 }
      );
    }
    const ok = GuestbookRepo.setMessageDeleted(msgId, true);
    if (!ok) {
      return NextResponse.json(
        { ok: false, message: "留言不存在" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true, message: "已删除" });
  } catch (err) {
    const e = err as Error;
    console.error(`[api/guestbook/:id][DELETE] 异常: ${e.message}`);
    return NextResponse.json(
      { ok: false, message: "服务器异常" },
      { status: 500 }
    );
  }
}
