import { NextResponse } from "next/server";

/**
 * Temporary debug endpoint to check Gemini API status and find a model that has quota.
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
      error: "GEMINI_API_KEY tidak terdeteksi di environment Vercel.",
    });
  }

  // Models to test
  const candidateModels = [
    "gemini-flash-latest",
    "gemini-2.5-flash",
    "gemini-2.0-flash-lite",
    "gemini-3.1-flash-lite",
  ];

  const results: any[] = [];

  for (const model of candidateModels) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const res = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Hi, reply with exactly the word OK" }] }],
        }),
      });

      const body = await res.json();
      results.push({
        model,
        ok: res.ok,
        status: res.status,
        response: body,
      });
    } catch (err: any) {
      results.push({
        model,
        ok: false,
        error: err.message,
      });
    }
  }

  return NextResponse.json({
    ok: results.some((r) => r.ok),
    keyInfo,
    testResults: results,
  });
}
