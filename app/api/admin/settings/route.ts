import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireRole } from "../../../../lib/auth-guard";
import { ensureModuleContents } from "../../../../lib/module-content";
import { TOTAL_MODULES } from "../../../../lib/modules";


export async function GET(request: NextRequest) {
  if (!requireRole(request, "ADMIN")) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }
  try {
    await ensureModuleContents();
    const rows = await prisma.moduleContent.findMany({
      orderBy: { number: "asc" },
      select: { number: true, title: true, phaseLabel: true, deadlineAt: true },
    });
    const modules = rows.map((m) => ({
      number: m.number,
      title: m.title,
      phaseLabel: m.phaseLabel,
      deadlineAt: m.deadlineAt ? m.deadlineAt.toISOString() : null,
    }));
    return NextResponse.json({ modules });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat pengaturan" }, { status: 500 });
  }
}


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
  if (!number || number < 1 || number > TOTAL_MODULES) {
    return NextResponse.json({ error: "Nomor modul harus 1-12" }, { status: 400 });
  }

  
  let deadlineAt: Date | null = null;
  if (body?.deadlineAt != null) {
    const parsed = new Date(body.deadlineAt);
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json({ error: "Tanggal tidak valid" }, { status: 400 });
    }
    deadlineAt = parsed;
  }

  try {
    await ensureModuleContents();
    const updated = await prisma.moduleContent.update({
      where: { number },
      data: { deadlineAt },
      select: { number: true, title: true, phaseLabel: true, deadlineAt: true },
    });
    return NextResponse.json({
      module: {
        number: updated.number,
        title: updated.title,
        phaseLabel: updated.phaseLabel,
        deadlineAt: updated.deadlineAt ? updated.deadlineAt.toISOString() : null,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan pengaturan" }, { status: 500 });
  }
}
