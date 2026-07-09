"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, CheckCircle2, ChevronDown, ChevronUp, Clock, ExternalLink, AlertTriangle, Lock } from "lucide-react";
import {
  fetchCounselorOverview,
  submitCounselorFeedback,
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
            <RefreshCw size={18} className="animate-spin text-[#2e1065]" />
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
                <StudentJournalRow key={student.id} student={student} onSaveFeedback={handleSaveFeedback} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

function StudentJournalRow({ student, onSaveFeedback }: { student: CounselorStudent; onSaveFeedback: (studentId: string, weekNumber: number, feedbackText: string) => Promise<void>; }) {
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
            isOpen ? "border-[#2e1065] bg-[#2e1065] text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          {isOpen ? "Tutup Jurnal" : "Buka Jurnal"}
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {isOpen && (
        <div className="flex flex-col gap-3 border-t border-slate-200 bg-[#FAFBFD] p-5">
          {student.journals.map((journal) => (
            <JournalCard key={journal.id} journal={journal} studentId={student.id} onSave={onSaveFeedback} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── COMPONENT: Journal Card & Feedback Form ───
function JournalCard({ journal, studentId, onSave }: { journal: CounselorJournal; studentId: string; onSave: (studentId: string, weekNumber: number, feedbackText: string) => Promise<void>; }) {
  const [draft, setDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

  const meta = getModule(journal.weekNumber);
  const isTempLocked =
    journal.status === "LOCKED" &&
    journal.lockedUntil &&
    new Date(journal.lockedUntil).getTime() > Date.now();
  const isLate = journal.status === "UNLOCKED" && (journal.lateCount ?? 0) > 0;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <span className="text-[11px] font-extrabold uppercase tracking-wide text-blue-700">
          Modul {journal.weekNumber}{meta ? `: ${meta.title}` : ""}
        </span>
        <div className="flex items-center gap-1.5">
          {isLate && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-amber-700">
              <AlertTriangle size={10} /> Terblokir
            </span>
          )}
          {isTempLocked && (
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-rose-700">
              <Lock size={10} /> Terblokir
            </span>
          )}
          {journal.reflectionText && (
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider ${
              isPending ? "border-amber-200 bg-amber-50 text-amber-700" : "border-green-200 bg-green-50 text-green-700"
            }`}>
              {isPending ? <><Clock size={10} /> Menunggu Reviu</> : <><CheckCircle2 size={10} /> Telah Direviu</>}
            </span>
          )}
        </div>
      </div>

      {isTempLocked && (
        <div className="border-b border-rose-100 bg-rose-50/60 px-4 py-2 text-[11px] font-medium text-rose-700">
          Modul terkunci hingga {formatDateTimeId(journal.lockedUntil)}. Mohon berikan pendampingan.
        </div>
      )}

      <div className="p-4">
        {journal.moodDocumentUrl && (
          <a
            href={journal.moodDocumentUrl}
            target="_blank"
            rel="noreferrer"
            className="mb-3 flex items-center gap-1.5 rounded-lg border border-fuchsia-200 bg-fuchsia-50 p-3 text-[11.5px] font-bold text-fuchsia-700 transition hover:bg-fuchsia-100"
          >
            <ExternalLink size={12} /> Lihat Dokumen Mood Board
          </a>
        )}

        <div className="mb-1.5 text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400">Mood Board</div>
        <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-[12.5px] leading-relaxed text-slate-600">
          {journal.reflectionText || <em className="text-slate-400">Tidak ada teks.</em>}
        </div>

        {journal.evidenceImageUrl && (
          <a href={journal.evidenceImageUrl} target="_blank" rel="noreferrer" className="mb-3 flex items-center gap-1.5 text-[11.5px] font-semibold text-blue-600 hover:text-blue-800 hover:underline underline-offset-2">
            <ExternalLink size={12} /> Lihat Lampiran Bukti
          </a>
        )}

        {journal.counselorFeedback ? (
          <>
            <div className="mb-1.5 text-[9.5px] font-extrabold uppercase tracking-wider text-green-600">Umpan Balik Konselor</div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-[12.5px] leading-relaxed text-green-900">
              {journal.counselorFeedback}
            </div>
          </>
        ) : (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <div className="mb-2 text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400">Tulis Umpan Balik</div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              placeholder="Masukkan catatan dan arahan untuk siswa..."
              className="w-full resize-none rounded-lg border border-slate-300 p-3 text-[12.5px] text-slate-700 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            />
            {errorMessage && (
              <p className="mt-2 text-[11px] font-semibold text-rose-600">{errorMessage}</p>
            )}
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="rounded-lg bg-[#2e1065] px-4 py-2 text-[11.5px] font-bold text-white transition-colors hover:bg-[#3b0764] disabled:bg-slate-300"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Umpan Balik"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
