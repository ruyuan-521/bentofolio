import { getDb, runSql, getOne, getAll } from "./sqlite";

/** 今天（UTC 日期，格式 YYYY-MM-DD） */
export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/** 记录一次页面访问 */
export function recordPageView(
  day: string,
  visitorHash: string,
  path: string
): void {
  const db = getDb();
  runSql(
    db,
    `INSERT INTO page_views (day, visitor_hash, path) VALUES (@day, @h, @path)`,
    { day, h: visitorHash, path: path.slice(0, 200) }
  );
}

export type StatsOverview = {
  totalPv: number;
  totalUv: number;
  todayPv: number;
  todayUv: number;
  totalUsers: number;
  totalMessages: number;
  totalLikes: number;
};

export function getOverview(): StatsOverview {
  const db = getDb();
  const pv = getOne<{ c: number }>(
    db,
    `SELECT COUNT(*) AS c FROM page_views`
  );
  const uv = getOne<{ c: number }>(
    db,
    `SELECT COUNT(DISTINCT visitor_hash) AS c FROM page_views`
  );
  const today = todayStr();
  const todayPv = getOne<{ c: number }>(
    db,
    `SELECT COUNT(*) AS c FROM page_views WHERE day = @d`,
    { d: today }
  );
  const todayUv = getOne<{ c: number }>(
    db,
    `SELECT COUNT(DISTINCT visitor_hash) AS c FROM page_views WHERE day = @d`,
    { d: today }
  );
  const users = getOne<{ c: number }>(db, `SELECT COUNT(*) AS c FROM users`);
  const msgs = getOne<{ c: number }>(
    db,
    `SELECT COUNT(*) AS c FROM guestbook_messages WHERE is_deleted = 0`
  );
  const likes = getOne<{ c: number }>(
    db,
    `SELECT COUNT(*) AS c FROM project_likes`
  );
  return {
    totalPv: Number(pv?.c ?? 0),
    totalUv: Number(uv?.c ?? 0),
    todayPv: Number(todayPv?.c ?? 0),
    todayUv: Number(todayUv?.c ?? 0),
    totalUsers: Number(users?.c ?? 0),
    totalMessages: Number(msgs?.c ?? 0),
    totalLikes: Number(likes?.c ?? 0),
  };
}

export type DailyStat = { day: string; pv: number; uv: number };

/** 最近 N 天的 PV/UV（缺数据的天补 0），按日期升序返回 */
export function getDailyStats(days = 14): DailyStat[] {
  const db = getDb();
  const from = new Date(Date.now() - (days - 1) * 86400_000)
    .toISOString()
    .slice(0, 10);
  const rows = getAll<{ day: string; pv: number; uv: number }>(
    db,
    `SELECT day, COUNT(*) AS pv, COUNT(DISTINCT visitor_hash) AS uv
     FROM page_views WHERE day >= @from GROUP BY day ORDER BY day`,
    { from }
  );
  const map = new Map(rows.map((r) => [r.day, r]));
  const out: DailyStat[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10);
    const r = map.get(day);
    out.push({ day, pv: Number(r?.pv ?? 0), uv: Number(r?.uv ?? 0) });
  }
  return out;
}
