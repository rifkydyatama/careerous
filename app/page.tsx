import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Clock3,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

type StatItem = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
};

type FeatureItem = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

const HERO_STATS: StatItem[] = [
  {
    label: "Program layanan",
    value: "12 modul",
    helper: "eksplorasi karier bertahap dalam 3 fase",
    icon: Clock3,
  },
  {
    label: "Peran utama",
    value: "Siswa & Konselor",
    helper: "satu portal dengan akses sesuai peran",
    icon: Users,
  },
  {
    label: "Arah layanan",
    value: "Terpadu",
    helper: "menghubungkan refleksi, pemantauan, dan umpan balik",
    icon: ShieldCheck,
  },
];

const FEATURE_ITEMS: FeatureItem[] = [
  {
    eyebrow: "Alur terarah",
    title: "Modul eksplorasi dibuka bertahap",
    description:
      "Siswa mengikuti 12 modul eksplorasi karier yang terstruktur dalam 3 fase agar proses perencanaan karier berjalan konsisten, tidak sporadis.",
    icon: BookOpenCheck,
  },
  {
    eyebrow: "Tindak lanjut cepat",
    title: "Konselor melihat kebutuhan yang perlu respons",
    description:
      "Catatan yang masuk dapat dipantau sebagai dasar pendampingan, sehingga tindak lanjut lebih tepat dan terukur.",
    icon: ShieldCheck,
  },
  {
    eyebrow: "Akses sesuai peran",
    title: "Pintu masuk berbeda, pengalaman tetap seragam",
    description:
      "siswa dan konselor masuk dari jalur yang sesuai, namun tetap berada di dalam satu pengalaman portal yang konsisten.",
    icon: Users,
  },
];

export default function HomePage() {
  return (
    <main className="um-landing relative min-h-screen overflow-hidden bg-[#07111F] font-sans text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,200,66,0.16),transparent_30%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.24),transparent_32%),linear-gradient(180deg,_#07111F_0%,_#081628_45%,_#040B14_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-12 pt-6 sm:px-8 lg:px-10">
        <header className="motion-rise flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C9920A] to-[#F5C842] text-sm font-extrabold text-[#0B1D3A] shadow-lg shadow-[#C9920A]/35">
              CP
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#F5C842]">
                Universitas Negeri Malang
              </p>
              <h1 className="text-sm font-semibold text-white">Careerous Portal</h1>
            </div>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/70">
              Portal layanan
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/70">
              Bimbingan karier
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/70">
              Refleksi siswa
            </span>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-8 py-12 lg:grid-cols-[1.08fr_0.92fr] lg:py-16">
          <div className="motion-rise max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#F5C842]/20 bg-[#F5C842]/10 px-3 py-1 text-[11px] font-semibold text-[#F5C842]">
              <Sparkles size={13} />
              Satu pintu layanan karier dan konseling
            </div>

            <h2 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Portal yang menjelaskan alurnya dengan bahasa layanan, bukan bahasa teknis.
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Halaman depan ini dirancang untuk memberi konteks yang mudah dipahami:
              siswa mengisi refleksi, konselor meninjau progres, dan seluruh
              proses berjalan dalam satu portal yang rapi dan formal untuk lingkungan kampus.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-[#0B1D3A] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0B1D3A]/30 transition hover:bg-[#132848]"
              >
                <LayoutDashboard size={16} />
                Masuk Portal
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Daftar Akun
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {HERO_STATS.map((item) => (
                <StatPill key={item.label} item={item} />
              ))}
            </div>
          </div>

          <div className="motion-rise">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/40">
                    Akses cepat
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-white">
                    Masuk atau daftar akun
                  </h3>
                </div>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                  Siap digunakan
                </span>
              </div>

              <div className="mt-6 grid gap-3">
                <Link
                  href="/login"
                  className="group flex items-center justify-between rounded-2xl border border-[#C9920A]/30 bg-gradient-to-r from-[#0B1D3A] to-[#132848] px-4 py-4 text-left transition hover:border-[#F5C842]/40 hover:shadow-lg hover:shadow-[#0B1D3A]/30"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#F5C842]">
                      Login
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      Masuk sesuai peran
                    </p>
                    <p className="mt-1 text-xs text-slate-300">
                      Gunakan email terdaftar untuk mengakses halaman yang tepat.
                    </p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-[#F5C842] transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  href="/register"
                  className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left transition hover:border-white/20 hover:bg-white/10"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                      Daftar
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      Tambah akun siswa atau konselor
                    </p>
                    <p className="mt-1 text-xs text-slate-300">
                      Data disimpan ke database agar bisa dipakai untuk login.
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
        </section>

        <section className="pb-14" id="fitur">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#F5C842]">
                Logika Layanan
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                Alur kerja yang jelas untuk lingkungan universitas.
              </h3>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-400">
              Landing page ini menekankan manfaat dan alur layanan, supaya cocok untuk produksi
              kampus yang menuntut komunikasi formal, ringkas, dan mudah dipahami.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3 motion-stagger">
            {FEATURE_ITEMS.map((item) => (
              <FeatureCard key={item.title} item={item} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatPill({ item }: { item: StatItem }) {
  const Icon = item.icon;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[10px] uppercase tracking-[0.25em] text-white/45">
          {item.label}
        </p>
        <Icon size={15} className="text-[#F5C842]" />
      </div>
      <div className="mt-3 text-2xl font-semibold text-white">{item.value}</div>
      <p className="mt-1 text-xs leading-5 text-slate-400">{item.helper}</p>
    </div>
  );
}

function FeatureCard({ item }: { item: FeatureItem }) {
  const Icon = item.icon;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] transition-transform hover:-translate-y-1">
      <div className="inline-flex rounded-2xl border border-[#F5C842]/15 bg-[#F5C842]/10 p-3 text-[#F5C842]">
        <Icon size={18} />
      </div>
      <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
        {item.eyebrow}
      </p>
      <h4 className="mt-3 text-xl font-semibold text-white">{item.title}</h4>
      <p className="mt-3 text-sm leading-6 text-slate-400">{item.description}</p>
    </div>
  );
}
