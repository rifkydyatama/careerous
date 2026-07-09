"use client";

import { useEffect, useState } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function JitsiRoomClient({
  roomId,
  userName,
  userEmail,
  userRole,
}: {
  roomId: string;
  userName: string;
  userEmail: string;
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
    <div className="relative h-screen w-full bg-black">
      {/* Overlay Mask for Jitsi Watermark */}
      <div className="absolute left-0 top-0 z-[100] flex h-[80px] w-[250px] items-start p-4">
        <div className="flex items-center gap-2 rounded-lg bg-black/50 px-3 py-1.5 backdrop-blur-md">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#2563eb] text-[10px] font-bold text-white shadow-sm">
            CR
          </div>
          <span className="text-[13px] font-bold tracking-wide text-white">Careerous Meet</span>
        </div>
      </div>
      
      <JitsiMeeting
        domain="meet.guifi.net"
        roomName={`careerous-room-${roomId}`}
        configOverwrite={{
          startWithAudioMuted: true,
          startWithVideoMuted: false,
          disableModeratorIndicator: true,
          enableEmailInStats: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true, // Mencegah promosi download aplikasi Jitsi di HP
          hideConferenceSubject: true, // Menyembunyikan judul rapat (opsional, karena ada overlay kita)
          hideConferenceTimer: false,
          toolbarButtons: [
            'microphone', 'camera', 'desktop', 'fullscreen',
            'hangup', 'profile', 'chat', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'tileview', 'videobackgroundblur',
            'mute-everyone'
            // Menghilangkan tombol 'invite', 'help', 'feedback', dsb agar tidak terlihat dari pihak ke-3
          ],
        }}
        interfaceConfigOverwrite={{
          APP_NAME: "Careerous Meet",
          NATIVE_APP_NAME: "Careerous Meet",
          PROVIDER_NAME: "Careerous",
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          SHOW_JITSI_WATERMARK: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          DEFAULT_LOGO_URL: "",
          DEFAULT_WELCOME_PAGE_LOGO_URL: "",
          HIDE_INVITE_MORE_HEADER: true,
        }}
        userInfo={{
          displayName: userName,
          email: userEmail,
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
