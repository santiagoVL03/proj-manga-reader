import { cookies } from "next/headers";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

export type Session = {
  sub: string;
  name: string;
  exp: number; // segundos UNIX
};

function getSecretKey(): Uint8Array<ArrayBuffer> {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error(
      "Falta AUTH_SECRET. Añádela a .env.local (por ejemplo: `openssl rand -hex 32`).",
    );
  }

  return new TextEncoder().encode(secret);
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");

  return Uint8Array.from(
    atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "=")),
    (char) => char.charCodeAt(0),
  );
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    getSecretKey(),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** Firma el payload y devuelve el token `cuerpo.firma`. */
export async function signSession(
  payload: Pick<Session, "sub" | "name">,
  maxAgeSeconds = SESSION_MAX_AGE,
): Promise<string> {
  const session: Session = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
  };

  const body = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify(session)),
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(),
    new TextEncoder().encode(body),
  );

  return `${body}.${base64UrlEncode(new Uint8Array(signature))}`;
}

/** Devuelve la sesión si la firma es válida y no ha expirado. */
export async function verifySession(
  token: string | undefined,
): Promise<Session | null> {
  if (!token) {
    return null;
  }

  const [body, signature] = token.split(".");

  if (!body || !signature) {
    return null;
  }

  let isValid = false;

  try {
    isValid = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(),
      base64UrlDecode(signature),
      new TextEncoder().encode(body),
    );
  } catch {
    return null;
  }

  if (!isValid) {
    return null;
  }

  try {
    const session = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(body)),
    ) as Session;

    if (typeof session.exp !== "number" || session.exp * 1000 < Date.now()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/** Escribe la cookie httpOnly con el token firmado. Solo en el servidor. */
export async function createSession(
  user: { id: string; name: string },
  maxAgeSeconds = SESSION_MAX_AGE,
): Promise<void> {
  const token = await signSession(
    { sub: user.id, name: user.name },
    maxAgeSeconds,
  );
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

/** Lee y verifica la cookie de la petición actual. */
export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  return verifySession(token);
}

/** Borra la cookie (logout). */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE);
}
