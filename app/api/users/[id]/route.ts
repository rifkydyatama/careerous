import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  const { id: userId } = await params;
  if (!userId) {
    return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
