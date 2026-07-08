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
import AuroraBackground from "../components/AuroraBackground";
import Reveal from "../components/Reveal";

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
    <main className="relative min-h-screen overflow-hidden font-sans text-white">
      <AuroraBackground />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 text-sm font-black text-white shadow-lg shadow-fuchsia-500/40">
              C
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-fuchsia-300">
                Careerous
              </p>
              <h1 className="text-sm font-bold text-white">Masuk ke portal</h1>
            </div>
          </div>
          <Link
            href="/"
            className="text-xs font-semibold text-white/70 transition hover:text-white"
          >
            ← Beranda
          </Link>
        </div>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1fr_0.92fr]">
          <Reveal>
            <section className="max-w-2xl">
              <div className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[12px] font-semibold text-white backdrop-blur">
                <Sparkles size={14} className="text-fuchsia-300" />
                Selamat datang kembali 👋
                <span className="shimmer pointer-events-none absolute inset-0" />
              </div>
              <h2 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Lanjutkan <span className="text-gradient">petualangan kariermu</span>
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                Pilih peranmu, masukkan email & kata sandi, dan kami arahkan ke
                halaman yang pas untukmu.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <InfoCard icon={Mail} emoji="📧" title="Email" text="Identitas akunmu." />
                <InfoCard icon={UserRound} emoji="🎭" title="Peran" text="Siswa, konselor, admin." />
                <InfoCard icon={ShieldCheck} emoji="🔒" title="Aman" text="Sesi terenkripsi." />
              </div>
            </section>
          </Reveal>

          <Reveal delay={0.15}>
            <section className="relative">
              <div className="absolute -inset-3 -z-10 rounded-[36px] bg-gradient-to-br from-fuchsia-500/25 via-purple-500/15 to-cyan-400/15 blur-2xl glow-pulse" />
              <div className="glass rounded-[30px] p-6 shadow-2xl shadow-black/40 sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/50">
                      Form login
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-white">Masuk 🚪</h3>
                  </div>
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/15 px-3 py-1 text-[11px] font-bold text-emerald-300">
                    Siap
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <Field label="Email terdaftar">
                    <InputIcon icon={Mail} />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="nama@sekolah.sch.id"
                      autoComplete="email"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Kata sandi">
                    <InputIcon icon={Lock} />
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Masukkan kata sandi"
                      autoComplete="current-password"
                      className={inputClass}
                    />
                  </Field>

                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold text-slate-200">
                      Peran akun
                    </label>
                    <select
                      value={role}
                      onChange={(event) => setRole(event.target.value as PortalRole)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-400/20"
                    >
                      {LOGIN_ROLE_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value} className="bg-[#160b26]">
                          {item.label}
                        </option>
                      ))}
                    </select>
                    {selectedRole && (
                      <p className="mt-2 text-xs text-slate-400">{selectedRole.description}</p>
                    )}
                  </div>

                  {errorMessage && (
                    <div className="rounded-xl border border-rose-400/30 bg-rose-500/15 px-4 py-3 text-sm font-medium text-rose-200">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-glow flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? "Memproses..." : "Masuk ke Portal"}
                    {!isSubmitting && <ArrowRight size={16} />}
                  </button>
                </form>

                <div className="mt-5 flex items-center justify-between gap-4 text-xs text-slate-400">
                  <span>Belum punya akun?</span>
                  <Link href="/register" className="font-bold text-fuchsia-300 hover:text-fuchsia-200">
                    Daftar gratis →
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

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-400/20";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-semibold text-slate-200">
        {label}
      </label>
      <div className="relative">{children}</div>
    </div>
  );
}

function InputIcon({ icon: Icon }: { icon: typeof Mail }) {
  return (
    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
      <Icon size={14} />
    </div>
  );
}

function InfoCard({
  icon: Icon,
  emoji,
  title,
  text,
}: {
  icon: typeof Mail;
  emoji: string;
  title: string;
  text: string;
}) {
  return (
    <div className="card-hover rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="text-xl">{emoji}</span>
        <Icon size={15} className="text-fuchsia-300" />
      </div>
      <p className="mt-3 text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-xs text-slate-400">{text}</p>
    </div>
  );
}
