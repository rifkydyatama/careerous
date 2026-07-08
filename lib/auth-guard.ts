// Helper proteksi role untuk route handler (terutama API admin).
import { NextRequest } from "next/server";
import { getSessionCookieName, parseSessionToken, AuthSession } from "./portal-session";
import type { PortalRole } from "./portal-auth";

// Mengembalikan session bila valid & rolenya sesuai; null bila tidak.
export function getSession(request: NextRequest): AuthSession | null {
  const token = request.cookies.get(getSessionCookieName())?.value;
  if (!token) return null;
  return parseSessionToken(token);
}

export function requireRole(
  request: NextRequest,
  role: PortalRole
): AuthSession | null {
  const session = getSession(request);
  if (!session || session.role !== role) return null;
  return session;
}
