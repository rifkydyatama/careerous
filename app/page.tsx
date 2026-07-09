import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Compass,
  LayoutDashboard,
  MessageCircleHeart,
  Rocket,
  Sparkles,
  Star,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
import AuroraBackground from "./components/AuroraBackground";
import Reveal from "./components/Reveal";

type StatItem = {
  emoji: string;
  label: string;
  value: string;
  helper: string;
};

type FeatureItem = {
  emoji: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  glow: string;
};

type StepItem = {
  emoji: string;
  title: string;
  text: string;
};

const HERO_STATS: StatItem[] = [
  {
    emoji: "🎯",
    label: "Program",
    value: "12 modul",
    helper: "eksplorasi karier bertahap dalam 3 fase seru",
  },
  {
    emoji: "🤝",
    label: "Didampingi",
    value: "Guru & Konselor",
    helper: "ada yang bantu di tiap langkahmu",
  },
  {
    emoji: "🧭",
    label: "Hasil",
    value: "Arah jelas",
    helper: "kenali minat, bakat, dan jurusan impian",
  },
];

const FEATURE_ITEMS: FeatureItem[] = [
  {
    emoji: "📚",
    eyebrow: "Step by step",
    title: "Modul kebuka bertahap",
    description:
      "Ikuti 12 modul eksplorasi karier yang tersusun rapi dalam 3 fase — nggak bikin bingung, tinggal jalanin satu per satu.",
    icon: BookOpenCheck,
    glow: "from-fuchsia-500/30 to-pink-500/10",
  },
  {
    emoji: "💬",
    eyebrow: "Selalu didampingi",
    title: "Konselor pantau progresmu",
    description:
      "Setiap refleksi yang kamu tulis bisa dilihat konselor, jadi kamu dapat feedback dan dukungan yang pas.",
    icon: MessageCircleHeart,
    glow: "from-violet-500/30 to-indigo-500/10",
  },
  {
    emoji: "✨",
    eyebrow: "Satu portal",
    title: "Semua di satu tempat",
    description:
      "Refleksi, jurnal, jadwal, sampai laporan kariermu ada dalam satu portal yang gampang dipakai dari HP maupun laptop.",
    icon: Compass,
    glow: "from-sky-500/30 to-cyan-500/10",
  },
];

const STEPS: StepItem[] = [
  { emoji: "📝", title: "Daftar & pilih sekolah", text: "Bikin akun, pilih sekolahmu, langsung mulai." },
  { emoji: "🧩", title: "Kerjakan modul", text: "Isi refleksi & jurnal tiap minggu dengan santai." },
  { emoji: "🚀", title: "Temukan arahmu", text: "Dapat gambaran minat, bakat, dan jurusan impian." },
];

export default function HomePage() {
  return (
    <main data-noinvert className="relative min-h-screen overflow-hidden font-sans text-white">
      <AuroraBackground />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pb-16 pt-5 sm:px-8 lg:px-10">
        {/* ─── Navbar ─── */}
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 text-sm font-black text-white shadow-lg shadow-fuchsia-500/40 animate-float-slow">
              C
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-fuchsia-300">
                Career Curiosity Platform
              </p>
              <h1 className="text-sm font-bold text-white">Careerous</h1>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-semibold text-white/80 transition hover:text-white"
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
              <div className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[12px] font-semibold text-white backdrop-blur">
                <Sparkles size={14} className="text-fuchsia-300" />
                Platform eksplorasi karier buat pelajar
                <span className="shimmer pointer-events-none absolute inset-0" />
              </div>

              <h2 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Temukan{" "}
                <span className="text-gradient">potensi & jurusan impianmu</span>{" "}
                🚀
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                Careerous bantu kamu kenali minat dan bakat lewat modul seru,
                jurnal refleksi, dan pendampingan konselor — semua dalam satu
                portal yang asik dipakai.
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
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
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
              <div className="absolute -inset-4 -z-10 rounded-[40px] bg-gradient-to-br from-fuchsia-500/30 via-purple-500/20 to-cyan-400/20 blur-2xl glow-pulse" />
              <div className="glass animate-float-slow rounded-[32px] p-6 shadow-2xl shadow-black/40 sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/50">
                      Akses cepat
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-white">
                      Yuk gabung! 🎉
                    </h3>
                  </div>
                  <span className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/15 px-3 py-1 text-[11px] font-bold text-emerald-300">
                    <Star size={11} className="fill-emerald-300" /> Gratis
                  </span>
                </div>

                <div className="mt-6 grid gap-3">
                  <Link
                    href="/register"
                    className="card-hover group flex items-center justify-between rounded-2xl border border-white/10 bg-gradient-to-r from-fuchsia-500/20 to-purple-500/10 px-4 py-4"
                  >
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-300">
                        Daftar
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        Buat akun siswa
                      </p>
                      <p className="mt-1 text-xs text-slate-300">
                        Pilih sekolahmu dan mulai eksplorasi.
                      </p>
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-fuchsia-300 transition-transform group-hover:translate-x-1"
                    />
                  </Link>

                  <Link
                    href="/login"
                    className="card-hover group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                  >
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">
                        Login
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        Masuk sesuai peran
                      </p>
                      <p className="mt-1 text-xs text-slate-300">
                        Siswa, konselor, atau admin.
                      </p>
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-white/70 transition-transform group-hover:translate-x-1"
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
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-fuchsia-300">
                Kenapa Careerous?
              </p>
              <h3 className="mt-3 text-3xl font-black sm:text-4xl">
                Dibikin biar kamu <span className="text-gradient">nggak bingung</span>
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
                <h3 className="text-2xl font-black sm:text-3xl">
                  Cuma 3 langkah ✌️
                </h3>
                <p className="text-sm text-slate-300">
                  Gampang banget, bisa dari HP.
                </p>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {STEPS.map((step, i) => (
                  <Reveal key={step.title} delay={i * 0.1}>
                    <div className="relative rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                      <span className="absolute -top-4 left-6 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-sm font-black text-white shadow-lg shadow-fuchsia-500/40">
                        {i + 1}
                      </span>
                      <div className="text-3xl">{step.emoji}</div>
                      <h4 className="mt-3 text-lg font-bold text-white">
                        {step.title}
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {step.text}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* ─── CTA akhir ─── */}
        <Reveal>
          <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-fuchsia-600/30 via-purple-600/20 to-cyan-500/20 p-8 text-center sm:p-12">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-fuchsia-500/40 blur-3xl glow-pulse" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-cyan-400/30 blur-3xl glow-pulse" />
            <div className="relative">
              <div className="mb-4 flex justify-center">
                <Target size={40} className="text-fuchsia-300 animate-float" />
              </div>
              <h3 className="text-2xl font-black sm:text-4xl">
                Siap kenali dirimu lebih dalam?
              </h3>
              <p className="mx-auto mt-3 max-w-lg text-sm text-slate-200 sm:text-base">
                Gabung sekarang, gratis. Temukan minat, bakat, dan arah kariermu
                bareng Careerous.
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
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  Masuk
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </section>
        </Reveal>

        <footer className="mt-10 text-center text-xs text-white/40">
          © Careerous — Career Curiosity Platform
        </footer>
      </div>
    </main>
  );
}

function StatPill({ item }: { item: StatItem }) {
  return (
    <div className="card-hover rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-2xl">{item.emoji}</span>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
          {item.label}
        </p>
      </div>
      <div className="mt-2 text-xl font-black text-white">{item.value}</div>
      <p className="mt-1 text-xs leading-5 text-slate-400">{item.helper}</p>
    </div>
  );
}

function FeatureCard({ item }: { item: FeatureItem }) {
  const Icon = item.icon;

  return (
    <div className="card-hover group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-6">
      <div
        className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${item.glow} blur-2xl transition-opacity group-hover:opacity-100`}
      />
      <div className="relative">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{item.emoji}</span>
          <div className="inline-flex rounded-2xl border border-white/15 bg-white/10 p-2.5 text-white">
            <Icon size={18} />
          </div>
        </div>
        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.28em] text-fuchsia-300">
          {item.eyebrow}
        </p>
        <h4 className="mt-2 text-xl font-bold text-white">{item.title}</h4>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          {item.description}
        </p>
      </div>
    </div>
  );
}
