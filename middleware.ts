import { NextRequest, NextResponse } from "next/server";

const EXCLUDED_PATHS = [
  "/maintenance",
  "/login",
  "/guide",
  "/api/auth/",
  "/_next",
  "/logo.jpg",
  "/favicon.ico",
  "/static",
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isExcluded = EXCLUDED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path)
  );

  if (isExcluded) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", pathname);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
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
    const sessionToken = request.cookies.get("careerous_session")?.value;
    let isAdmin = false;

    if (sessionToken) {
      try {
        const [bodyPart] = sessionToken.split(".");
        if (bodyPart) {
          const base64 = bodyPart.replace(/-/g, "+").replace(/_/g, "/");
          const decodedStr = atob(base64);
          const session = JSON.parse(decodedStr);
          
          if (
            session &&
            session.role === "ADMIN" &&
            session.expiresAt > Date.now()
          ) {
            isAdmin = true;
          }
        }
      } catch {
      }
    }

    if (!isAdmin) {
      const maintenanceUrl = new URL("/maintenance", request.url);
      return NextResponse.redirect(maintenanceUrl);
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|logo.jpg|favicon.ico).*)",
  ],
};
