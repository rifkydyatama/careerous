"use client";

import { useEffect, useState } from "react";
import { Hammer, Lock, Cpu, Sparkles, CalendarClock } from "lucide-react";
import Link from "next/link";

export default function MaintenancePage() {
  const [endsAt, setEndsAt] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetch("/api/auth/maintenance-check?t=" + Date.now(), { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.maintenanceEndsAt) setEndsAt(data.maintenanceEndsAt);
      })
      .catch(() => {});
  }, []);

  const formatEndsAt = (iso: string) => {
    try {
      return new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
        timeZoneName: "short",
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-5 text-slate-100 font-sans">
      <div className="absolute top-1/4 left-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[120px] animate-pulse" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="flex flex-col items-center text-center max-w-xl">
        <div className="relative mb-6">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-sky-500 opacity-75 blur-md animate-tilt" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-slate-800 bg-slate-900 shadow-2xl">
            <img src="/logo.jpg" alt="Logo" className="h-[74px] w-[74px] rounded-full object-cover" />
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-slate-950 border border-slate-950 shadow-md">
            <Hammer size={13} className="animate-bounce" />
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-950/40 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-blue-400">
          <Sparkles size={11} /> Mode Pemeliharaan
        </span>

        <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl leading-tight">
          Sistem Sedang <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent">Ditingkatkan</span>
        </h1>

        <p className="mt-4 text-[13.5px] leading-relaxed text-slate-400">
          Kami sedang melakukan pemeliharaan rutin dan pembaruan fitur baru untuk memberikan pengalaman terbaik bagimu.
          Sistem akan segera kembali online.
        </p>

        {isMounted && endsAt && (
          <div className="mt-8 flex items-center gap-2.5 rounded-2xl border border-slate-700/60 bg-slate-900/60 px-5 py-4 backdrop-blur-md">
            <CalendarClock size={18} className="shrink-0 text-cyan-400" />
            <div className="text-left">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Diperkirakan selesai</p>
              <p className="mt-0.5 text-[14px] font-bold text-white">{formatEndsAt(endsAt)}</p>
            </div>
          </div>
        )}

        {isMounted && !endsAt && (
          <div className="mt-8 flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/40 px-5 py-4">
            <CalendarClock size={16} className="text-slate-500" />
            <p className="text-[12px] text-slate-500">Waktu penyelesaian belum ditentukan.</p>
          </div>
        )}

        <div className="mt-10 flex flex-col items-center gap-3 text-center text-xs text-slate-500">
          <div className="flex items-center gap-2 rounded-lg border border-slate-900 bg-slate-900/40 px-4 py-2 text-[11px]">
            <Lock size={12} className="text-amber-500" />
            <span>Akses sementara dibatasi untuk siswa dan konselor.</span>
          </div>
          <p>© Careerous — Career Curiosity Platform</p>
        </div>
      </div>

      <div className="absolute bottom-5">
        <Link
          href="/login"
          className="flex items-center gap-1.5 rounded-lg border border-slate-900 bg-slate-950/80 px-3 py-1.5 text-[10.5px] font-bold text-slate-600 transition hover:border-slate-800 hover:text-slate-400 shadow-sm"
        >
          <Cpu size={12} /> Staff Portal
        </Link>
      </div>
    </main>
  );
}
