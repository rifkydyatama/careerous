import { NextResponse } from "next/server";

/**
 * Temporary debug endpoint to check Gemini API status.
 * Hit: GET /api/debug/ai-status
 */
export async function GET() {
  const key = process.env.GEMINI_API_KEY?.trim() ?? "";

  const keyInfo = {
    detected: Boolean(key),
    prefix: key ? key.slice(0, 10) + "..." : "NOT SET",
    length: key.length,
  };

  if (!key) {
    return NextResponse.json({
      ok: false,
      keyInfo,
      error: "GEMINI_API_KEY tidak terdeteksi di environment Vercel. Pastikan Anda sudah menambahkannya di Settings -> Environment Variables dan melakukan redeploy.",
    });
  }

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
    const res = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello, reply with status OK." }] }],
      }),
    });

    const body = await res.json();

    if (!res.ok) {
      return NextResponse.json({
        ok: false,
        keyInfo,
        httpStatus: res.status,
        geminiError: body,
      });
    }

    return NextResponse.json({
      ok: true,
      keyInfo,
      httpStatus: res.status,
      geminiResponse: body,
    });
  } catch (err: unknown) {
    return NextResponse.json({
      ok: false,
      keyInfo,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
