import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  ClipboardList,
  Compass,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  MessageCircleHeart,
  PencilLine,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
import AuroraBackground from "./components/AuroraBackground";
import Reveal from "./components/Reveal";

type StatItem = {
  icon: LucideIcon;
  label: string;
  value: string;
  helper: string;
};

type FeatureItem = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  glow: string;
};

type StepItem = {
  icon: LucideIcon;
  title: string;
  text: string;
};

const HERO_STATS: StatItem[] = [
  {
    icon: Target,
    label: "Program",
    value: "12 modul",
    helper: "Eksplorasi karier bertahap dalam tiga fase terstruktur.",
  },
  {
    icon: HeartHandshake,
    label: "Didampingi",
    value: "Guru & Konselor",
    helper: "Pendampingan pada setiap langkah perjalananmu.",
  },
  {
    icon: Compass,
    label: "Hasil",
    value: "Arah yang jelas",
    helper: "Kenali minat, bakat, dan jurusan yang sesuai.",
  },
];

const FEATURE_ITEMS: FeatureItem[] = [
  {
    eyebrow: "Terstruktur",
    title: "Modul terbuka bertahap",
    description:
      "Dua belas modul eksplorasi karier tersusun rapi dalam tiga fase, sehingga kamu dapat menyelesaikannya satu per satu dengan terarah.",
    icon: BookOpenCheck,
    glow: "from-blue-500/20 to-sky-500/10",
  },
  {
    eyebrow: "Didampingi konselor",
    title: "Progres yang terpantau",
    description:
      "Setiap refleksi yang kamu tulis dapat ditinjau konselor, sehingga kamu memperoleh umpan balik dan dukungan yang tepat sasaran.",
    icon: MessageCircleHeart,
    glow: "from-indigo-500/20 to-blue-500/10",
  },
  {
    eyebrow: "Satu portal",
    title: "Semua kebutuhan di satu tempat",
    description:
      "Refleksi, jurnal, jadwal konseling, hingga laporan karier tersedia dalam satu portal yang mudah diakses dari ponsel maupun laptop.",
    icon: Compass,
    glow: "from-sky-500/20 to-cyan-400/10",
  },
];

const STEPS: StepItem[] = [
  { icon: ClipboardList, title: "Daftar & pilih sekolah", text: "Buat akun, pilih sekolahmu, dan mulai program." },
  { icon: PencilLine, title: "Kerjakan modul", text: "Isi refleksi dan jurnal secara bertahap setiap pekan." },
  { icon: GraduationCap, title: "Temukan arahmu", text: "Peroleh gambaran minat, bakat, dan jurusan yang sesuai." },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden font-sans text-slate-900">
      <AuroraBackground />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pb-16 pt-5 sm:px-8 lg:px-10">
        {/* ─── Navbar ─── */}
        <header className="flex items-center justify-between rounded-full border border-slate-200/80 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-full border border-slate-200 bg-white shadow-md flex items-center justify-center shrink-0">
              <img src="/logo.jpg" alt="Logo" className="h-full w-full object-cover animate-float-slow" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-600">
                Career Curiosity Platform
              </p>
              <h1 className="text-sm font-bold text-slate-900">Careerous</h1>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="btn-glow rounded-full px-5 py-2 text-sm font-bold text-white"
            >
              Daftar gratis
            </Link>
          </div>
        </header>

        {/* ─── Hero ─── */}
        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
          <Reveal>
            <div className="max-w-2xl">
              <div className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-[12px] font-semibold text-blue-700">
                <Sparkles size={14} className="text-blue-500" />
                Platform eksplorasi karier untuk pelajar
                <span className="shimmer pointer-events-none absolute inset-0" />
              </div>

              <h2 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Temukan{" "}
                <span className="text-gradient">potensi dan jurusan impianmu</span>
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Careerous membantu kamu mengenali minat dan bakat melalui modul
                terstruktur, jurnal refleksi, dan pendampingan konselor — semuanya
                dalam satu portal yang mudah digunakan.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="btn-glow inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold text-white"
                >
                  <Rocket size={17} />
                  Mulai sekarang
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <LayoutDashboard size={16} />
                  Sudah punya akun
                </Link>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {HERO_STATS.map((item, i) => (
                  <Reveal key={item.label} delay={0.1 + i * 0.08}>
                    <StatPill item={item} />
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Kartu akses cepat melayang */}
          <Reveal delay={0.15}>
            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-[40px] bg-gradient-to-br from-blue-400/25 via-sky-400/15 to-cyan-300/15 blur-2xl glow-pulse" />
              <div className="glass animate-float-slow rounded-[32px] p-6 shadow-xl shadow-blue-500/10 sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                      Akses cepat
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-slate-900">
                      Mulai perjalananmu
                    </h3>
                  </div>
                  <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-600">
                    <ShieldCheck size={12} /> Gratis
                  </span>
                </div>

                <div className="mt-6 grid gap-3">
                  <Link
                    href="/register"
                    className="card-hover group flex items-center justify-between rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-sky-50 px-4 py-4"
                  >
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                        Daftar
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        Buat akun siswa
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Pilih sekolahmu dan mulai eksplorasi.
                      </p>
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-blue-500 transition-transform group-hover:translate-x-1"
                    />
                  </Link>

                  <Link
                    href="/login"
                    className="card-hover group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4"
                  >
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                        Masuk
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        Masuk sesuai peran
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Siswa, konselor, atau admin.
                      </p>
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-slate-400 transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ─── Fitur ─── */}
        <section className="pb-16" id="fitur">
          <Reveal>
            <div className="mb-8 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-blue-600">
                Kenapa Careerous?
              </p>
              <h3 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                Dirancang agar kamu <span className="text-gradient">lebih terarah</span>
              </h3>
            </div>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-3">
            {FEATURE_ITEMS.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.1}>
                <FeatureCard item={item} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* ─── Langkah ─── */}
        <section className="pb-16">
          <Reveal>
            <div className="glass rounded-[32px] p-6 sm:p-10">
              <div className="mb-8 flex flex-col gap-2 text-center">
                <h3 className="text-2xl font-black text-slate-900 sm:text-3xl">
                  Hanya tiga langkah
                </h3>
                <p className="text-sm text-slate-500">
                  Proses sederhana, dapat diakses dari mana saja.
                </p>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {STEPS.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <Reveal key={step.title} delay={i * 0.1}>
                      <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <span className="absolute -top-4 left-6 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-sky-500 text-sm font-black text-white shadow-lg shadow-blue-500/30">
                          {i + 1}
                        </span>
                        <div className="inline-flex rounded-2xl bg-blue-50 p-3 text-blue-600">
                          <Icon size={22} />
                        </div>
                        <h4 className="mt-3 text-lg font-bold text-slate-900">
                          {step.title}
                        </h4>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {step.text}
                        </p>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </section>

        {/* ─── CTA akhir ─── */}
        <Reveal>
          <section className="relative overflow-hidden rounded-[32px] border border-blue-100 bg-gradient-to-br from-blue-50 via-sky-50 to-white p-8 text-center shadow-sm sm:p-12">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-400/20 blur-3xl glow-pulse" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-sky-400/20 blur-3xl glow-pulse" />
            <div className="relative">
              <div className="mb-4 flex justify-center">
                <span className="inline-flex rounded-2xl bg-white p-3.5 text-blue-600 shadow-sm animate-float">
                  <Target size={32} />
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 sm:text-4xl">
                Siap mengenali dirimu lebih dalam?
              </h3>
              <p className="mx-auto mt-3 max-w-lg text-sm text-slate-600 sm:text-base">
                Bergabunglah sekarang secara gratis. Temukan minat, bakat, dan arah
                kariermu bersama Careerous.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link
                  href="/register"
                  className="btn-glow inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white"
                >
                  <Users size={17} />
                  Daftar gratis
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Masuk
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </section>
        </Reveal>

        <footer className="mt-10 text-center text-xs text-slate-400">
          © Careerous — Career Curiosity Platform
        </footer>
      </div>
    </main>
  );
}

function StatPill({ item }: { item: StatItem }) {
  const Icon = item.icon;
  return (
    <div className="card-hover rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex rounded-xl bg-blue-50 p-2 text-blue-600">
          <Icon size={18} />
        </span>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          {item.label}
        </p>
      </div>
      <div className="mt-2 text-xl font-black text-slate-900">{item.value}</div>
      <p className="mt-1 text-xs leading-5 text-slate-500">{item.helper}</p>
    </div>
  );
}

function FeatureCard({ item }: { item: FeatureItem }) {
  const Icon = item.icon;

  return (
    <div className="card-hover group relative h-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div
        className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${item.glow} blur-2xl transition-opacity group-hover:opacity-100`}
      />
      <div className="relative">
        <div className="inline-flex rounded-2xl bg-blue-50 p-3 text-blue-600">
          <Icon size={20} />
        </div>
        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.28em] text-blue-600">
          {item.eyebrow}
        </p>
        <h4 className="mt-2 text-xl font-bold text-slate-900">{item.title}</h4>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {item.description}
        </p>
      </div>
    </div>
  );
}
