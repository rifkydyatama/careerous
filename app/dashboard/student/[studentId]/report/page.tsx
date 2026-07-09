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
} from "lucide-react";
import { fetchCareerReport, formatDateTimeId, CareerReport } from "../utils";

const SENTIMENT_UI: Record<string, { label: string; icon: any; colorClass: string }> = {
  POSITIF: { label: "Positif", icon: Smile, colorClass: "bg-emerald-100 text-emerald-700" },
  NETRAL: { label: "Netral", icon: Meh, colorClass: "bg-slate-100 text-slate-600" },
  CAMPURAN: { label: "Campuran", icon: CloudSun, colorClass: "bg-amber-100 text-amber-700" },
};

export default function CareerReportPage() {
  const params = useParams<{ studentId: string }>();
  const studentId = params.studentId;
  const [report, setReport] = useState<CareerReport | null>(null);
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
        if (result) setReport(result);
        else setNotReady(true);
      } catch (error) {
        if (mounted) {
          setErrorMessage(
            error instanceof Error ? error.message : "Gagal memuat laporan"
          );
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [studentId]);

  const sentiment = report ? SENTIMENT_UI[report.sentimentLabel] ?? SENTIMENT_UI.NETRAL : null;
  const SentimentIcon = sentiment?.icon ?? Meh;

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Career Exploration Report</h2>
          <p className="mt-1 text-[13px] text-slate-500">
            Ringkasan perjalanan eksplorasi karier Anda dari seluruh 12 modul.
          </p>
        </div>
        <Link
          href={`/dashboard/student/${studentId}/journals`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11.5px] font-bold text-slate-600 transition hover:bg-slate-50"
        >
          <ArrowLeft size={14} /> Kembali ke Modul
        </Link>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <RefreshCw size={18} className="animate-spin text-[#2563eb]" />
            <div>
              <p className="text-sm font-bold text-slate-900">Menyiapkan laporan</p>
              <p className="text-[13px] text-slate-500">Menganalisis jawaban journaling Anda.</p>
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
            Selesaikan seluruh 12 modul eksplorasi karier untuk membuka laporan ini.
          </p>
          <Link
            href={`/dashboard/student/${studentId}/journals`}
            className="mt-4 inline-flex rounded-lg bg-[#2563eb] px-4 py-2 text-[12px] font-bold text-white transition hover:bg-[#1d4ed8]"
          >
            Lanjutkan Modul
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {}
          <div className="relative overflow-hidden rounded-2xl bg-[#2563eb] p-7 shadow-md">
            <div className="absolute -right-16 -top-16 h-[250px] w-[250px] rounded-full bg-[#3b82f6]/10 blur-2xl"></div>
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3b82f6]/20 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#0ea5e9]">
                <Sparkles size={11} /> {report.isAiGenerated ? "AI Insight (GPT)" : "AI Insight (Pratinjau)"}
              </span>
              <h3 className="mt-3 text-xl font-extrabold text-white">Ringkasan Eksplorasi Karier</h3>
              <p className="mt-1 text-[12px] text-white/50">
                Dibuat pada {formatDateTimeId(report.generatedAt)}
              </p>
            </div>
          </div>

          {}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Sentimen Umum</p>
              <div className="mt-3 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold ${sentiment?.colorClass}`}>
                  <SentimentIcon size={14} /> {sentiment?.label}
                </span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${report.sentimentScore}%` }}></div>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500">Skor positif {report.sentimentScore}/100</p>
            </div>

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

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Minat RIASEC Teratas</p>
              <div className="mt-3 flex items-center gap-2 text-[13px] font-bold text-indigo-700">
                <Compass size={16} />
                {report.topInterest || "Belum ada data RIASEC"}
              </div>
            </div>
          </div>

          {}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Ringkasan</p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-slate-700">{report.summary}</p>
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[12px] text-amber-800">
            <Info size={15} className="mt-0.5 shrink-0" />
            <p>
              {report.isAiGenerated
                ? "Laporan ini dihasilkan otomatis oleh AI (GPT) dari seluruh jawaban journaling Anda. Gunakan sebagai bahan diskusi bersama guru BK Anda."
                : "Laporan ini dihasilkan otomatis sebagai pratinjau (analisis rule-based) karena AI belum aktif. Gunakan sebagai bahan diskusi bersama guru BK Anda."}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
