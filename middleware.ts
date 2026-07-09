import { NextRequest, NextResponse } from "next/server";

// Halaman & aset yang dikecualikan dari pemeliharaan (tidak diredirect)
const EXCLUDED_PATHS = [
  "/maintenance",
  "/login",
  "/api/auth/",
  "/_next",
  "/logo.jpg",
  "/favicon.ico",
  "/static",
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Cek apakah path saat ini masuk pengecualian
  const isExcluded = EXCLUDED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path)
  );

  if (isExcluded) {
    // Teruskan x-pathname header untuk layout.tsx
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", pathname);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Panggil API internal untuk cek status maintenance secara real-time
  let isMaintenance = false;
  try {
    const origin = request.nextUrl.origin;
    const res = await fetch(`${origin}/api/auth/maintenance-check`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      isMaintenance = !!data.maintenanceMode;
    }
  } catch (err) {
    // Jika gagal fetch (misal server shutdown/booting), default ke false agar tidak mati total
  }

  if (isMaintenance) {
    // Cek apakah user yang login adalah ADMIN
    const sessionToken = request.cookies.get("careerous_session")?.value;
    let isAdmin = false;

    if (sessionToken) {
      try {
        const [bodyPart] = sessionToken.split(".");
        if (bodyPart) {
          // Edge-compatible base64url decoding menggunakan atob
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
        // Abaikan jika token rusak
      }
    }

    if (!isAdmin) {
      // Redirect ke maintenance
      const maintenanceUrl = new URL("/maintenance", request.url);
      return NextResponse.redirect(maintenanceUrl);
    }
  }

  // Set x-pathname header & teruskan
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
