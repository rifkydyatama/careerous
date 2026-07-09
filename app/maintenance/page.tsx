"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Hammer, Lock, ShieldAlert, Cpu, Sparkles } from "lucide-react";

const TARGET_DATE = new Date("2026-07-16T12:00:00Z").getTime();

export default function MaintenancePage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const updateTimer = () => {
      const now = Date.now();
      const difference = TARGET_DATE - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-5 text-slate-100 font-sans">
      {/* GLOW BACKGROUND EFFECT */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[120px] animate-pulse" />

      {/* DECORATIVE GRID */}
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* HEADER LOGO */}
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
          Kami sedang melakukan pemeliharaan rutin dan pembaruan fitur baru untuk memberikan pengalaman terbaik bagimu. Sistem akan segera kembali online dalam:
        </p>
      </div>

      {/* COUNTDOWN TIMER */}
      {isMounted && (
        <div className="mt-10 grid grid-cols-4 gap-3 sm:gap-4 max-w-lg w-full">
          <CountdownCard value={timeLeft.days} label="Hari" />
          <CountdownCard value={timeLeft.hours} label="Jam" />
          <CountdownCard value={timeLeft.minutes} label="Menit" />
          <CountdownCard value={timeLeft.seconds} label="Detik" />
        </div>
      )}

      {/* FOOTER INFO */}
      <div className="mt-12 flex flex-col items-center gap-3 text-center text-xs text-slate-500">
        <div className="flex items-center gap-2 rounded-lg border border-slate-900 bg-slate-900/40 px-4 py-2 text-[11px]">
          <Lock size={12} className="text-amber-500" />
          <span>Akses sementara dibatasi untuk siswa dan konselor.</span>
        </div>
        <p className="mt-2">© Careerous — Career Curiosity Platform</p>
      </div>

      {/* STAFF PORTAL SECRET LINK */}
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


function CountdownCard({ value, label }: { value: number; label: string }) {
  const formattedValue = String(value).padStart(2, "0");

  return (
    <div className="relative flex flex-col items-center rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl backdrop-blur-md">
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-mono tracking-tight glow-blue">
        {formattedValue}
      </span>
      <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
    </div>
  );
}
