import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireRole } from "../../../../lib/auth-guard";
import { ensureModuleContents } from "../../../../lib/module-content";
import { TOTAL_MODULES } from "../../../../lib/modules";

// GET /api/admin/modules — daftar konten 12 modul (admin only).
export async function GET(request: NextRequest) {
  if (!requireRole(request, "ADMIN")) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }
  try {
    await ensureModuleContents();
    const modules = await prisma.moduleContent.findMany({
      orderBy: { number: "asc" },
      select: { number: true, title: true, prompt: true, phaseLabel: true },
    });
    return NextResponse.json({ modules });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat modul" }, { status: 500 });
  }
}

// PATCH /api/admin/modules — ubah judul/prompt satu modul. body: { number, title, prompt }
export async function PATCH(request: NextRequest) {
  if (!requireRole(request, "ADMIN")) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const number = Number.isInteger(body?.number) ? body.number : null;
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";

  if (!number || number < 1 || number > TOTAL_MODULES) {
    return NextResponse.json({ error: "Nomor modul harus 1-12" }, { status: 400 });
  }
  if (!title || !prompt) {
    return NextResponse.json({ error: "Judul dan prompt wajib diisi" }, { status: 400 });
  }

  try {
    await ensureModuleContents();
    const updated = await prisma.moduleContent.update({
      where: { number },
      data: { title, prompt },
      select: { number: true, title: true, prompt: true, phaseLabel: true },
    });
    return NextResponse.json({ module: updated });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui modul" }, { status: 500 });
  }
}
