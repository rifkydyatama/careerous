"use client";

import { useCallback, useEffect, useState } from "react";
import {
  RefreshCw, CheckCircle2, ChevronDown, ChevronUp, Clock, FileText, ExternalLink, Sparkles,
  AlertTriangle, Lock, Crown
} from "lucide-react";
import {
  fetchCounselorOverview,
  fetchStudentReport,
  formatDateTimeId,
  CounselorStudent,
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

  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetchCounselorOverview();
      setStudents(response.students);
      setTotalWeeks(response.totalWeeks ?? COUNSELOR_TOTAL_WEEKS);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal memuat data siswa"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);



  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Daftar Siswa</h2>
          <p className="mt-1 text-[13px] text-slate-500">Lihat progres, buka detail jurnal, dan masuk ke panel tindak lanjut.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <RefreshCw size={18} className="animate-spin text-[#2e1065]" />
            <div>
              <p className="text-sm font-bold text-slate-900">Memuat data siswa</p>
              <p className="text-[13px] text-slate-500">Menghubungkan panel konselor ke database.</p>
            </div>
          </div>
        </div>
      ) : errorMessage && students.length === 0 ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
          <p className="text-sm font-bold text-rose-900">Gagal memuat data siswa</p>
          <p className="mt-1 text-[13px] text-rose-700">{errorMessage}</p>
          <button
            onClick={() => void loadOverview()}
            className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-rose-700"
          >
            Coba Lagi
          </button>
        </div>
      ) : (
        <>
          {errorMessage && (
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
              {errorMessage}
            </div>
          )}

          {students.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
              <FileText size={24} className="mx-auto text-slate-400" />
              <h4 className="mt-3 text-sm font-bold text-slate-900">Belum ada data siswa</h4>
              <p className="mt-1 text-[13px] text-slate-500">
                Database belum memiliki siswa dengan peran STUDENT.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {students.map((student) => (
                <StudentRow 
                  key={student.id} 
                  student={student} 
                  totalWeeks={totalWeeks} 
                />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

// ─── COMPONENT: Student Row (Collapsible) ───
function StudentRow({ student, totalWeeks }: { student: CounselorStudent; totalWeeks: number; }) {
  const [isOpen, setIsOpen] = useState(false);

  const assessment = student.latestAssessment;
  const assessmentDateLabel = assessment
    ? new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(assessment.createdAt))
    : null;
  const assessmentTop3 = assessment?.riasecTop3
    ? assessment.riasecTop3.split(",").map((item) => item.trim()).filter(Boolean)
    : [];

  const pendingCount = student.pendingFeedback;
  const completedCount = student.completedCount;
  const progressPct = totalWeeks ? Math.round((completedCount / totalWeeks) * 100) : 0;
  const isGreen = progressPct >= 80;

  return (
    <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Row Header */}
      <div className="flex flex-wrap items-center gap-4 p-4 md:flex-nowrap">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-[15px] font-extrabold text-blue-700">
          {getInitials(student.name)}
        </div>
        <div className="min-w-[140px] flex-1">
          <h4 className="text-[13.5px] font-bold text-slate-900">{student.name}</h4>
          <p className="mt-0.5 text-[11.5px] text-slate-500">{student.email}</p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-4">
          <div className="min-w-[110px]">
            <div className="mb-1 flex justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Progres</span>
              <span className="text-[10px] font-bold text-slate-600">{completedCount}/{totalWeeks}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div className={`h-full rounded-full transition-all duration-500 ${isGreen ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${progressPct}%` }}></div>
            </div>
          </div>

          {student.lateModules > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10.5px] font-bold text-amber-700">
              <AlertTriangle size={12} /> {student.lateModules} Terblokir
            </span>
          )}

          {student.lockedModules > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-100 px-2.5 py-1 text-[10.5px] font-bold text-rose-700">
              <Lock size={12} /> {student.lockedModules} Terblokir
            </span>
          )}

          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10.5px] font-bold ${
            student.premium ? "border-amber-200 bg-amber-50 text-amber-700" : "border-slate-200 bg-slate-50 text-slate-500"
          }`}>
            <Crown size={12} /> {student.premiumSource === "INSTITUTION" ? "Premium (Institusi)" : student.premium ? "Premium" : "Gratis"}
          </span>

          {pendingCount > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10.5px] font-bold text-rose-700">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-600"></span> {pendingCount} Reviu Tertunda
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[10.5px] font-bold text-green-700">
              <CheckCircle2 size={12} /> Tuntas
            </span>
          )}

          {assessment ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10.5px] font-bold text-indigo-700">
              <Sparkles size={12} /> RIASEC tersedia
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10.5px] font-bold text-slate-500">
              <Sparkles size={12} /> Belum isi tes
            </span>
          )}

          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-[11.5px] font-bold transition-colors ${
              isOpen ? "border-[#2e1065] bg-[#2e1065] text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {isOpen ? "Tutup Panel" : "Buka Panel"}
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded Panel */}
      {isOpen && (
        <div className="border-t border-slate-200 bg-[#FAFBFD] p-5">
          <div className="mb-4 border-b border-slate-200 pb-2.5 text-[9.5px] font-extrabold uppercase tracking-[1.2px] text-slate-400">
            Riwayat Jurnal Refleksi ({completedCount} entri)
          </div>

          <div className={`mb-4 rounded-xl border p-4 ${assessment ? "border-indigo-200 bg-indigo-50" : "border-dashed border-slate-200 bg-white"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#2e1065]">Tes RIASEC & Gaya Belajar</p>
                <h5 className="mt-1 text-[13px] font-bold text-slate-900">
                  {assessment ? "Hasil minat karier terbaru" : "Belum ada hasil RIASEC"}
                </h5>
                <p className="mt-1 text-[11.5px] leading-relaxed text-slate-500">
                  {assessment
                    ? `Diisi pada ${assessmentDateLabel} · Gaya belajar ${COUNSELOR_LEARNING_STYLE_LABELS[assessment.learningStyle]}`
                    : "Minta siswa membuka menu Tes RIASEC agar hasil minat dan gaya belajarnya muncul di sini."}
                </p>
              </div>

              {assessment && (
                <div className="flex flex-wrap gap-2">
                  {assessmentTop3.map((item) => (
                    <span key={item} className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-indigo-700 shadow-sm">
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {assessment && (
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <div className="rounded-xl border border-white bg-white p-3.5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Skor Dimensi</p>
                  <div className="mt-3 space-y-2.5">
                    {COUNSELOR_RIASEC_DIMENSIONS.map((dimension) => {
                      const score = assessment[dimension.key];

                      return (
                        <div key={dimension.key} className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">{dimension.label}</span>
                            <span className="text-[11px] font-bold text-slate-900">{score}/10</span>
                          </div>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-[#2e1065]"
                              style={{ width: `${score * 10}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-white bg-white p-3.5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Interpretasi Cepat</p>
                  <div className="mt-3 space-y-3 text-[12px] leading-relaxed text-slate-600">
                    <p>
                      Gunakan hasil ini untuk melihat kecenderungan minat siswa sebelum memberi arahan jurusan, aktivitas, atau tindak lanjut konseling.
                    </p>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Gaya Belajar</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {COUNSELOR_LEARNING_STYLE_LABELS[assessment.learningStyle]}
                      </p>
                      <p className="mt-1 text-slate-500">
                        {assessment.learningStyle === "MULTIMODAL"
                          ? "Siswa nyaman memakai beberapa cara belajar sekaligus."
                          : "Sesuaikan materi dan media belajar dengan preferensi ini."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!assessment && (
              <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white p-3.5 text-[12px] leading-relaxed text-slate-500">
                Setelah siswa menyelesaikan Tes RIASEC, ringkasan minat dan gaya belajar akan muncul di sini agar konselor bisa membaca profilnya lebih cepat.
              </div>
            )}
          </div>

          <CounselorReportSection studentId={student.id} />


          <div className="mt-4 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/50 p-4">
            <div>
              <p className="text-[13px] font-bold text-slate-900">Jurnal Refleksi Siswa</p>
              <p className="mt-0.5 text-[11.5px] text-slate-500">Ada {student.journals.length} entri jurnal yang dibuat siswa ini.</p>
            </div>
            <a 
              href="/counselor/journals" 
              className="rounded-lg bg-white px-4 py-2 text-[12px] font-bold text-blue-700 shadow-sm border border-blue-200 transition hover:bg-blue-50"
            >
              Buka Fitur Reviu
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── COMPONENT: Career Exploration Report (dokumen pendukung BK) ───
function CounselorReportSection({ studentId }: { studentId: string }) {
  const [open, setOpen] = useState(false);
  const [report, setReport] = useState<CounselorCareerReport | null>(null);
  const [notReady, setNotReady] = useState<{ completed: number; total: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const handleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next && !loaded) {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const result = await fetchStudentReport(studentId);
        if ("report" in result) setReport(result.report);
        else setNotReady({ completed: result.completed, total: result.total });
        setLoaded(true);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Gagal memuat laporan");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
            <Sparkles size={12} /> Career Exploration Report (AI)
          </p>
          <h5 className="mt-1 text-[13px] font-bold text-slate-900">
            Dokumen pendukung bimbingan
          </h5>
          <p className="mt-0.5 text-[11.5px] text-slate-500">
            Ringkasan AI dari seluruh journaling siswa untuk membantu mengarahkan pilihan kariernya.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleOpen()}
          className="rounded-lg border border-amber-300 bg-white px-3.5 py-2 text-[11.5px] font-bold text-amber-700 transition hover:bg-amber-100"
        >
          {open ? "Tutup" : "Lihat Laporan"}
        </button>
      </div>

      {open && (
        <div className="mt-4">
          {isLoading ? (
            <p className="text-[12px] text-slate-500">Memuat laporan...</p>
          ) : errorMessage ? (
            <p className="text-[12px] font-semibold text-rose-600">{errorMessage}</p>
          ) : notReady ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-3.5 text-[12px] text-slate-500">
              Laporan belum tersedia — siswa baru menyelesaikan {notReady.completed}/{notReady.total} modul.
              Laporan otomatis dibuat setelah seluruh modul selesai.
            </div>
          ) : report ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10.5px] font-bold text-emerald-700">
                  Sentimen: {report.sentimentLabel} ({report.sentimentScore}/100)
                </span>
                {report.topInterest && (
                  <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[10.5px] font-bold text-indigo-700">
                    Minat: {report.topInterest}
                  </span>
                )}
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10.5px] font-bold text-amber-700">
                  {report.isAiGenerated ? "AI (Claude)" : "Pratinjau rule-based"}
                </span>
              </div>
              {report.dominantThemes.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {report.dominantThemes.map((theme) => (
                    <span key={theme} className="rounded-full bg-white px-2.5 py-1 text-[10.5px] font-bold text-blue-700 shadow-sm">
                      {theme}
                    </span>
                  ))}
                </div>
              )}
              <div className="rounded-lg border border-white bg-white p-3.5 text-[12.5px] leading-relaxed text-slate-700 shadow-sm">
                {report.summary}
              </div>
              <p className="text-[10.5px] text-slate-400">
                Dibuat pada {formatDateTimeId(report.generatedAt)}.
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
