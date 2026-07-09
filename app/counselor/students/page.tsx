"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshCw, CheckCircle2, ChevronRight, Clock, FileText, ExternalLink, Sparkles,
  AlertTriangle, Lock, Crown, KeyRound, Search, X, SlidersHorizontal, User, Mail
} from "lucide-react";
import {
  fetchCounselorOverview,
  fetchStudentReport,
  unlockStudentModule,
  formatDateTimeId,
  CounselorStudent,
  CounselorJournal,
  CounselorCareerReport,
  COUNSELOR_TOTAL_WEEKS,
  COUNSELOR_LEARNING_STYLE_LABELS,
  COUNSELOR_RIASEC_DIMENSIONS,
  getInitials,
} from "../utils";
import { getModule } from "@/lib/modules";

export default function StudentsPage() {
  const [students, setStudents] = useState<CounselorStudent[]>([]);
  const [totalWeeks, setTotalWeeks] = useState(COUNSELOR_TOTAL_WEEKS);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "LOCKED" | "PENDING" | "PREMIUM">("ALL");

  
  const [selectedStudent, setSelectedStudent] = useState<CounselorStudent | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  
  const [resetTarget, setResetTarget] = useState<CounselorStudent | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetchCounselorOverview();
      setStudents(response.students);
      setTotalWeeks(response.totalWeeks ?? COUNSELOR_TOTAL_WEEKS);
      
      
      if (selectedStudent) {
        const updated = response.students.find((s) => s.id === selectedStudent.id);
        if (updated) setSelectedStudent(updated);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal memuat data siswa"
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedStudent]);

  useEffect(() => {
    void loadOverview();
    
  }, []);

  
  const handleUnlockModule = async (studentId: string, weekNumber: number) => {
    try {
      await unlockStudentModule(studentId, weekNumber);
      
      
      setStudents((prev) =>
        prev.map((student) => {
          if (student.id !== studentId) return student;

          const updatedJournals = student.journals.map((j) =>
            j.weekNumber === weekNumber
              ? { ...j, status: "UNLOCKED" as const, lockedUntil: null, lateCount: 3 }
              : j
          );

          const lateModules = updatedJournals.filter(
            (j) => j.status === "UNLOCKED" && (j.lateCount ?? 0) > 0 && (j.lateCount ?? 0) < 3
          ).length;

          const lockedModules = updatedJournals.filter(
            (j) => j.status === "LOCKED" && (j.lateCount ?? 0) > 0
          ).length;

          const updatedStudent = {
            ...student,
            journals: updatedJournals,
            lateModules,
            lockedModules,
          };

          if (selectedStudent && selectedStudent.id === studentId) {
            setSelectedStudent(updatedStudent);
          }

          return updatedStudent;
        })
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal membuka modul");
    }
  };

  const handleResetPassword = async () => {
    if (!resetTarget || resetPassword.length < 8) {
      setResetError("Kata sandi baru minimal 8 karakter.");
      return;
    }
    setIsResetting(true);
    setResetError(null);
    try {
      const res = await fetch("/api/counselor/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: resetTarget.id, newPassword: resetPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Gagal mereset kata sandi");
      }
      setResetSuccess(`Kata sandi ${resetTarget.name} berhasil direset.`);
      setResetPassword("");
      setTimeout(() => {
        setResetTarget(null);
        setResetSuccess(null);
      }, 2000);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "Gagal mereset");
    } finally {
      setIsResetting(false);
    }
  };

  
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        (s.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.email ?? "").toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      switch (filterType) {
        case "LOCKED":
          return s.lateModules > 0 || s.lockedModules > 0;
        case "PENDING":
          return s.pendingFeedback > 0;
        case "PREMIUM":
          return s.premium;
        default:
          return true;
      }
    });
  }, [students, searchQuery, filterType]);

  const handleOpenDrawer = (student: CounselorStudent) => {
    setSelectedStudent(student);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    
    setTimeout(() => setSelectedStudent(null), 300);
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Kelola & Pendampingan Siswa</h2>
          <p className="mt-1 text-[13px] text-slate-500">Pantau progres belajar, hasil tes minat bakat RIASEC, reviu jurnal, dan AI Insights.</p>
        </div>
        <button
          onClick={() => void loadOverview()}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          Segarkan Data
        </button>
      </div>

      {}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari siswa berdasarkan nama / email..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-medium outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-400/10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 mr-2 uppercase tracking-wider">
            <SlidersHorizontal size={12} /> Filter:
          </span>
          <FilterButton active={filterType === "ALL"} onClick={() => setFilterType("ALL")} label="Semua Siswa" />
          <FilterButton active={filterType === "LOCKED"} onClick={() => setFilterType("LOCKED")} label="Terblokir/Kendala" isAlert count={students.filter((s) => s.lateModules > 0 || s.lockedModules > 0).length} />
          <FilterButton active={filterType === "PENDING"} onClick={() => setFilterType("PENDING")} label="Butuh Reviu" count={students.filter((s) => s.pendingFeedback > 0).length} />
          <FilterButton active={filterType === "PREMIUM"} onClick={() => setFilterType("PREMIUM")} label="Premium" />
        </div>
      </div>

      {}
      {isLoading && students.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <RefreshCw size={24} className="mx-auto animate-spin text-blue-600 mb-3" />
          <p className="text-sm font-bold text-slate-900">Menghubungkan Database</p>
          <p className="text-xs text-slate-500 mt-1">Mengambil profil progres akademik siswa Anda...</p>
        </div>
      ) : errorMessage && students.length === 0 ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center shadow-sm">
          <AlertTriangle size={24} className="mx-auto text-rose-600 mb-3" />
          <p className="text-sm font-bold text-rose-900">Gagal Memuat Data</p>
          <p className="text-xs text-rose-700 mt-1">{errorMessage}</p>
          <button
            onClick={() => void loadOverview()}
            className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-rose-700"
          >
            Coba Lagi
          </button>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
          <User size={28} className="mx-auto text-slate-400 mb-3" />
          <p className="text-sm font-bold text-slate-900">Tidak ada siswa ditemukan</p>
          <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau filter yang Anda gunakan.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[850px] text-left text-[12.5px] border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">Nama & Email</th>
                <th className="px-5 py-3.5">Progres Modul</th>
                <th className="px-5 py-3.5">Status Kendala</th>
                <th className="px-5 py-3.5">Minat Bakat (RIASEC)</th>
                <th className="px-5 py-3.5">Paket</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => {
                const assessment = student.latestAssessment;
                const progressPct = totalWeeks ? Math.round((student.completedCount / totalWeeks) * 100) : 0;
                const hasBlockers = student.lateModules > 0 || student.lockedModules > 0;
                
                return (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors group">
                    {}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-[13px] font-bold text-blue-700">
                          {getInitials(student.name)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{student.name || "—"}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{student.email}</p>
                        </div>
                      </div>
                    </td>

                    {}
                    <td className="px-5 py-3">
                      <div className="max-w-[140px]">
                        <div className="mb-1 flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-600">{student.completedCount} / {totalWeeks} Modul</span>
                          <span className="font-bold text-slate-400">{progressPct}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${progressPct >= 80 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {}
                    <td className="px-5 py-3">
                      {hasBlockers ? (
                        <div className="flex flex-wrap gap-1">
                          {student.lateModules > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9.5px] font-bold text-amber-700">
                              <AlertTriangle size={10} /> {student.lateModules} Telat
                            </span>
                          )}
                          {student.lockedModules > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[9.5px] font-bold text-rose-700">
                              <Lock size={10} /> {student.lockedModules} Terblokir
                            </span>
                          )}
                        </div>
                      ) : student.pendingFeedback > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[9.5px] font-bold text-orange-700">
                          <Clock size={10} /> {student.pendingFeedback} Reviu Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[9.5px] font-bold text-green-700">
                          <CheckCircle2 size={10} /> Tuntas / Aktif
                        </span>
                      )}
                    </td>

                    {}
                    <td className="px-5 py-3">
                      {assessment?.riasecTop3 ? (
                        <div className="flex items-center gap-1.5">
                          {assessment.riasecTop3.split(",").slice(0, 3).map((item) => (
                            <span key={item} className="rounded-md bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                              {item.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400">— Belum Tes —</span>
                      )}
                    </td>

                    {}
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9.5px] font-bold ${
                        student.premium ? "border-amber-200 bg-amber-50 text-amber-700" : "border-slate-200 bg-slate-50 text-slate-500"
                      }`}>
                        <Crown size={10} /> {student.premium ? "Premium" : "Gratis"}
                      </span>
                    </td>

                    {}
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenDrawer(student)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                          Lihat Detail <ChevronRight size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setResetTarget(student);
                            setResetPassword("");
                            setResetError(null);
                            setResetSuccess(null);
                          }}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                          title="Reset Sandi Siswa"
                        >
                          <KeyRound size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {}
      <DetailDrawer
        isOpen={isDrawerOpen}
        student={selectedStudent}
        onClose={handleCloseDrawer}
        onUnlockModule={handleUnlockModule}
        onOpenResetPassword={(s) => {
          setResetTarget(s);
          setResetPassword("");
          setResetError(null);
          setResetSuccess(null);
        }}
      />

      {}
      {resetTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-fade-in">
            <h3 className="text-lg font-extrabold text-slate-900">Reset Kata Sandi</h3>
            <p className="mt-1 text-[13px] text-slate-500">
              Atur ulang kata sandi untuk siswa <b>{resetTarget.name}</b>
            </p>
            <input
              type="password"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              placeholder="Kata sandi baru (min. 8 karakter)"
              className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            {resetError && <p className="mt-2 text-[12px] font-semibold text-rose-600">{resetError}</p>}
            {resetSuccess && <p className="mt-2 text-[12px] font-semibold text-emerald-600">{resetSuccess}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setResetTarget(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-[12px] font-bold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => void handleResetPassword()}
                disabled={isResetting}
                className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-bold text-white hover:bg-blue-700 disabled:bg-slate-300"
              >
                {isResetting ? "Menyimpan..." : "Reset Kata Sandi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


function FilterButton({
  active,
  onClick,
  label,
  count,
  isAlert,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
  isAlert?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all flex items-center gap-1.5 ${
        active
          ? "bg-slate-900 text-white shadow-sm"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${
          active 
            ? "bg-white text-slate-900" 
            : isAlert 
              ? "bg-rose-600 text-white" 
              : "bg-slate-800 text-white"
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}


function DetailDrawer({
  isOpen,
  student,
  onClose,
  onUnlockModule,
  onOpenResetPassword,
}: {
  isOpen: boolean;
  student: CounselorStudent | null;
  onClose: () => void;
  onUnlockModule: (studentId: string, weekNumber: number) => Promise<void>;
  onOpenResetPassword: (student: CounselorStudent) => void;
}) {
  const [activeTab, setActiveTab] = useState<"JURNAL" | "RIASEC" | "AI_REPORT">("JURNAL");

  
  useEffect(() => {
    if (student) setActiveTab("JURNAL");
  }, [student]);

  if (!student) return null;

  return (
    <>
      {}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white border-l border-slate-200 shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {}
        <div className="flex items-center justify-between border-b border-slate-200 p-5 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[15px] font-extrabold text-blue-700">
              {getInitials(student.name)}
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">{student.name}</h3>
              <p className="text-[11px] text-slate-500 font-semibold">{student.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
          >
            <X size={16} />
          </button>
        </div>

        {}
        <div className="px-5 py-3 border-b border-slate-100 bg-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
              student.premium ? "border-amber-200 bg-amber-50 text-amber-700" : "border-slate-200 bg-slate-50 text-slate-500"
            }`}>
              <Crown size={10} /> {student.premium ? "Akun Premium" : "Akun Gratis"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onOpenResetPassword(student)}
            className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
          >
            <KeyRound size={12} /> Reset Sandi Siswa
          </button>
        </div>

        {}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-2">
          <TabHeader active={activeTab === "JURNAL"} onClick={() => setActiveTab("JURNAL")} label="Progres & Jurnal" />
          <TabHeader active={activeTab === "RIASEC"} onClick={() => setActiveTab("RIASEC")} label="Hasil RIASEC" />
          <TabHeader active={activeTab === "AI_REPORT"} onClick={() => setActiveTab("AI_REPORT")} label="AI Career Report" />
        </div>

        {}
        <div className="flex-1 overflow-y-auto p-5 bg-[#FAFBFD]">
          {activeTab === "JURNAL" && (
            <TabJurnal student={student} onUnlockModule={onUnlockModule} />
          )}

          {activeTab === "RIASEC" && (
            <TabRiasec student={student} />
          )}

          {activeTab === "AI_REPORT" && (
            <TabAiReport studentId={student.id} />
          )}
        </div>
      </div>
    </>
  );
}



function TabHeader({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`border-b-2 px-4 py-3.5 text-xs font-bold transition-all ${
        active
          ? "border-blue-600 text-blue-700"
          : "border-transparent text-slate-500 hover:text-slate-900"
      }`}
    >
      {label}
    </button>
  );
}


function TabJurnal({
  student,
  onUnlockModule,
}: {
  student: CounselorStudent;
  onUnlockModule: (studentId: string, weekNumber: number) => Promise<void>;
}) {
  const [unlockingId, setUnlockingId] = useState<number | null>(null);

  const handleUnlock = async (week: number) => {
    setUnlockingId(week);
    await onUnlockModule(student.id, week);
    setUnlockingId(null);
  };

  return (
    <div className="space-y-3.5">
      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">Riwayat Pembelajaran & Modul</div>
      
      {student.journals.map((journal) => {
        const meta = getModule(journal.weekNumber);
        
        const isCompleted = journal.status === "COMPLETED";
        const isLocked = journal.status === "LOCKED";
        
        
        const isGraceLocked = isLocked && (journal.lateCount ?? 0) === 1;
        const isPermanentlyLocked = isLocked && (journal.lateCount ?? 0) >= 2;
        
        return (
          <div key={journal.id} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all hover:border-slate-300">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wide text-blue-700">
                Modul {journal.weekNumber}{meta ? `: ${meta.title}` : ""}
              </span>
              
              <div className="flex gap-1">
                {isCompleted ? (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-green-50 px-2 py-0.5 text-[9px] font-bold text-green-700">
                    <CheckCircle2 size={10} /> Selesai
                  </span>
                ) : isGraceLocked ? (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700">
                    <AlertTriangle size={10} /> Masa Tenggang
                  </span>
                ) : isPermanentlyLocked ? (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-700">
                    <Lock size={10} /> Terkunci BK
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500 font-semibold">
                    Belum Dikerjakan
                  </span>
                )}
              </div>
            </div>

            {}
            {isGraceLocked && (
              <div className="mb-3 rounded-lg bg-amber-50 border border-amber-100 p-2.5 text-[11px] text-amber-800 flex flex-wrap items-center justify-between gap-2">
                <span>Modul terkunci sementara hingga <b>{formatDateTimeId(journal.lockedUntil)}</b></span>
                <button
                  type="button"
                  onClick={() => void handleUnlock(journal.weekNumber)}
                  disabled={unlockingId === journal.weekNumber}
                  className="rounded bg-amber-600 px-2.5 py-1 text-[10px] font-extrabold text-white transition hover:bg-amber-700 disabled:opacity-50"
                >
                  {unlockingId === journal.weekNumber ? "Proses..." : "Buka Sekarang"}
                </button>
              </div>
            )}

            {isPermanentlyLocked && (
              <div className="mb-3 rounded-lg bg-rose-50 border border-rose-100 p-2.5 text-[11px] text-rose-800 flex flex-wrap items-center justify-between gap-2">
                <span>Terblokir permanen karena terlambat. Memerlukan pembukaan kunci dari Anda.</span>
                <button
                  type="button"
                  onClick={() => void handleUnlock(journal.weekNumber)}
                  disabled={unlockingId === journal.weekNumber}
                  className="rounded bg-rose-600 px-2.5 py-1 text-[10px] font-extrabold text-white transition hover:bg-rose-700 disabled:opacity-50"
                >
                  {unlockingId === journal.weekNumber ? "Proses..." : "Buka Modul"}
                </button>
              </div>
            )}

            {}
            {isCompleted ? (
              <div className="space-y-2">
                <div>
                  <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Hasil Refleksi / Journaling</p>
                  <p className="text-[12px] leading-relaxed text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 whitespace-pre-wrap">
                    {journal.reflectionText}
                  </p>
                </div>
                {journal.evidenceImageUrl && (
                  <a
                    href={journal.evidenceImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <ExternalLink size={12} /> Lihat Lampiran Bukti
                  </a>
                )}
                <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">
                    {journal.counselorFeedback ? "✓ Sudah direviu" : "⌛ Menunggu reviu BK"}
                  </span>
                  <a
                    href="/counselor/journals"
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    Tulis Umpan Balik →
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-[12px] italic text-slate-400">Modul belum selesai dikerjakan oleh siswa.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}


function TabRiasec({ student }: { student: CounselorStudent }) {
  const assessment = student.latestAssessment;
  
  if (!assessment) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
        <Sparkles size={20} className="mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-bold text-slate-900">Belum Ada Riwayat Tes</p>
        <p className="text-xs text-slate-500 mt-1">Siswa ini belum pernah menyelesaikan Tes Penentuan Minat RIASEC di portal.</p>
      </div>
    );
  }

  const top3 = assessment.riasecTop3
    ? assessment.riasecTop3.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="space-y-4">
      {}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Dimensi Utama Minat Karier</p>
        <h4 className="text-sm font-extrabold text-slate-900 mt-1">3 Tipe Kepribadian Dominan</h4>
        <div className="mt-3 flex flex-wrap gap-2">
          {top3.map((item, idx) => (
            <span key={item} className="rounded-full bg-white border border-indigo-200 px-3.5 py-1 text-xs font-bold text-indigo-700 shadow-sm flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-black">{idx + 1}</span>
              {item}
            </span>
          ))}
        </div>
        <p className="mt-3 text-[11.5px] leading-relaxed text-slate-600">
          Minat karier siswa didominasi oleh perpaduan tipe kepribadian di atas. Gunakan ini sebagai panduan utama saat memberikan konseling studi lanjutan.
        </p>
      </div>

      {}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Skor Detail Minat (RIASEC)</p>
        <div className="space-y-3">
          {COUNSELOR_RIASEC_DIMENSIONS.map((dim) => {
            const score = assessment[dim.key] ?? 0;
            return (
              <div key={dim.key} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 tracking-wide">{dim.label}</span>
                  <span className="text-slate-900">{score} / 10</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${score * 10}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Preferensi Metode Pembelajaran</p>
        <h4 className="text-sm font-extrabold text-slate-900 mt-1">Gaya Belajar Utama</h4>
        <div className="mt-2 rounded-lg bg-blue-50 border border-blue-100 p-3">
          <p className="font-extrabold text-blue-800 text-xs uppercase tracking-wider">
            {COUNSELOR_LEARNING_STYLE_LABELS[assessment.learningStyle] || "Belum Terdeteksi"}
          </p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-blue-700 font-medium">
            {assessment.learningStyle === "MULTIMODAL"
              ? "Siswa sangat fleksibel dan cepat menyerap ilmu jika metode pembelajaran menggabungkan visual (gambar/video) dengan praktik langsung."
              : "Sesuaikan penugasan dan bahan bacaan bimbingan konseling Anda dengan karakteristik belajar utama di atas agar materi dapat diserap secara optimal."}
          </p>
        </div>
      </div>
    </div>
  );
}


function TabAiReport({ studentId }: { studentId: string }) {
  const [report, setReport] = useState<CounselorCareerReport | null>(null);
  const [notReady, setNotReady] = useState<{ completed: number; total: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadReport = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      setReport(null);
      setNotReady(null);
      try {
        const result = await fetchStudentReport(studentId);
        if (!active) return;
        if ("report" in result) {
          setReport(result.report);
        } else {
          setNotReady({ completed: result.completed, total: result.total });
        }
      } catch (err) {
        if (active) {
          setErrorMessage(err instanceof Error ? err.message : "Gagal memuat laporan AI");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void loadReport();
    return () => {
      active = false;
    };
  }, [studentId]);

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <RefreshCw size={20} className="mx-auto animate-spin text-slate-400 mb-2" />
        <p className="text-[12px] text-slate-500">Menganalisis hasil jurnal via kecerdasan buatan...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center">
        <p className="text-xs font-bold text-rose-900">Gagal Menganalisis Laporan</p>
        <p className="text-[11px] text-rose-700 mt-1">{errorMessage}</p>
      </div>
    );
  }

  if (notReady) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-slate-500">
        <FileText size={24} className="mx-auto text-slate-400 mb-2" />
        <h4 className="text-sm font-bold text-slate-900">AI Report Belum Siap</h4>
        <p className="text-xs text-slate-500 mt-1">
          Siswa baru menyelesaikan <b>{notReady.completed}/{notReady.total} modul</b>. Analisis laporan AI otomatis siap setelah siswa menyelesaikan seluruh 12 modul eksplorasi.
        </p>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-4">
      {}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex flex-wrap gap-2.5 items-center justify-between">
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-700">Analisis Sentimen Jurnal</p>
          <p className="text-sm font-bold text-emerald-900 mt-0.5">{report.sentimentLabel} ({report.sentimentScore}/100)</p>
        </div>
        {report.topInterest && (
          <div className="text-right">
            <p className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-700">Fokus Minat Utama</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{report.topInterest}</p>
          </div>
        )}
      </div>

      {}
      {report.dominantThemes.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">Tema Eksplorasi Paling Dominan</p>
          <div className="flex flex-wrap gap-1.5">
            {report.dominantThemes.map((theme) => (
              <span key={theme} className="rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-bold text-blue-700 shadow-sm">
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}

      {}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ringkasan Analisis Karakter & Minat BK</p>
        <p className="text-[12.5px] leading-relaxed text-slate-700 whitespace-pre-wrap">
          {report.summary}
        </p>
      </div>

      <div className="text-center">
        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-medium">
          Dihasilkan AI pada {formatDateTimeId(report.generatedAt)}
        </span>
      </div>
    </div>
  );
}
