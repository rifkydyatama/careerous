import { NextRequest, NextResponse } from "next/server";
import { processAllDeadlines } from "../../../../lib/deadlines";

// Endpoint background job/cron untuk memproses deadline seluruh siswa.
// Bila CRON_SECRET di-set, wajib menyertakan header `x-cron-secret` yang cocok.
// Bila tidak di-set (mis. demo), endpoint terbuka.
async function handle(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) {
    // Vercel Cron mengirim `Authorization: Bearer <CRON_SECRET>`. Panggilan manual
    // boleh memakai header `x-cron-secret`. Terima keduanya.
    const bearer = request.headers.get("authorization");
    const provided = request.headers.get("x-cron-secret") ?? (
      bearer?.startsWith("Bearer ") ? bearer.slice(7) : null
    );
    if (provided !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await processAllDeadlines();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memproses deadline" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
