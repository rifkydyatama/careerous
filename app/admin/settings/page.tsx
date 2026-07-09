"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Save, CalendarClock, X } from "lucide-react";
import {
  fetchModuleDeadlines,
  updateModuleDeadline,
  isoToLocalInput,
  localInputToIso,
  formatDateTimeId,
  ModuleDeadline,
} from "../utils";

export default function AdminSettingsPage() {
  const [modules, setModules] = useState<ModuleDeadline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      setModules(await fetchModuleDeadlines());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal memuat pengaturan");
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
        <h2 className="text-xl font-extrabold text-slate-900">Batas Waktu Modul</h2>
        <p className="mt-1 text-[13px] text-slate-500">
          Tetapkan tanggal &amp; jam batas pengerjaan untuk tiap modul. Saat batas terlewat, siswa
          Premium wajib mengisi moodboard untuk membuka modul kembali (+1 hari). Kosongkan bila modul
          tanpa batas waktu.
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
            <p className="text-sm font-bold text-slate-900">Memuat pengaturan</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {modules.map((mod) => (
            <ModuleDeadlineEditor key={mod.number} module={mod} />
          ))}
        </div>
      )}
    </>
  );
}

function ModuleDeadlineEditor({ module }: { module: ModuleDeadline }) {
  const [value, setValue] = useState(isoToLocalInput(module.deadlineAt));
  const [savedIso, setSavedIso] = useState<string | null>(module.deadlineAt);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const currentIso = localInputToIso(value);
  const dirty = (currentIso ?? null) !== (savedIso ?? null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await updateModuleDeadline(module.number, currentIso);
      setSavedIso(updated.deadlineAt);
      setValue(isoToLocalInput(updated.deadlineAt));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
            <CalendarClock size={15} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Modul {module.number} · {module.phaseLabel}
            </p>
            <p className="text-[13px] font-bold text-slate-900">{module.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="datetime-local"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setSaved(false);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-[12.5px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          {value && (
            <button
              type="button"
              title="Kosongkan batas waktu"
              onClick={() => {
                setValue("");
                setSaved(false);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving || !dirty}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-3.5 py-2 text-[11.5px] font-bold text-white transition hover:bg-[#1d4ed8] disabled:bg-slate-300"
          >
            <Save size={13} /> {isSaving ? "Menyimpan..." : saved && !dirty ? "Tersimpan" : "Simpan"}
          </button>
        </div>
      </div>

      <p className="mt-2 text-[11px] text-slate-400">
        {savedIso
          ? `Batas saat ini: ${formatDateTimeId(savedIso)}`
          : "Belum ada batas waktu untuk modul ini."}
      </p>
      {error && <p className="mt-1 text-[11px] font-semibold text-rose-600">{error}</p>}
    </div>
  );
}
