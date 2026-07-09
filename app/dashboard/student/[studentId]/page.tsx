"use client";

import { useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  ChevronRight,
  BookOpen,
  Sparkles,
  Award,
  Trophy,
  Lock,
  Calendar,
  Clock,
  AlertTriangle,
  Target,
  MessageSquareText,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  fetchStudentDashboard,
  fetchStudentAssessment,
  formatDeadlineCountdown,
  StudentDashboardResponse,
  TOTAL_WEEKS,
} from "./utils";
import { computeGamification } from "@/lib/gamification";
import { PHASES } from "@/lib/modules";

export default function StudentDashboardPage() {
  const params = useParams<{ studentId: string }>();
  const studentId = params.studentId;
  const [data, setData] = useState<StudentDashboardResponse | null>(null);
  const [hasAssessment, setHasAssessment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await fetchStudentDashboard(studentId);
        if (mounted) setData(response);
        const assessment = await fetchStudentAssessment(studentId).catch(() => null);
        if (mounted) setHasAssessment(Boolean(assessment));
      } catch (error) {
        if (mounted) {
          setErrorMessage(error instanceof Error ? error.message : "Gagal memuat data dasbor");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [studentId]);

  const stats = useMemo(() => {
    if (!data) return { completed: 0, pending: 0, progress: 0, total: TOTAL_WEEKS, reviewed: 0 };
    const completed = data.journals.filter((j) => j.status === "COMPLETED").length;
    const pending = data.journals.filter(
      (j) => j.status === "COMPLETED" && !j.counselorFeedback && Boolean(j.reflectionText)
    ).length;
    const reviewed = data.journals.filter((j) => Boolean(j.counselorFeedback)).length;
    const total = data.totalWeeks || TOTAL_WEEKS;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, pending, progress, total, reviewed };
  }, [data]);

  const game = useMemo(() => {
    const completedNumbers = (data?.journals ?? [])
      .filter((j) => j.status === "COMPLETED")
      .map((j) => j.weekNumber);
    return computeGamification(completedNumbers, hasAssessment);
  }, [data, hasAssessment]);

  const phaseProgress = useMemo(() => {
    const completed = new Set(
      (data?.journals ?? []).filter((j) => j.status === "COMPLETED").map((j) => j.weekNumber)
    );
    return PHASES.map((p) => {
      const total = p.range[1] - p.range[0] + 1;
      let done = 0;
      for (let n = p.range[0]; n <= p.range[1]; n += 1) if (completed.has(n)) done += 1;
      return { label: p.label, description: p.description, done, total, pct: Math.round((done / total) * 100) };
    });
  }, [data]);

  const activeModule = useMemo(() => {
    if (!data) return null;
    const unlocked = data.journals.find((j) => j.status === "UNLOCKED" && !j.premiumLocked);
    return unlocked ?? null;
  }, [data]);

  const recentFeedback = useMemo(() => {
    return (data?.journals ?? [])
      .filter((j) => Boolean(j.counselorFeedback))
      .sort((a, b) => b.weekNumber - a.weekNumber)
      .slice(0, 3);
  }, [data]);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Dasbor Utama</h2>
          <p className="mt-1 text-[13px] text-slate-500">Ringkasan perjalanan eksplorasi karier Anda.</p>
        </div>
      </div>

      {isLoading ? (
        <LoadingCard />
      ) : errorMessage || !data ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
          <p className="text-sm font-bold text-rose-900">Gagal memuat data dasbor</p>
          <p className="mt-1 text-[13px] text-rose-700">{errorMessage || "Data tidak ditemukan."}</p>
        </div>
      ) : (
        <>
          {/* Hero */}
          <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#1d4ed8] via-[#2563eb] to-[#0ea5e9] p-7 shadow-md shadow-blue-500/20">
            <div className="absolute -right-16 -top-16 h-[250px] w-[250px] rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute -bottom-16 -left-16 h-[200px] w-[200px] rounded-full bg-white/10 blur-2xl"></div>
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
              <div className="text-white">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[1.5px] text-sky-100">Ruang Siswa</p>
                <h3 className="text-2xl font-extrabold leading-tight">
                  Halo, {data.student?.name?.split(" ")[0] || "Siswa"}!
                </h3>
                <p className="mt-2 max-w-md text-[13px] leading-relaxed text-white/60">
                  {stats.completed === 0
                    ? "Mulai modul pertamamu dan ikuti Tes RIASEC untuk mengenali minat kariermu."
                    : stats.completed >= stats.total
                      ? "Luar biasa! Kamu telah menuntaskan seluruh modul eksplorasi karier."
                      : `Kamu sudah menuntaskan ${stats.completed} dari ${stats.total} modul. Teruskan langkahmu!`}
                </p>
                {data.premium && (
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10.5px] font-bold text-white">
                    <Sparkles size={11} /> Akses Premium aktif
                    {data.premiumSource === "INSTITUTION" ? " (institusi)" : ""}
                  </span>
                )}
              </div>

              {/* Cincin progres */}
              <div className="flex items-center gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <ProgressRing percent={stats.progress} />
                <div className="space-y-2.5">
                  <MiniStat label="Modul Tuntas" value={`${stats.completed}/${stats.total}`} />
                  <MiniStat label="Sudah Direviu" value={`${stats.reviewed}`} accent />
                  <MiniStat label="Poin" value={`${game.points}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Baris: modul aktif + progres fase */}
          <div className="mb-6 grid gap-5 lg:grid-cols-[1.1fr_1.4fr]">
            <ActiveModuleCard studentId={studentId} active={activeModule} completed={stats.completed} total={stats.total} />
            <PhaseProgressCard phases={phaseProgress} />
          </div>

          {/* Gamifikasi */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#0ea5e9] text-white shadow-sm">
                  <Trophy size={22} />
                </div>
                <div>
                  <h3 className="text-[15px] font-extrabold text-slate-900">Pencapaian Anda</h3>
                  <p className="text-[12px] text-slate-500">Level {game.level} · {game.levelLabel}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-end gap-1.5">
                  <span className="text-[28px] font-extrabold leading-none text-[#3b82f6]">{game.points}</span>
                  <span className="mb-1 text-[12px] font-bold text-slate-400">poin</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {game.badges.filter((b) => b.earned).length}/{game.badges.length} lencana
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
              {game.badges.map((badge) => (
                <div
                  key={badge.key}
                  title={badge.description}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition ${
                    badge.earned ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50 opacity-60"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      badge.earned ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {badge.earned ? <Award size={16} /> : <Lock size={14} />}
                  </div>
                  <span className="text-[10px] font-bold leading-tight text-slate-700">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Akses cepat + umpan balik terbaru */}
          <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              <QuickCard
                href={`/dashboard/student/${studentId}/journals`}
                icon={<BookOpen size={18} />}
                color="blue"
                title="Modul Eksplorasi"
                desc="Kerjakan modul & baca umpan balik konselor."
                cta="Buka Modul"
              />
              <QuickCard
                href={`/dashboard/student/${studentId}/riasec`}
                icon={<Sparkles size={18} />}
                color="indigo"
                title="Tes RIASEC"
                desc="Kenali tipe kepribadian & minat kariermu."
                cta="Mulai Tes"
              />
              <QuickCard
                href={`/dashboard/student/${studentId}/schedule`}
                icon={<Calendar size={18} />}
                color="teal"
                title="Jadwal Konseling"
                desc="Lihat & ikuti sesi konseling bersama BK."
                cta="Lihat Jadwal"
              />
              <QuickCard
                href={`/dashboard/student/${studentId}/report`}
                icon={<FileText size={18} />}
                color="amber"
                title="Career Report"
                desc={data.hasReport ? "Ringkasan AI perjalanan kariermu." : "Tersedia setelah 12 modul selesai."}
                cta={data.hasReport ? "Lihat Laporan" : "Belum tersedia"}
                disabled={!data.hasReport}
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <MessageSquareText size={16} className="text-emerald-600" />
                <h3 className="text-[14px] font-extrabold text-slate-900">Umpan Balik Terbaru</h3>
              </div>
              {recentFeedback.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-[12px] text-slate-400">
                  Belum ada umpan balik dari konselor.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentFeedback.map((j) => (
                    <div key={j.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        Modul {j.weekNumber}{j.title ? ` · ${j.title}` : ""}
                      </p>
                      <p className="mt-1 line-clamp-3 text-[12px] leading-relaxed text-slate-600">
                        {j.counselorFeedback}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

function LoadingCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <RefreshCw size={18} className="animate-spin text-[#2563eb]" />
        <div>
          <p className="text-sm font-bold text-slate-900">Memuat data dasbor</p>
          <p className="text-[13px] text-slate-500">Menyinkronkan data Anda.</p>
        </div>
      </div>
    </div>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  return (
    <div
      className="relative flex h-[92px] w-[92px] items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(#7dd3fc ${percent * 3.6}deg, rgba(255,255,255,0.15) 0deg)`,
      }}
    >
      <div className="flex h-[72px] w-[72px] flex-col items-center justify-center rounded-full bg-[#1e3a8a]">
        <span className="text-[20px] font-extrabold leading-none text-white">{percent}%</span>
        <span className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-white/40">Progres</span>
      </div>
    </div>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">{label}</p>
      <p className={`text-[15px] font-extrabold leading-none ${accent ? "text-sky-200" : "text-white"}`}>{value}</p>
    </div>
  );
}

function ActiveModuleCard({
  studentId,
  active,
  completed,
  total,
}: {
  studentId: string;
  active: StudentDashboardResponse["journals"][number] | null;
  completed: number;
  total: number;
}) {
  const countdown = active?.deadlineAt ? formatDeadlineCountdown(active.deadlineAt) : null;
  const allDone = completed >= total;

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Target size={16} className="text-blue-600" />
        <h3 className="text-[14px] font-extrabold text-slate-900">Fokus Saat Ini</h3>
      </div>

      {allDone ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
          <Trophy size={26} className="mb-2 text-emerald-600" />
          <p className="text-[13px] font-bold text-emerald-800">Semua modul tuntas!</p>
          <p className="mt-1 text-[11.5px] text-emerald-700">Lihat Career Report-mu sebagai bahan konseling.</p>
        </div>
      ) : active ? (
        <div className="flex flex-1 flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Modul {active.weekNumber}{active.phaseLabel ? ` · ${active.phaseLabel}` : ""}
          </span>
          <p className="mt-1 text-[16px] font-extrabold text-slate-900">{active.title || "Modul berikutnya"}</p>
          {active.prompt && (
            <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-slate-500">{active.prompt}</p>
          )}
          {countdown && (
            <div
              className={`mt-3 inline-flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                countdown.overdue ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-700"
              }`}
            >
              {countdown.overdue ? <AlertTriangle size={12} /> : <Clock size={12} />} {countdown.text}
            </div>
          )}
          <Link
            href={`/dashboard/student/${studentId}/journals`}
            className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-lg bg-[#2563eb] px-4 py-2 text-[12px] font-bold text-white transition hover:bg-[#1d4ed8]"
          >
            Kerjakan Sekarang <ChevronRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
          <Lock size={22} className="mb-2 text-slate-300" />
          <p className="text-[12px] font-medium text-slate-500">
            Tidak ada modul aktif. Modul berikutnya mungkin butuh Premium atau sedang terkunci.
          </p>
        </div>
      )}
    </div>
  );
}

function PhaseProgressCard({
  phases,
}: {
  phases: { label: string; description: string; done: number; total: number; pct: number }[];
}) {
  const PHASE_COLORS = ["bg-blue-500", "bg-indigo-500", "bg-amber-500"];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-[14px] font-extrabold text-slate-900">Progres 3 Fase Eksplorasi</h3>
      <div className="space-y-4">
        {phases.map((p, i) => (
          <div key={p.label}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[12.5px] font-bold text-slate-800">{p.label}</span>
              <span className="text-[11px] font-bold text-slate-500">{p.done}/{p.total}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${PHASE_COLORS[i]} transition-all duration-700`} style={{ width: `${p.pct}%` }}></div>
            </div>
            <p className="mt-1 text-[10.5px] text-slate-400">{p.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const COLOR_MAP: Record<string, { box: string; text: string; ring: string }> = {
  blue: { box: "bg-blue-100 text-blue-600", text: "text-blue-600", ring: "hover:border-blue-300" },
  indigo: { box: "bg-indigo-100 text-indigo-600", text: "text-indigo-600", ring: "hover:border-indigo-300" },
  teal: { box: "bg-teal-100 text-teal-600", text: "text-teal-600", ring: "hover:border-teal-300" },
  amber: { box: "bg-amber-100 text-amber-600", text: "text-amber-600", ring: "hover:border-amber-300" },
};

function QuickCard({
  href,
  icon,
  color,
  title,
  desc,
  cta,
  disabled,
}: {
  href: string;
  icon: React.ReactNode;
  color: string;
  title: string;
  desc: string;
  cta: string;
  disabled?: boolean;
}) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.blue;
  const inner = (
    <>
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${c.box}`}>{icon}</div>
      <h4 className="text-[14.5px] font-extrabold text-slate-900">{title}</h4>
      <p className="mt-1 text-[12px] leading-relaxed text-slate-500">{desc}</p>
      <div className={`mt-3 flex items-center text-[11.5px] font-bold ${disabled ? "text-slate-300" : c.text}`}>
        {cta} {!disabled && <ChevronRight size={14} className="ml-0.5" />}
      </div>
    </>
  );
  if (disabled) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-5 opacity-70">{inner}</div>;
  }
  return (
    <Link
      href={href}
      className={`block rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${c.ring}`}
    >
      {inner}
    </Link>
  );
}
