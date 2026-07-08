"use client";

import { useEffect, useState, useMemo } from "react";
import { RefreshCw, CheckCircle2, ChevronRight, Sparkles, AlertCircle } from "lucide-react";
import { useParams } from "next/navigation";
import {
  fetchStudentAssessment,
  submitStudentAssessment,
  AssessmentRecord,
  RIASEC_QUESTIONS,
  RIASEC_RESPONSE_OPTIONS,
  RIASEC_DIMENSIONS,
  LEARNING_STYLE_OPTIONS,
  LearningStyle,
  RiasecResponseMap,
  calculateRiasecScoresFromResponses,
  buildRiasecTop3,
} from "../utils";

export default function RiasecPage() {
  const params = useParams<{ studentId: string }>();
  const studentId = params.studentId;
  const [assessment, setAssessment] = useState<AssessmentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [responses, setResponses] = useState<RiasecResponseMap>({});
  const [learningStyle, setLearningStyle] = useState<LearningStyle>("MULTIMODAL");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await fetchStudentAssessment(studentId);
        if (mounted) setAssessment(data);
      } catch (error) {
        if (mounted) {
          setErrorMessage(
            error instanceof Error ? error.message : "Gagal memuat hasil tes"
          );
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    void load();
    return () => { mounted = false; };
  }, [studentId]);

  const testProgress = useMemo(() => {
    const { answeredCount, totalQuestions } = calculateRiasecScoresFromResponses(responses);
    const pct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
    const isComplete = answeredCount === totalQuestions;
    return { answeredCount, totalQuestions, pct, isComplete };
  }, [responses]);

  const handleResponseChange = (questionId: string, value: number) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!testProgress.isComplete) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const { scores } = calculateRiasecScoresFromResponses(responses);
    const top3 = buildRiasecTop3(scores);

    try {
      const saved = await submitStudentAssessment({
        studentId,
        learningStyle,
        riasecRealistic: scores.riasecRealistic,
        riasecInvestigative: scores.riasecInvestigative,
        riasecArtistic: scores.riasecArtistic,
        riasecSocial: scores.riasecSocial,
        riasecEnterprising: scores.riasecEnterprising,
        riasecConventional: scores.riasecConventional,
        riasecTop3: top3,
      });
      setAssessment(saved);
      setIsTestStarted(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal menyimpan hasil tes"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <RefreshCw size={18} className="animate-spin text-[#2e1065]" />
          <div>
            <p className="text-sm font-bold text-slate-900">Memuat data asesmen</p>
            <p className="text-[13px] text-slate-500">Menyinkronkan hasil tes Anda.</p>
          </div>
        </div>
      </div>
    );
  }

  // --- RESULT VIEW ---
  if (assessment && !isTestStarted) {
    const assessmentTop3 = assessment.riasecTop3
      ? assessment.riasecTop3.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

    return (
      <>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Hasil Tes RIASEC & Gaya Belajar</h2>
            <p className="mt-1 text-[13px] text-slate-500">Profil minat karier dan preferensi belajar Anda.</p>
          </div>
          <button
            onClick={() => {
              setIsTestStarted(true);
              setResponses({});
            }}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Ulangi Tes
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#2e1065]">Dimensi Minat</p>
                <h3 className="mt-1 text-lg font-extrabold text-slate-900">Profil Holland Anda</h3>
              </div>
              <div className="flex gap-2">
                {assessmentTop3.map((item) => (
                  <span key={item} className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-700 border border-indigo-200">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              {RIASEC_DIMENSIONS.map((dimension) => {
                const score = assessment[dimension.key] as number;
                return (
                  <div key={dimension.key}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{dimension.label}</span>
                        <span className="text-[11px] font-medium text-slate-500 hidden sm:inline-block">— {dimension.description}</span>
                      </div>
                      <span className="text-sm font-extrabold text-[#2e1065]">{score}/10</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000"
                        style={{ width: `${score * 10}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-[#2e1065] to-[#1e3a6e] p-6 text-white shadow-md">
              <Sparkles size={24} className="mb-3 text-[#e879f9]" />
              <h4 className="text-base font-extrabold">Interpretasi Singkat</h4>
              <p className="mt-2 text-[13px] leading-relaxed text-white/80">
                Profil RIASEC Anda menunjukkan kombinasi ketertarikan pada {assessmentTop3.join(" dan ")}. Gunakan wawasan ini untuk memilih jurusan atau aktivitas ekstrakurikuler yang sesuai.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Gaya Belajar</p>
              <h4 className="mt-1 text-base font-extrabold text-slate-900">
                {LEARNING_STYLE_OPTIONS.find(o => o.value === assessment.learningStyle)?.label || "Multimodal"}
              </h4>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
                {LEARNING_STYLE_OPTIONS.find(o => o.value === assessment.learningStyle)?.description}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // --- TEST VIEW ---
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Tes RIASEC dan Tes Gaya Belajar</h2>
          <p className="mt-1 text-[13px] text-slate-500">Jawab pertanyaan berikut dengan jujur sesuai preferensi Anda.</p>
        </div>
        {!isTestStarted && assessment && (
          <button
            onClick={() => setIsTestStarted(false)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Batal
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-[13px] text-rose-800">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      {!isTestStarted ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Sparkles size={32} />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">Belum Ada Hasil Tes</h3>
          <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-slate-500">
            Tes ini akan membantu Anda dan konselor memahami minat, bakat, serta lingkungan kerja yang paling cocok untuk Anda.
          </p>
          <button
            onClick={() => setIsTestStarted(true)}
            className="mt-6 rounded-xl bg-[#2e1065] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#3b0764]"
          >
            Mulai Tes Sekarang
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <h3 className="mb-5 text-sm font-extrabold text-slate-900">Bagian 1: Preferensi Aktivitas</h3>
              <div className="space-y-6 divide-y divide-slate-100">
                {RIASEC_QUESTIONS.map((q, idx) => (
                  <div key={q.id} className={idx > 0 ? "pt-6" : ""}>
                    <p className="text-[13.5px] font-semibold text-slate-900">
                      {idx + 1}. {q.prompt}
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {RIASEC_RESPONSE_OPTIONS.map((opt) => {
                        const isSelected = responses[q.id] === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => handleResponseChange(q.id, opt.value)}
                            className={`rounded-lg border px-3 py-2.5 text-center text-[11.5px] font-semibold transition-colors ${
                              isSelected
                                ? "border-blue-600 bg-blue-50 text-blue-700"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <h3 className="mb-5 text-sm font-extrabold text-slate-900">Bagian 2: Gaya Belajar</h3>
              <div className="space-y-3">
                {LEARNING_STYLE_OPTIONS.map((style) => {
                  const isSelected = learningStyle === style.value;
                  return (
                    <button
                      key={style.value}
                      onClick={() => setLearningStyle(style.value)}
                      className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-colors ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        isSelected ? "border-indigo-600" : "border-slate-300"
                      }`}>
                        {isSelected && <div className="h-2 w-2 rounded-full bg-indigo-600"></div>}
                      </div>
                      <div>
                        <h4 className={`text-[13.5px] font-bold ${isSelected ? "text-indigo-900" : "text-slate-900"}`}>
                          {style.label}
                        </h4>
                        <p className={`mt-1 text-[12px] leading-relaxed ${isSelected ? "text-indigo-700/80" : "text-slate-500"}`}>
                          {style.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Progres Pengisian</p>
              <div className="mt-3 flex items-end justify-between">
                <span className="text-2xl font-extrabold text-slate-900">{testProgress.answeredCount}</span>
                <span className="mb-1 text-sm font-semibold text-slate-400">/ {testProgress.totalQuestions} Soal</span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    testProgress.isComplete ? "bg-emerald-500" : "bg-blue-600"
                  }`}
                  style={{ width: `${testProgress.pct}%` }}
                ></div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-6">
                <button
                  onClick={handleSubmit}
                  disabled={!testProgress.isComplete || isSubmitting}
                  className="w-full rounded-xl bg-[#2e1065] py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#3b0764] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                >
                  {isSubmitting ? "Menyimpan..." : "Kirim Hasil"}
                </button>
                {!testProgress.isComplete && (
                  <p className="mt-3 text-center text-[11px] text-slate-500">
                    Jawab semua pertanyaan untuk mengirim hasil.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}