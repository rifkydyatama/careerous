"use client";

import Link from "next/link";
import { Mail, ArrowLeft, ShieldQuestion } from "lucide-react";
import AuroraBackground from "../components/AuroraBackground";
import Reveal from "../components/Reveal";

export default function ForgotPasswordPage() {
  return (
    <main className="relative min-h-screen overflow-hidden font-sans text-slate-900">
      <AuroraBackground />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between rounded-full border border-slate-200/80 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-white shadow-md flex items-center justify-center shrink-0">
              <img src="/logo.jpg" alt="Logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-600">
                Careerous
              </p>
              <h1 className="text-sm font-bold text-slate-900">Lupa Kata Sandi</h1>
            </div>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft size={14} /> Kembali ke Login
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <Reveal>
            <section className="relative w-full max-w-lg">
              <div className="absolute -inset-3 -z-10 rounded-[36px] bg-gradient-to-br from-blue-400/20 via-sky-400/15 to-cyan-300/15 blur-2xl glow-pulse" />
              <div className="glass rounded-[30px] p-8 shadow-xl shadow-blue-500/10 sm:p-10">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/30">
                    <ShieldQuestion size={28} />
                  </div>

                  <h2 className="mt-6 text-2xl font-black text-slate-900">
                    Lupa Kata Sandi?
                  </h2>
                  <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-slate-600">
                    Untuk keamanan akunmu, reset kata sandi dilakukan oleh <b>Administrator</b> atau <b>Konselor/Guru BK</b> di sekolahmu.
                  </p>

                  <div className="mt-6 w-full rounded-2xl border border-blue-200 bg-blue-50 p-5">
                    <div className="flex items-center justify-center gap-2 text-[13px] font-bold text-blue-800">
                      <Mail size={16} /> Langkah-langkah:
                    </div>
                    <ol className="mt-3 space-y-2 text-left text-[13px] text-blue-700">
                      <li className="flex gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-[10px] font-extrabold text-blue-800">1</span>
                        Hubungi guru BK atau admin sekolahmu.
                      </li>
                      <li className="flex gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-[10px] font-extrabold text-blue-800">2</span>
                        Sampaikan email akun yang terdaftar.
                      </li>
                      <li className="flex gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-[10px] font-extrabold text-blue-800">3</span>
                        Admin akan mereset kata sandimu dari panel.
                      </li>
                      <li className="flex gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-[10px] font-extrabold text-blue-800">4</span>
                        Login dengan kata sandi baru yang diberikan.
                      </li>
                    </ol>
                  </div>

                  <Link
                    href="/login"
                    className="btn-glow mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold text-white"
                  >
                    <ArrowLeft size={16} /> Kembali ke Halaman Login
                  </Link>
                </div>
              </div>
            </section>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
