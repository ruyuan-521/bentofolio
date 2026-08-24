// 注意：这里不能用静态 import sql.js，否则 webpack/turbopack 会静态追踪
// sql.js 内部的 sql-wasm.wasm 导入 → 打包报错。
// 解决方案：用 node:module createRequire 锚定到【真实项目根目录 process.cwd()】去加载 sql.js，
// 不依赖 __filename（Turbopack 会把它变成假路径 /ROOT/src/xxx，导致模块解析失败）。
import fs from "node:fs";
import path from "node:path";

// ------ 基于 process.cwd() 的稳定 require 解析器 ------
type SqlJsDb = any;
type SqlJsStatic = any;

/**
 * 拿到一个永远以【真实项目根目录】为基准的 require 函数。
 * 无论 webpack/turbopack 怎么篡改 __filename，
 * process.cwd() 在 `next dev` / `next start` 下一定是 bentofolio 项目根目录，
 * 所以 createRequire(项目根/package.json) 一定能找到 node_modules/sql.js。
 */
function getRootRequire(): NodeRequire {
  // Node.js 22+ 全局有 createRequire；老版本走 node:module
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ModuleBuiltin = require("node:module");
  const mk = (ModuleBuiltin as any).createRequire;
  const anchor = path.join(process.cwd(), "package.json");
  return mk(anchor);
}

let _cwdRequire: NodeRequire | null = null;
function rootRequire(mod: string): any {
  if (!_cwdRequire) _cwdRequire = getRootRequire();
  return _cwdRequire(mod);
}
function rootResolve(request: string): string {
  if (!_cwdRequire) _cwdRequire = getRootRequire();
  return (_cwdRequire as any).resolve(request);
}

// sql.js 引擎 & 单例数据库
let _SQL: SqlJsStatic | null = null;
let _db: SqlJsDb | null = null;
let _saveTimer: NodeJS.Timeout | null = null;
let _sqlJsEntry: string | null = null;

// 数据库路径
// 生产环境（standalone）：PM2 的 cwd 是 .next/standalone，next build 会重建整个 .next，
// 所以数据库必须放在 .next 外面（项目根/data），否则每次部署数据全丢。
// 开发环境：process.cwd() 就是项目根，直接用。
const PROJECT_ROOT = path.resolve(process.cwd());
const IS_STANDALONE = PROJECT_ROOT.endsWith(path.join(".next", "standalone"));
const DATA_DIR = IS_STANDALONE
  ? path.join(PROJECT_ROOT, "..", "..", "data")
  : path.join(PROJECT_ROOT, "data");
const DB_PATH = path.join(DATA_DIR, "app.db");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getSqlJsDistDir(): string {
  if (_sqlJsEntry) return _sqlJsEntry;
  try {
    const pkg = rootResolve("sql.js/package.json");
    _sqlJsEntry = path.join(path.dirname(pkg), "dist");
    return _sqlJsEntry;
  } catch {
    _sqlJsEntry = path.join(process.cwd(), "node_modules", "sql.js", "dist");
    return _sqlJsEntry;
  }
}

async function ensureEngine(): Promise<SqlJsStatic> {
  if (_SQL) return _SQL;
  const mod = rootRequire("sql.js");
  // sql.js CJS 导出：mod.default 是 initSqlJs 函数（或 mod 本身就是）
  const init: (opts: any) => Promise<SqlJsStatic> =
    (mod as any).default ?? mod;
  const wasmAbs = path.join(getSqlJsDistDir(), "sql-wasm.wasm");
  // locateFile: 直接返回 node_modules 里 wasm 的绝对路径，避免 sql.js 走 CDN / import.meta.url
  _SQL = await init({
    locateFile: () => wasmAbs,
  });
  return _SQL;
}

/**
 * 把内存中的数据库写回到磁盘文件。
 * sql.js 是纯内存数据库，必须显式 export() + 写文件才能持久化。
 */
function persistDb() {
  if (!_db) return;
  try {
    const data = _db.export();
    // 先写临时文件再 rename，防崩溃时损坏
    const tmpPath = `${DB_PATH}.tmp`;
    fs.writeFileSync(tmpPath, Buffer.from(data));
    fs.renameSync(tmpPath, DB_PATH);
  } catch (err) {
    console.error(`[db] persist 失败: ${(err as Error).message}`);
  }
}

// 进程退出前确保落盘
function hookExitSave() {
  if (process.listenerCount("exit")) return;
  process.on("exit", persistDb);
  process.on("SIGINT", () => {
    persistDb();
    process.exit(130);
  });
  process.on("SIGTERM", () => {
    persistDb();
    process.exit(143);
  });
}

/**
 * 初始化数据库（必须在启动时 await 一次）。
 * 单例：多次调用安全。
 */
let _initPromise: Promise<void> | null = null;
export async function initDb(): Promise<void> {
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    const SQL = await ensureEngine();
    if (_db) return;

    // 1. 从磁盘加载已有数据
    let buffer: Uint8Array | undefined;
    if (fs.existsSync(DB_PATH)) {
      try {
        buffer = new Uint8Array(fs.readFileSync(DB_PATH));
      } catch {
        buffer = undefined;
      }
    }
    _db = new SQL.Database(buffer);

    // 2. 兼容 better-sqlite3 的 PRAGMA（sql.js 没有 PRAGMA 接口，
    //    但 foreign_keys 默认就是 ON；WAL 是 fs 层的特性，内存库不需要）
    try {
      _db.run("PRAGMA foreign_keys = ON;");
    } catch {
      /* 某些旧版本 sql.js 不支持忽略 */
    }

    // 3. 跑迁移
    runMigrations(_db);

    // 4. 首次保存 & 定时持久化（15 秒同步一次 + 退出时保存）
    persistDb();
    hookExitSave();
    if (_saveTimer) clearInterval(_saveTimer);
    _saveTimer = setInterval(persistDb, 15_000);
    _saveTimer.unref?.();
  })();
  return _initPromise;
}

/**
 * 获取数据库实例（用于同步查询）。
 * ⚠️ 调用前必须先 `await initDb()` 一次，否则会抛错。
 */
export function getDb(): SqlJsDb {
  if (!_db) {
    throw new Error(
      "[db] 数据库尚未初始化，请在使用前调用一次 await initDb()"
    );
  }
  return _db;
}

// ---------- 兼容层：把 better-sqlite3 的 prepare/run/get/all/transaction 风格封装一下 ----------
// （让 repo 层不用大面积改代码，保持接近 better-sqlite3 的使用感）

export type BindMap = Record<string, unknown>;

/**
 * 等价 `db.prepare(sql).run(bind)`：执行，不返回行。
 * 返回 { changes: number; lastInsertRowid: bigint | number } 类似 better-sqlite3 的 info。
 */
export function runSql(db: SqlJsDb, sql: string, bind: BindMap = {}) {
  const [names, values] = objectToPositionalBind(bind);
  const sqlFixed = names.length ? swapNamedToQuestion(sql, names) : sql;
  db.run(sqlFixed, values);
  const changes = (db as any).getRowsModified?.() ?? 0;
  // last_insert_rowid()
  const row: any = db.exec("SELECT last_insert_rowid() AS id")[0]?.values?.[0];
  const lastInsertRowid = row ? Number(row[0]) : 0;
  return { changes, lastInsertRowid };
}

/**
 * 等价 `db.prepare(sql).get(bind)`：取第一行，没找到返回 null。
 */
export function getOne<T = any>(
  db: SqlJsDb,
  sql: string,
  bind: BindMap = {}
): T | null {
  const [names, values] = objectToPositionalBind(bind);
  const sqlFixed = names.length ? swapNamedToQuestion(sql, names) : sql;
  const stmt = db.prepare(sqlFixed);
  try {
    stmt.bind(values as any);
    if (!stmt.step()) return null;
    return stmt.getAsObject() as T;
  } finally {
    stmt.free();
  }
}

/**
 * 等价 `db.prepare(sql).all(bind)`：取全部行，空数组表示没数据。
 */
export function getAll<T = any>(
  db: SqlJsDb,
  sql: string,
  bind: BindMap = {}
): T[] {
  const [names, values] = objectToPositionalBind(bind);
  const sqlFixed = names.length ? swapNamedToQuestion(sql, names) : sql;
  const stmt = db.prepare(sqlFixed);
  const out: T[] = [];
  try {
    stmt.bind(values as any);
    while (stmt.step()) out.push(stmt.getAsObject() as T);
    return out;
  } finally {
    stmt.free();
  }
}

/**
 * 事务包裹：fn() 抛错会自动 ROLLBACK。
 * 支持「嵌套事务加入」：如果调用时已经在一个外层事务里，
 * 则不再 BEGIN/COMMIT，而是把 fn() 并入外层事务的作用域。
 * （sql.js / SQLite 原生不支持 SAVEPOINT 之外的 BEGIN 嵌套，
 *  这样做可以避免 runMigrations 的外层事务和 migration v3 的内层事务打架）
 */
const _txDepth = new WeakMap<any, number>();
export function runInTx<T>(db: SqlJsDb, fn: () => T): T {
  const depth = _txDepth.get(db) ?? 0;
  if (depth > 0) {
    // 已在事务中：直接执行（加入外层事务）
    _txDepth.set(db, depth + 1);
    try {
      return fn();
    } finally {
      _txDepth.set(db, depth);
    }
  }
  // 最外层：真实 BEGIN / COMMIT / ROLLBACK
  _txDepth.set(db, 1);
  db.run("BEGIN");
  try {
    const r = fn();
    db.run("COMMIT");
    _txDepth.set(db, 0);
    return r;
  } catch (err) {
    try {
      db.run("ROLLBACK");
    } catch {
      /* ignore */
    }
    _txDepth.set(db, 0);
    throw err;
  }
}

/**
 * sql.js 只支持 `?` 位置参数 / `?NNN` 编号参数，不直接支持 `@name` 命名参数。
 * 这里做一个转换：按顺序把 @name 替换成 ?1 ?2，同时按对应顺序把值放进数组。
 */
function objectToPositionalBind(bind: BindMap): [string[], unknown[]] {
  const names = Object.keys(bind);
  const values = names.map((n) => normalizeValue(bind[n]));
  return [names, values];
}

function normalizeValue(v: unknown): unknown {
  // sql.js 不支持 bigint，一律转 number
  if (typeof v === "bigint") return Number(v);
  return v;
}

function swapNamedToQuestion(sql: string, names: string[]): string {
  // 用占位符替换：把 @name 替换成 ?N（N 从 1 开始，按 names 的顺序）
  // 也兼容 :name / $name 的写法
  const placeholders: Array<{ idx: number; raw: string; name: string }> = [];
  // 匹配 @x / :x / $x ，x 以字母/下划线开头
  const re = /([@:$])([A-Za-z_][A-Za-z0-9_]*)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(sql)) !== null) {
    placeholders.push({
      idx: match.index,
      raw: match[0],
      name: match[2],
    });
  }
  if (!placeholders.length) return sql;
  // 从后往前替换，避免 idx 偏移
  let out = sql;
  placeholders.reverse().forEach((p) => {
    const n = names.indexOf(p.name);
    if (n < 0) {
      throw new Error(
        `[db] SQL 中引用了 ${p.raw} 但 bind 对象里没有 ${p.name}`
      );
    }
    out =
      out.substring(0, p.idx) + `?${n + 1}` + out.substring(p.idx + p.raw.length);
  });
  return out;
}

// ---------- 迁移 ----------
type Migration = {
  version: number;
  name: string;
  up: (db: SqlJsDb) => void;
};

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: "init_users_table",
    up: (db) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id            INTEGER PRIMARY KEY AUTOINCREMENT,
          email         TEXT    NOT NULL UNIQUE,
          role          TEXT    NOT NULL DEFAULT 'user',
          created_at    INTEGER NOT NULL DEFAULT (strftime('%s','now')),
          last_login_at INTEGER
        );
      `);
      db.run(
        `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`
      );
    },
  },
  {
    version: 2,
    name: "init_verification_codes_table",
    up: (db) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS verification_codes (
          id         INTEGER PRIMARY KEY AUTOINCREMENT,
          email      TEXT    NOT NULL,
          code       TEXT    NOT NULL,
          purpose    TEXT    NOT NULL DEFAULT 'login',
          expires_at INTEGER NOT NULL,
          used       INTEGER NOT NULL DEFAULT 0,
          created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
        );
      `);
      db.run(
        `CREATE INDEX IF NOT EXISTS idx_ver_codes_email ON verification_codes(email)`
      );
      db.run(
        `CREATE INDEX IF NOT EXISTS idx_ver_codes_purpose ON verification_codes(purpose)`
      );
      db.run(
        `CREATE INDEX IF NOT EXISTS idx_ver_codes_expires ON verification_codes(expires_at)`
      );
    },
  },
  {
    version: 3,
    name: "insert_admin_whitelist_user",
    up: (db) => {
      const admins = (process.env.ADMIN_EMAILS || process.env.SMTP_USER || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      runInTx(db, () => {
        for (const e of admins) {
          runSql(
            db,
            `INSERT OR IGNORE INTO users (email, role) VALUES (@email, 'admin')`,
            { email: e }
          );
        }
      });
    },
  },
  {
    version: 4,
    name: "init_guestbook_likes_pageviews",
    up: (db) => {
      // 留言板（软删除，is_pinned 置顶）
      db.run(`
        CREATE TABLE IF NOT EXISTS guestbook_messages (
          id         INTEGER PRIMARY KEY AUTOINCREMENT,
          uid        INTEGER NOT NULL,
          email      TEXT    NOT NULL DEFAULT '',
          nickname   TEXT    NOT NULL DEFAULT '',
          content    TEXT    NOT NULL,
          is_pinned  INTEGER NOT NULL DEFAULT 0,
          is_deleted INTEGER NOT NULL DEFAULT 0,
          created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
        );
      `);
      db.run(
        `CREATE INDEX IF NOT EXISTS idx_guestbook_created ON guestbook_messages(created_at)`
      );
      // 项目点赞（project_key + visitor_hash 唯一约束防重复点赞）
      db.run(`
        CREATE TABLE IF NOT EXISTS project_likes (
          id           INTEGER PRIMARY KEY AUTOINCREMENT,
          project_key  TEXT    NOT NULL,
          visitor_hash TEXT    NOT NULL,
          created_at   INTEGER NOT NULL DEFAULT (strftime('%s','now')),
          UNIQUE(project_key, visitor_hash)
        );
      `);
      db.run(
        `CREATE INDEX IF NOT EXISTS idx_likes_key ON project_likes(project_key)`
      );
      // 访问统计（day 为 UTC 日期字符串 YYYY-MM-DD，visitor_hash 为 IP+UA 哈希，不存原始 IP）
      db.run(`
        CREATE TABLE IF NOT EXISTS page_views (
          id           INTEGER PRIMARY KEY AUTOINCREMENT,
          day          TEXT    NOT NULL,
          visitor_hash TEXT    NOT NULL,
          path         TEXT    NOT NULL DEFAULT '/',
          created_at   INTEGER NOT NULL DEFAULT (strftime('%s','now'))
        );
      `);
      db.run(`CREATE INDEX IF NOT EXISTS idx_pv_day ON page_views(day)`);
    },
  },
];

function runMigrations(db: SqlJsDb) {
  db.run(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    INTEGER PRIMARY KEY,
      name       TEXT    NOT NULL,
      applied_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );
  `);

  const appliedRows = getAll<{ version: number }>(
    db,
    `SELECT version FROM schema_migrations ORDER BY version`
  );
  const appliedSet = new Set(appliedRows.map((r) => r.version));

  runInTx(db, () => {
    for (const m of MIGRATIONS) {
      if (appliedSet.has(m.version)) continue;
      m.up(db);
      runSql(db, `INSERT INTO schema_migrations (version, name) VALUES (@v, @n)`, {
        v: m.version,
        n: m.name,
      });
      console.log(`[db] applied migration v${m.version}: ${m.name}`);
    }
  });
}

// ---------- 便捷方法 ----------
export * as UserRepo from "./user.repo";
export * as VerificationRepo from "./verification.repo";
