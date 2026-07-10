import { prisma } from "./prisma";

/**
 * Automatically assigns a student to a counselor in their school.
 * It selects the counselor with the fewest assigned students at that institution (load balancing).
 */
export async function autoAssignCounselor(studentId: string, institutionId: string): Promise<string | null> {
  try {
    // 1. Find all counselors in the institution
    const counselors = await prisma.user.findMany({
      where: {
        role: "COUNSELOR",
        institutionId: institutionId,
      },
      select: {
        id: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    if (counselors.length === 0) {
      return null;
    }

    // 2. Sort counselors by student count (lowest first)
    counselors.sort((a, b) => a._count.students - b._count.students);

    const selectedCounselor = counselors[0];

    // 3. Assign the student to this counselor
    await prisma.user.update({
      where: { id: studentId },
      data: { counselorId: selectedCounselor.id },
    });

    return selectedCounselor.id;
  } catch (error) {
    console.error("Failed to auto-assign counselor:", error);
    return null;
  }
}

/**
 * Re-allocates all students in an institution to load-balance across all counselors.
 * Useful if counselors change or new counselors join.
 */
export async function reallocateInstitutionStudents(institutionId: string): Promise<void> {
  try {
    const counselors = await prisma.user.findMany({
      where: { role: "COUNSELOR", institutionId },
      select: { id: true },
    });

    if (counselors.length === 0) return;

    const students = await prisma.user.findMany({
      where: { role: "STUDENT", institutionId },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });

    if (students.length === 0) return;

    // Distribute students evenly in round-robin fashion
    for (let i = 0; i < students.length; i++) {
      const counselor = counselors[i % counselors.length];
      await prisma.user.update({
        where: { id: students[i].id },
        data: { counselorId: counselor.id },
      });
    }
  } catch (error) {
    console.error("Failed to reallocate students:", error);
  }
}
