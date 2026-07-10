"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, CheckCircle2, ChevronDown, ChevronUp, Clock, ExternalLink, AlertTriangle, Lock, Sparkles } from "lucide-react";
import {
  fetchCounselorOverview,
  submitCounselorFeedback,
  unlockStudentModule,
  CounselorStudent,
  CounselorJournal,
  formatDateTimeId,
  getInitials,
} from "../utils";
import { getModule } from "@/lib/modules";

export default function JournalsPage() {
  const [students, setStudents] = useState<CounselorStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetchCounselorOverview();
      setStudents(response.students);
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

  const handleSaveFeedback = useCallback(
    async (studentId: string, weekNumber: number, feedbackText: string) => {
      const trimmedFeedback = feedbackText.trim();
      const savedJournal = await submitCounselorFeedback(studentId, {
        weekNumber,
        counselorFeedback: trimmedFeedback,
      });

      setStudents((previousStudents) =>
        previousStudents.map((student) => {
          if (student.id !== studentId) {
            return student;
          }

          const journals = student.journals.map((journal) =>
            journal.weekNumber === weekNumber
              ? {
                  ...journal,
                  counselorFeedback: savedJournal.counselorFeedback ?? trimmedFeedback,
                  status: savedJournal.status ?? journal.status,
                  updatedAt: savedJournal.updatedAt ?? journal.updatedAt,
                }
              : journal
          );

          const completedCount = journals.filter(
            (journal) => journal.status === "COMPLETED"
          ).length;
          const pendingFeedback = journals.filter(
            (journal) =>
              journal.status === "COMPLETED" &&
              !journal.counselorFeedback &&
              Boolean(journal.reflectionText)
          ).length;

          return {
            ...student,
            journals,
            completedCount,
            pendingFeedback,
          };
        })
      );
    },
    []
  );

  const handleUnlockModule = useCallback(
    async (studentId: string, weekNumber: number) => {
      await unlockStudentModule(studentId, weekNumber);
      setStudents((previousStudents) =>
        previousStudents.map((student) => {
          if (student.id !== studentId) {
            return student;
          }

          const journals = student.journals.map((journal) =>
            journal.weekNumber === weekNumber
              ? {
                  ...journal,
                  status: "UNLOCKED" as const,
                  lockedUntil: null,
                  lateCount: 3,
                }
              : journal
          );

          return {
            ...student,
            journals,
          };
        })
      );
    },
    []
  );

  const studentsWithJournals = useMemo(() => {
    return students.filter((s) => s.journals.length > 0);
  }, [students]);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Reviu Jurnal Refleksi</h2>
          <p className="mt-1 text-[13px] text-slate-500">Baca jurnal siswa dan berikan umpan balik / catatan pendampingan.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <RefreshCw size={18} className="animate-spin text-[#2563eb]" />
            <div>
              <p className="text-sm font-bold text-slate-900">Memuat data jurnal</p>
              <p className="text-[13px] text-slate-500">Menghubungkan panel konselor ke database.</p>
            </div>
          </div>
        </div>
      ) : errorMessage && students.length === 0 ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
          <p className="text-sm font-bold text-rose-900">Gagal memuat data jurnal</p>
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

          {studentsWithJournals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
              <h4 className="text-sm font-bold text-slate-900">Belum ada jurnal</h4>
              <p className="mt-1 text-[13px] text-slate-500">Belum ada siswa yang mengumpulkan jurnal.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {studentsWithJournals.map((student) => (
                <StudentJournalRow
                  key={student.id}
                  student={student}
                  onSaveFeedback={handleSaveFeedback}
                  onUnlockModule={handleUnlockModule}
                />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

function StudentJournalRow({
  student,
  onSaveFeedback,
  onUnlockModule,
}: {
  student: CounselorStudent;
  onSaveFeedback: (studentId: string, weekNumber: number, feedbackText: string) => Promise<void>;
  onUnlockModule: (studentId: string, weekNumber: number) => Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(student.pendingFeedback > 0);

  return (
    <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-[15px] font-extrabold text-blue-700">
            {getInitials(student.name)}
          </div>
          <div>
            <h4 className="text-[13.5px] font-bold text-slate-900">{student.name}</h4>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-[11.5px] text-slate-500">{student.journals.length} entri jurnal</span>
              {student.pendingFeedback > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[9.5px] font-bold text-rose-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-600"></span> {student.pendingFeedback} Reviu Tertunda
                </span>
              )}
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-[11.5px] font-bold transition-colors ${
            isOpen ? "border-[#2563eb] bg-[#2563eb] text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          {isOpen ? "Tutup Jurnal" : "Buka Jurnal"}
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {isOpen && (
        <div className="flex flex-col gap-3 border-t border-slate-200 bg-[#FAFBFD] p-5">
          {student.journals.map((journal) => (
            <JournalCard
              key={journal.id}
              journal={journal}
              studentId={student.id}
              onSave={onSaveFeedback}
              onUnlock={onUnlockModule}
            />
          ))}
        </div>
      )}
    </div>
  );
}


function JournalCard({
  journal,
  studentId,
  onSave,
  onUnlock,
}: {
  journal: CounselorJournal;
  studentId: string;
  onSave: (studentId: string, weekNumber: number, feedbackText: string) => Promise<void>;
  onUnlock: (studentId: string, weekNumber: number) => Promise<void>;
}) {
  const [draft, setDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const isPending = !journal.counselorFeedback && Boolean(journal.reflectionText);

  const handleSubmit = async () => {
    const trimmedDraft = draft.trim();

    if (!trimmedDraft) {
      setErrorMessage("Feedback tidak boleh kosong.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onSave(studentId, journal.weekNumber, trimmedDraft);
      setDraft("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal menyimpan feedback"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlockClick = async () => {
    setIsUnlocking(true);
    setUnlockError(null);
    try {
      await onUnlock(studentId, journal.weekNumber);
    } catch (error) {
      setUnlockError(
        error instanceof Error ? error.message : "Gagal membuka kunci modul"
      );
    } finally {
      setIsUnlocking(false);
    }
  };

  const meta = getModule(journal.weekNumber);
  const isTempLocked =
    journal.status === "LOCKED" &&
    journal.lockedUntil &&
    new Date(journal.lockedUntil).getTime() > Date.now();
  const isLate = journal.status === "UNLOCKED" && (journal.lateCount ?? 0) > 0;
  const isPermanentlyLocked = journal.status === "LOCKED" && (journal.lateCount ?? 0) >= 2;
  const isGraceLocked = journal.status === "LOCKED" && (journal.lateCount ?? 0) === 1;

  const cardBorderClass = isLate
    ? "border-amber-250 bg-amber-50/5"
    : (isTempLocked || isPermanentlyLocked)
      ? "border-rose-200 bg-rose-50/5"
      : journal.reflectionText && isPending
        ? "border-blue-200 bg-blue-50/5 ring-1 ring-blue-500/5 shadow-sm"
        : "border-slate-205 bg-white";

  return (
    <div className={`overflow-hidden rounded-2xl border transition-all duration-350 ${cardBorderClass} hover:shadow-md`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Modul {journal.weekNumber}
        </span>
        <div className="flex items-center gap-1.5">
          {isLate && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-100/50 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-700 animate-pulse">
              <AlertTriangle size={9} /> Terlambat
            </span>
          )}
          {(isTempLocked || isPermanentlyLocked) && (
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-100/50 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-rose-700 animate-pulse">
              <Lock size={9} /> Terkunci
            </span>
          )}
          {journal.reflectionText && (
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
              isPending ? "border-amber-200 bg-amber-100/60 text-amber-750" : "border-green-200 bg-green-100/60 text-green-755"
            }`}>
              {isPending ? <><Clock size={9} /> Menunggu Reviu</> : <><CheckCircle2 size={9} /> Telah Direviu</>}
            </span>
          )}
        </div>
      </div>

      {/* Sub-header / Title */}
      {meta && (
        <div className="border-b border-slate-100/50 bg-white px-4 py-3 flex items-center justify-between gap-3">
          <span className="truncate text-[13px] font-extrabold text-slate-800 tracking-tight">{meta.title}</span>
          <span className="shrink-0 rounded-full bg-slate-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 border border-slate-200/50">
            {meta.phaseLabel}
          </span>
        </div>
      )}

      {/* Grace Lock Banner */}
      {isGraceLocked && (
        <div className="m-4 mb-0 rounded-xl border border-amber-200 bg-amber-50/20 p-4 text-[12px] leading-relaxed text-amber-850">
          <p className="font-extrabold text-amber-900 mb-1 flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-amber-500 animate-pulse" />
            Masa Tenggang Keterlambatan
          </p>
          <p className="mb-3 font-semibold">
            Modul ini terkunci sementara hingga <b>{formatDateTimeId(journal.lockedUntil)}</b> karena siswa terlambat. Siswa harus mengunggah dokumen mood board untuk membukanya sendiri, atau Anda dapat membukanya sekarang.
          </p>
          <button
            type="button"
            onClick={handleUnlockClick}
            disabled={isUnlocking}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-[11px] font-bold text-white transition hover:bg-amber-700 disabled:opacity-50 shadow-sm"
          >
            {isUnlocking ? "Membuka..." : "Buka Akses Sekarang"}
          </button>
        </div>
      )}

      {/* Permanent Lock Banner */}
      {isPermanentlyLocked && (
        <div className="m-4 mb-0 rounded-xl border border-rose-200 bg-rose-50/20 p-4 text-[12px] leading-relaxed text-rose-850">
          <p className="font-extrabold text-rose-900 mb-1 flex items-center gap-1.5">
            <Lock size={14} className="text-rose-500 animate-pulse" />
            Terkunci Permanen
          </p>
          <p className="mb-3 font-semibold">
            Siswa tidak mengunggah dokumen mood board tepat waktu hingga batas masa tenggang habis. Modul hanya dapat dibuka secara manual oleh Anda sebagai Konselor.
          </p>
          <button
            type="button"
            onClick={handleUnlockClick}
            disabled={isUnlocking}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-[11px] font-bold text-white transition hover:bg-rose-700 disabled:opacity-50 shadow-sm"
          >
            {isUnlocking ? "Membuka..." : "Buka Akses Modul"}
          </button>
        </div>
      )}

      {unlockError && (
        <div className="mx-4 mt-4 rounded-xl border border-rose-100 bg-rose-55/10 px-4 py-2 text-[11px] font-semibold text-rose-600">
          {unlockError}
        </div>
      )}

      {/* Main content body */}
      <div className="p-4 bg-white/50">
        {/* Mood Document Link */}
        {journal.moodDocumentUrl && (
          <a
            href={journal.moodDocumentUrl}
            target="_blank"
            rel="noreferrer"
            className="mb-4 flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/50 p-3 text-[11.5px] font-extrabold text-blue-700 transition hover:bg-blue-100/50 shadow-sm"
          >
            <ExternalLink size={13} /> Lihat Lampiran Dokumen Moodboard Pendukung
          </a>
        )}

        {/* Module Intro Callout */}
        {meta?.introduction && (
          <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50/20 p-4 text-[12.5px] leading-relaxed text-indigo-950 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 opacity-5">
              <Sparkles size={70} className="text-indigo-600" />
            </div>
            <p className="font-extrabold text-indigo-900 mb-1 flex items-center gap-1.5">
              <Sparkles size={13} className="text-indigo-600" />
              Pengantar Modul
            </p>
            <p className="whitespace-pre-line text-indigo-900/80 leading-relaxed font-semibold">{meta.introduction}</p>
          </div>
        )}

        {/* Questions list */}
        {meta?.prompts && meta.prompts.length > 0 && (
          <div className="mb-4">
            <div className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Pertanyaan Modul</div>
            <div className="space-y-2">
              {meta.prompts.map((q: string, i: number) => (
                <div key={i} className="flex gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-[12px] leading-relaxed text-slate-700 font-semibold">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-slate-600 to-slate-750 text-[10px] font-black text-white shadow-sm mt-0.5">
                    {i + 1}
                  </span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Journal reflection text */}
        <div className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Hasil Jurnal Refleksi Siswa</div>
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 text-[12.5px] leading-relaxed text-slate-650 font-medium whitespace-pre-line max-h-48 overflow-y-auto shadow-inner">
          {journal.reflectionText || <em className="text-slate-400">Siswa belum mengirim jawaban untuk modul ini.</em>}
        </div>

        {journal.evidenceImageUrl && (
          <a
            href={journal.evidenceImageUrl}
            target="_blank"
            rel="noreferrer"
            className="mb-4 flex items-center gap-1.5 text-[11.5px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
          >
            <ExternalLink size={13} /> Lihat Lampiran Bukti
          </a>
        )}

        {/* Feedback section */}
        {journal.counselorFeedback ? (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
            <div className="mb-1.5 text-[9.5px] font-extrabold uppercase tracking-wider text-emerald-700">Umpan Balik Konselor (Telah Dikirim)</div>
            <div className="rounded-lg border border-emerald-150 bg-white p-3 text-[12.5px] font-semibold leading-relaxed text-emerald-950">
              {journal.counselorFeedback}
            </div>
          </div>
        ) : (
          journal.reflectionText && (
            <div className="rounded-xl border border-slate-150 bg-slate-50/60 p-4">
              <div className="mb-2 text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400">Tulis Umpan Balik / Catatan Pendampingan</div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                placeholder="Berikan saran, apresiasi, atau arahan tindak lanjut kepada siswa..."
                className="w-full resize-none rounded-xl border border-slate-200 p-3 text-[12.5px] text-slate-750 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 font-medium"
              />
              {errorMessage && (
                <p className="mt-2 text-[11px] font-semibold text-rose-600">{errorMessage}</p>
              )}
              <div className="mt-2 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-[11.5px] font-black tracking-wide text-white shadow-md hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg focus:ring-4 focus:ring-blue-500/10 active:scale-[0.98] disabled:from-slate-250 disabled:to-slate-300 disabled:text-slate-400 disabled:shadow-none"
                >
                  {isSubmitting ? "Menyimpan..." : "Kirim Umpan Balik"}
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
