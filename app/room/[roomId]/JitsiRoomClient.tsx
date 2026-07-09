"use client";

import { useEffect, useState } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function JitsiRoomClient({
  roomId,
  userName,
  userRole,
}: {
  roomId: string;
  userName: string;
  userRole: string;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin" size={40} />
          <p className="text-sm font-semibold">Memuat Video Call...</p>
        </div>
      </div>
    );
  }

  const handleApiReady = (apiObj: any) => {
    // Optionally listen to events
    apiObj.addListener("videoConferenceLeft", () => {
      // Redirect back when user leaves
      if (userRole === "COUNSELOR") {
        router.push("/counselor/program");
      } else {
        // assume STUDENT
        // we can't easily know student id from here but let's just go to dashboard
        router.push("/dashboard");
      }
    });
  };

  return (
    <div className="h-screen w-full bg-black">
      <JitsiMeeting
        domain="meet.jit.si"
        roomName={`careerous-room-${roomId}`}
        configOverwrite={{
          startWithAudioMuted: true,
          startWithVideoMuted: false,
          disableModeratorIndicator: true,
          enableEmailInStats: false,
          prejoinPageEnabled: false,
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          SHOW_JITSI_WATERMARK: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          DEFAULT_LOGO_URL: "",
          DEFAULT_WELCOME_PAGE_LOGO_URL: "",
        }}
        userInfo={{
          displayName: userName,
        }}
        onApiReady={handleApiReady}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = "100%";
          iframeRef.style.width = "100%";
          iframeRef.style.border = "none";
        }}
      />
    </div>
  );
}
