"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { RefreshCw, Save, BookOpen, Trash2 } from "lucide-react";
import { fetchAdminModules, updateAdminModule, AdminModule } from "../utils";

export default function AdminModulesPage() {
  const [modules, setModules] = useState<AdminModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      setModules(await fetchAdminModules());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal memuat modul");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-slate-900">Konten Modul</h2>
        <p className="mt-1 text-[13px] text-slate-500">
          Edit judul dan pertanyaan reflektif untuk tiap modul. Perubahan langsung dipakai siswa.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <RefreshCw size={18} className="animate-spin text-[#2563eb]" />
            <p className="text-sm font-bold text-slate-900">Memuat modul</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {modules.map((mod) => (
            <ModuleEditor key={mod.number} module={mod} />
          ))}
        </div>
      )}
    </>
  );
}

function parseModulePromptClient(promptStr: string) {
  if (!promptStr) return { introduction: "", questions: [""] };
  
  if (promptStr.includes("---")) {
    const parts = promptStr.split("---").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) {
      const firstIsIntro = parts[0].toLowerCase().startsWith("pengantar:") || parts[0].toLowerCase().startsWith("[pengantar]");
      const introduction = firstIsIntro 
        ? parts[0].replace(/^(pengantar:|\[pengantar\])\s*/i, "").trim()
        : "";
      
      const questions = firstIsIntro ? parts.slice(1) : parts;
      return { introduction, questions: questions.length > 0 ? questions : [""] };
    }
  }

  // Fallback split by ||| or \n\n
  let questions: string[] = [];
  if (promptStr.includes("|||")) {
    questions = promptStr.split("|||").map((p) => p.trim()).filter(Boolean);
  } else if (promptStr.includes("\n\n")) {
    questions = promptStr.split("\n\n").map((p) => p.trim()).filter(Boolean);
  } else {
    questions = [promptStr.trim()];
  }

  return {
    introduction: "",
    questions: questions.length > 0 ? questions : [""],
  };
}

function ModuleEditor({ module }: { module: AdminModule }) {
  const [title, setTitle] = useState(module.title);
  
  const initialData = useMemo(() => parseModulePromptClient(module.prompt), [module.prompt]);
  const [introduction, setIntroduction] = useState(initialData.introduction);
  const [questions, setQuestions] = useState<string[]>(initialData.questions);
  
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state if module prop changes
  useEffect(() => {
    setTitle(module.title);
    setIntroduction(initialData.introduction);
    setQuestions(initialData.questions);
    setSavedAt(false);
  }, [module, initialData]);

  const currentSerialized = introduction.trim() 
    ? `Pengantar: ${introduction.trim()}\n---\n` + questions.map((q) => q.trim()).filter(Boolean).join("\n---\n")
    : questions.map((q) => q.trim()).filter(Boolean).join("\n---\n");
    
  const dirty = title !== module.title || currentSerialized !== module.prompt;

  const handleAddQuestion = () => {
    setQuestions((prev) => [...prev, ""]);
    setSavedAt(false);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    setSavedAt(false);
  };

  const handleQuestionChange = (index: number, value: string) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    setSavedAt(false);
  };

  const handleSave = async () => {
    const validQuestions = questions.map(q => q.trim()).filter(Boolean);
    if (!title.trim() || validQuestions.length === 0) {
      setError("Judul dan minimal satu pertanyaan wajib diisi.");
      return;
    }
    setIsSaving(true);
    setError(null);
    setSavedAt(false);
    try {
      const promptToSave = introduction.trim()
        ? `Pengantar: ${introduction.trim()}\n---\n` + validQuestions.join("\n---\n")
        : validQuestions.join("\n---\n");
        
      await updateAdminModule(module.number, title.trim(), promptToSave);
      setSavedAt(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
            <BookOpen size={15} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Modul {module.number} · {module.phaseLabel}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving || !dirty}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-3.5 py-2 text-[11.5px] font-bold text-white transition hover:bg-[#1d4ed8] disabled:bg-slate-300"
        >
          <Save size={13} /> {isSaving ? "Menyimpan..." : savedAt && !dirty ? "Tersimpan" : "Simpan"}
        </button>
      </div>

      <div className="grid gap-4">
        {/* Judul Modul */}
        <div>
          <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            Judul Modul
          </label>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSavedAt(false);
            }}
            placeholder="Judul modul..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[12.5px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-800"
          />
        </div>

        {/* Pengantar Modul */}
        <div>
          <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            Pengantar Modul (Opsional)
          </label>
          <textarea
            rows={3}
            value={introduction}
            onChange={(e) => {
              setIntroduction(e.target.value);
              setSavedAt(false);
            }}
            placeholder="Teks pengantar yang menjelaskan instruksi atau tujuan modul kepada siswa..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[12.5px] leading-relaxed outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-600"
          />
        </div>

        {/* Butir Pertanyaan */}
        <div>
          <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            Daftar Pertanyaan Reflektif
          </label>
          <div className="flex flex-col gap-2.5">
            {questions.map((q, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-bold text-slate-600 border border-slate-200">
                  {index + 1}
                </div>
                <input
                  value={q}
                  onChange={(e) => handleQuestionChange(index, e.target.value)}
                  placeholder={`Masukkan pertanyaan reflektif ke-${index + 1}...`}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-[12.5px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-700"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(index)}
                  disabled={questions.length <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 disabled:hover:bg-slate-50 disabled:hover:text-slate-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddQuestion}
            className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-extrabold text-blue-600 hover:text-blue-800 transition-colors"
          >
            + Tambah Pertanyaan
          </button>
        </div>
      </div>

      {error && <p className="mt-3 text-[11px] font-semibold text-rose-600">{error}</p>}
    </div>
  );
}
