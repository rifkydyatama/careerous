"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  RefreshCw,
  Clock,
  ExternalLink,
  UploadCloud,
  Lock,
  Crown,
  AlertTriangle,
  CalendarClock,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  fetchStudentDashboard,
  submitStudentJournal,
  submitMoodDocument,
  uploadFile,
  formatDateTimeId,
  formatDeadlineCountdown,
  StudentDashboardResponse,
  JournalItem,
  STATUS_CONFIG,
} from "../utils";
import { getModule } from "@/lib/modules";

export default function JournalsPage() {
  const params = useParams<{ studentId: string }>();
  const studentId = params.studentId;
  const [data, setData] = useState<StudentDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetchStudentDashboard(studentId);
      setData(response);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal memuat data modul"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
    
  }, [studentId]);

  const handleJournalSubmit = async (savedJournal: JournalItem) => {
    
    await load();
    return savedJournal;
  };

  const completedAll =
    data && data.journals.filter((j) => j.status === "COMPLETED").length >= data.totalWeeks;

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Modul Eksplorasi Karier</h2>
          <p className="mt-1 text-[13px] text-slate-500">
            12 modul dalam 3 fase: Eksplorasi Diri, Eksplorasi Lingkungan, lalu Sintesis &amp; Refleksi.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <RefreshCw size={18} className="animate-spin text-[#2563eb]" />
            <div>
              <p className="text-sm font-bold text-slate-900">Memuat modul</p>
              <p className="text-[13px] text-slate-500">Menyinkronkan data Anda.</p>
            </div>
          </div>
        </div>
      ) : errorMessage || !data ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
          <p className="text-sm font-bold text-rose-900">Gagal memuat modul</p>
          <p className="mt-1 text-[13px] text-rose-700">{errorMessage || "Data tidak ditemukan."}</p>
        </div>
      ) : (
        <>
          {}
          {(completedAll || data.hasReport) && (
            <Link
              href={`/dashboard/student/${studentId}/report`}
              className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-4 transition hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="text-[13px] font-extrabold text-slate-900">Career Exploration Report siap</p>
                  <p className="text-[12px] text-slate-500">Lihat ringkasan AI Insight dari perjalanan eksplorasimu.</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-amber-700" />
            </Link>
          )}

          {}
          {!data.premium && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                <Crown size={18} />
              </div>
              <div>
                <p className="text-[13px] font-extrabold text-slate-900">
                  Paket Gratis · Modul 1–{data.freeModuleLimit} terbuka
                </p>
                <p className="text-[12px] text-slate-500">
                  Akses Premium (seluruh 12 modul, konseling online, dan laporan AI) diaktifkan oleh
                  sekolah. Hubungi guru BK-mu untuk mengajukan langganan.
                </p>
              </div>
            </div>
          )}

          {}
          {data.premium && data.premiumSource === "INSTITUTION" && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Crown size={18} />
              </div>
              <div>
                <p className="text-[13px] font-extrabold text-slate-900">
                  Premium aktif via institusi{data.institutionName ? ` · ${data.institutionName}` : ""}
                </p>
                <p className="text-[12px] text-slate-500">
                  Seluruh 12 modul, AI Insight, dan konseling terbuka untukmu lewat langganan sekolah.
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {data.journals.map((journal) => (
              <ModuleCard
                key={journal.id}
                studentId={studentId}
                journal={journal}
                onSubmitSuccess={handleJournalSubmit}
                onReload={load}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}

function ModuleCard({
  studentId,
  journal,
  onSubmitSuccess,
  onReload,
}: {
  studentId: string;
  journal: JournalItem;
  onSubmitSuccess: (journal: JournalItem) => Promise<JournalItem> | void;
  onReload: () => Promise<void> | void;
}) {
  const fallback = getModule(journal.weekNumber);
  const meta = {
    title: journal.title ?? fallback?.title ?? "",
    prompt: journal.prompt ?? fallback?.prompt ?? "",
    prompts: fallback?.prompts ?? [journal.prompt ?? fallback?.prompt ?? ""],
    phaseLabel: journal.phaseLabel ?? fallback?.phaseLabel ?? "",
  };
  const isPremiumGate = journal.premiumLocked && journal.status !== "COMPLETED";
  const config = STATUS_CONFIG[journal.status];
  const Icon = config.icon;

  
  const cardClass = isPremiumGate
    ? "border-indigo-200 bg-indigo-50/40"
    : config.colorClass;

  return (
    <div className={`group relative overflow-hidden rounded-[14px] border transition-all ${cardClass}`}>
      <div className="border-b border-slate-900/5 bg-slate-900/5 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wide text-slate-700">
            Modul {journal.weekNumber}
          </span>
          {isPremiumGate ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-indigo-700">
              <Crown size={10} /> Premium
            </span>
          ) : (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${config.badgeClass}`}>
              <Icon size={10} /> {config.label}
            </span>
          )}
        </div>
        {meta.title && (
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <span className="truncate text-[12.5px] font-bold text-slate-900">{meta.title}</span>
            <span className="shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
              {meta.phaseLabel}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        {isPremiumGate ? (
          <div className="flex h-32 flex-col items-center justify-center px-3 text-center">
            <Crown size={22} className="mb-2 text-indigo-400" />
            <p className="text-[11.5px] font-medium text-slate-600">
              Modul ini bagian dari paket Premium.
            </p>
            <p className="mt-1.5 text-[10.5px] leading-snug text-slate-400">
              Akses diaktifkan oleh sekolah. Hubungi guru BK-mu.
            </p>
          </div>
        ) : journal.status === "LOCKED" ? (
          <LockedCard journal={journal} studentId={studentId} onReload={onReload} />
        ) : journal.status === "UNLOCKED" ? (
          <>
            <DeadlineBanner journal={journal} />
            <JournalEntryForm
              studentId={studentId}
              weekNumber={journal.weekNumber}
              prompts={meta.prompts}
              onSubmitSuccess={onSubmitSuccess}
            />
          </>
        ) : (
          <CompletedCard journal={journal} />
        )}
      </div>
    </div>
  );
}

function LockedCard({
  journal,
  studentId,
  onReload,
}: {
  journal: JournalItem;
  studentId: string;
  onReload: () => Promise<void> | void;
}) {
  const reopenAt = journal.lockedUntil;
  const isTempLocked = Boolean(reopenAt && new Date(reopenAt).getTime() > Date.now());
  const lateCount = journal.lateCount ?? 0;

  if (isTempLocked && lateCount >= 1) {
    
    return (
      <TransitionTaskForm
        journal={journal}
        studentId={studentId}
        reopenAt={reopenAt as string}
        onReload={onReload}
      />
    );
  }

  
  if (lateCount >= 2) {
    return (
      <div className="flex h-32 flex-col items-center justify-center text-center">
        <CalendarClock size={20} className="mb-2 text-amber-400" />
        <p className="text-[11px] font-semibold text-amber-700">
          Menunggu konselor membuka modul ini.
        </p>
        <p className="mt-1 text-[10.5px] font-medium text-slate-500">
          Kamu belum mengisi moodboard tepat waktu. Konselor sudah diberi tahu.
        </p>
      </div>
    );
  }

  
  return (
    <div className="flex h-32 flex-col items-center justify-center text-center">
      <Lock size={20} className="mb-2 text-slate-300" />
      <p className="text-[11px] font-medium text-slate-500">
        Selesaikan modul sebelumnya untuk membuka modul ini.
      </p>
    </div>
  );
}

function TransitionTaskForm({
  journal,
  studentId,
  reopenAt,
  onReload,
}: {
  journal: JournalItem;
  studentId: string;
  reopenAt: string;
  onReload: () => Promise<void> | void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const url = await uploadFile(file);
      await submitMoodDocument(studentId, journal.weekNumber, url);
      await onReload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim dokumen");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
        <div className="flex items-center gap-1.5 font-bold">
          <CalendarClock size={12} /> Modul terblokir sementara
        </div>
        <p className="mt-0.5 leading-snug">
          Akan otomatis terbuka pada <b>{formatDateTimeId(reopenAt)}</b>. Atau, unggah dokumen mood
          board di bawah untuk membukanya sekarang.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <label className="text-[11px] font-semibold leading-snug text-slate-700">
          Unggah dokumen mood board (akan ditinjau konselor untuk membantumu).
        </label>
        <label
          className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-3 py-5 text-center transition-all ${
            file
              ? "border-blue-400 bg-blue-50"
              : "border-slate-300 bg-slate-50 hover:bg-slate-100"
          }`}
        >
          <UploadCloud size={20} className={file ? "text-blue-500" : "text-slate-400"} />
          <span className="text-[11.5px] font-semibold text-slate-600">
            {file ? file.name : "Pilih file (PDF / gambar / dokumen, maks 8 MB)"}
          </span>
          <input
            type="file"
            accept="image/*,.pdf,.doc,.docx,.ppt,.pptx"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        {error && <p className="text-[11px] font-semibold text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting || !file}
          className="rounded-lg bg-[#2563eb] py-2.5 text-[12px] font-bold text-white transition-all hover:bg-[#1d4ed8] disabled:bg-slate-300"
        >
          {isSubmitting ? "Mengunggah..." : "Unggah & Buka Modul"}
        </button>
      </form>
    </div>
  );
}

function DeadlineBanner({ journal }: { journal: JournalItem }) {
  const countdown = formatDeadlineCountdown(journal.deadlineAt);
  const isLate = (journal.lateCount ?? 0) > 0;

  if (!countdown && !isLate) return null;

  return (
    <div
      className={`mb-3 rounded-lg border px-3 py-2 text-[11px] ${
        isLate
          ? "border-amber-300 bg-amber-50 text-amber-800"
          : countdown?.overdue
            ? "border-rose-200 bg-rose-50 text-rose-700"
            : "border-blue-200 bg-blue-50 text-blue-700"
      }`}
    >
      <div className="flex items-center gap-1.5 font-bold">
        {isLate ? <AlertTriangle size={12} /> : <Clock size={12} />}
        {isLate ? "Peringatan keterlambatan" : "Batas waktu"}
      </div>
      <p className="mt-0.5 leading-snug">
        {journal.deadlineAt && <>Deadline: {formatDateTimeId(journal.deadlineAt)} · </>}
        {countdown?.text}
        {isLate && (
          <>
            {" "}
            — jika kembali terlambat, modul akan <b>terblokir</b>.
          </>
        )}
      </p>
    </div>
  );
}

function CompletedCard({ journal }: { journal: JournalItem }) {
  return (
    <div>
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Refleksi Anda</p>
      <p className="mt-1.5 line-clamp-3 text-[12.5px] leading-relaxed text-slate-600">
        {journal.reflectionText}
      </p>
      {journal.evidenceImageUrl && (
        <a
          href={journal.evidenceImageUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
        >
          <ExternalLink size={12} /> Bukti Terlampir
        </a>
      )}

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Feedback Konselor</p>
        {journal.counselorFeedback ? (
          <p className="mt-1.5 text-[12.5px] font-medium leading-relaxed text-emerald-800">
            {journal.counselorFeedback}
          </p>
        ) : (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <Clock size={12} /> Menunggu reviu konselor
          </div>
        )}
      </div>
    </div>
  );
}

function JournalEntryForm({
  studentId,
  weekNumber,
  prompts,
  onSubmitSuccess,
}: {
  studentId: string;
  weekNumber: number;
  prompts: string[];
  onSubmitSuccess: (journal: JournalItem) => Promise<JournalItem> | void;
}) {
  const [answers, setAnswers] = useState<string[]>(() => prompts.map(() => ""));
  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAnswer = (index: number, value: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const allFilled = answers.every((a) => a.trim().length > 0);

  const handleFileChange = async (selectedFile: File | null) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setIsUploading(true);
    setError(null);
    try {
      const url = await uploadFile(selectedFile);
      setUploadedUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah file");
      setFile(null);
      setUploadedUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!allFilled) return;

    setIsSubmitting(true);
    setError(null);

    
    const combined = answers
      .map((a, i) => `[Pertanyaan ${i + 1}]\n${a.trim()}`)
      .join("\n\n");

    try {
      const savedJournal = await submitStudentJournal(studentId, {
        weekNumber,
        reflectionText: combined,
        evidenceImageUrl: uploadedUrl,
      });
      await onSubmitSuccess(savedJournal);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {prompts.map((prompt, index) => (
        <div key={index}>
          <label className="mb-1 block text-[11px] font-semibold leading-snug text-slate-700">
            <span className="mr-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-[9px] font-extrabold text-blue-700">
              {index + 1}
            </span>
            {prompt}
          </label>
          <textarea
            required
            rows={3}
            value={answers[index] ?? ""}
            onChange={(e) => updateAnswer(index, e.target.value)}
            placeholder={`Jawaban pertanyaan ${index + 1}...`}
            className="w-full resize-none rounded-lg border border-slate-300 bg-white p-3 text-[12.5px] text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      ))}

      <div>
        <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Lampiran Bukti (Opsional)</label>
        <label
          className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-[11.5px] font-semibold transition-colors ${
            file
              ? "border-blue-400 bg-blue-50 text-blue-700"
              : "border-slate-300 bg-slate-50 text-slate-500 hover:bg-slate-100"
          }`}
        >
          <UploadCloud size={14} />
          {isUploading
            ? "Mengunggah..."
            : file
              ? file.name
              : "Unggah Foto / Dokumen"}
          <input
            type="file"
            accept="image/*,.pdf,.doc,.docx,.ppt,.pptx"
            className="hidden"
            onChange={(e) => void handleFileChange(e.target.files?.[0] ?? null)}
          />
        </label>
        {uploadedUrl && (
          <p className="mt-1 text-[10px] font-semibold text-emerald-600">✓ File berhasil diunggah</p>
        )}
      </div>

      {error && <p className="text-[11px] font-semibold text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting || isUploading || !allFilled}
        className="mt-1 rounded-lg bg-blue-600 py-2.5 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-blue-700 disabled:bg-slate-300"
      >
        {isSubmitting ? "Mengirim..." : "Kirim Jawaban Modul"}
      </button>
    </form>
  );
}
