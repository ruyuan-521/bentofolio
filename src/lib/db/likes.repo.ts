import { getDb, runSql, getAll } from "./sqlite";

/** 全部项目的点赞数：{ [projectKey]: count } */
export function getLikeCounts(): Record<string, number> {
  const db = getDb();
  const rows = getAll<{ project_key: string; cnt: number }>(
    db,
    `SELECT project_key, COUNT(*) AS cnt FROM project_likes GROUP BY project_key`
  );
  const out: Record<string, number> = {};
  for (const r of rows) out[r.project_key] = Number(r.cnt);
  return out;
}

/** 某访客点过赞的项目 key 列表 */
export function getLikedKeys(visitorHash: string): string[] {
  const db = getDb();
  const rows = getAll<{ project_key: string }>(
    db,
    `SELECT project_key FROM project_likes WHERE visitor_hash = @h`,
    { h: visitorHash }
  );
  return rows.map((r) => r.project_key);
}

/**
 * 切换点赞（已点则取消，未点则添加）。
 * 返回切换后的最新状态：{ liked, count }
 */
export function toggleLike(
  projectKey: string,
  visitorHash: string
): { liked: boolean; count: number } {
  const db = getDb();

  // 先尝试删除（取消赞）
  const del = runSql(
    db,
    `DELETE FROM project_likes WHERE project_key = @k AND visitor_hash = @h`,
    { k: projectKey, h: visitorHash }
  );
  if (del.changes > 0) {
    return { liked: false, count: countForKey(db, projectKey) };
  }

  // 没删到 → 说明没点过 → 插入（点赞）
  // UNIQUE 约束兜底：并发重复插入会抛错，catch 后视为已点赞
  try {
    runSql(
      db,
      `INSERT INTO project_likes (project_key, visitor_hash) VALUES (@k, @h)`,
      { k: projectKey, h: visitorHash }
    );
  } catch {
    /* 并发兜底，忽略 */
  }
  return { liked: true, count: countForKey(db, projectKey) };
}

function countForKey(db: ReturnType<typeof getDb>, projectKey: string): number {
  const rows = getAll<{ cnt: number }>(
    db,
    `SELECT COUNT(*) AS cnt FROM project_likes WHERE project_key = @k`,
    { k: projectKey }
  );
  return Number(rows[0]?.cnt ?? 0);
}

/** 点赞总数（统计用） */
export function countAllLikes(): number {
  const db = getDb();
  const rows = getAll<{ cnt: number }>(
    db,
    `SELECT COUNT(*) AS cnt FROM project_likes`
  );
  return Number(rows[0]?.cnt ?? 0);
}
