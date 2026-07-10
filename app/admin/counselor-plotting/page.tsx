"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import {
  RefreshCw,
  Search,
  UserCheck,
  Building2,
  Users,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  BarChart3,
  Activity,
  Award,
  ArrowRight,
} from "lucide-react";
import { AdminUser, AdminInstitutionOption, fetchAdminUsers, updateAdminUser, formatDateId } from "../utils";

type ActiveTab = "STUDENTS" | "COUNSELORS";

export default function CounselorPlottingPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [institutions, setInstitutions] = useState<AdminInstitutionOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<ActiveTab>("STUDENTS");

  // Filters
  const [query, setQuery] = useState("");
  const [selectedInstId, setSelectedInstId] = useState("");
  const [plotStatus, setPlotStatus] = useState<"ALL" | "PLOTTED" | "UNPLOTTED">("ALL");

  const [savingId, setSavingId] = useState<string | null>(null);
  const [isAutoPlotting, setIsAutoPlotting] = useState(false);
  const [autoPlotSuccessMsg, setAutoPlotSuccessMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await fetchAdminUsers();
      setUsers(result.users);
      setInstitutions(result.institutions);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Update counselor assignment
  const handleAssign = async (studentId: string, counselorId: string | null) => {
    setSavingId(studentId);
    setErrorMessage(null);
    setAutoPlotSuccessMsg(null);
    
    // Optimistic Update
    setUsers((prev) =>
      prev.map((u) =>
        u.id === studentId
          ? {
              ...u,
              counselor: counselorId
                ? (() => {
                    const matched = prev.find((x) => x.id === counselorId);
                    return matched ? { id: matched.id, name: matched.name || "Konselor" } : null;
                  })()
                : null,
            }
          : u
      )
    );

    try {
      await updateAdminUser(studentId, { counselorId });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal memperbarui plotting konselor");
      await load();
    } finally {
      setSavingId(null);
    }
  };

  // Run auto plotting
  const handleAutoPlot = async () => {
    setIsAutoPlotting(true);
    setAutoPlotSuccessMsg(null);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/counselor-plotting/auto-assign", {
        method: "POST",
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Gagal melakukan plotting otomatis");
      }
      const data = await res.json();
      setAutoPlotSuccessMsg(
        `Sukses! Sebanyak ${data.assignedCount} siswa telah berhasil di-plot otomatis menggunakan load balancing.`
      );
      await load();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal melakukan plotting otomatis");
    } finally {
      setIsAutoPlotting(false);
    }
  };

  // Filter students
  const students = useMemo(() => {
    return users.filter((u) => u.role === "STUDENT");
  }, [users]);

  const counselors = useMemo(() => {
    return users.filter((u) => u.role === "COUNSELOR");
  }, [users]);

  // Counselor evaluation KPI calculations
  const counselorMetrics = useMemo(() => {
    return counselors.map((c) => {
      // Find all students assigned to this counselor
      const assignedStudents = students.filter((s) => s.counselor?.id === c.id);
      const totalStudents = assignedStudents.length;

      // Calculate average module progress of their students
      const totalJournals = assignedStudents.reduce((sum, s) => sum + ((s as any)._count?.journalProgress ?? 0), 0);
      const avgProgressPct = totalStudents > 0 ? Math.round((totalJournals / (totalStudents * 12)) * 100) : 0;

      // Workload Load Status Rating
      let loadStatus: "LOW" | "OPTIMAL" | "OVERLOAD" = "LOW";
      if (totalStudents > 20) loadStatus = "OVERLOAD";
      else if (totalStudents >= 8) loadStatus = "OPTIMAL";

      return {
        ...c,
        totalStudents,
        avgProgressPct,
        loadStatus,
      };
    });
  }, [counselors, students]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = query.trim().toLowerCase();
      
      const matchesSearch =
        !q ||
        (s.name ?? "").toLowerCase().includes(q) ||
        (s.email ?? "").toLowerCase().includes(q);

      const matchesInst = !selectedInstId || s.institution?.id === selectedInstId;

      const hasCounselor = Boolean(s.counselor?.id);
      const matchesPlot =
        plotStatus === "ALL" ||
        (plotStatus === "PLOTTED" && hasCounselor) ||
        (plotStatus === "UNPLOTTED" && !hasCounselor);

      return matchesSearch && matchesInst && matchesPlot;
    });
  }, [students, query, selectedInstId, plotStatus]);

  // Statistics summaries
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const plottedStudents = students.filter((s) => Boolean(s.counselor?.id)).length;
    const unplottedStudents = totalStudents - plottedStudents;
    const totalCounselors = counselors.length;

    // Average students per counselor
    const avgLoad = totalCounselors > 0 ? Math.round((plottedStudents / totalCounselors) * 10) / 10 : 0;

    // System-wide average progress rate
    const totalJournals = students.reduce((sum, s) => sum + ((s as any)._count?.journalProgress ?? 0), 0);
    const avgSystemProgress = totalStudents > 0 ? Math.round((totalJournals / (totalStudents * 12)) * 100) : 0;

    return {
      totalStudents,
      plottedStudents,
      unplottedStudents,
      totalCounselors,
      avgLoad,
      avgSystemProgress,
    };
  }, [students, counselors]);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Dasbor & Evaluasi Konselor</h2>
          <p className="mt-1 text-[13px] text-slate-500">
            Analisis beban bimbingan, pantau indikator kinerja utama (KPI), dan kelola plotting konselor BK.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition shadow-xs"
            title="Muat Ulang Data"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          </button>
          
          <button
            type="button"
            onClick={() => void handleAutoPlot()}
            disabled={isAutoPlotting || stats.unplottedStudents === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-[12.5px] font-bold text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            {isAutoPlotting ? (
              <>
                <RefreshCw size={15} className="animate-spin" /> memproses...
              </>
            ) : (
              <>
                <Sparkles size={15} /> Plotting Otomatis Massal
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analytics KPI Widgets Grid */}
      <div className="mb-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Total Students Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Siswa Aktif</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users size={16} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">{stats.totalStudents}</p>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
            <span className="font-bold text-emerald-600">{stats.plottedStudents}</span> ter-plot
            <span className="text-slate-300">|</span>
            <span className="font-bold text-amber-600">{stats.unplottedStudents}</span> antrean
          </div>
        </div>

        {/* Total Counselors Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Konselor Terdaftar</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <UserCheck size={16} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">{stats.totalCounselors}</p>
          <p className="mt-2 text-[11px] text-slate-400">Guru Bimbingan Konseling aktif</p>
        </div>

        {/* Avg work load ratio Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rasio Beban Bimbingan</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <Activity size={16} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">{stats.avgLoad}</p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            <span>Optimal rasio: &lt; 25 siswa / BK</span>
          </div>
        </div>

        {/* Success module progress Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rata-rata Progres Modul</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-emerald-600">{stats.avgSystemProgress}%</p>
          <p className="mt-2 text-[11px] text-slate-400">Rata-rata penyelesaian 12 modul siswa</p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
          {errorMessage}
        </div>
      )}

      {autoPlotSuccessMsg && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-700 flex items-center gap-2">
          <CheckCircle2 size={15} className="shrink-0" />
          <span>{autoPlotSuccessMsg}</span>
        </div>
      )}

      {/* Tabs navigation panel */}
      <div className="mb-6 flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("STUDENTS")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-bold transition-all ${
            activeTab === "STUDENTS"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          <Users size={16} />
          Plotting Bimbingan Siswa
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("COUNSELORS")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-bold transition-all ${
            activeTab === "COUNSELORS"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          <BarChart3 size={16} />
          Evaluasi Kinerja Konselor (KPI)
        </button>
      </div>

      {/* Tab 1: Student Plotting Table */}
      {activeTab === "STUDENTS" && (
        <>
          {/* Filters toolbar panel */}
          <div className="mb-5 flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama / email siswa..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-[12.5px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Institution Selector */}
              <div className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2 py-1">
                <Building2 size={13} className="text-slate-400" />
                <select
                  value={selectedInstId}
                  onChange={(e) => setSelectedInstId(e.target.value)}
                  className="bg-transparent text-[12px] outline-none text-slate-700 font-medium py-1"
                >
                  <option value="">Semua Sekolah</option>
                  {institutions.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2 py-1">
                <UserCheck size={13} className="text-slate-400" />
                <select
                  value={plotStatus}
                  onChange={(e) => setPlotStatus(e.target.value as any)}
                  className="bg-transparent text-[12px] outline-none text-slate-700 font-medium py-1"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="PLOTTED">Sudah Di-plot</option>
                  <option value="UNPLOTTED">Belum Di-plot</option>
                </select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <RefreshCw size={18} className="animate-spin text-[#2563eb]" />
                <p className="text-sm font-bold text-slate-900">Memuat data plotting...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[900px] text-left text-[12.5px]">
                <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Siswa</th>
                    <th className="px-4 py-3">Institusi / Sekolah</th>
                    <th className="px-4 py-3">Progres Eksplorasi</th>
                    <th className="px-4 py-3">Konselor BK Akademik</th>
                    <th className="px-4 py-3">Terdaftar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((u) => {
                    const journalCount = (u as any)._count?.journalProgress ?? 0;
                    const progressPct = Math.round((journalCount / 12) * 100);

                    return (
                      <tr key={u.id} className={savingId === u.id ? "opacity-60" : ""}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-extrabold text-[12px] border border-blue-100">
                              {(u.name?.[0] || "S").toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{u.name || "—"}</p>
                              <p className="text-[11px] text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          {u.institution ? (
                            <div>
                              <p className="font-bold text-slate-700">{u.institution.name}</p>
                              <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-bold text-slate-500 uppercase tracking-wide">
                                {u.plan}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Belum memilih sekolah</span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex max-w-[150px] flex-col gap-1">
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                              <span>{journalCount}/12 modul</span>
                              <span>{progressPct}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#2563eb]"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          {u.institution ? (
                            <select
                              value={u.counselor?.id ?? ""}
                              onChange={(e) => void handleAssign(u.id, e.target.value || null)}
                              disabled={savingId === u.id}
                              className="max-w-[200px] rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-[11.5px] outline-none focus:border-blue-500 disabled:opacity-50 font-medium text-slate-800"
                            >
                              <option value="">— Belum Di-plot —</option>
                              {users
                                .filter((c) => c.role === "COUNSELOR" && c.institution?.id === u.institution?.id)
                                .map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name || c.email}
                                  </option>
                                ))}
                            </select>
                          ) : (
                            <span className="text-[11.5px] text-slate-400 italic">Pilih institusi siswa dulu</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-slate-500">{formatDateId(u.createdAt)}</td>
                      </tr>
                    );
                  })}

                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                        Tidak ada siswa ditemukan yang cocok dengan kriteria filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Tab 2: Counselor Evaluation & KPI Metrics */}
      {activeTab === "COUNSELORS" && (
        <>
          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <RefreshCw size={18} className="animate-spin text-[#2563eb]" />
                <p className="text-sm font-bold text-slate-900">Memuat analisis kinerja...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[900px] text-left text-[12.5px]">
                <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Nama Konselor</th>
                    <th className="px-4 py-3">Institusi / Sekolah</th>
                    <th className="px-4 py-3">Siswa Bimbingan</th>
                    <th className="px-4 py-3">Tingkat Beban Kerja</th>
                    <th className="px-4 py-3">Rata-rata Progres Siswa (KPI)</th>
                    <th className="px-4 py-3">Evaluasi Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {counselorMetrics.map((c) => {
                    const loadPercentage = Math.min((c.totalStudents / 20) * 100, 100);

                    // Colors for KPI Status Rating
                    let statusBadge = (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-700">
                        <CheckCircle2 size={11} /> Rendah (Aman)
                      </span>
                    );
                    if (c.loadStatus === "OVERLOAD") {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10.5px] font-bold text-rose-700">
                          <ShieldAlert size={11} /> Overload
                        </span>
                      );
                    } else if (c.loadStatus === "OPTIMAL") {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10.5px] font-bold text-blue-700">
                          <Activity size={11} /> Optimal
                        </span>
                      );
                    }

                    // Progress rating background colors
                    let progressColor = "bg-rose-500";
                    if (c.avgProgressPct >= 70) progressColor = "bg-emerald-500";
                    else if (c.avgProgressPct >= 40) progressColor = "bg-blue-500";

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition">
                        {/* Profile Details */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-extrabold text-[12px] border border-indigo-100 shadow-inner">
                              {(c.name?.[0] || "C").toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{c.name || "—"}</p>
                              <p className="text-[11px] text-slate-400">{c.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* School/Institution */}
                        <td className="px-4 py-3 font-bold text-slate-700">
                          {c.institution?.name || "—"}
                        </td>

                        {/* Work Load Progress indicator */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1 max-w-[140px]">
                            <span className="font-bold text-slate-800">{c.totalStudents} siswa</span>
                            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  c.loadStatus === "OVERLOAD"
                                    ? "bg-rose-500"
                                    : c.loadStatus === "OPTIMAL"
                                      ? "bg-blue-600"
                                      : "bg-emerald-500"
                                }`}
                                style={{ width: `${loadPercentage}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Workload tag */}
                        <td className="px-4 py-3">{statusBadge}</td>

                        {/* Avg completion progress */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 border border-slate-100">
                              <span className="text-[11px] font-extrabold text-slate-700">{c.avgProgressPct}%</span>
                            </div>
                            <div className="h-2 w-24 rounded-full bg-slate-100 overflow-hidden">
                              <div className={`h-full ${progressColor}`} style={{ width: `${c.avgProgressPct}%` }} />
                            </div>
                          </div>
                        </td>

                        {/* KPI Rating */}
                        <td className="px-4 py-3">
                          {c.totalStudents === 0 ? (
                            <span className="text-slate-400 italic text-[11px]">Belum ada siswa ter-plot</span>
                          ) : c.avgProgressPct >= 80 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                              <Award size={13} /> Sangat Efektif (A)
                            </span>
                          ) : c.avgProgressPct >= 50 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600">
                              <Award size={13} /> Efektif (B)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
                              <ArrowRight size={13} /> Butuh Perhatian (C)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {counselorMetrics.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                        Tidak ada konselor terdaftar untuk evaluasi kinerja.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  );
}
