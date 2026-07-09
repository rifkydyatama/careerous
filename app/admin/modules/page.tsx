"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Save, BookOpen } from "lucide-react";
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

function ModuleEditor({ module }: { module: AdminModule }) {
  const [title, setTitle] = useState(module.title);
  const [prompt, setPrompt] = useState(module.prompt);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = title !== module.title || prompt !== module.prompt;

  const handleSave = async () => {
    if (!title.trim() || !prompt.trim()) {
      setError("Judul dan prompt wajib diisi.");
      return;
    }
    setIsSaving(true);
    setError(null);
    setSavedAt(false);
    try {
      await updateAdminModule(module.number, title.trim(), prompt.trim());
      setSavedAt(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
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

      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Judul</label>
      <input
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setSavedAt(false);
        }}
        className="mb-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[12.5px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />

      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
        Pertanyaan Reflektif (Prompt)
      </label>
      <textarea
        rows={2}
        value={prompt}
        onChange={(e) => {
          setPrompt(e.target.value);
          setSavedAt(false);
        }}
        className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-[12.5px] leading-relaxed outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />

      {error && <p className="mt-2 text-[11px] font-semibold text-rose-600">{error}</p>}
    </div>
  );
}
