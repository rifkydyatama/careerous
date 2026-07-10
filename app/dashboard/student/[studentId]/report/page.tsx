"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  RefreshCw,
  Sparkles,
  Smile,
  Meh,
  CloudSun,
  Tag,
  Compass,
  Info,
  ArrowLeft,
  Printer,
  Brain,
  BookOpen,
  BarChart2,
} from "lucide-react";
import {
  fetchCareerReport,
  formatDateTimeId,
  CareerReport,
  AssessmentData,
} from "../utils";

const SENTIMENT_UI: Record<string, { label: string; icon: any; colorClass: string }> = {
  POSITIF: { label: "Positif", icon: Smile, colorClass: "bg-emerald-100 text-emerald-700" },
  NETRAL: { label: "Netral", icon: Meh, colorClass: "bg-slate-100 text-slate-600" },
  CAMPURAN: { label: "Campuran", icon: CloudSun, colorClass: "bg-amber-100 text-amber-700" },
};

const RIASEC_LABELS: Record<string, string> = {
  riasecRealistic: "Realistic (R)",
  riasecInvestigative: "Investigative (I)",
  riasecArtistic: "Artistic (A)",
  riasecSocial: "Social (S)",
  riasecEnterprising: "Enterprising (E)",
  riasecConventional: "Conventional (C)",
};

const RIASEC_COLORS: Record<string, string> = {
  riasecRealistic: "bg-orange-500",
  riasecInvestigative: "bg-blue-500",
  riasecArtistic: "bg-purple-500",
  riasecSocial: "bg-emerald-500",
  riasecEnterprising: "bg-amber-500",
  riasecConventional: "bg-slate-500",
};

const LEARNING_STYLE_LABELS: Record<string, { label: string; desc: string }> = {
  VISUAL: { label: "Visual", desc: "Belajar terbaik melalui gambar, diagram, dan tampilan visual." },
  AUDITORY: { label: "Auditori", desc: "Belajar terbaik melalui mendengar, diskusi, dan penjelasan lisan." },
  KINESTHETIC: { label: "Kinestetik", desc: "Belajar terbaik melalui praktik langsung dan pengalaman nyata." },
  READ_WRITE: { label: "Baca/Tulis", desc: "Belajar terbaik melalui membaca dan membuat catatan." },
  MULTIMODAL: { label: "Multimodal", desc: "Fleksibel — dapat belajar efektif dengan berbagai gaya belajar." },
};

function RiasecChart({ assessment, isPrint = false }: { assessment: AssessmentData; isPrint?: boolean }) {
  const scores: Array<{ key: string; score: number }> = [
    { key: "riasecRealistic",     score: assessment.riasecRealistic },
    { key: "riasecInvestigative", score: assessment.riasecInvestigative },
    { key: "riasecArtistic",      score: assessment.riasecArtistic },
    { key: "riasecSocial",        score: assessment.riasecSocial },
    { key: "riasecEnterprising",  score: assessment.riasecEnterprising },
    { key: "riasecConventional",  score: assessment.riasecConventional },
  ].sort((a, b) => b.score - a.score);

  const maxScore = Math.max(...scores.map((s) => s.score), 1);

  return (
    <div className="flex flex-col gap-2.5">
      {scores.map(({ key, score }) => (
        <div key={key} className="flex items-center gap-3 text-[12px] print:text-[10px]">
          <span className="w-32 shrink-0 font-semibold text-slate-600 print:text-slate-900 text-right">
            {RIASEC_LABELS[key]}
          </span>
          <div className="flex-1 h-2 print:h-2.5 rounded-full bg-slate-100 print:bg-slate-200 overflow-hidden">
            <div
              className={`h-full rounded-full ${isPrint ? 'bg-slate-700' : RIASEC_COLORS[key]} transition-all duration-500`}
              style={{ width: `${(score / maxScore) * 100}%` }}
            />
          </div>
          <span className="w-6 text-right font-bold text-slate-700 print:text-black">{score}</span>
        </div>
      ))}
    </div>
  );
}

export default function CareerReportPage() {
  const params = useParams<{ studentId: string }>();
  const studentId = params.studentId;
  const [report, setReport] = useState<CareerReport | null>(null);
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notReady, setNotReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      setNotReady(false);
      try {
        const result = await fetchCareerReport(studentId);
        if (!mounted) return;
        if (result) {
          setReport(result.report);
          setAssessment(result.assessment);
          const dbData = await fetch(`/api/journals/${studentId}`)
            .then((r) => r.json())
            .catch(() => null);
          if (mounted && dbData) {
            setStudentData(dbData);
          }
        } else {
          setNotReady(true);
        }
      } catch (error) {
        if (mounted) {
          setErrorMessage(
            error instanceof Error ? error.message : "Gagal memuat laporan"
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [studentId]);

  const sentiment = report ? SENTIMENT_UI[report.sentimentLabel] ?? SENTIMENT_UI.NETRAL : null;
  const SentimentIcon = sentiment?.icon ?? Meh;
  const learnStyle = assessment ? LEARNING_STYLE_LABELS[assessment.learningStyle] : null;

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm 15mm 15mm 15mm;
          }
          body {
            background-color: white !important;
            color: black !important;
            font-family: "Georgia", "Times New Roman", serif !important;
            font-size: 11pt !important;
            line-height: 1.5 !important;
          }
          aside, header, footer, nav, .print\\:hidden, #accessibility-widget {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
          .print\\:bg-white { background-color: white !important; }
          
          /* Prevent page break inside official documents */
          .print-section {
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Top toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Career Exploration Report</h2>
          <p className="mt-1 text-[13px] text-slate-500">
            Laporan holistik eksplorasi karier — modul, RIASEC, dan gaya belajar.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-[11.5px] font-bold text-white transition hover:from-blue-700 hover:to-indigo-700 flex-1 sm:flex-initial text-center shadow-md shadow-blue-500/10"
          >
            <Printer size={14} /> Cetak / Unduh Laporan
          </button>
          <Link
            href={`/dashboard/student/${studentId}/journals`}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[11.5px] font-bold text-slate-600 transition hover:bg-slate-50 flex-1 sm:flex-initial text-center"
          >
            <ArrowLeft size={14} /> Kembali
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <RefreshCw size={18} className="animate-spin text-[#2563eb]" />
            <div>
              <p className="text-sm font-bold text-slate-900">Menyiapkan laporan</p>
              <p className="text-[13px] text-slate-500">
                Menganalisis jawaban journaling, RIASEC, dan gaya belajar Anda…
              </p>
            </div>
          </div>
        </div>
      ) : errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
          <p className="text-sm font-bold text-rose-900">Gagal memuat laporan</p>
          <p className="mt-1 text-[13px] text-rose-700">{errorMessage}</p>
        </div>
      ) : notReady || !report ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
          <Sparkles size={24} className="mx-auto text-slate-400" />
          <h4 className="mt-3 text-sm font-bold text-slate-900">Laporan belum tersedia</h4>
          <p className="mt-1 text-[13px] text-slate-500">
            Laporan dibuat secara otomatis setelah kamu menyelesaikan:
          </p>
          <ul className="mt-3 inline-flex flex-col gap-1 text-left text-[12.5px] text-slate-600">
            <li>✅ Seluruh 12 modul eksplorasi karier (refleksi lengkap)</li>
            <li>✅ Tes RIASEC &amp; Gaya Belajar</li>
          </ul>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              href={`/dashboard/student/${studentId}/journals`}
              className="inline-flex rounded-lg bg-[#2563eb] px-4 py-2 text-[12px] font-bold text-white transition hover:bg-[#1d4ed8]"
            >
              Lanjutkan Modul
            </Link>
            <Link
              href={`/dashboard/student/${studentId}/riasec`}
              className="inline-flex rounded-lg border border-slate-200 bg-white px-4 py-2 text-[12px] font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Ikuti Tes Asesmen
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5 print:gap-4 print:p-0">
          {/* ── PRINT ONLY: Kop Surat Resmi Premium ── */}
          <div className="hidden print:block mb-6">
            <div className="flex items-center justify-between border-b-[3px] border-slate-900 pb-3">
              <div className="flex items-center gap-3">
                {/* Logo Instansi Mock Premium */}
                <div className="h-12 w-12 rounded-lg bg-slate-900 flex items-center justify-center text-white font-black text-lg tracking-wider">
                  CR
                </div>
                <div>
                  <h1 className="text-lg font-black text-slate-950 tracking-tight leading-none">
                    CAREEROUS EXPLORATION SYSTEM
                  </h1>
                  <p className="text-[9px] text-slate-600 font-bold uppercase mt-0.5 tracking-wider">
                    Sistem Penilaian Karir &amp; Portofolio Evaluasi Siswa
                  </p>
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-600 leading-normal">
                <p className="font-bold text-slate-900">LAPORAN HASIL ASESMEN RESMI</p>
                <p>ID Dokumen: CR-{studentId.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>
            
            {/* Elegant Double Line Accent */}
            <div className="h-0.5 w-full bg-amber-500 mt-1 mb-6" />

            {/* Biodata Table Resmi */}
            <h2 className="text-[12px] font-bold uppercase tracking-wider text-slate-800 mb-2.5">
              I. IDENTITAS PESERTA ASESMEN
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 border border-slate-300 rounded-lg p-4 bg-slate-50 text-[11px] text-slate-800 mb-6">
              <div className="flex justify-between border-b border-slate-200 pb-1">
                <span className="text-slate-500 font-semibold">Nama Lengkap:</span>
                <span className="font-bold text-slate-900 text-right">{studentData?.student?.name || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1">
                <span className="text-slate-500 font-semibold">Sekolah / Institusi:</span>
                <span className="font-bold text-slate-900 text-right">{studentData?.institutionName || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1">
                <span className="text-slate-500 font-semibold">Email Siswa:</span>
                <span className="font-bold text-slate-900 text-right">{studentData?.student?.email || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1">
                <span className="text-slate-500 font-semibold">Tanggal Penyelesaian:</span>
                <span className="font-bold text-slate-900 text-right">
                  {new Date(report.generatedAt).toLocaleDateString("id-ID", { dateStyle: "long" })}
                </span>
              </div>
            </div>
          </div>

          {/* ── Dashboard Welcome Banner (System-Only) ── */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#4f46e5] p-7 shadow-md print:hidden">
            <div className="absolute -right-16 -top-16 h-[250px] w-[250px] rounded-full bg-white/5 blur-2xl" />
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-sky-200">
                <Sparkles size={11} />
                {report.isAiGenerated ? "AI Insight (Gemini)" : "Analisis Sistem"}
              </span>
              <h3 className="mt-3 text-xl font-extrabold text-white">Ringkasan Eksplorasi Karier</h3>
              <p className="mt-1 text-[12px] text-white/50">
                Dibuat pada {formatDateTimeId(report.generatedAt)}
              </p>
            </div>
          </div>

          {/* ── 3-Column Analytics Grid (Dashboard view) ── */}
          <div className="grid gap-4 sm:grid-cols-3 print:hidden">
            {/* Sentiment */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Sentimen Umum</p>
              <div className="mt-3 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold ${sentiment?.colorClass}`}>
                  <SentimentIcon size={14} /> {sentiment?.label}
                </span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${report.sentimentScore}%` }} />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500">Skor positif {report.sentimentScore}/100</p>
            </div>

            {/* Dominant Themes */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Tema Karier Dominan</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {report.dominantThemes.length > 0 ? (
                  report.dominantThemes.map((theme) => (
                    <span key={theme} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                      <Tag size={11} /> {theme}
                    </span>
                  ))
                ) : (
                  <span className="text-[12px] text-slate-400">Belum ada tema dominan</span>
                )}
              </div>
            </div>

            {/* Top RIASEC Interest */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Minat RIASEC Teratas</p>
              <div className="mt-3 flex items-start gap-2 text-[12.5px] font-semibold text-indigo-700">
                <Compass size={15} className="mt-0.5 shrink-0" />
                <span>{report.topInterest || "Belum ada data RIASEC"}</span>
              </div>
            </div>
          </div>

          {/* ── PRINT ONLY: Ringkasan Indikator Kunci (Compact Table format) ── */}
          <div className="hidden print:block mb-6">
            <h2 className="text-[12px] font-bold uppercase tracking-wider text-slate-800 mb-2.5">
              II. RINGKASAN METRIK EKSPLORASI
            </h2>
            <table className="w-full border-collapse border border-slate-300 text-[11px] text-slate-800">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-2 text-left font-bold w-1/3">Indikator</th>
                  <th className="border border-slate-300 p-2 text-left font-bold">Hasil Pengukuran &amp; Keterangan</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-2 font-semibold">Minat RIASEC Teratas</td>
                  <td className="border border-slate-300 p-2 font-bold text-indigo-950">{report.topInterest || "—"}</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 font-semibold">Tema Karir Teridentifikasi</td>
                  <td className="border border-slate-300 p-2 text-slate-700">{report.dominantThemes.join(", ") || "—"}</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 font-semibold">Indeks Sentimen Jurnal</td>
                  <td className="border border-slate-300 p-2">
                    <span className="font-bold">{sentiment?.label}</span> (Skor: {report.sentimentScore}/100)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── Narasi Naratif Ulasan ── */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:shadow-none print:border-none print:p-0 mb-4">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 print:text-slate-800 print:text-[11.5px] print:border-b print:pb-1.5">
              {/* Conditional Title based on view */}
              <span className="print:hidden">Ulasan &amp; Catatan Narasi Eksplorasi</span>
              <span className="hidden print:inline">III. ANALISIS NARASI &amp; REKOMENDASI KARIER</span>
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-slate-700 print:text-[11px] print:text-slate-900 print:text-justify whitespace-pre-line print:leading-normal">
              {report.summary}
            </p>
          </div>

          {/* ── Asesmen Grid (Print layout: side by side) ── */}
          <div className="grid gap-5 sm:grid-cols-2 print:grid-cols-2 print:gap-6 print:border-t print:pt-4">
            {/* RIASEC Chart */}
            {assessment && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:shadow-none print:border-none print:p-0">
                <div className="flex items-center gap-2 mb-4 print:mb-2.5">
                  <BarChart2 size={16} className="text-indigo-500 print:hidden" />
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 print:text-slate-800 print:text-[11.5px] print:border-b print:pb-1.5 w-full">
                    IV. PROFIL SKOR RIASCE (MINAT VOKASIONAL)
                  </p>
                </div>
                <div className="print:mt-2">
                  <RiasecChart assessment={assessment} isPrint={false} />
                </div>
                {assessment.riasecTop3 && (
                  <p className="mt-4 text-[11.5px] text-slate-500 print:text-[10px] print:text-slate-800 print:mt-2.5">
                    <span className="font-bold text-slate-700 print:text-slate-950">Orientasi Tipe Dominan:</span>{" "}
                    {assessment.riasecTop3}
                  </p>
                )}
              </div>
            )}

            {/* Learning Style */}
            {assessment && learnStyle && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:shadow-none print:border-none print:p-0">
                <div className="flex items-center gap-2 mb-3">
                  <Brain size={16} className="text-purple-500 print:hidden" />
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 print:text-slate-800 print:text-[11.5px] print:border-b print:pb-1.5 w-full">
                    V. GAYA BELAJAR DOMINAN SENSENSORIK
                  </p>
                </div>
                <div className="flex items-start gap-3 print:gap-0 print:flex-col print:mt-2">
                  <span className="rounded-xl bg-purple-50 px-3 py-2 text-[13px] font-extrabold text-purple-700 print:bg-slate-100 print:text-slate-950 print:px-2.5 print:py-1 print:text-[10.5px] print:rounded-md">
                    {learnStyle.label}
                  </span>
                  <p className="mt-1 text-[12.5px] text-slate-600 leading-relaxed print:text-[10px] print:text-slate-800 print:mt-2 print:leading-normal">
                    {learnStyle.desc}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Official Signatures (Print Only) ── */}
          <div className="hidden print:grid grid-cols-2 gap-10 mt-12 pt-8 border-t border-dashed border-slate-400 text-center text-[10px] text-slate-800 print-section">
            <div>
              <p className="text-slate-500 uppercase tracking-wider text-[8.5px] font-bold mb-14">Siswa Bersangkutan</p>
              <div className="border-b border-slate-400 mx-auto w-40 mb-1" />
              <p className="font-extrabold text-slate-950">{studentData?.student?.name || "—"}</p>
              <p className="text-[8px] text-slate-500">Tanda Tangan &amp; Nama Terang</p>
            </div>
            <div>
              <p className="text-slate-500 uppercase tracking-wider text-[8.5px] font-bold mb-14">Guru Konselor Pendamping (BK)</p>
              <div className="border-b border-slate-400 mx-auto w-40 mb-1" />
              <p className="font-extrabold text-slate-950">{studentData?.counselor?.name || "Guru Pendamping"}</p>
              <p className="text-[8px] text-slate-500">Mengesahkan Laporan Hasil</p>
            </div>
          </div>

          {/* ── Notice Banner (System-Only) ── */}
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[12px] text-amber-800 print:hidden">
            <Info size={15} className="mt-0.5 shrink-0" />
            <p>
              {report.isAiGenerated
                ? "Laporan ini dihasilkan oleh AI (Gemini) berdasarkan jawaban journaling, hasil RIASEC, dan gaya belajar Anda. Gunakan sebagai bahan diskusi bersama guru BK."
                : "Laporan ini dihasilkan secara otomatis menggunakan analisis berbasis aturan karena AI belum aktif. Hasil sudah mencakup data RIASEC dan gaya belajar Anda."}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
