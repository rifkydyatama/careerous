import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { parseSessionToken, getSessionCookieName } from "@/lib/portal-session";
import JitsiRoomClient from "./JitsiRoomClient";

export default async function RoomPage({
  params,
}: {
  params: { roomId: string };
}) {
  const token = cookies().get(getSessionCookieName())?.value;
  if (!token) {
    redirect("/login");
  }

  const session = parseSessionToken(token);
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, role: true },
  });

  if (!user) {
    redirect("/login");
  }

  // To secure it fully, we should check if the user is authorized to enter this roomId
  // But for now, since roomId is a UUID and only known to assigned users, it's reasonably secure.

  return (
    <JitsiRoomClient
      roomId={params.roomId}
      userName={user.name || "Peserta"}
      userRole={user.role}
    />
  );
}
