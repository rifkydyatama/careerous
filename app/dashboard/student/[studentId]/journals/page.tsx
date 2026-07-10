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
                serverTime={data.serverTime}
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
  serverTime,
  onSubmitSuccess,
  onReload,
}: {
  studentId: string;
  journal: JournalItem;
  serverTime?: string | null;
  onSubmitSuccess: (journal: JournalItem) => Promise<JournalItem> | void;
  onReload: () => Promise<void> | void;
}) {
  const fallback = getModule(journal.weekNumber);
  const serverPrompts = Array.isArray(journal.prompts) ? journal.prompts.filter(Boolean) : [];
  const meta = {
    title: journal.title ?? fallback?.title ?? "",
    prompt: journal.prompt ?? fallback?.prompt ?? "",
    introduction: journal.introduction !== undefined && journal.introduction !== null
      ? journal.introduction
      : (fallback?.introduction ?? null),
    prompts: serverPrompts.length > 0
      ? serverPrompts
      : (fallback?.prompts ?? [journal.prompt ?? fallback?.prompt ?? ""]),
    phaseLabel: journal.phaseLabel ?? fallback?.phaseLabel ?? "",
  };
  const isPremiumGate = journal.premiumLocked && journal.status !== "COMPLETED";
  const config = STATUS_CONFIG[journal.status];
  const Icon = config.icon;

  const cardClass = isPremiumGate
    ? "border-indigo-200 bg-indigo-50/10 shadow-sm"
    : journal.status === "UNLOCKED"
      ? "border-blue-200 bg-blue-50/5 shadow-md shadow-blue-500/5 ring-1 ring-blue-500/5"
      : config.colorClass;

  return (
    <div className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-300 ${cardClass} hover:-translate-y-1 hover:shadow-lg`}>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Modul {journal.weekNumber}
          </span>
          {isPremiumGate ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-sm">
              <Crown size={9} /> Premium
            </span>
          ) : (
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${config.badgeClass} border border-slate-200/20`}>
              <Icon size={9} /> {config.label}
            </span>
          )}
        </div>

        {/* Phase Info */}
        {meta.title && (
          <div className="border-b border-slate-100/50 bg-white px-4 py-3 flex items-center justify-between gap-3">
            <span className="truncate text-[13px] font-extrabold text-slate-800 tracking-tight">{meta.title}</span>
            <span className="shrink-0 rounded-full bg-slate-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 border border-slate-200/50">
              {meta.phaseLabel}
            </span>
          </div>
        )}

        {/* Content Container */}
        <div className="p-4 bg-white/50">
          {isPremiumGate ? (
            <div className="flex h-36 flex-col items-center justify-center px-4 text-center">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20">
                <Crown size={18} />
              </div>
              <p className="text-[12px] font-extrabold text-slate-850">
                Akses Terkunci (Premium)
              </p>
              <p className="mt-1 text-[10px] leading-relaxed text-slate-400 font-medium">
                Akses diaktifkan oleh sekolah. Silakan hubungi guru BK Anda untuk info selengkapnya.
              </p>
            </div>
          ) : journal.status === "LOCKED" ? (
            <LockedCard journal={journal} studentId={studentId} onReload={onReload} />
          ) : journal.status === "UNLOCKED" ? (
            <>
              <DeadlineBanner journal={journal} serverTime={serverTime} />
              <JournalEntryForm
                studentId={studentId}
                weekNumber={journal.weekNumber}
                prompts={meta.prompts}
                introduction={meta.introduction}
                onSubmitSuccess={onSubmitSuccess}
              />
            </>
          ) : (
            <CompletedCard journal={journal} />
          )}
        </div>
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
      <div className="flex h-36 flex-col items-center justify-center text-center p-4 rounded-xl bg-amber-50/50 border border-amber-100/60">
        <CalendarClock size={24} className="mb-2 text-amber-500 animate-bounce" />
        <p className="text-[11.5px] font-extrabold text-amber-900 leading-snug">
          Menunggu Pembukaan Akses
        </p>
        <p className="mt-1 text-[10px] leading-relaxed text-slate-500 font-medium">
          Kamu belum mengisi tepat waktu. Silakan hubungi konselor BK Anda untuk membuka blokir modul ini.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-36 flex-col items-center justify-center text-center p-4 rounded-xl bg-slate-50/40 border border-slate-100">
      <Lock size={22} className="mb-2 text-slate-350" />
      <p className="text-[11.5px] font-bold text-slate-500 leading-snug">
        Belum Terbuka
      </p>
      <p className="mt-1 text-[10px] leading-relaxed text-slate-400 font-medium">
        Selesaikan modul sebelumnya terlebih dahulu untuk mengakses modul ini.
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
  const [lateMood, setLateMood] = useState("Bingung");
  const [lateReason, setLateReason] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const url = await uploadFile(file);
      await submitMoodDocument(studentId, journal.weekNumber, url, lateMood, lateReason);
      await onReload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim dokumen");
    } finally {
      setIsSubmitting(false);
    }
  };

  const moods = [
    { label: "Bingung", emoji: "😕" },
    { label: "Cemas", emoji: "😰" },
    { label: "Sedih", emoji: "😭" },
    { label: "Stres", emoji: "🥵" },
    { label: "Lelah", emoji: "🥱" },
    { label: "Lainnya", emoji: "😐" },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3.5 text-[11px] text-rose-800 leading-relaxed font-medium">
        <div className="flex items-center gap-1.5 font-extrabold text-rose-900 mb-1">
          <CalendarClock size={13} className="animate-pulse" />
          Modul Terblokir Sementara
        </div>
        <p>
          Terbuka otomatis pada <b>{formatDateTimeId(reopenAt)}</b>. Untuk membuka sekarang, silakan selesaikan tugas transisi berikut:
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Mood Selection */}
        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">
            1. Bagaimana Perasaanmu Saat Ini?
          </label>
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
            {moods.map((m) => (
              <button
                key={m.label}
                type="button"
                onClick={() => setLateMood(m.label)}
                className={`flex flex-col items-center justify-center rounded-xl border p-2 text-center transition-all ${
                  lateMood === m.label
                    ? "border-blue-500 bg-blue-50/80 text-blue-700 shadow-sm ring-2 ring-blue-500/20"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="text-xl">{m.emoji}</span>
                <span className="text-[9px] font-bold mt-1 tracking-tight">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reason Textarea */}
        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
            2. Tuliskan Hambatan / Kendalamu
          </label>
          <textarea
            value={lateReason}
            onChange={(e) => setLateReason(e.target.value)}
            required
            placeholder="Ceritakan mengapa kamu terlambat mengisi refleksi ini..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-[12px] text-slate-700 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-medium"
            rows={2}
          />
        </div>

        {/* Moodboard File Upload */}
        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">
            3. Unggah Dokumen Moodboard Pendukung
          </label>
          <label
            className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed px-3 py-4 text-center transition-all ${
              file
                ? "border-blue-400 bg-blue-50/80 text-blue-700 shadow-sm"
                : "border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/30 text-slate-500"
            }`}
          >
            <UploadCloud size={20} className={file ? "text-blue-500 scale-110 transition-transform" : "text-slate-400"} />
            <span className="text-[11px] font-bold">
              {file ? file.name : "Pilih file moodboard"}
            </span>
            <span className="text-[9px] text-slate-400">
              {file ? "File siap diunggah" : "Format: PDF, gambar, atau dokumen (maks 8 MB)"}
            </span>
            <input
              type="file"
              accept="image/*,.pdf,.doc,.docx,.ppt,.pptx"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        {error && <p className="text-[11px] font-semibold text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting || !file || !lateReason.trim()}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-[12px] font-black tracking-wide text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg focus:ring-4 focus:ring-blue-500/20 active:scale-[0.98] disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 disabled:shadow-none"
        >
          {isSubmitting ? "Mengunggah..." : "Unggah & Buka Modul"}
        </button>
      </form>
    </div>
  );
}

function DeadlineBanner({ journal, serverTime }: { journal: JournalItem; serverTime?: string | null }) {
  const countdown = formatDeadlineCountdown(journal.deadlineAt, serverTime);
  const isLate = (journal.lateCount ?? 0) > 0;

  if (!countdown && !isLate) return null;

  return (
    <div
      className={`mb-4 rounded-xl border px-3.5 py-2.5 text-[11px] font-medium leading-relaxed ${
        isLate
          ? "border-amber-200 bg-amber-50/55 text-amber-800"
          : countdown?.overdue
            ? "border-rose-200 bg-rose-50/50 text-rose-700"
            : "border-blue-150 bg-blue-50/20 text-blue-700"
      }`}
    >
      <div className="flex items-center gap-1.5 font-extrabold">
        {isLate ? <AlertTriangle size={13} className="text-amber-500" /> : <Clock size={13} className="text-blue-500" />}
        {isLate ? "Peringatan Keterlambatan" : "Batas Waktu Pengisian"}
      </div>
      <p className="mt-1">
        {journal.deadlineAt && <>Batas: <b>{formatDateTimeId(journal.deadlineAt)}</b> · </>}
        <span>{countdown?.text}</span>
        {isLate && (
          <span>
            {" "}
            — jika terlambat kembali, akses modul ini akan <b>terkunci permanen</b>.
          </span>
        )}
      </p>
    </div>
  );
}

function CompletedCard({ journal }: { journal: JournalItem }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Refleksi Anda</p>
        <div className="mt-1.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 text-[12.5px] leading-relaxed text-slate-600 whitespace-pre-line max-h-48 overflow-y-auto font-medium">
          {journal.reflectionText}
        </div>
        {journal.evidenceImageUrl && (
          <a
            href={journal.evidenceImageUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-extrabold text-blue-600 hover:text-blue-800 hover:underline"
          >
            <ExternalLink size={12} /> Lihat Lampiran Bukti
          </a>
        )}
      </div>

      <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
        <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-emerald-700">Umpan Balik Konselor</p>
        {journal.counselorFeedback ? (
          <p className="mt-2 text-[12.5px] font-semibold leading-relaxed text-emerald-950 bg-white/80 p-3 rounded-lg border border-emerald-100">
            {journal.counselorFeedback}
          </p>
        ) : (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <Clock size={12} className="text-slate-450 animate-pulse" /> Menunggu reviu & masukan guru BK
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
  introduction,
  onSubmitSuccess,
}: {
  studentId: string;
  weekNumber: number;
  prompts: string[];
  introduction?: string | null;
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {introduction && (
        <div className="mb-1 rounded-xl border border-indigo-100 bg-indigo-50/20 p-4 text-[12.5px] leading-relaxed text-indigo-950 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 opacity-5">
            <Sparkles size={70} className="text-indigo-600" />
          </div>
          <p className="font-extrabold text-indigo-900 mb-1 flex items-center gap-1.5">
            <Sparkles size={13} className="text-indigo-600 animate-pulse" />
            Pengantar Modul
          </p>
          <p className="whitespace-pre-line text-indigo-900/80 leading-relaxed font-semibold">{introduction}</p>
        </div>
      )}

      {prompts.map((prompt, index) => (
        <div key={index} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition-all focus-within:border-blue-200 focus-within:bg-white focus-within:shadow-sm">
          <label className="mb-2 flex items-start gap-2 text-[12px] font-bold leading-relaxed text-slate-700">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-[10px] font-black text-white shadow-sm mt-0.5">
              {index + 1}
            </span>
            <span>{prompt}</span>
          </label>
          <textarea
            required
            rows={3}
            value={answers[index] ?? ""}
            onChange={(e) => updateAnswer(index, e.target.value)}
            placeholder={`Tulis jawaban refleksi Anda secara lengkap di sini...`}
            className="w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-[12px] text-slate-750 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 font-medium"
          />
        </div>
      ))}

      {/* Upload Bukti */}
      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
        <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Lampiran Bukti (Opsional)</label>
        <label
          className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-3 py-4 text-center transition-all ${
            file
              ? "border-blue-400 bg-blue-50/80 text-blue-700 shadow-sm"
              : "border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/30 text-slate-500"
          }`}
        >
          <UploadCloud size={20} className={file ? "text-blue-550 scale-110 transition-transform" : "text-slate-400"} />
          <span className="text-[11px] font-bold">
            {isUploading ? "Mengunggah..." : file ? file.name : "Unggah Foto / Dokumen Bukti"}
          </span>
          <span className="text-[9px] text-slate-400">
            {file ? "File siap dikirim" : "Format: PDF, JPG, PNG, DOC (maks 8 MB)"}
          </span>
          <input
            type="file"
            accept="image/*,.pdf,.doc,.docx,.ppt,.pptx"
            className="hidden"
            onChange={(e) => void handleFileChange(e.target.files?.[0] ?? null)}
          />
        </label>
        {uploadedUrl && (
          <p className="mt-2 text-[10px] font-semibold text-emerald-600 flex items-center gap-1">✓ Dokumen berhasil diunggah dan disimpan</p>
        )}
      </div>

      {error && <p className="text-[11px] font-semibold text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting || isUploading || !allFilled}
        className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-[12px] font-black tracking-wide text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg focus:ring-4 focus:ring-blue-500/10 active:scale-[0.98] disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 disabled:shadow-none"
      >
        {isSubmitting ? "Menyimpan Jawaban..." : "Kirim Jawaban Refleksi"}
      </button>
    </form>
  );
}
