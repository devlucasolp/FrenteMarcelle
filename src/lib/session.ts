// Signed session cookie (HMAC-SHA256 via Web Crypto, so it also runs in proxy.ts).

export const COOKIE = "portal_session";
const MAX_AGE_S = 60 * 60 * 24 * 30;

export type Sessao = { papel: "cliente"; slug: string; exp: number } | { papel: "admin"; exp: number };

const enc = new TextEncoder();

function segredo(): string {
  const s = process.env.SESSION_SECRET;
  if (!s && process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET not set");
  return s ?? "dev-only-secret-change-me";
}

const b64url = (buf: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const fromB64url = (s: string) =>
  Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

async function chave() {
  return crypto.subtle.importKey("raw", enc.encode(segredo()), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

type SemExp<T> = T extends unknown ? Omit<T, "exp"> : never;

export async function assinar(dados: SemExp<Sessao>): Promise<string> {
  const payload = b64url(enc.encode(JSON.stringify({ ...dados, exp: Date.now() + MAX_AGE_S * 1000 })));
  const sig = await crypto.subtle.sign("HMAC", await chave(), enc.encode(payload));
  return `${payload}.${b64url(sig)}`;
}

export async function verificar(token: string | undefined): Promise<Sessao | null> {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await chave(), fromB64url(sig), enc.encode(payload));
    if (!ok) return null;
    const sessao = JSON.parse(new TextDecoder().decode(fromB64url(payload))) as Sessao;
    return sessao.exp > Date.now() ? sessao : null;
  } catch {
    return null;
  }
}

export const cookieOpcoes = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_S,
};
