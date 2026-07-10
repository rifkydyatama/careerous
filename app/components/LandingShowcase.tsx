"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  GraduationCap,
  HeartHandshake,
  School,
  BookOpenCheck,
  Building2,
  Sparkles,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react";
import Reveal from "./Reveal";

type Stats = {
  students: number;
  counselors: number;
  institutions: number;
  modulesDone: number;
};

type Counselor = {
  id: string;
  name: string | null;
  avatar: string | null;
  institutionName: string | null;
  studentCount: number;
};

type Partner = { id: string; name: string; active: boolean };

type LandingData = {
  stats: Stats;
  counselors: Counselor[];
  partners: Partner[];
};

const STAT_META: {
  key: keyof Stats;
  label: string;
  icon: LucideIcon;
  gradient: string;
  ring: string;
  suffix?: string;
}[] = [
  { key: "students", label: "Siswa terdaftar", icon: GraduationCap, gradient: "from-blue-600 to-sky-500", ring: "text-blue-600", suffix: "+" },
  { key: "counselors", label: "Konselor pendamping", icon: HeartHandshake, gradient: "from-indigo-600 to-blue-500", ring: "text-indigo-600" },
  { key: "institutions", label: "Sekolah mitra", icon: School, gradient: "from-sky-500 to-cyan-500", ring: "text-sky-600" },
  { key: "modulesDone", label: "Modul diselesaikan", icon: BookOpenCheck, gradient: "from-emerald-600 to-teal-500", ring: "text-emerald-600", suffix: "+" },
];

function initialsOf(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_GRADIENTS = [
  "from-blue-500 to-indigo-500",
  "from-fuchsia-500 to-violet-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-sky-500 to-cyan-500",
  "from-rose-500 to-pink-500",
];

function useCountUp(target: number, active: boolean, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let startTime: number | null = null;
    const step = (t: number) => {
      if (startTime === null) startTime = t;
      const progress = Math.min(1, (t - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return value;
}

function StatCard({ meta, value, active }: { meta: (typeof STAT_META)[number]; value: number; active: boolean }) {
  const display = useCountUp(value, active);
  const Icon = meta.icon;
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-6">
      <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${meta.gradient} opacity-10 blur-xl transition group-hover:opacity-20`} />
      <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.gradient} text-white shadow-md`}>
        <Icon size={20} />
      </div>
      <p className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
        {display.toLocaleString("id-ID")}
        {meta.suffix && value > 0 ? <span className={meta.ring}>{meta.suffix}</span> : null}
      </p>
      <p className="mt-1 text-[12.5px] font-semibold text-slate-500">{meta.label}</p>
    </div>
  );
}

function CounselorCard({ c, index }: { c: Counselor; index: number }) {
  const gradient = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
  return (
    <div className="group relative flex h-full flex-col items-center rounded-3xl border border-slate-200/70 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        <div className={`absolute -inset-1.5 rounded-full bg-gradient-to-br ${gradient} opacity-60 blur-[8px] transition group-hover:opacity-90`} />
        {c.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={c.avatar}
            alt={c.name ?? "Konselor"}
            className="relative h-24 w-24 rounded-full object-cover ring-4 ring-white sm:h-28 sm:w-28"
          />
        ) : (
          <div className={`relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-2xl font-black text-white ring-4 ring-white sm:h-28 sm:w-28 sm:text-3xl`}>
            {initialsOf(c.name)}
          </div>
        )}
        <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-blue-600 shadow ring-1 ring-slate-100">
          <BadgeCheck size={16} />
        </span>
      </div>
      <h3 className="mt-5 line-clamp-1 text-base font-extrabold text-slate-900 sm:text-lg">{c.name}</h3>
      <p className="mt-1 text-[11.5px] font-bold uppercase tracking-wide text-blue-600">Konselor Karier</p>
      {c.institutionName ? (
        <p className="mt-2.5 flex items-center gap-1 text-[12.5px] text-slate-500">
          <Building2 size={13} className="shrink-0" />
          <span className="line-clamp-1">{c.institutionName}</span>
        </p>
      ) : null}
      {c.studentCount > 0 ? (
        <span className="mt-3.5 rounded-full bg-blue-50 px-3.5 py-1.5 text-[11.5px] font-bold text-blue-700">
          {c.studentCount} siswa dibimbing
        </span>
      ) : (
        <span className="mt-3.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-[11.5px] font-bold text-emerald-700">
          Siap mendampingi
        </span>
      )}
    </div>
  );
}

// Ambang jumlah mitra sebelum daftar dijalankan (marquee). Di bawah ini tampil statis & center.
const MARQUEE_MIN = 8;

function PartnerChip({ p }: { p: Partner }) {
  return (
    <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
      <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-white ${p.active ? "bg-gradient-to-br from-emerald-500 to-teal-500" : "bg-gradient-to-br from-slate-400 to-slate-500"}`}>
        <School size={14} />
      </span>
      <span className="whitespace-nowrap text-[13px] font-bold text-slate-700">{p.name}</span>
      {p.active ? (
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-emerald-700">
          Premium
        </span>
      ) : null}
    </div>
  );
}

function PartnerStrip({ partners }: { partners: Partner[] }) {
  // Mitra masih sedikit: tampil statis, di tengah, tanpa animasi & tanpa duplikat.
  if (partners.length < MARQUEE_MIN) {
    return (
      <div className="flex flex-wrap justify-center gap-3">
        {partners.map((p) => (
          <PartnerChip key={p.id} p={p} />
        ))}
      </div>
    );
  }

  // Mitra sudah banyak: jalankan marquee mulus. Daftar digandakan hanya untuk loop (-50%).
  const loop = [...partners, ...partners];
  return (
    <div className="relative overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <motion.div
        className="flex w-max gap-3"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: partners.length * 3.5, ease: "linear", repeat: Infinity }}
      >
        {loop.map((p, i) => (
          <PartnerChip key={`${p.id}-${i}`} p={p} />
        ))}
      </motion.div>
    </div>
  );
}

export default function LandingShowcase() {
  const [data, setData] = useState<LandingData | null>(null);
  const [countActive, setCountActive] = useState(false);
  const statsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/public/landing")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (mounted && d && d.stats) setData(d as LandingData);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Mulai animasi angka saat blok statistik masuk viewport.
  useEffect(() => {
    const node = statsRef.current;
    if (!node || countActive) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setCountActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [data, countActive]);

  if (!data) return null;

  const hasCounselors = data.counselors.length > 0;
  const hasPartners = data.partners.length > 0;

  return (
    <>
      {/* ─── Infografik jumlah pengguna (tanpa admin) ─── */}
      <section className="pb-16" id="statistik">
        <Reveal>
          <div className="mb-8 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-blue-600">
              <Sparkles size={12} /> Careerous dalam angka
            </span>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Dipercaya untuk mendampingi karier
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
              Pertumbuhan komunitas siswa, konselor, dan sekolah mitra di seluruh platform.
            </p>
          </div>
        </Reveal>
        <div ref={statsRef} className="mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {STAT_META.map((meta, i) => (
            <Reveal key={meta.key} delay={i * 0.08}>
              <StatCard meta={meta} value={data.stats[meta.key]} active={countActive} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── Profil konselor ─── */}
      {hasCounselors ? (
        <section className="pb-16" id="konselor">
          <Reveal>
            <div className="mb-8 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
                <HeartHandshake size={12} /> Tim Konselor
              </span>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Konselor karier pendampingmu
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
                Guru BK &amp; konselor berpengalaman yang siap membimbing setiap langkah eksplorasi kariermu.
              </p>
            </div>
          </Reveal>
          <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-3 sm:gap-4">
            {data.counselors.map((c, i) => (
              <Reveal key={c.id} delay={(i % 4) * 0.07} className="w-[170px] sm:w-[210px]">
                <CounselorCard c={c} index={i} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* ─── Sekolah mitra berjalan ─── */}
      {hasPartners ? (
        <section className="pb-16" id="mitra">
          <Reveal>
            <div className="mb-6 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-600">
                <School size={12} /> Sekolah Mitra
              </span>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Dipercaya {data.partners.length} sekolah mitra
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <PartnerStrip partners={data.partners} />
          </Reveal>
        </section>
      ) : null}
    </>
  );
}
