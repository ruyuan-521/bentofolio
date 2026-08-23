import { getDb, runSql, getOne, getAll } from "./sqlite";

export type GuestbookMessage = {
  id: number;
  uid: number;
  nickname: string;
  content: string;
  is_pinned: number;
  created_at: number;
};

export type GuestbookMessageAdmin = GuestbookMessage & {
  email: string;
  is_deleted: number;
};

/**
 * 从邮箱生成展示昵称（保护隐私，不暴露完整邮箱）：
 * 13585010039@163.com → "135****39"；abc@x.com → "abc"
 */
export function nicknameFromEmail(email: string): string {
  const prefix = (email.split("@")[0] || "").trim();
  if (!prefix) return "访客";
  if (prefix.length <= 3) return prefix + "***";
  if (prefix.length <= 6) return prefix.slice(0, 3) + "***";
  return prefix.slice(0, 3) + "****" + prefix.slice(-2);
}

/** 公开列表：未删除，置顶优先，其余按时间倒序 */
export function listMessages(limit = 100): GuestbookMessage[] {
  const db = getDb();
  return getAll<GuestbookMessage>(
    db,
    `SELECT id, uid, nickname, content, is_pinned, created_at
     FROM guestbook_messages
     WHERE is_deleted = 0
     ORDER BY is_pinned DESC, created_at DESC
     LIMIT @limit`,
    { limit }
  );
}

/** 管理端列表：含已删除的，带 email */
export function listAllForAdmin(limit = 300): GuestbookMessageAdmin[] {
  const db = getDb();
  return getAll<GuestbookMessageAdmin>(
    db,
    `SELECT id, uid, email, nickname, content, is_pinned, is_deleted, created_at
     FROM guestbook_messages
     ORDER BY is_pinned DESC, created_at DESC
     LIMIT @limit`,
    { limit }
  );
}

export function createMessage(params: {
  uid: number;
  email: string;
  nickname: string;
  content: string;
}): GuestbookMessage | null {
  const db = getDb();
  const info = runSql(
    db,
    `INSERT INTO guestbook_messages (uid, email, nickname, content)
     VALUES (@uid, @email, @nickname, @content)`,
    params
  );
  const id = Number(info.lastInsertRowid);
  if (!id) return null;
  return getOne<GuestbookMessage>(
    db,
    `SELECT id, uid, nickname, content, is_pinned, created_at
     FROM guestbook_messages WHERE id = @id`,
    { id }
  );
}

/** 该用户最近一条留言的时间戳（做发言频率限制用） */
export function getLastMessageAt(uid: number): number | null {
  const db = getDb();
  const row = getOne<{ created_at: number }>(
    db,
    `SELECT created_at FROM guestbook_messages
     WHERE uid = @uid ORDER BY created_at DESC LIMIT 1`,
    { uid }
  );
  return row?.created_at ?? null;
}

/** 置顶 / 取消置顶 */
export function setMessagePinned(id: number, pinned: boolean): boolean {
  const db = getDb();
  const info = runSql(
    db,
    `UPDATE guestbook_messages SET is_pinned = @p WHERE id = @id`,
    { p: pinned ? 1 : 0, id }
  );
  return info.changes > 0;
}

/** 软删除（管理端可看，前台隐藏） */
export function setMessageDeleted(id: number, deleted: boolean): boolean {
  const db = getDb();
  const info = runSql(
    db,
    `UPDATE guestbook_messages SET is_deleted = @d WHERE id = @id`,
    { d: deleted ? 1 : 0, id }
  );
  return info.changes > 0;
}

/** 未删除留言总数 */
export function countMessages(): number {
  const db = getDb();
  const row = getOne<{ c: number }>(
    db,
    `SELECT COUNT(*) AS c FROM guestbook_messages WHERE is_deleted = 0`
  );
  return Number(row?.c ?? 0);
}
