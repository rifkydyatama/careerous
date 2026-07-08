import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

const LEARNING_STYLES = new Set([
  "VISUAL",
  "AUDITORY",
  "KINESTHETIC",
  "READ_WRITE",
  "MULTIMODAL",
]);

function isInt(value: unknown): value is number {
  return Number.isInteger(value);
}

function buildRiasecTop3(scores: {
  riasecRealistic: number;
  riasecInvestigative: number;
  riasecArtistic: number;
  riasecSocial: number;
  riasecEnterprising: number;
  riasecConventional: number;
}) {
  const entries: Array<[string, number]> = [
    ["Realistic", scores.riasecRealistic],
    ["Investigative", scores.riasecInvestigative],
    ["Artistic", scores.riasecArtistic],
    ["Social", scores.riasecSocial],
    ["Enterprising", scores.riasecEnterprising],
    ["Conventional", scores.riasecConventional],
  ];

  return entries
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([label]) => label)
    .join(", ");
}

function serializeAssessment(assessment: Awaited<ReturnType<typeof prisma.assessment.findFirst>>) {
  if (!assessment) {
    return null;
  }

  return {
    id: assessment.id,
    studentId: assessment.studentId,
    riasecRealistic: assessment.riasecRealistic,
    riasecInvestigative: assessment.riasecInvestigative,
    riasecArtistic: assessment.riasecArtistic,
    riasecSocial: assessment.riasecSocial,
    riasecEnterprising: assessment.riasecEnterprising,
    riasecConventional: assessment.riasecConventional,
    riasecTop3: assessment.riasecTop3,
    learningStyle: assessment.learningStyle,
    createdAt: assessment.createdAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get("studentId")?.trim() ?? "";

  if (!studentId) {
    return NextResponse.json({ error: "studentId wajib diisi" }, { status: 400 });
  }

  try {
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { role: true },
    });

    if (!student) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    if (student.role !== "STUDENT") {
      return NextResponse.json(
        { error: "User bukan siswa" },
        { status: 400 }
      );
    }

    const assessment = await prisma.assessment.findFirst({
      where: { studentId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ assessment: serializeAssessment(assessment) });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil assessment" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const studentId = typeof body?.studentId === "string" ? body.studentId : "";
  const learningStyleRaw =
    typeof body?.learningStyle === "string" ? body.learningStyle : "";
  const learningStyle = learningStyleRaw.toUpperCase();

  const scores = {
    riasecRealistic: body?.riasecRealistic,
    riasecInvestigative: body?.riasecInvestigative,
    riasecArtistic: body?.riasecArtistic,
    riasecSocial: body?.riasecSocial,
    riasecEnterprising: body?.riasecEnterprising,
    riasecConventional: body?.riasecConventional,
  };

  if (!studentId) {
    return NextResponse.json({ error: "studentId wajib diisi" }, { status: 400 });
  }

  if (!LEARNING_STYLES.has(learningStyle)) {
    return NextResponse.json(
      { error: "learningStyle tidak valid" },
      { status: 400 }
    );
  }

  for (const [key, value] of Object.entries(scores)) {
    if (!isInt(value)) {
      return NextResponse.json(
        { error: `${key} harus bilangan bulat` },
        { status: 400 }
      );
    }
  }

  try {
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { role: true },
    });

    if (!student) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    if (student.role !== "STUDENT") {
      return NextResponse.json(
        { error: "User bukan siswa" },
        { status: 400 }
      );
    }

    const assessment = await prisma.assessment.create({
      data: {
        studentId,
        riasecRealistic: scores.riasecRealistic,
        riasecInvestigative: scores.riasecInvestigative,
        riasecArtistic: scores.riasecArtistic,
        riasecSocial: scores.riasecSocial,
        riasecEnterprising: scores.riasecEnterprising,
        riasecConventional: scores.riasecConventional,
        riasecTop3:
          typeof body?.riasecTop3 === "string" && body.riasecTop3.trim()
            ? body.riasecTop3.trim()
            : buildRiasecTop3(scores),
        learningStyle: learningStyle,
      },
    });

    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menyimpan assessment" },
      { status: 500 }
    );
  }
}
