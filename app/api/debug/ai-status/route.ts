import { NextResponse } from "next/server";

/**
 * Debug endpoint — ONLY for troubleshooting. Remove after issue is resolved.
 * Hit: GET /api/debug/ai-status
 */
export async function GET() {
  const key = process.env.OPENAI_API_KEY?.trim() ?? "";

  const keyInfo = {
    detected: Boolean(key),
    prefix: key ? key.slice(0, 10) + "..." : "NOT SET",
    length: key.length,
  };

  if (!key) {
    return NextResponse.json({
      ok: false,
      keyInfo,
      error: "OPENAI_API_KEY tidak terdeteksi di environment Vercel",
    });
  }

  // Test call — minimal tokens
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: 'Balas dengan JSON: {"status":"ok"}',
          },
        ],
        max_tokens: 20,
        temperature: 0,
      }),
    });

    const body = await res.json();

    if (!res.ok) {
      return NextResponse.json({
        ok: false,
        keyInfo,
        httpStatus: res.status,
        openaiError: body,
      });
    }

    const content = body?.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({
      ok: true,
      keyInfo,
      httpStatus: res.status,
      openaiResponse: content,
      model: body?.model,
    });
  } catch (err: unknown) {
    return NextResponse.json({
      ok: false,
      keyInfo,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
