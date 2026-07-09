import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getSession } from "../../../../lib/auth-guard";

export async function GET(request: NextRequest) {
  const session = getSession(request);
  if (!session || session.role !== "COUNSELOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const counselor = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { institutionId: true },
  });

  if (!counselor?.institutionId) {
    return NextResponse.json({ error: "Sekolah tidak terasosiasi" }, { status: 400 });
  }

  try {
    const deadlines = await prisma.institutionModuleDeadline.findMany({
      where: { institutionId: counselor.institutionId },
      orderBy: { moduleNumber: "asc" },
    });

    return NextResponse.json({ deadlines });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat batas waktu" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = getSession(request);
  if (!session || session.role !== "COUNSELOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const counselor = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { institutionId: true },
  });

  if (!counselor?.institutionId) {
    return NextResponse.json({ error: "Sekolah tidak terasosiasi" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const moduleNumber = parseInt(body.moduleNumber, 10);
    const deadlineAtStr = body.deadlineAt;

    if (isNaN(moduleNumber) || moduleNumber < 1 || moduleNumber > 12) {
      return NextResponse.json({ error: "Nomor modul harus 1-12" }, { status: 400 });
    }

    const deadlineAt = deadlineAtStr ? new Date(deadlineAtStr) : null;

    const upserted = await prisma.institutionModuleDeadline.upsert({
      where: {
        institutionId_moduleNumber: {
          institutionId: counselor.institutionId,
          moduleNumber,
        },
      },
      create: {
        institutionId: counselor.institutionId,
        moduleNumber,
        deadlineAt,
      },
      update: {
        deadlineAt,
      },
    });

    return NextResponse.json({ success: true, deadline: upserted });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan batas waktu" }, { status: 500 });
  }
}
