"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgePlus,
  Lock,
  Mail,
  School,
  Sparkles,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { PORTAL_ROLE_OPTIONS, normalizeRole, type PortalRole } from "../../lib/portal-auth";
import AuroraBackground from "../components/AuroraBackground";
import Reveal from "../components/Reveal";

type InstitutionOption = {
  id: string;
  name: string;
  hasCounselor: boolean;
};

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

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-400/20";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<PortalRole>("STUDENT");
  const [institutionName, setInstitutionName] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const [institutions, setInstitutions] = useState<InstitutionOption[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const roleParam = new URLSearchParams(window.location.search).get("role");
    const normalizedRole = normalizeRole(roleParam);

    if (normalizedRole) {
      setRole(normalizedRole);
    }
  }, []);

  // Ambil daftar sekolah: siswa memilih dari sini, guru memakainya sebagai saran nama.
  useEffect(() => {
    let active = true;
    fetch("/api/institutions/list", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { institutions: [] }))
      .then((data) => {
        if (active) setInstitutions(data.institutions ?? []);
      })
      .catch(() => {
        if (active) setInstitutions([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const selectedRole = useMemo(
    () => PORTAL_ROLE_OPTIONS.find((item) => item.value === role),
    [role]
  );

  // Sekolah yang boleh dipilih siswa: hanya yang sudah punya guru terdaftar.
  const studentSchools = useMemo(
    () => institutions.filter((item) => item.hasCounselor),
    [institutions]
  );

  // Saran untuk guru: bila mengetik nama yang sudah terdaftar (case-insensitive), tampilkan
  // nama kanoniknya agar tidak membuat sekolah duplikat dengan ejaan berbeda.
  const institutionSuggestion = useMemo(() => {
    const typed = institutionName.trim().toLowerCase();
    if (!typed) return null;
    const match = institutions.find((item) => item.name.toLowerCase() === typed);
    return match && match.name !== institutionName.trim() ? match.name : null;
  }, [institutionName, institutions]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setErrorMessage("Nama wajib diisi.");
      return;
    }

    if (!trimmedEmail) {
      setErrorMessage("Email wajib diisi.");
      return;
    }

    if (password.trim().length < 8) {
      setErrorMessage("Kata sandi minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    // Siswa wajib memilih sekolah dari daftar.
    if (role === "STUDENT" && !institutionId) {
      setErrorMessage("Silakan pilih sekolah dari daftar.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          role,
          password,
          // Siswa: id sekolah dari dropdown. Guru: nama sekolah (find-or-create).
          ...(role === "STUDENT"
            ? { institutionId }
            : { institutionName: institutionName.trim() }),
        }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, "Gagal membuat akun"));
      }

      const payload = (await response.json()) as { redirectTo?: string };
      router.push(payload.redirectTo ?? "/");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal membuat akun"
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
              <h1 className="text-sm font-bold text-white">Daftar akun baru</h1>
            </div>
          </div>
          <Link
            href="/"
            className="text-xs font-semibold text-white/70 transition hover:text-white"
          >
            ← Beranda
          </Link>
        </div>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1fr_0.95fr]">
          <Reveal>
            <section className="max-w-2xl">
              <div className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[12px] font-semibold text-white backdrop-blur">
                <Sparkles size={14} className="text-fuchsia-300" />
                Gratis buat siswa & konselor 🎉
                <span className="shimmer pointer-events-none absolute inset-0" />
              </div>
              <h2 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Mulai <span className="text-gradient">petualangan kariermu</span> 🚀
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                Buat akun, pilih sekolahmu, dan langsung mulai eksplorasi minat &
                bakat bareng Careerous.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <Card icon={UserPlus} emoji="🙋" title="Akun baru" text="Nama & email jadi identitas." />
                <Card icon={BadgePlus} emoji="🎭" title="Pilih peran" text="Siswa / mahasiswa atau konselor." />
                <Card icon={Mail} emoji="⚡" title="Langsung aktif" text="Data tersimpan otomatis." />
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
                      Form daftar
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-white">Bikin akun ✨</h3>
                  </div>
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/15 px-3 py-1 text-[11px] font-bold text-emerald-300">
                    Gratis
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold text-slate-200">
                      Nama lengkap
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Nama lengkap"
                      autoComplete="name"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-400/20"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold text-slate-200">
                      Email aktif
                    </label>
                    <div className="relative">
                      <InputIcon icon={Mail} />
                      <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="nama@sekolah.sch.id"
                        autoComplete="email"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold text-slate-200">
                      Kata sandi
                    </label>
                    <div className="relative">
                      <InputIcon icon={Lock} />
                      <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Minimal 8 karakter"
                        autoComplete="new-password"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold text-slate-200">
                      Konfirmasi kata sandi
                    </label>
                    <div className="relative">
                      <InputIcon icon={Lock} />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="Ulangi kata sandi"
                        autoComplete="new-password"
                        className={inputClass}
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
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-400/20"
                    >
                      {PORTAL_ROLE_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value} className="bg-[#160b26]">
                          {item.label}
                        </option>
                      ))}
                    </select>
                    {selectedRole && (
                      <p className="mt-2 text-xs text-slate-400">{selectedRole.description}</p>
                    )}
                  </div>

                  {role === "STUDENT" ? (
                    <div>
                      <label className="mb-1.5 block text-[12px] font-semibold text-slate-200">
                        Sekolah
                      </label>
                      <div className="relative">
                        <InputIcon icon={School} />
                        <select
                          value={institutionId}
                          onChange={(event) => setInstitutionId(event.target.value)}
                          disabled={studentSchools.length === 0}
                          className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-400/20 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <option value="" className="bg-[#160b26]">
                            {studentSchools.length === 0
                              ? "Belum ada sekolah terdaftar"
                              : "— Pilih sekolah —"}
                          </option>
                          {studentSchools.map((item) => (
                            <option key={item.id} value={item.id} className="bg-[#160b26]">
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <p className="mt-2 text-xs text-slate-400">
                        {studentSchools.length === 0
                          ? "Sekolah baru muncul setelah guru dari sekolahmu mendaftar terlebih dahulu."
                          : "Pilih sekolahmu. Daftar ini berisi sekolah yang gurunya sudah terdaftar."}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="mb-1.5 block text-[12px] font-semibold text-slate-200">
                        Sekolah / Institusi <span className="font-normal text-slate-400">(opsional)</span>
                      </label>
                      <div className="relative">
                        <InputIcon icon={School} />
                        <input
                          type="text"
                          value={institutionName}
                          onChange={(event) => setInstitutionName(event.target.value)}
                          placeholder="mis. SMA Negeri 1 Malang"
                          list="institution-suggestions"
                          autoComplete="off"
                          className={inputClass}
                        />
                        <datalist id="institution-suggestions">
                          {institutions.map((item) => (
                            <option key={item.id} value={item.name} />
                          ))}
                        </datalist>
                      </div>
                      {institutionSuggestion ? (
                        <button
                          type="button"
                          onClick={() => setInstitutionName(institutionSuggestion)}
                          className="mt-2 text-xs font-bold text-fuchsia-300 hover:text-fuchsia-200"
                        >
                          Sekolah ini sudah terdaftar sebagai “{institutionSuggestion}” — gunakan nama itu
                        </button>
                      ) : (
                        <p className="mt-2 text-xs text-slate-400">
                          Ketik nama sekolahmu. Jika sudah pernah didaftarkan guru lain, pilih dari saran
                          agar tidak terjadi duplikat. Siswa akan memilih sekolah ini saat mendaftar.
                        </p>
                      )}
                    </div>
                  )}

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
                    {isSubmitting ? "Menyimpan..." : "Daftarkan Akun"}
                    {!isSubmitting && <ArrowRight size={16} />}
                  </button>
                </form>

                <div className="mt-5 flex items-center justify-between gap-4 text-xs text-slate-400">
                  <span>Sudah punya akun?</span>
                  <Link href="/login" className="font-bold text-fuchsia-300 hover:text-fuchsia-200">
                    Masuk ke portal →
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

function InputIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
      <Icon size={14} />
    </div>
  );
}

function Card({
  icon: Icon,
  emoji,
  title,
  text,
}: {
  icon: LucideIcon;
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
