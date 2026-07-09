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
  Eye,
  EyeOff,
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
  "w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const role: PortalRole = "STUDENT";
  const [institutionName, setInstitutionName] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const [institutions, setInstitutions] = useState<InstitutionOption[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    <main className="relative min-h-screen overflow-hidden font-sans text-slate-900">
      <AuroraBackground />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between rounded-full border border-slate-200/80 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-sky-500 text-sm font-black text-white shadow-lg shadow-blue-500/30">
              C
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-600">
                Careerous
              </p>
              <h1 className="text-sm font-bold text-slate-900">Daftar akun baru</h1>
            </div>
          </div>
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 transition hover:text-slate-900"
          >
            ← Beranda
          </Link>
        </div>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1fr_0.95fr]">
          <Reveal>
            <section className="max-w-2xl">
              <div className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-[12px] font-semibold text-blue-700">
                <Sparkles size={14} className="text-blue-500" />
                Gratis untuk siswa dan konselor
                <span className="shimmer pointer-events-none absolute inset-0" />
              </div>
              <h2 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Mulai <span className="text-gradient">perjalanan kariermu</span>
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Buat akun, pilih sekolahmu, dan mulai eksplorasi minat serta bakat
                bersama Careerous.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <Card icon={UserPlus} title="Akun baru" text="Nama & email jadi identitas." />
                <Card icon={BadgePlus} title="Role Siswa" text="Akun khusus siswa/mahasiswa." />
                <Card icon={Mail} title="Langsung aktif" text="Data tersimpan otomatis." />
              </div>
            </section>
          </Reveal>

          <Reveal delay={0.15}>
            <section className="relative">
              <div className="absolute -inset-3 -z-10 rounded-[36px] bg-gradient-to-br from-blue-400/20 via-sky-400/15 to-cyan-300/15 blur-2xl glow-pulse" />
              <div className="glass rounded-[30px] p-6 shadow-xl shadow-blue-500/10 sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                      Form daftar
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-slate-900">Buat akun</h3>
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-600">
                    Gratis
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">
                      Nama lengkap
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Nama lengkap"
                      autoComplete="name"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">
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
                    <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">
                      Kata sandi
                    </label>
                    <div className="relative">
                      <InputIcon icon={Lock} />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Minimal 8 karakter"
                        autoComplete="new-password"
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">
                      Konfirmasi kata sandi
                    </label>
                    <div className="relative">
                      <InputIcon icon={Lock} />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="Ulangi kata sandi"
                        autoComplete="new-password"
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">
                      Sekolah
                    </label>
                    <div className="relative">
                      <InputIcon icon={School} />
                      <select
                        value={institutionId}
                        onChange={(event) => setInstitutionId(event.target.value)}
                        disabled={studentSchools.length === 0}
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <option value="" className="bg-white">
                          {studentSchools.length === 0
                            ? "Belum ada sekolah terdaftar"
                            : "— Pilih sekolah —"}
                        </option>
                        {studentSchools.map((item) => (
                          <option key={item.id} value={item.id} className="bg-white">
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {studentSchools.length === 0
                        ? "Sekolah baru muncul setelah guru dari sekolahmu mendaftar terlebih dahulu."
                        : "Pilih sekolahmu. Daftar ini berisi sekolah yang gurunya sudah terdaftar."}
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
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

                <div className="mt-5 flex items-center justify-between gap-4 text-xs text-slate-500">
                  <span>Sudah punya akun?</span>
                  <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700">
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
  title,
  text,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
}) {
  return (
    <div className="card-hover rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className="inline-flex rounded-xl bg-blue-50 p-2 text-blue-600">
        <Icon size={16} />
      </span>
      <p className="mt-3 text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{text}</p>
    </div>
  );
}
