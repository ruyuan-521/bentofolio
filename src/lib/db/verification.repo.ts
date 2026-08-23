import { getDb, runSql, getOne, runInTx } from "./sqlite";

type Purpose = "login" | "reset-password";

export type VerificationCode = {
  id: number;
  email: string;
  code: string;
  purpose: Purpose;
  expires_at: number;
  used: 0 | 1;
  created_at: number;
};

/**
 * 创建一条验证码记录（同一邮箱同一目的，旧的会自动置为 used 失效）
 */
export function create({
  email,
  code,
  purpose = "login",
  ttlSeconds = 600,
}: {
  email: string;
  code: string;
  purpose?: Purpose;
  ttlSeconds?: number;
}) {
  const db = getDb();
  const e = email.trim().toLowerCase();
  const now = Math.floor(Date.now() / 1000);

  return runInTx(db, () => {
    // 1. 同邮箱同目的的旧未使用验证码，立刻置为 used
    runSql(
      db,
      `UPDATE verification_codes SET used = 1
       WHERE email = @e AND purpose = @p AND used = 0 AND expires_at > @now`,
      { e, p: purpose, now }
    );

    // 2. 插入新的
    const info = runSql(
      db,
      `INSERT INTO verification_codes (email, code, purpose, expires_at)
       VALUES (@e, @c, @p, @exp)`,
      { e, c: code, p: purpose, exp: now + ttlSeconds }
    );

    return Number(info.lastInsertRowid);
  });
}

/**
 * 最近一次发送时间（秒级），用于频率限制：60 秒内只能发一封
 */
export function getLastSentAt(
  email: string,
  purpose: Purpose = "login"
): number {
  const db = getDb();
  const row = getOne<{ created_at: number }>(
    db,
    `SELECT created_at FROM verification_codes
     WHERE email = @e AND purpose = @p
     ORDER BY id DESC LIMIT 1`,
    { e: email.trim().toLowerCase(), p: purpose }
  );
  return row ? Number(row.created_at) : 0;
}

/**
 * 查找并验证：成功返回记录 id，失败返回 null
 * 验证成功后自动标记为 used（一次性消耗）
 */
export function consume({
  email,
  code,
  purpose = "login",
}: {
  email: string;
  code: string;
  purpose?: Purpose;
}): VerificationCode | null {
  const db = getDb();
  const e = email.trim().toLowerCase();
  const now = Math.floor(Date.now() / 1000);

  const row = runInTx(db, () => {
    const r = getOne<VerificationCode>(
      db,
      `SELECT * FROM verification_codes
       WHERE email = @e AND code = @c AND purpose = @p
         AND used = 0 AND expires_at > @now
       ORDER BY id DESC LIMIT 1`,
      { e, c: code, p: purpose, now }
    );
    if (!r) return null;
    runSql(db, `UPDATE verification_codes SET used = 1 WHERE id = @id`, {
      id: r.id,
    });
    return r;
  });
  return row ?? null;
}

/**
 * 生成 6 位数字验证码
 */
export function generateCode(): string {
  let s = "";
  for (let i = 0; i < 6; i++) s += Math.floor(Math.random() * 10).toString();
  return s;
}
