import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { parseSessionToken, getSessionCookieName } from "@/lib/portal-session";
import JitsiRoomClient from "./JitsiRoomClient";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  if (!token) {
    redirect("/login");
  }

  const session = parseSessionToken(token);
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, role: true, email: true },
  });

  if (!user) {
    redirect("/login");
  }

  
  

  return (
    <JitsiRoomClient
      roomId={roomId}
      userName={user.name || "Peserta"}
      userEmail={user.email || ""}
      userRole={user.role}
    />
  );
}
