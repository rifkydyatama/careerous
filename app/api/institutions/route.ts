import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";



export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  try {
    if (id) {
      const institution = await prisma.institution.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          subscriptionActive: true,
          subscriptionExpiresAt: true,
        },
      });
      if (!institution) {
        return NextResponse.json({ error: "Institusi tidak ditemukan" }, { status: 404 });
      }
      const studentCount = await prisma.user.count({
        where: { institutionId: id, role: "STUDENT" },
      });
      return NextResponse.json({
        institution: {
          ...institution,
          subscriptionExpiresAt: institution.subscriptionExpiresAt
            ? institution.subscriptionExpiresAt.toISOString()
            : null,
          studentCount,
        },
      });
    }

    const institutions = await prisma.institution.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    return NextResponse.json({ institutions });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat institusi" }, { status: 500 });
  }
}


