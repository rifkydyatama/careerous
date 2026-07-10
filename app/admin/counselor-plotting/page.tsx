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
} from "lucide-react";
import { AdminUser, AdminInstitutionOption, fetchAdminUsers, updateAdminUser, formatDateId } from "../utils";

export default function CounselorPlottingPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [institutions, setInstitutions] = useState<AdminInstitutionOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
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
      setErrorMessage(error instanceof Error ? error.message : "Gagal memuat data pengguna");
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
        `Sukses! Sebanyak ${data.assignedCount} siswa telah di-plot otomatis ke konselor BK sekolah.`
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

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = query.trim().toLowerCase();
      // Search filter
      const matchesSearch =
        !q ||
        (s.name ?? "").toLowerCase().includes(q) ||
        (s.email ?? "").toLowerCase().includes(q);

      // Institution filter
      const matchesInst = !selectedInstId || s.institution?.id === selectedInstId;

      // Plot status filter
      const hasCounselor = Boolean(s.counselor?.id);
      const matchesPlot =
        plotStatus === "ALL" ||
        (plotStatus === "PLOTTED" && hasCounselor) ||
        (plotStatus === "UNPLOTTED" && !hasCounselor);

      return matchesSearch && matchesInst && matchesPlot;
    });
  }, [students, query, selectedInstId, plotStatus]);

  // Statistics calculations
  const stats = useMemo(() => {
    const total = students.length;
    const plotted = students.filter((s) => Boolean(s.counselor?.id)).length;
    const unplotted = total - plotted;
    return { total, plotted, unplotted };
  }, [students]);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Plotting Konselor Akademik</h2>
          <p className="mt-1 text-[13px] text-slate-500">
            Monitor beban bimbingan konselor BK dan kelola plotting penugasan siswa secara dinamis.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleAutoPlot()}
          disabled={isAutoPlotting || stats.unplotted === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-[12.5px] font-bold text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none"
        >
          {isAutoPlotting ? (
            <>
              <RefreshCw size={15} className="animate-spin" /> memproses...
            </>
          ) : (
            <>
              <Sparkles size={15} /> Plotting Otomatis Semua
            </>
          )}
        </button>
      </div>

      {/* Stats Overview widgets */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Total Siswa</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Users size={16} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.total}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Sudah Di-plot</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600">{stats.plotted}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Belum Di-plot</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <ShieldAlert size={16} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-amber-600">{stats.unplotted}</p>
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

      {/* Filter Toolbar */}
      <div className="mb-5 flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari siswa berdasarkan nama / email..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-[12.5px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Institution Filter */}
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

          {/* Plot Status Filter */}
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
            <p className="text-sm font-bold text-slate-900">Memuat data monitoring plotting...</p>
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
                    {/* Student Profile Card */}
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

                    {/* School Institution */}
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

                    {/* Week Progress Bar */}
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

                    {/* Interactive Counselor Assignment Dropdown */}
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
                        <span className="text-[11.5px] text-slate-400 italic">Pilih institusi siswa terlebih dahulu</span>
                      )}
                    </td>

                    {/* Registered Date */}
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
  );
}
