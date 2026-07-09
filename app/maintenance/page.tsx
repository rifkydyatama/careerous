"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Wrench, Zap, Shield, Clock } from "lucide-react";

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
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#020817] px-5 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(56,189,248,0.12),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_80%_100%,rgba(99,102,241,0.08),transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-[600px] bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full">

        <div className="relative mb-10">
          <div className="absolute inset-0 rounded-full bg-sky-500/20 blur-3xl scale-150" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-sm ring-1 ring-sky-500/20">
            <img
              src="/logo.jpg"
              alt="Careerous"
              className="h-20 w-20 rounded-xl object-cover"
            />
            <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-slate-900 shadow-lg ring-2 ring-[#020817]">
              <Wrench size={14} className="animate-spin" style={{ animationDuration: "3s" }} />
            </span>
          </div>
        </div>

        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-sky-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sky-500" />
          </span>
          Sedang dalam Pemeliharaan
        </div>

        <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
          Kami Sedang
          <span className="block mt-1 bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Meningkatkan Sistem
          </span>
        </h1>

        <p className="mt-5 max-w-lg text-[14px] leading-relaxed text-slate-400">
          Tim kami sedang bekerja keras melakukan pembaruan dan peningkatan fitur.
          Platform akan segera kembali tersedia lebih baik dari sebelumnya.
        </p>

        {isMounted && endsAt && (
          <div className="mt-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/8 bg-white/5 backdrop-blur-md">
            <div className="border-b border-white/8 px-5 py-3 flex items-center gap-2">
              <CalendarClock size={14} className="text-sky-400" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Diperkirakan Selesai</span>
            </div>
            <div className="px-5 py-4">
              <p className="text-[16px] font-bold text-white">{formatEndsAt(endsAt)}</p>
            </div>
          </div>
        )}

        {isMounted && !endsAt && (
          <div className="mt-10 flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-6 py-4 backdrop-blur-md">
            <Clock size={16} className="shrink-0 text-slate-500" />
            <p className="text-[13px] text-slate-500">Waktu selesai sedang ditentukan oleh tim kami.</p>
          </div>
        )}

        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-[12px] text-slate-600">
          <div className="flex items-center gap-2">
            <Shield size={13} className="text-slate-600" />
            <span>Data Anda aman</span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <Zap size={13} className="text-slate-600" />
            <span>Akan kembali segera</span>
          </div>
        </div>

        <p className="mt-10 text-[11px] text-slate-700">
          © 2025 Careerous — Career Curiosity Platform
        </p>
      </div>
    </main>
  );
}
