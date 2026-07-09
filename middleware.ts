import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    // Jalankan middleware untuk semua path
    "/((?!_next/static|_next/image|logo.jpg|favicon.ico).*)",
  ],
};
