import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean; // true = SSL (465), false = STARTTLS (587)
  user: string;
  pass: string;
  from: string;
};

export function envSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS; // ⚠️ 163 要填【SMTP 授权码】，不是邮箱登录密码！
  if (!host || !user || !pass) return null;

  return {
    host,
    port,
    secure: port === 465, // 465 用 SSL，587 用 STARTTLS
    user,
    pass,
    from: process.env.SMTP_FROM || `"渊 · Yuan 个人主页" <${user}>`,
  };
}

let _transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> | null =
  null;

export function getTransporter(
  cfg: SmtpConfig
): nodemailer.Transporter<SMTPTransport.SentMessageInfo> {
  if (_transporter) return _transporter;
  const options: SMTPTransport.Options = {
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
    // 网络不好时重试 2 次
    ...({
      maxConnections: 2,
      pool: false,
      connectionTimeout: 20_000,
      greetingTimeout: 15_000,
      socketTimeout: 30_000,
      logger: process.env.NODE_ENV !== "production",
      debug: process.env.NODE_ENV !== "production",
    } as any),
  };
  _transporter = nodemailer.createTransport(options);
  return _transporter;
}

export async function sendMail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  const cfg = envSmtpConfig();
  if (!cfg) {
    console.warn("[mail] SMTP 未配置（SMTP_HOST/USER/PASS 缺失），跳过邮件发送");
    return false;
  }
  const transporter = getTransporter(cfg);
  try {
    await transporter.sendMail({
      from: cfg.from,
      to,
      subject,
      html,
      text,
    });
    return true;
  } catch (err) {
    // 分层打印错误，方便定位：是 TCP 连不上 / 535 账号密码错 / Relay denied
    const e = err as Error;
    console.error(
      `[mail] 发送失败 to=${to} err=${e.message} cause=${
        (e as { code?: string; response?: string }).code || ""
      } response=${(e as { response?: string }).response || ""}`
    );
    return false;
  }
}

// ---------------- 常用邮件模板 ----------------
export function renderCodeEmail({
  code,
  email,
  ttlMinutes = 10,
}: {
  code: string;
  email: string;
  ttlMinutes?: number;
}) {
  const html = `
    <div style="max-width:560px;margin:24px auto;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif;color:#1f2937;">
      <div style="padding:28px;background:linear-gradient(135deg,#e0f2fe 0%,#f5f3ff 100%);border-radius:16px;border:1px solid #e2e8f0;">
        <div style="font-size:13px;color:#475569;margin-bottom:12px;">渊 · Yuan 个人主页</div>
        <h2 style="margin:0 0 12px 0;font-size:22px;">你的邮箱验证码</h2>
        <p style="color:#475569;margin:0 0 20px 0;font-size:14px;line-height:1.7;">
          正在用邮箱 <strong>${email}</strong> 登录管理员后台。<br/>
          验证码有效时间 <strong>${ttlMinutes} 分钟</strong>，请勿泄露给他人。
        </p>
        <div style="padding:22px 24px;background:#fff;border-radius:12px;border:1px dashed #60a5fa;text-align:center;">
          <div style="font-size:38px;letter-spacing:12px;font-weight:700;color:#2563eb;font-family: ui-monospace,'SFMono-Regular',Consolas,monospace;">
            ${code}
          </div>
        </div>
        <div style="margin-top:20px;font-size:12px;color:#64748b;line-height:1.7;">
          如果你没有发起本次操作，请忽略这封邮件。<br/>
          此邮件由系统自动发出，请勿直接回复。
        </div>
      </div>
    </div>`;
  const text = `你的登录验证码：${code}（${ttlMinutes} 分钟内有效）\n邮箱：${email}\n如果你没有发起本次操作，请忽略。`;
  return { html, text };
}
