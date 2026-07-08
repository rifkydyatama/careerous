import {
  createHmac,
  pbkdf2,
  randomBytes,
  timingSafeEqual,
} from "crypto";
import { promisify } from "util";
import type { PortalRole } from "./portal-auth";

const pbkdf2Async = promisify(pbkdf2);

const PASSWORD_ITERATIONS = 210000;
const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_DIGEST = "sha512";
const SESSION_COOKIE_NAME = "careerous_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const FALLBACK_AUTH_SECRET = "careerous-development-secret";

export type AuthSession = {
  userId: string;
  role: PortalRole;
  expiresAt: number;
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET?.trim();

  // Di produksi, menandatangani session dengan secret dev yang hardcoded = siapa pun
  // bisa memalsukan token (termasuk ADMIN). Wajib gagal keras bila belum di-set.
  if (process.env.NODE_ENV === "production" && (!secret || secret === FALLBACK_AUTH_SECRET)) {
    throw new Error(
      "AUTH_SECRET wajib di-set di produksi (tidak boleh kosong atau memakai secret dev bawaan)."
    );
  }

  return secret || FALLBACK_AUTH_SECRET;
}

function toBase64Url(value: Buffer) {
  return value.toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url");
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const derived = (await pbkdf2Async(
    password,
    salt,
    PASSWORD_ITERATIONS,
    PASSWORD_KEY_LENGTH,
    PASSWORD_DIGEST
  )) as Buffer;

  return `pbkdf2$${PASSWORD_ITERATIONS}$${salt}$${toBase64Url(derived)}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, iterationRaw, salt, encodedHash] = storedHash.split("$");

  if (algorithm !== "pbkdf2" || !iterationRaw || !salt || !encodedHash) {
    return false;
  }

  const iterations = Number.parseInt(iterationRaw, 10);
  if (!Number.isInteger(iterations) || iterations <= 0) {
    return false;
  }

  const derived = (await pbkdf2Async(
    password,
    salt,
    iterations,
    PASSWORD_KEY_LENGTH,
    PASSWORD_DIGEST
  )) as Buffer;
  const expected = fromBase64Url(encodedHash);

  if (expected.length !== derived.length) {
    return false;
  }

  return timingSafeEqual(derived, expected);
}

function sign(value: string) {
  return createHmac("sha256", getAuthSecret()).update(value).digest("base64url");
}

export function createSessionToken(session: AuthSession) {
  const body = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = sign(body);
  return `${body}.${signature}`;
}

export function parseSessionToken(token: string): AuthSession | null {
  const [body, signature] = token.split(".");

  if (!body || !signature) {
    return null;
  }

  const expectedSignature = sign(body);
  if (signature.length !== expectedSignature.length) {
    return null;
  }

  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as AuthSession;
    if (
      !session ||
      typeof session.userId !== "string" ||
      typeof session.role !== "string" ||
      typeof session.expiresAt !== "number"
    ) {
      return null;
    }

    if (Date.now() > session.expiresAt) {
      return null;
    }

    if (
      session.role !== "STUDENT" &&
      session.role !== "COUNSELOR" &&
      session.role !== "ADMIN"
    ) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function buildSessionCookie(token: string) {
  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export function clearSessionCookie() {
  return {
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

export function createSessionForUser(userId: string, role: PortalRole) {
  const session: AuthSession = {
    userId,
    role,
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };

  return createSessionToken(session);
}