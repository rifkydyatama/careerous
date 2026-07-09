import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");

  const expectedToken = process.env.AUTH_SECRET
    ? Buffer.from(`admin-bypass:${process.env.AUTH_SECRET}`).toString("base64url").slice(0, 32)
    : "admin-bypass-token";

  if (!key || key !== expectedToken) {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  const response = NextResponse.redirect(new URL("/admin", request.url));
  response.cookies.set("careerous_maintenance_bypass", expectedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
    path: "/",
  });

  return response;
}
