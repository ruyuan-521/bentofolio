import { getDb, runSql, getOne, runInTx } from "./sqlite";

export type User = {
  id: number;
  email: string;
  role: "admin" | "user";
  created_at: number;
  last_login_at: number | null;
};

export function findByEmail(email: string): User | null {
  const db = getDb();
  return getOne<User>(db, `SELECT * FROM users WHERE email = @email LIMIT 1`, {
    email: email.trim().toLowerCase(),
  });
}

/**
 * 按 ADMIN_EMAILS 白名单自动决定角色：
 * 白名单里的邮箱 → admin，其他所有邮箱 → user（开放注册，人人可登录）
 */
export function upsertByEmail(email: string): User {
  const db = getDb();
  const e = email.trim().toLowerCase();
  const role: "admin" | "user" = isAdminEmail(e) ? "admin" : "user";
  const exist = findByEmail(e);
  if (exist) {
    // 白名单变动后重新登录，同步刷新角色（比如新邮箱加进了 ADMIN_EMAILS）
    if (exist.role !== role) {
      runSql(db, `UPDATE users SET role = @r WHERE id = @id`, {
        r: role,
        id: exist.id,
      });
      return { ...exist, role };
    }
    return exist;
  }
  const info = runInTx(db, () =>
    runSql(db, `INSERT INTO users (email, role) VALUES (@e, @r)`, {
      e,
      r: role,
    })
  );
  return {
    id: Number(info.lastInsertRowid),
    email: e,
    role,
    created_at: Math.floor(Date.now() / 1000),
    last_login_at: null,
  };
}

export function markLogin(userId: number) {
  const db = getDb();
  runSql(
    db,
    `UPDATE users SET last_login_at = strftime('%s','now') WHERE id = @id`,
    { id: userId }
  );
}

export function isAdminEmail(email: string): boolean {
  const whitelist = (process.env.ADMIN_EMAILS || process.env.SMTP_USER || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (whitelist.length === 0) return false;
  return whitelist.includes(email.trim().toLowerCase());
}
