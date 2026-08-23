import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  VerificationRepo,
  UserRepo,
  initDb,
} from "@/lib/db/sqlite";
import { signSession, setAuthCookie } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await initDb(); // 确保 sql.js WASM 已加载 + 迁移完成

    const { email, code, purpose = "login" } = (await req.json()) as {
      email?: string;
      code?: string;
      purpose?: "login" | "reset-password";
    };

    if (!email || !code) {
      return NextResponse.json(
        { ok: false, message: "邮箱和验证码不能为空" },
        { status: 400 }
      );
    }
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedCode = code.trim();

    // 1. 验证码一次性校验（校验通过自动标记 used）
    const vc = VerificationRepo.consume({
      email: trimmedEmail,
      code: trimmedCode,
      purpose,
    });
    if (!vc) {
      return NextResponse.json(
        { ok: false, message: "验证码无效或已过期" },
        { status: 401 }
      );
    }

    // 2. 取/建用户（角色按 ADMIN_EMAILS 白名单自动决定：admin / user）
    const user = UserRepo.upsertByEmail(trimmedEmail);

    // 4. 更新最后登录时间
    UserRepo.markLogin(user.id);

    // 5. 签发 JWT + 写入 HTTP-only Cookie
    const payload = { uid: user.id, email: user.email, role: user.role };
    const token = await signSession(payload, 7 * 24 * 60 * 60);
    const cookieStore = await cookies();
    setAuthCookie(cookieStore, token);

    return NextResponse.json({
      ok: true,
      message: "登录成功",
      data: {
        uid: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    const e = err as Error;
    console.error(`[api/auth/verify-code] 异常: ${e.message}`);
    return NextResponse.json(
      { ok: false, message: "服务器异常，请稍后再试" },
      { status: 500 }
    );
  }
}
