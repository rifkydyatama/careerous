import { NextRequest, NextResponse } from "next/server";

const EXCLUDED_PATHS = [
  "/maintenance",
  "/admin-access",
  "/login",
  "/guide",
  "/api/auth/",
  "/_next",
  "/logo.jpg",
  "/favicon.ico",
  "/static",
];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isExcluded = EXCLUDED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path)
  );

  if (isExcluded) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", pathname);
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  let isMaintenance = false;
  try {
    const origin = request.nextUrl.origin;
    const res = await fetch(`${origin}/api/auth/maintenance-check?t=${Date.now()}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      isMaintenance = !!data.maintenanceMode;
    }
  } catch (err) {
  }

  if (isMaintenance) {
    const expectedToken = process.env.AUTH_SECRET
      ? Buffer.from(`admin-bypass:${process.env.AUTH_SECRET}`).toString("base64url").slice(0, 32)
      : "admin-bypass-token";

    const bypassCookie = request.cookies.get("careerous_maintenance_bypass")?.value;
    const hasValidBypass = bypassCookie === expectedToken;

    if (!hasValidBypass) {
      const maintenanceUrl = new URL("/maintenance", request.url);
      return NextResponse.redirect(maintenanceUrl);
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|logo.jpg|favicon.ico).*)",
  ],
};
