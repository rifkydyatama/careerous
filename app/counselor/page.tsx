"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  Users,
  AlertTriangle,
  Lock,
  Crown,
  ClipboardCheck,
  MessageSquareText,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import {
  fetchCounselorOverview,
  getInitials,
  formatDateTimeId,
  CounselorStudent,
  COUNSELOR_TOTAL_WEEKS,
} from "./utils";
import { getMood } from "@/lib/modules";

export default function CounselorDashboard() {
  const router = useRouter();
  const [students, setStudents] = useState<CounselorStudent[]>([]);
  const [totalWeeks, setTotalWeeks] = useState(COUNSELOR_TOTAL_WEEKS);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await fetchCounselorOverview();
        if (mounted) {
          setStudents(response.students);
          setTotalWeeks(response.totalWeeks ?? COUNSELOR_TOTAL_WEEKS);
        }
      } catch (error) {
        if (mounted) setErrorMessage(error instanceof Error ? error.message : "Gagal memuat data siswa");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    const totalStudents = students.length;
    const totalCompleted = students.reduce((acc, s) => acc + s.completedCount, 0);
    const totalPending = students.reduce((acc, s) => acc + s.pendingFeedback, 0);
    const needAttention = students.filter((s) => s.lateModules > 0 || s.lockedModules > 0).length;
    const premium = students.filter((s) => s.premium).length;
    const finished = students.filter((s) => s.completedCount >= totalWeeks).length;
    const avgProgress = totalStudents
      ? Math.round((totalCompleted / (totalWeeks * totalStudents)) * 100)
      : 0;
    return { totalStudents, totalCompleted, totalPending, needAttention, premium, finished, avgProgress };
  }, [students, totalWeeks]);

  // Data grafik: progres per siswa (top 8 berdasarkan progres).
  const progressData = useMemo(
    () =>
      students
        .map((s) => ({ name: getInitials(s.name), full: s.name ?? "—", modul: s.completedCount }))
        .sort((a, b) => b.modul - a.modul)
        .slice(0, 8),
    [students]
  );

  // Distribusi status siswa.
  const statusData = useMemo(() => {
    const finished = students.filter((s) => s.completedCount >= totalWeeks).length;
    const attention = students.filter((s) => s.lateModules > 0 || s.lockedModules > 0).length;
    const inProgress = students.length - finished - attention;
    return [
      { name: "Tuntas", value: finished, color: "#10b981" },
      { name: "Dalam proses", value: Math.max(0, inProgress), color: "#3b82f6" },
      { name: "Perlu perhatian", value: attention, color: "#f59e0b" },
    ].filter((d) => d.value > 0);
  }, [students, totalWeeks]);

  const attentionStudents = useMemo(
    () =>
      students
        .filter((s) => s.lateModules > 0 || s.lockedModules > 0 || s.pendingFeedback > 0)
        .sort(
          (a, b) =>
            b.lockedModules - a.lockedModules ||
            b.lateModules - a.lateModules ||
            b.pendingFeedback - a.pendingFeedback
        )
        .slice(0, 6),
    [students]
  );

  const lateReasons = useMemo(() => {
    const items: { student: string; week: number; reason: string; mood: string | null; at?: string }[] = [];
    for (const s of students) {
      for (const j of s.journals) {
        if (j.lateReason) {
          items.push({ student: s.name ?? "—", week: j.weekNumber, reason: j.lateReason, mood: j.lateMood ?? null, at: j.updatedAt });
        }
      }
    }
    return items
      .sort((a, b) => (b.at ? new Date(b.at).getTime() : 0) - (a.at ? new Date(a.at).getTime() : 0))
      .slice(0, 5);
  }, [students]);

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-slate-900">Dasbor Administrasi Konselor</h2>
        <p className="mt-1 text-[13px] text-slate-500">
          Pantau progres, identifikasi siswa yang perlu pendampingan, dan tindak lanjuti dengan cepat.
        </p>
      </div>

      {isLoading ? (
        <LoadingCard />
      ) : errorMessage && students.length === 0 ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
          <p className="text-sm font-bold text-rose-900">Gagal memuat data dasbor</p>
          <p className="mt-1 text-[13px] text-rose-700">{errorMessage}</p>
        </div>
      ) : (
        <>
          {/* KPI */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi icon={Users} label="Total Siswa" value={summary.totalStudents} sub={`${summary.premium} Premium`} color="from-blue-600 to-blue-400" />
            <Kpi icon={TrendingUp} label="Rata-rata Progres" value={`${summary.avgProgress}%`} sub={`${summary.finished} tuntas`} color="from-teal-600 to-teal-400" progress={summary.avgProgress} />
            <Kpi icon={ClipboardCheck} label="Menunggu Reviu" value={summary.totalPending} sub={summary.totalPending > 0 ? "Perlu umpan balik" : "Semua direviu"} color="from-rose-600 to-rose-400" isRed={summary.totalPending > 0} />
            <Kpi icon={AlertTriangle} label="Perlu Perhatian" value={summary.needAttention} sub="Telat / terkunci" color="from-amber-600 to-amber-400" isRed={summary.needAttention > 0} />
          </div>

          {/* Grafik */}
          <div className="mb-6 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-[14px] font-extrabold text-slate-900">Progres Modul per Siswa</h3>
              {progressData.length === 0 ? (
                <EmptyChart />
              ) : (
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={progressData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, totalWeeks]} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: "rgba(59,130,246,0.06)" }}
                        contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                        formatter={(v: any) => [`${v} modul`, "Selesai"]}
                        labelFormatter={(l: any, p: any) => p?.[0]?.payload?.full ?? l}
                      />
                      <Bar dataKey="modul" fill="#0B1D3A" radius={[6, 6, 0, 0]} maxBarSize={42} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-2 text-[14px] font-extrabold text-slate-900">Status Siswa</h3>
              {statusData.length === 0 ? (
                <EmptyChart />
              ) : (
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={3}>
                        {statusData.map((d) => (
                          <Cell key={d.name} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Panel perhatian + alasan keterlambatan */}
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-600" />
                  <h3 className="text-[14px] font-extrabold text-slate-900">Siswa Perlu Perhatian</h3>
                </div>
                <button
                  onClick={() => router.push("/counselor/students")}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800"
                >
                  Semua siswa <ArrowRight size={12} />
                </button>
              </div>
              {attentionStudents.length === 0 ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-[12.5px] text-emerald-800">
                  Tidak ada siswa yang memerlukan tindakan mendesak. 🎉
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {attentionStudents.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-[12px] font-extrabold text-blue-700">
                        {getInitials(s.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12.5px] font-bold text-slate-900">{s.name}</p>
                        <div className="mt-0.5 flex flex-wrap gap-1.5">
                          {s.lockedModules > 0 && <Tag color="rose" icon={<Lock size={9} />} text={`${s.lockedModules} terkunci`} />}
                          {s.lateModules > 0 && <Tag color="amber" icon={<AlertTriangle size={9} />} text={`${s.lateModules} telat`} />}
                          {s.pendingFeedback > 0 && <Tag color="blue" text={`${s.pendingFeedback} reviu`} />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <MessageSquareText size={16} className="text-indigo-600" />
                <h3 className="text-[14px] font-extrabold text-slate-900">Alasan Keterlambatan Terbaru</h3>
              </div>
              {lateReasons.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-[12px] text-slate-400">
                  Belum ada alasan keterlambatan yang dikirim siswa.
                </p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {lateReasons.map((r, i) => (
                    <div key={i} className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                        <span>{r.student} · Modul {r.week}</span>
                        {(() => {
                          const m = getMood(r.mood);
                          return m ? (
                            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9.5px] normal-case tracking-normal">
                              {m.emoji} {m.label}
                            </span>
                          ) : null;
                        })()}
                      </p>
                      <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-amber-900">{r.reason}</p>
                      {r.at && <p className="mt-1 text-[10px] text-amber-600/70">{formatDateTimeId(r.at)}</p>}
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
        <RefreshCw size={18} className="animate-spin text-[#0B1D3A]" />
        <p className="text-sm font-bold text-slate-900">Memuat data dasbor</p>
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-[12px] text-slate-400">
      Belum ada data untuk ditampilkan.
    </div>
  );
}

function Kpi({ icon: Icon, label, value, sub, color, progress, isRed }: any) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r ${color}`}></div>
      <div className="flex items-center gap-2 text-slate-400">
        <Icon size={15} />
        <p className="text-[10px] font-bold uppercase tracking-wider">{label}</p>
      </div>
      <p className={`mt-2 text-[30px] font-extrabold leading-none ${isRed ? "text-rose-600" : "text-slate-900"}`}>{value}</p>
      <p className="mt-1.5 text-[11.5px] text-slate-500">{sub}</p>
      {progress !== undefined && (
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-teal-500" style={{ width: `${progress}%` }}></div>
        </div>
      )}
    </div>
  );
}

function Tag({ color, icon, text }: { color: string; icon?: React.ReactNode; text: string }) {
  const map: Record<string, string> = {
    rose: "bg-rose-100 text-rose-700",
    amber: "bg-amber-100 text-amber-700",
    blue: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold ${map[color]}`}>
      {icon} {text}
    </span>
  );
}
