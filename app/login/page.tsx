"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import {
  ArrowRight,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { LOGIN_ROLE_OPTIONS, type PortalRole } from "../../lib/portal-auth";

async function readApiError(response: Response, fallback: string) {
  try {
    const payload = await response.json().catch(() => null);
    if (payload && typeof payload.error === "string" && payload.error.trim()) {
      return payload.error;
    }
  } catch {
    // Fall through to the fallback message.
  }

  return fallback;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<PortalRole>("STUDENT");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedRole = useMemo(
    () => LOGIN_ROLE_OPTIONS.find((item) => item.value === role),
    [role]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMessage("Email wajib diisi.");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("Kata sandi wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmedEmail, role, password }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, "Gagal melakukan login"));
      }

      const payload = (await response.json()) as { redirectTo?: string };
      router.push(payload.redirectTo ?? "/");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal melakukan login"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#07111F] font-sans text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,200,66,0.18),transparent_30%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.24),transparent_30%),linear-gradient(180deg,_#07111F_0%,_#081628_45%,_#040B14_100%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-6 sm:px-8 lg:px-10">
        <div className="mb-8 flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#F5C842]">
              Universitas Negeri Malang
            </p>
            <h1 className="text-sm font-semibold text-white">Masuk ke Careerous Portal</h1>
          </div>
          <Link
            href="/"
            className="text-xs font-semibold text-white/70 transition hover:text-white"
          >
            Kembali ke beranda
          </Link>
        </div>

        <div className="grid flex-1 gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <section className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#F5C842]/20 bg-[#F5C842]/10 px-3 py-1 text-[11px] font-semibold text-[#F5C842]">
              <Sparkles size={13} />
              Akses sesuai peran
            </div>
            <h2 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Masuk dengan akun yang sudah terdaftar.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              Pilih peran yang sesuai, lalu gunakan email dan kata sandi terdaftar untuk masuk.
              Setelah berhasil login, sistem akan mengarahkan Anda ke halaman yang
              tepat sesuai peran masing-masing.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                <Mail size={16} className="text-[#F5C842]" />
                <p className="mt-3 text-sm font-semibold text-white">Email aktif</p>
                <p className="mt-1 text-xs text-slate-400">Dipakai sebagai identitas akun.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                <UserRound size={16} className="text-[#F5C842]" />
                <p className="mt-3 text-sm font-semibold text-white">Peran jelas</p>
                <p className="mt-1 text-xs text-slate-400">Siswa / siswa atau konselor.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                <ShieldCheck size={16} className="text-[#F5C842]" />
                <p className="mt-3 text-sm font-semibold text-white">Akses rapi</p>
                <p className="mt-1 text-xs text-slate-400">Masuk ke halaman yang relevan.</p>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/40">
                  Form login
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  Masuk ke portal layanan
                </h3>
              </div>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                Siap
              </span>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-slate-200">
                  Email terdaftar
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail size={14} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="nama@kampus.ac.id"
                    autoComplete="email"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#F5C842]/60 focus:ring-2 focus:ring-[#F5C842]/15"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-slate-200">
                  Kata sandi
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock size={14} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Masukkan kata sandi"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#F5C842]/60 focus:ring-2 focus:ring-[#F5C842]/15"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-slate-200">
                  Peran akun
                </label>
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as PortalRole)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition focus:border-[#F5C842]/60 focus:ring-2 focus:ring-[#F5C842]/15"
                >
                  {LOGIN_ROLE_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value} className="bg-slate-950">
                      {item.label}
                    </option>
                  ))}
                </select>
                {selectedRole && (
                  <p className="mt-2 text-xs text-slate-400">{selectedRole.description}</p>
                )}
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5C842] px-4 py-3 text-sm font-semibold text-[#0B1D3A] transition hover:bg-[#ffd75a] disabled:cursor-not-allowed disabled:opacity-80"
              >
                {isSubmitting ? "Memproses..." : "Masuk ke Portal"}
                {!isSubmitting && <ArrowRight size={16} />}
              </button>
            </form>

            <div className="mt-5 flex items-center justify-between gap-4 text-xs text-slate-400">
              <span>Belum punya akun?</span>
              <Link href="/register" className="font-semibold text-[#F5C842] hover:text-[#ffd75a]">
                Daftar akun baru
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
