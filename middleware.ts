import { NextRequest, NextResponse } from "next/server";

const MAINTENANCE_MODE = true;

// Halaman & aset yang dikecualikan dari pemeliharaan (tidak diredirect)
const EXCLUDED_PATHS = [
  "/maintenance",
  "/login",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/me",
  "/_next",
  "/logo.jpg",
  "/favicon.ico",
  "/static",
];

export function middleware(request: NextRequest) {
  if (!MAINTENANCE_MODE) {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;

  // Cek apakah path saat ini masuk pengecualian
  const isExcluded = EXCLUDED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path)
  );

  if (isExcluded) {
    return NextResponse.next();
  }

  // Baca cookie session
  const sessionToken = request.cookies.get("careerous_session")?.value;

  if (sessionToken) {
    try {
      const [bodyPart] = sessionToken.split(".");
      if (bodyPart) {
        // Decode base64url payload
        const decodedStr = Buffer.from(bodyPart, "base64").toString("utf8");
        const session = JSON.parse(decodedStr);

        // Jika user adalah ADMIN dan session belum kedaluwarsa, izinkan bypass maintenance
        if (
          session &&
          session.role === "ADMIN" &&
          session.expiresAt > Date.now()
        ) {
          return NextResponse.next();
        }
      }
    } catch {
      // Abaikan error decoding, lanjut redirect ke maintenance
    }
  }

  // Redirect semua non-admin & tamu ke halaman maintenance
  const maintenanceUrl = new URL("/maintenance", request.url);
  return NextResponse.redirect(maintenanceUrl);
}

export const config = {
  // Jalankan middleware untuk semua path kecuali file static eksternal di public
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes, but we explicitly handle some in EXCLUDED_PATHS)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo.jpg (logo file)
     */
    "/((?!_next/static|_next/image|logo.jpg|favicon.ico).*)",
  ],
};
