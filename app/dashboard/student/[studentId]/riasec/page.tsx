"use client";

import { useEffect, useState, useMemo } from "react";
import { RefreshCw, CheckCircle2, Sparkles, AlertCircle } from "lucide-react";
import { useParams } from "next/navigation";
import {
  fetchStudentAssessment,
  submitStudentAssessment,
  AssessmentRecord,
  RIASEC_STATEMENTS,
  RIASEC_DIMENSIONS,
  RIASEC_MAX_PER_DIMENSION,
  LEARNING_STYLE_QUESTIONS,
  LEARNING_STYLE_OPTIONS,
  LearningStyleAnswerMap,
  LearningStyleChoice,
  RiasecCheckMap,
  computeRiasecScores,
  computeLearningStyle,
  buildRiasecTop3,
} from "../utils";

const LS_CHOICES: LearningStyleChoice[] = ["a", "b", "c"];

export default function RiasecPage() {
  const params = useParams<{ studentId: string }>();
  const studentId = params.studentId;
  const [assessment, setAssessment] = useState<AssessmentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [checks, setChecks] = useState<RiasecCheckMap>({});
  const [lsAnswers, setLsAnswers] = useState<LearningStyleAnswerMap>({});
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

  const riasecCheckedCount = useMemo(
    () => Object.values(checks).filter(Boolean).length,
    [checks]
  );
  const lsAnsweredCount = useMemo(
    () => LEARNING_STYLE_QUESTIONS.filter((q) => lsAnswers[q.id]).length,
    [lsAnswers]
  );
  const lsComplete = lsAnsweredCount === LEARNING_STYLE_QUESTIONS.length;

  const toggleCheck = (id: string) => {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const setLsAnswer = (id: string, choice: LearningStyleChoice) => {
    setLsAnswers((prev) => ({ ...prev, [id]: choice }));
  };

  const startTest = () => {
    setChecks({});
    setLsAnswers({});
    setIsTestStarted(true);
  };

  const handleSubmit = async () => {
    // Gaya belajar wajib lengkap; centang RIASEC boleh sebagian (tidak dicentang = tidak sesuai).
    if (!lsComplete) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const { scores } = computeRiasecScores(checks);
    const top3 = buildRiasecTop3(scores);
    const { style } = computeLearningStyle(lsAnswers);

    try {
      const saved = await submitStudentAssessment({
        studentId,
        learningStyle: style,
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
          <RefreshCw size={18} className="animate-spin text-[#2563eb]" />
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
    const learningLabel =
      LEARNING_STYLE_OPTIONS.find((o) => o.value === assessment.learningStyle)?.label ||
      "Multimodal";
    const learningDesc = LEARNING_STYLE_OPTIONS.find(
      (o) => o.value === assessment.learningStyle
    )?.description;

    return (
      <>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Hasil Tes RIASEC & Gaya Belajar</h2>
            <p className="mt-1 text-[13px] text-slate-500">Profil minat karier dan preferensi belajar Anda.</p>
          </div>
          <button
            onClick={startTest}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Ulangi Tes
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#2563eb]">Dimensi Minat</p>
                <h3 className="mt-1 text-lg font-extrabold text-slate-900">Profil Holland Anda</h3>
              </div>
              <div className="flex gap-2">
                {assessmentTop3.map((item) => (
                  <span key={item} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              {RIASEC_DIMENSIONS.map((dimension) => {
                const score = assessment[dimension.key] as number;
                const max = RIASEC_MAX_PER_DIMENSION[dimension.key] || 1;
                const pct = Math.round((score / max) * 100);
                return (
                  <div key={dimension.key}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{dimension.label}</span>
                        <span className="text-[11px] font-medium text-slate-500 hidden sm:inline-block">— {dimension.description}</span>
                      </div>
                      <span className="text-sm font-extrabold text-[#2563eb]">{score}/{max}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-[#2563eb] to-[#1d4ed8] p-6 text-white shadow-md">
              <Sparkles size={24} className="mb-3 text-[#0ea5e9]" />
              <h4 className="text-base font-extrabold">Interpretasi Singkat</h4>
              <p className="mt-2 text-[13px] leading-relaxed text-white/80">
                {assessmentTop3.length > 0
                  ? `Profil RIASEC Anda menonjolkan ketertarikan pada ${assessmentTop3.join(" dan ")}. Gunakan wawasan ini untuk memilih jurusan atau aktivitas yang sesuai.`
                  : "Belum ada dimensi minat yang menonjol — coba ulangi tes dan centang pernyataan yang paling sesuai denganmu."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Gaya Belajar</p>
              <h4 className="mt-1 text-base font-extrabold text-slate-900">{learningLabel}</h4>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{learningDesc}</p>
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
          <p className="mt-1 text-[13px] text-slate-500">Isi dengan jujur sesuai diri Anda.</p>
        </div>
        {isTestStarted && assessment && (
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
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Sparkles size={32} />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">Belum Ada Hasil Tes</h3>
          <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-slate-500">
            Tes ini membantu Anda dan konselor memahami minat karier serta gaya belajar yang paling cocok untuk Anda.
          </p>
          <button
            onClick={startTest}
            className="mt-6 rounded-xl bg-[#2563eb] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1d4ed8]"
          >
            Mulai Tes Sekarang
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            {/* Bagian 1: RIASEC — centang pernyataan yang sesuai */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-900">Bagian 1: Pernyataan tentang Diri Anda</h3>
              <p className="mt-1 mb-5 text-[12px] text-slate-500">Centang pernyataan yang sesuai dengan diri Anda. Biarkan kosong bila tidak sesuai.</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {RIASEC_STATEMENTS.map((s) => {
                  const checked = !!checks[s.id];
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleCheck(s.id)}
                      aria-pressed={checked}
                      className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors ${
                        checked
                          ? "border-blue-400 bg-blue-50"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                          checked ? "border-blue-500 bg-blue-500 text-white" : "border-slate-300 bg-white"
                        }`}
                      >
                        {checked && <CheckCircle2 size={13} />}
                      </span>
                      <span className={`text-[12.5px] font-medium ${checked ? "text-blue-900" : "text-slate-700"}`}>
                        {s.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bagian 2: Gaya belajar — pilih A/B/C */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-900">Bagian 2: Kuesioner Gaya Belajar</h3>
              <p className="mt-1 mb-5 text-[12px] text-slate-500">Pilih salah satu jawaban yang paling sesuai untuk tiap pertanyaan.</p>
              <div className="space-y-6 divide-y divide-slate-100">
                {LEARNING_STYLE_QUESTIONS.map((q, idx) => (
                  <div key={q.id} className={idx > 0 ? "pt-6" : ""}>
                    <p className="text-[13.5px] font-semibold text-slate-900">
                      {idx + 1}. {q.prompt}
                    </p>
                    <div className="mt-3 grid gap-2">
                      {LS_CHOICES.map((c) => {
                        const selected = lsAnswers[q.id] === c;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setLsAnswer(q.id, c)}
                            className={`flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-colors ${
                              selected
                                ? "border-indigo-600 bg-indigo-50"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold uppercase ${
                                selected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 text-slate-500"
                              }`}
                            >
                              {c}
                            </span>
                            <span className={`text-[12.5px] font-medium ${selected ? "text-indigo-900" : "text-slate-700"}`}>
                              {q.options[c]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Progres Pengisian</p>

              <div className="mt-4">
                <div className="flex items-center justify-between text-[12px] font-semibold text-slate-600">
                  <span>Pernyataan dicentang</span>
                  <span>{riasecCheckedCount}</span>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-[12px] font-semibold text-slate-600">
                  <span>Gaya belajar</span>
                  <span>{lsAnsweredCount} / {LEARNING_STYLE_QUESTIONS.length}</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${lsComplete ? "bg-emerald-500" : "bg-indigo-600"}`}
                    style={{ width: `${Math.round((lsAnsweredCount / LEARNING_STYLE_QUESTIONS.length) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-6">
                <button
                  onClick={handleSubmit}
                  disabled={!lsComplete || isSubmitting}
                  className="w-full rounded-xl bg-[#2563eb] py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                >
                  {isSubmitting ? "Menyimpan..." : "Kirim Hasil"}
                </button>
                {!lsComplete && (
                  <p className="mt-3 text-center text-[11px] text-slate-500">
                    Lengkapi semua pertanyaan gaya belajar untuk mengirim.
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
