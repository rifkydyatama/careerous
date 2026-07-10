import { NextResponse } from "next/server";

/**
 * Temporary debug endpoint to check Gemini API status and available models.
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

  try {
    // Let's call ModelService.ListModels to see what models are actually available for this key
    const listModelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    const listRes = await fetch(listModelsUrl);
    const listBody = await listRes.json();

    // Let's also try calling v1 endpoint for gemini-1.5-flash just in case
    const v1Url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${key}`;
    const v1Res = await fetch(v1Url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello" }] }],
      }),
    });
    const v1Body = await v1Res.json().catch(() => null);

    return NextResponse.json({
      ok: false,
      keyInfo,
      listModelsResponse: listBody,
      v1TestStatus: v1Res.status,
      v1TestResponse: v1Body,
    });
  } catch (err: unknown) {
    return NextResponse.json({
      ok: false,
      keyInfo,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
