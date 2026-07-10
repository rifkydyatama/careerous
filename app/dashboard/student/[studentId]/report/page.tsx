"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  RefreshCw, Sparkles, Smile, Meh, CloudSun,
  Tag, Compass, Info, ArrowLeft, Printer, Brain, BarChart2,
} from "lucide-react";
import { fetchCareerReport, formatDateTimeId, CareerReport, AssessmentData } from "../utils";

// ─── Constants ───────────────────────────────────────────────────────────────

const SENTIMENT_UI: Record<string, { label: string; icon: any; colorClass: string }> = {
  POSITIF:  { label: "Positif",  icon: Smile,    colorClass: "bg-emerald-100 text-emerald-700" },
  NETRAL:   { label: "Netral",   icon: Meh,      colorClass: "bg-slate-100 text-slate-600"    },
  CAMPURAN: { label: "Campuran", icon: CloudSun, colorClass: "bg-amber-100 text-amber-700"   },
};

const RIASEC_KEYS = [
  "riasecRealistic", "riasecInvestigative", "riasecArtistic",
  "riasecSocial", "riasecEnterprising", "riasecConventional",
] as const;

const RIASEC_LABELS: Record<string, string> = {
  riasecRealistic:     "Realistic (R)",
  riasecInvestigative: "Investigative (I)",
  riasecArtistic:      "Artistic (A)",
  riasecSocial:        "Social (S)",
  riasecEnterprising:  "Enterprising (E)",
  riasecConventional:  "Conventional (C)",
};

const RIASEC_SCREEN_COLORS: Record<string, string> = {
  riasecRealistic:     "bg-orange-500",
  riasecInvestigative: "bg-blue-500",
  riasecArtistic:      "bg-purple-500",
  riasecSocial:        "bg-emerald-500",
  riasecEnterprising:  "bg-amber-500",
  riasecConventional:  "bg-slate-500",
};

const LEARNING_STYLE_LABELS: Record<string, { label: string; desc: string }> = {
  VISUAL:      { label: "Visual",      desc: "Belajar terbaik melalui gambar, diagram, dan tampilan visual." },
  AUDITORY:    { label: "Auditori",    desc: "Belajar terbaik melalui mendengar, diskusi, dan penjelasan lisan." },
  KINESTHETIC: { label: "Kinestetik",  desc: "Belajar terbaik melalui praktik langsung dan pengalaman nyata." },
  READ_WRITE:  { label: "Baca/Tulis",  desc: "Belajar terbaik melalui membaca dan membuat catatan." },
  MULTIMODAL:  { label: "Multimodal",  desc: "Fleksibel — dapat belajar efektif dengan berbagai gaya belajar." },
};

// ─── RIASEC Chart Component ───────────────────────────────────────────────────

function RiasecChart({ assessment, forPrint = false }: { assessment: AssessmentData; forPrint?: boolean }) {
  const raw = RIASEC_KEYS.map((k) => ({ key: k, score: (assessment as any)[k] as number }));
  const sorted = [...raw].sort((a, b) => b.score - a.score);
  const max = Math.max(...sorted.map((s) => s.score), 1);

  if (forPrint) {
    return (
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10pt" }}>
        <tbody>
          {sorted.map(({ key, score }) => (
            <tr key={key}>
              <td style={{ width: 140, paddingRight: 8, textAlign: "right", fontWeight: 600, color: "#374151", paddingBottom: 5 }}>
                {RIASEC_LABELS[key]}
              </td>
              <td style={{ paddingBottom: 5 }}>
                <div style={{ height: 10, background: "#E5E7EB", borderRadius: 5, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(score / max) * 100}%`, background: "#1E3A5F", borderRadius: 5 }} />
                </div>
              </td>
              <td style={{ width: 24, textAlign: "right", fontWeight: 700, paddingLeft: 8, paddingBottom: 5 }}>{score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {sorted.map(({ key, score }) => (
        <div key={key} className="flex items-center gap-2 text-[12px]">
          <span className="w-32 shrink-0 font-semibold text-slate-600 text-right">{RIASEC_LABELS[key]}</span>
          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className={`h-full rounded-full ${RIASEC_SCREEN_COLORS[key]} transition-all duration-500`} style={{ width: `${(score / max) * 100}%` }} />
          </div>
          <span className="w-6 text-right font-bold text-slate-700">{score}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Print Document Component ─────────────────────────────────────────────────

function PrintDocument({
  report, assessment, studentData,
}: { report: CareerReport; assessment: AssessmentData | null; studentData: any }) {
  const learnStyle = assessment ? LEARNING_STYLE_LABELS[assessment.learningStyle] : null;
  const raw = assessment ? RIASEC_KEYS.map((k) => ({ key: k, score: (assessment as any)[k] as number })) : [];
  const sorted = [...raw].sort((a, b) => b.score - a.score);
  const sentimentLabel =
    report.sentimentLabel === "POSITIF" ? "Positif" :
    report.sentimentLabel === "CAMPURAN" ? "Campuran" : "Netral";

  return (
    <div className="hidden print:block" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", color: "#111827", fontSize: "11pt", lineHeight: 1.6 }}>

      {/* ═══════════════════════ KOP SURAT ═══════════════════════ */}
      <div style={{ borderBottom: "3px solid #1E3A5F", paddingBottom: 12, marginBottom: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Kiri: Logo Careerous + Nama Sistem */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src="/logo.jpg" alt="Careerous Logo" style={{ height: 52, width: 52, objectFit: "contain" }} />
          <div>
            <div style={{ fontSize: "16pt", fontWeight: 900, color: "#1E3A5F", letterSpacing: "-0.5px", lineHeight: 1.1 }}>
              CAREEROUS
            </div>
            <div style={{ fontSize: "8.5pt", color: "#6B7280", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", marginTop: 2 }}>
              Career Exploration &amp; Assessment System
            </div>
          </div>
        </div>
        {/* Kanan: Logo UM + Institusi */}
        <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: 10, flexDirection: "row-reverse" }}>
          <img src="/logo-um.png" alt="Logo Universitas Negeri Malang" style={{ height: 56, width: 56, objectFit: "contain" }} />
          <div>
            <div style={{ fontSize: "9pt", fontWeight: 700, color: "#1E3A5F" }}>Universitas Negeri Malang</div>
            <div style={{ fontSize: "7.5pt", color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.5px" }}>Mitra Institusi Resmi</div>
          </div>
        </div>
      </div>
      <div style={{ height: 3, background: "linear-gradient(to right, #1E3A5F, #C9920A)", marginBottom: 18 }} />

      {/* ═══════════════════════ JUDUL DOKUMEN ═══════════════════════ */}
      <div style={{ textAlign: "center", marginBottom: 20, borderBottom: "1px solid #E5E7EB", paddingBottom: 14 }}>
        <div style={{ fontSize: "14pt", fontWeight: 900, color: "#1E3A5F", textTransform: "uppercase", letterSpacing: "1px" }}>
          Laporan Hasil Eksplorasi Karier Siswa
        </div>
        <div style={{ fontSize: "9pt", color: "#6B7280", marginTop: 4 }}>
          Analisis Holistik: Jurnal 12 Modul · Profil RIASEC · Gaya Belajar
        </div>
        <div style={{ fontSize: "8pt", color: "#9CA3AF", marginTop: 2 }}>
          No. Dokumen: CR-{studentData?.student?.id?.slice(0, 8)?.toUpperCase() || "—"} &nbsp;|&nbsp; Tanggal Cetak: {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}
        </div>
      </div>

      {/* ═══════════════════════ I. IDENTITAS SISWA ═══════════════════════ */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: "10pt", fontWeight: 800, color: "#1E3A5F", textTransform: "uppercase", letterSpacing: "0.5px", borderLeft: "3px solid #C9920A", paddingLeft: 8, marginBottom: 10 }}>
          I. Identitas Peserta Asesmen
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10pt" }}>
          <tbody>
            <tr style={{ background: "#F9FAFB" }}>
              <td style={{ border: "1px solid #D1D5DB", padding: "6px 10px", fontWeight: 600, width: "25%", color: "#374151" }}>Nama Lengkap</td>
              <td style={{ border: "1px solid #D1D5DB", padding: "6px 10px", fontWeight: 700, color: "#111827" }}>{studentData?.student?.name || "—"}</td>
              <td style={{ border: "1px solid #D1D5DB", padding: "6px 10px", fontWeight: 600, width: "25%", color: "#374151" }}>Sekolah / Institusi</td>
              <td style={{ border: "1px solid #D1D5DB", padding: "6px 10px", fontWeight: 700, color: "#111827" }}>{studentData?.institutionName || "—"}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #D1D5DB", padding: "6px 10px", fontWeight: 600, color: "#374151" }}>Alamat Email</td>
              <td style={{ border: "1px solid #D1D5DB", padding: "6px 10px", color: "#111827" }}>{studentData?.student?.email || "—"}</td>
              <td style={{ border: "1px solid #D1D5DB", padding: "6px 10px", fontWeight: 600, color: "#374151" }}>Guru BK Pendamping</td>
              <td style={{ border: "1px solid #D1D5DB", padding: "6px 10px", color: "#111827" }}>{studentData?.counselor?.name || "—"}</td>
            </tr>
            <tr style={{ background: "#F9FAFB" }}>
              <td style={{ border: "1px solid #D1D5DB", padding: "6px 10px", fontWeight: 600, color: "#374151" }}>Tanggal Laporan</td>
              <td style={{ border: "1px solid #D1D5DB", padding: "6px 10px", color: "#111827" }}>
                {new Date(report.generatedAt).toLocaleDateString("id-ID", { dateStyle: "long" })}
              </td>
              <td style={{ border: "1px solid #D1D5DB", padding: "6px 10px", fontWeight: 600, color: "#374151" }}>Status Penyelesaian</td>
              <td style={{ border: "1px solid #D1D5DB", padding: "6px 10px", fontWeight: 700, color: "#065F46" }}>✓ Lulus (12 Modul + Asesmen)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ═══════════════════════ II. RINGKASAN METRIK ═══════════════════════ */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: "10pt", fontWeight: 800, color: "#1E3A5F", textTransform: "uppercase", letterSpacing: "0.5px", borderLeft: "3px solid #C9920A", paddingLeft: 8, marginBottom: 10 }}>
          II. Ringkasan Metrik Eksplorasi
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10pt" }}>
          <thead>
            <tr style={{ background: "#1E3A5F", color: "white" }}>
              <th style={{ border: "1px solid #1E3A5F", padding: "7px 10px", textAlign: "left", fontWeight: 700, fontSize: "9pt", width: "35%" }}>Dimensi Penilaian</th>
              <th style={{ border: "1px solid #1E3A5F", padding: "7px 10px", textAlign: "left", fontWeight: 700, fontSize: "9pt" }}>Hasil &amp; Keterangan</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #D1D5DB", padding: "7px 10px", fontWeight: 600, background: "#F9FAFB", color: "#374151" }}>Tipe Minat RIASEC Teratas</td>
              <td style={{ border: "1px solid #D1D5DB", padding: "7px 10px", fontWeight: 700, color: "#1E3A5F" }}>{report.topInterest || "—"}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #D1D5DB", padding: "7px 10px", fontWeight: 600, background: "#F9FAFB", color: "#374151" }}>Tema Karier Teridentifikasi</td>
              <td style={{ border: "1px solid #D1D5DB", padding: "7px 10px", color: "#111827" }}>{report.dominantThemes.join(" · ") || "—"}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #D1D5DB", padding: "7px 10px", fontWeight: 600, background: "#F9FAFB", color: "#374151" }}>Gaya Belajar Dominan</td>
              <td style={{ border: "1px solid #D1D5DB", padding: "7px 10px", color: "#111827" }}>
                <strong>{learnStyle?.label || "—"}</strong>{learnStyle ? ` — ${learnStyle.desc}` : ""}
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #D1D5DB", padding: "7px 10px", fontWeight: 600, background: "#F9FAFB", color: "#374151" }}>Indeks Sentimen Jurnal</td>
              <td style={{ border: "1px solid #D1D5DB", padding: "7px 10px", color: "#111827" }}>
                <strong>{sentimentLabel}</strong> &nbsp;(Skor: {report.sentimentScore}/100)
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #D1D5DB", padding: "7px 10px", fontWeight: 600, background: "#F9FAFB", color: "#374151" }}>Dibuat Menggunakan</td>
              <td style={{ border: "1px solid #D1D5DB", padding: "7px 10px", color: "#111827" }}>
                {report.isAiGenerated ? "Analisis AI (Gemini)" : "Analisis Berbasis Aturan"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ═══════════════════════ III. NARASI AI ═══════════════════════ */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: "10pt", fontWeight: 800, color: "#1E3A5F", textTransform: "uppercase", letterSpacing: "0.5px", borderLeft: "3px solid #C9920A", paddingLeft: 8, marginBottom: 10 }}>
          III. Analisis Narasi &amp; Rekomendasi Karier
        </div>
        <div style={{ border: "1px solid #D1D5DB", borderRadius: 4, padding: "12px 14px", fontSize: "10.5pt", lineHeight: 1.75, color: "#1F2937", textAlign: "justify", whiteSpace: "pre-line" }}>
          {report.summary}
        </div>
      </div>

      {/* ═══════════════════════ IV. PROFIL RIASEC ═══════════════════════ */}
      {assessment && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: "10pt", fontWeight: 800, color: "#1E3A5F", textTransform: "uppercase", letterSpacing: "0.5px", borderLeft: "3px solid #C9920A", paddingLeft: 8, marginBottom: 10 }}>
            IV. Profil Skor RIASEC (Minat Vokasional)
          </div>
          <RiasecChart assessment={assessment} forPrint />
          {assessment.riasecTop3 && (
            <div style={{ marginTop: 8, fontSize: "9.5pt", color: "#374151" }}>
              <strong>Orientasi Tipe Dominan:</strong> {assessment.riasecTop3}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════ TANDA TANGAN ═══════════════════════ */}
      <div style={{ marginTop: 28, borderTop: "1.5px solid #9CA3AF", paddingTop: 18 }}>
        <div style={{ fontSize: "8pt", color: "#9CA3AF", textAlign: "center", marginBottom: 24, letterSpacing: "0.5px" }}>
          Dokumen ini diterbitkan secara resmi oleh sistem CAREEROUS dan berlaku sebagai laporan evaluasi akhir eksplorasi karier siswa.
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 40 }}>
          {[
            { label: "Siswa Bersangkutan", name: studentData?.student?.name || "—" },
            { label: "Guru Bimbingan Konseling (BK)", name: studentData?.counselor?.name || "Guru Pendamping" },
          ].map(({ label, name }) => (
            <div key={label} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: "8.5pt", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 52, fontWeight: 600 }}>{label}</div>
              <div style={{ borderBottom: "1.5px solid #374151", marginBottom: 6, width: "75%", marginLeft: "auto", marginRight: "auto" }} />
              <div style={{ fontWeight: 700, fontSize: "10pt", color: "#111827" }}>{name}</div>
              <div style={{ fontSize: "8pt", color: "#9CA3AF" }}>Tanda Tangan &amp; Nama Terang</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 18, borderTop: "1px solid #E5E7EB", paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: "7.5pt", color: "#9CA3AF" }}>
        <span>© {new Date().getFullYear()} CAREEROUS — Career Exploration &amp; Assessment System</span>
        <span>Halaman 1 dari 1 · ID: CR-{studentData?.student?.id?.slice(0, 8)?.toUpperCase() || "—"}</span>
      </div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function CareerReportPage() {
  const params = useParams<{ studentId: string }>();
  const studentId = params.studentId;
  const [report, setReport] = useState<CareerReport | null>(null);
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notReady, setNotReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true); setErrorMessage(null); setNotReady(false);
      try {
        const result = await fetchCareerReport(studentId);
        if (!mounted) return;
        if (result) {
          setReport(result.report);
          setAssessment(result.assessment);
          const dbData = await fetch(`/api/journals/${studentId}`).then((r) => r.json()).catch(() => null);
          if (mounted && dbData) setStudentData(dbData);
        } else {
          setNotReady(true);
        }
      } catch (error) {
        if (mounted) setErrorMessage(error instanceof Error ? error.message : "Gagal memuat laporan");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    void load();
    return () => { mounted = false; };
  }, [studentId]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setErrorMessage(null);
    try {
      const result = await fetchCareerReport(studentId, true);
      if (result) {
        setReport(result.report);
        setAssessment(result.assessment);
      } else {
        setNotReady(true);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal memperbarui laporan dengan AI"
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const sentiment = report ? SENTIMENT_UI[report.sentimentLabel] ?? SENTIMENT_UI.NETRAL : null;
  const SentimentIcon = sentiment?.icon ?? Meh;
  const learnStyle = assessment ? LEARNING_STYLE_LABELS[assessment.learningStyle] : null;

  return (
    <>
      {/* Print-only global styles */}
      <style>{`
        @media print {
          @page { size: A4; margin: 18mm 16mm 18mm 16mm; }
          body { background: white !important; }
          aside, header, footer, nav, .print\\:hidden, #accessibility-widget { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; }
        }
      `}</style>

      {/* ── Toolbar (screen only) ── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Career Exploration Report</h2>
          <p className="mt-1 text-[13px] text-slate-500">Laporan holistik eksplorasi karier — modul, RIASEC, dan gaya belajar.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {report && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[11.5px] font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 flex-1 sm:flex-initial"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin text-blue-600" : ""} />
              {isRefreshing ? "Memproses AI..." : "Regenerasi AI"}
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-[11.5px] font-bold text-white transition hover:from-blue-700 hover:to-indigo-700 flex-1 sm:flex-initial shadow-md shadow-blue-500/10"
          >
            <Printer size={14} /> Cetak / Unduh PDF
          </button>
          <Link href={`/dashboard/student/${studentId}/journals`}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[11.5px] font-bold text-slate-600 transition hover:bg-slate-50 flex-1 sm:flex-initial"
          >
            <ArrowLeft size={14} /> Kembali
          </Link>
        </div>
      </div>

      {/* ── States ── */}
      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:hidden">
          <div className="flex items-center gap-3">
            <RefreshCw size={18} className="animate-spin text-blue-600" />
            <div>
              <p className="text-sm font-bold text-slate-900">Menyiapkan laporan…</p>
              <p className="text-[13px] text-slate-500">Menganalisis jawaban journaling, RIASEC, dan gaya belajar.</p>
            </div>
          </div>
        </div>
      ) : errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm print:hidden">
          <p className="text-sm font-bold text-rose-900">Gagal memuat laporan</p>
          <p className="mt-1 text-[13px] text-rose-700">{errorMessage}</p>
        </div>
      ) : notReady || !report ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm print:hidden">
          <Sparkles size={24} className="mx-auto text-slate-400" />
          <h4 className="mt-3 text-sm font-bold text-slate-900">Laporan belum tersedia</h4>
          <p className="mt-1 text-[13px] text-slate-500">Laporan dibuat setelah kamu menyelesaikan:</p>
          <ul className="mt-3 inline-flex flex-col gap-1 text-left text-[12.5px] text-slate-600">
            <li>✅ Seluruh 12 modul eksplorasi karier</li>
            <li>✅ Tes RIASEC &amp; Gaya Belajar</li>
          </ul>
          <div className="mt-5 flex justify-center gap-3">
            <Link href={`/dashboard/student/${studentId}/journals`} className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-bold text-white hover:bg-blue-700 transition">Lanjutkan Modul</Link>
            <Link href={`/dashboard/student/${studentId}/riasec`} className="inline-flex rounded-lg border border-slate-200 bg-white px-4 py-2 text-[12px] font-bold text-slate-700 hover:bg-slate-50 transition">Ikuti Tes Asesmen</Link>
          </div>
        </div>
      ) : (
        <>
          {/* ═══════════════ PRINT DOCUMENT (hidden on screen) ═══════════════ */}
          <PrintDocument report={report} assessment={assessment} studentData={studentData} />

          {/* ═══════════════ SCREEN UI (hidden on print) ═══════════════ */}
          <div className="flex flex-col gap-5 print:hidden">

            {/* Hero banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#4f46e5] p-7 shadow-md">
              <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-sky-200">
                  <Sparkles size={11} />
                  {report.isAiGenerated ? "AI Insight (Gemini)" : "Analisis Sistem"}
                </span>
                <h3 className="mt-3 text-xl font-extrabold text-white">Ringkasan Eksplorasi Karier</h3>
                <p className="mt-1 text-[12px] text-white/50">Dibuat pada {formatDateTimeId(report.generatedAt)}</p>
              </div>
            </div>

            {/* Metrics 3-col */}
            <div className="grid gap-4 sm:grid-cols-3">
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

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Tema Karier Dominan</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {report.dominantThemes.length > 0
                    ? report.dominantThemes.map((t) => (
                        <span key={t} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                          <Tag size={11} /> {t}
                        </span>
                      ))
                    : <span className="text-[12px] text-slate-400">Belum ada tema</span>}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Minat RIASEC Teratas</p>
                <div className="mt-3 flex items-start gap-2 text-[12.5px] font-semibold text-indigo-700">
                  <Compass size={15} className="mt-0.5 shrink-0" />
                  <span>{report.topInterest || "—"}</span>
                </div>
              </div>
            </div>

            {/* Narrative Summary */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Ulasan Narasi Eksplorasi</p>
              <p className="mt-3 text-[13px] leading-relaxed text-slate-700 whitespace-pre-line">{report.summary}</p>
            </div>

            {/* RIASEC + Learning Style side by side */}
            <div className="grid gap-5 sm:grid-cols-2">
              {assessment && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart2 size={16} className="text-indigo-500" />
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Skor RIASEC Lengkap</p>
                  </div>
                  <RiasecChart assessment={assessment} />
                  {assessment.riasecTop3 && (
                    <p className="mt-4 text-[11.5px] text-slate-500">
                      <span className="font-bold text-slate-700">Tiga tipe teratas:</span> {assessment.riasecTop3}
                    </p>
                  )}
                </div>
              )}

              {assessment && learnStyle && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain size={16} className="text-purple-500" />
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Gaya Belajar</p>
                  </div>
                  <span className="rounded-xl bg-purple-50 px-3 py-2 text-[13px] font-extrabold text-purple-700">{learnStyle.label}</span>
                  <p className="mt-3 text-[12.5px] text-slate-600 leading-relaxed">{learnStyle.desc}</p>
                </div>
              )}
            </div>

            {/* Notice */}
            <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[12px] text-amber-800">
              <div className="flex items-start gap-2">
                <Info size={15} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">
                    {report.isAiGenerated
                      ? "Laporan Resmi Terverifikasi AI (Gemini)"
                      : "Laporan Hasil Analisis Aturan (AI Tidak Aktif)"}
                  </p>
                  <p className="mt-0.5 opacity-90">
                    {report.isAiGenerated
                      ? "Laporan ini dihasilkan oleh AI (Gemini) secara holistik berdasarkan jawaban journaling, RIASEC, dan gaya belajar Anda. Gunakan sebagai bahan diskusi bersama guru BK."
                      : "Laporan ini dihasilkan menggunakan analisis otomatis berbasis aturan (rule-based) karena AI belum diaktifkan saat pembuatan laporan pertama kali."}
                  </p>
                </div>
              </div>
              {!report.isAiGenerated && (
                <div className="mt-1 flex items-center gap-3">
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-amber-700 disabled:opacity-50"
                  >
                    <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
                    {isRefreshing ? "Mengaktifkan AI..." : "Aktifkan Analisis AI Sekarang"}
                  </button>
                  {errorMessage && (
                    <span className="text-red-600 font-medium">Gagal: {errorMessage}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
