import { NextResponse, type NextRequest } from "next/server";
import {
  VerificationRepo,
  UserRepo,
  initDb,
} from "@/lib/db/sqlite";
import { envSmtpConfig, renderCodeEmail, sendMail } from "@/lib/email/smtp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 频率限制：60 秒内只能发一封
const SEND_COOLDOWN_SEC = 60;
// 验证码 10 分钟过期
const TTL_SEC = 600;

export async function POST(req: NextRequest) {
  try {
    await initDb(); // 确保 sql.js WASM 已加载 + 迁移完成

    const { email, purpose = "login" } = (await req.json()) as {
      email?: string;
      purpose?: "login" | "reset-password";
    };

    // -------- 1. 参数校验 --------
    if (!email) {
      return NextResponse.json(
        { ok: false, message: "请输入邮箱" },
        { status: 400 }
      );
    }
    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json(
        { ok: false, message: "邮箱格式不正确" },
        { status: 400 }
      );
    }

    // -------- 2. 频率限制 --------
    const lastSent = VerificationRepo.getLastSentAt(trimmedEmail, purpose);
    const now = Math.floor(Date.now() / 1000);
    if (lastSent && now - lastSent < SEND_COOLDOWN_SEC) {
      const wait = SEND_COOLDOWN_SEC - (now - lastSent);
      return NextResponse.json(
        {
          ok: false,
          message: `发送太频繁，请 ${wait} 秒后重试`,
          retryAfter: wait,
        },
        { status: 429 }
      );
    }

    // -------- 4. 生成 6 位验证码，写入 SQLite（持久化，重启服务不丢）--------
    const code = VerificationRepo.generateCode();
    VerificationRepo.create({
      email: trimmedEmail,
      code,
      purpose,
      ttlSeconds: TTL_SEC,
    });

    // -------- 5. 确保用户存在（角色按白名单自动决定：admin / user） --------
    if (purpose === "login") {
      UserRepo.upsertByEmail(trimmedEmail);
    }

    // -------- 6. 发邮件 --------
    const smtp = envSmtpConfig();
    let sent = false;
    if (smtp) {
      const tpl = renderCodeEmail({
        code,
        email: trimmedEmail,
        ttlMinutes: Math.floor(TTL_SEC / 60),
      });
      sent = await sendMail({
        to: trimmedEmail,
        subject: `【渊 · Yuan】你的登录验证码：${code}`,
        html: tpl.html,
        text: tpl.text,
      });
    }

    // -------- 7. 开发模式兜底：如果 SMTP 没配或者发失败了，把验证码写到日志里 --------
    // （方便你本地调试不用每次查邮箱）
    if (!sent && process.env.NODE_ENV !== "production") {
      console.log(
        `[auth] ⚠️  邮件未发送（SMTP 未配置或失败），验证码已直接打印：`
      );
      console.log(
        `          email=${trimmedEmail}  code=${code}  purpose=${purpose}  有效期 ${TTL_SEC}s`
      );
    }

    // 无论成功失败，统一告诉用户"已发送"，避免枚举管理员邮箱
    return NextResponse.json({
      ok: true,
      message: sent
        ? "验证码已发送，请注意查收邮箱（可能在垃圾箱）"
        : "验证码已发送",
      cooldown: SEND_COOLDOWN_SEC,
      // 本地开发方便调试，直接把验证码塞回来（生产不返回）
      devCode: process.env.NODE_ENV !== "production" ? code : undefined,
    });
  } catch (err) {
    const e = err as Error;
    console.error(`[api/auth/send-code] 异常: ${e.message}`);
    return NextResponse.json(
      { ok: false, message: "服务器异常，请稍后再试" },
      { status: 500 }
    );
  }
}
