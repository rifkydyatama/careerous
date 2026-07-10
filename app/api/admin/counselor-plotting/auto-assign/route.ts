import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { autoAssignCounselor } from "@/lib/counselor-assignment";

export async function POST(request: NextRequest) {
  if (!requireRole(request, "ADMIN")) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  try {
    // Find all students with an institution but no counselor assigned
    const unassignedStudents = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        institutionId: { not: null },
        counselorId: null,
      },
      select: {
        id: true,
        institutionId: true,
      },
    });

    let assignedCount = 0;

    for (const student of unassignedStudents) {
      if (student.institutionId) {
        const assigned = await autoAssignCounselor(student.id, student.institutionId);
        if (assigned) {
          assignedCount += 1;
        }
      }
    }

    return NextResponse.json({
      success: true,
      assignedCount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal melakukan plotting otomatis" },
      { status: 500 }
    );
  }
}
