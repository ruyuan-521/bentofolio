import { SignJWT, jwtVerify } from "jose";

export type SessionPayload = {
  uid: number;
  email: string;
  role: "admin" | "user";
};

const COOKIE_NAME = "yuanru_auth_token";
const DEFAULT_TTL = 7 * 24 * 60 * 60; // 7 天
const JWT_ALG = "HS256";

// JWT 密钥：优先 JWT_SECRET 环境变量，没有就用系统变量兜底（⚠️ 生产环境必须配置 JWT_SECRET！）
function secret() {
  const raw =
    process.env.JWT_SECRET ||
    process.env.SMTP_PASS ||
    "yuanru-fallback-secret-change-me-2026";
  return new TextEncoder().encode(raw);
}

export async function signSession(payload: SessionPayload, ttlSeconds = DEFAULT_TTL) {
  return new SignJWT(payload as unknown as { [key: string]: unknown })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .setSubject(String(payload.uid))
    .sign(secret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, secret());
    return payload ?? null;
  } catch {
    return null;
  }
}

type CookieStore = {
  set: (opts: {
    name: string;
    value: string;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "lax" | "strict" | "none" | boolean;
    path?: string;
    maxAge?: number;
  }) => void;
  get: (name: string) => { value: string } | undefined;
};

/**
 * 把 JWT 写入 HTTP-only Secure Cookie（浏览器拿不到，防 XSS）
 * cookieStore 由调用方通过 `const store = await cookies(); store` 传入，兼容 Next 15 async cookies
 */
export function setAuthCookie(
  cookieStore: CookieStore,
  token: string,
  ttlSeconds = DEFAULT_TTL
) {
  cookieStore.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ttlSeconds,
  });
}

export function clearAuthCookie(cookieStore: CookieStore) {
  cookieStore.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function readAuthCookie(cookieStore: CookieStore): string | null {
  const c = cookieStore.get(COOKIE_NAME);
  return c?.value ?? null;
}

export { COOKIE_NAME };
