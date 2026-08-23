import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  readAuthCookie,
  clearAuthCookie,
  verifySession,
} from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ------ GET /api/auth/me：前端用来判断当前登录状态 ------
// 注意：这里不读写数据库，只校验 JWT cookie → 不需要 initDb()，
//       避免 Navbar 每刷新一次会话状态就跑一遍 sql.js 迁移。
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = readAuthCookie(cookieStore);
    if (!token) {
      return NextResponse.json({ ok: true, me: null });
    }
    const me = await verifySession(token);
    if (!me) {
      // 会话过期：顺手清 cookie
      clearAuthCookie(cookieStore);
      return NextResponse.json({ ok: true, me: null });
    }
    return NextResponse.json({
      ok: true,
      me: {
        uid: me.uid,
        email: me.email,
        role: me.role,
        isAdmin: me.role === "admin",
      },
    });
  } catch (err) {
    const e = err as Error;
    console.error(`[api/auth/me] 异常: ${e.message}`);
    return NextResponse.json(
      { ok: false, message: "服务器异常", me: null },
      { status: 500 }
    );
  }
}

// ------ POST /api/auth/logout：登出，清空 cookie ------
// 同样不需要碰 DB，纯 cookie 操作
export async function POST(_req: NextRequest) {
  const cookieStore = await cookies();
  clearAuthCookie(cookieStore);
  return NextResponse.json({ ok: true, message: "已退出登录" });
}
