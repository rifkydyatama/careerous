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
    <main className="min-h-screen bg-[#07111F] font-sans text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,200,66,0.18),transparent_30%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.24),transparent_30%),linear-gradient(180deg,_#07111F_0%,_#081628_45%,_#040B14_100%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-6 sm:px-8 lg:px-10">
        <div className="mb-8 flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#F5C842]">
              Universitas Negeri Malang
            </p>
            <h1 className="text-sm font-semibold text-white">Daftar akun baru</h1>
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
              Pendaftaran siswa dan konselor
            </div>
            <h2 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Buat akun baru untuk masuk ke portal layanan.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              Gunakan formulir ini untuk menambahkan akun siswa atau konselor
              ke database. Setelah berhasil, akun akan diarahkan ke halaman yang
              sesuai dengan perannya.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Card icon={UserPlus} title="Akun baru" text="Nama dan email sebagai identitas." />
              <Card icon={BadgePlus} title="Peran jelas" text="Pilih siswa / mahasiswa atau konselor." />
              <Card icon={Mail} title="Tersambung" text="Data langsung disimpan ke database." />
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/40">
                  Form daftar
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  Registrasi akun portal
                </h3>
              </div>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                Siap
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
                  placeholder="Nama lengkap pengguna"
                  autoComplete="name"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#F5C842]/60 focus:ring-2 focus:ring-[#F5C842]/15"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-slate-200">
                  Email aktif
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
                    placeholder="Minimal 8 karakter"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#F5C842]/60 focus:ring-2 focus:ring-[#F5C842]/15"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-slate-200">
                  Konfirmasi kata sandi
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock size={14} />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Ulangi kata sandi"
                    autoComplete="new-password"
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
                  {PORTAL_ROLE_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value} className="bg-slate-950">
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
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <School size={14} />
                    </div>
                    <select
                      value={institutionId}
                      onChange={(event) => setInstitutionId(event.target.value)}
                      disabled={studentSchools.length === 0}
                      className="w-full appearance-none rounded-xl border border-white/10 bg-slate-950/40 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-[#F5C842]/60 focus:ring-2 focus:ring-[#F5C842]/15 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <option value="" className="bg-slate-950">
                        {studentSchools.length === 0
                          ? "Belum ada sekolah terdaftar"
                          : "— Pilih sekolah —"}
                      </option>
                      {studentSchools.map((item) => (
                        <option key={item.id} value={item.id} className="bg-slate-950">
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
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <School size={14} />
                    </div>
                    <input
                      type="text"
                      value={institutionName}
                      onChange={(event) => setInstitutionName(event.target.value)}
                      placeholder="mis. SMA Negeri 1 Malang"
                      list="institution-suggestions"
                      autoComplete="off"
                      className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#F5C842]/60 focus:ring-2 focus:ring-[#F5C842]/15"
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
                      className="mt-2 text-xs font-semibold text-[#F5C842] hover:text-[#ffd75a]"
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
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5C842] px-4 py-3 text-sm font-semibold text-[#0B1D3A] transition hover:bg-[#ffd75a] disabled:cursor-not-allowed disabled:opacity-80"
              >
                {isSubmitting ? "Menyimpan..." : "Daftarkan Akun"}
                {!isSubmitting && <ArrowRight size={16} />}
              </button>
            </form>

            <div className="mt-5 flex items-center justify-between gap-4 text-xs text-slate-400">
              <span>Sudah punya akun?</span>
              <Link href="/login" className="font-semibold text-[#F5C842] hover:text-[#ffd75a]">
                Masuk ke portal
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
      <Icon size={16} className="text-[#F5C842]" />
      <p className="mt-3 text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-xs text-slate-400">{text}</p>
    </div>
  );
}
