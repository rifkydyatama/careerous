"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Save, CalendarClock, X, ShieldAlert } from "lucide-react";
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

  const [maintenanceActive, setMaintenanceActive] = useState(false);
  const [isMaintenanceLoading, setIsMaintenanceLoading] = useState(false);
  const [maintenanceError, setMaintenanceError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      setModules(await fetchModuleDeadlines());
      
      const mRes = await fetch("/api/admin/maintenance");
      if (mRes.ok) {
        const mData = await mRes.json();
        setMaintenanceActive(mData.maintenanceMode);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal memuat pengaturan");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleToggleMaintenance = async () => {
    setIsMaintenanceLoading(true);
    setMaintenanceError(null);
    try {
      const targetState = !maintenanceActive;
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: targetState }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Gagal mengubah mode pemeliharaan");
      }
      const data = await res.json();
      setMaintenanceActive(data.maintenanceMode);
    } catch (err) {
      setMaintenanceError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsMaintenanceLoading(false);
    }
  };

  return (
    <>
      {/* KARTU PENGATURAN MODE PEMELIHARAAN GLOBAL */}
      <div className="mb-8">
        <h2 className="text-xl font-extrabold text-slate-900">Pengaturan Sistem Global</h2>
        <p className="mt-1 text-[13px] text-slate-500">
          Kelola status operasional platform Careerous secara keseluruhan.
        </p>

        <div className={`mt-4 rounded-2xl border p-6 transition-all duration-300 ${
          maintenanceActive 
            ? "border-rose-200 bg-rose-50/50 shadow-sm shadow-rose-100" 
            : "border-slate-200 bg-white"
        }`}>
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors duration-300 ${
                maintenanceActive ? "bg-rose-100 text-rose-600" : "bg-blue-50 text-blue-600"
              }`}>
                <ShieldAlert size={22} className={maintenanceActive ? "animate-pulse" : ""} />
              </div>
              <div className="max-w-xl">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Mode Pemeliharaan (Maintenance Mode)
                </h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-500">
                  Ketika aktif, seluruh halaman publik dan dashboard bimbingan karier (siswa &amp; konselor) akan diblokir dengan tampilan countdown modern. **Hanya akun ber-role ADMIN** yang diizinkan masuk dan mengakses sistem.
                </p>
                {maintenanceError && (
                  <p className="mt-2 text-[12px] font-semibold text-rose-600">
                    ❌ {maintenanceError}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-[12px] font-extrabold uppercase tracking-wider transition-colors duration-300 ${
                maintenanceActive ? "text-rose-600" : "text-slate-400"
              }`}>
                {maintenanceActive ? "Aktif (Dibatasi)" : "Tidak Aktif"}
              </span>
              
              <button
                type="button"
                onClick={() => void handleToggleMaintenance()}
                disabled={isMaintenanceLoading}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  maintenanceActive ? "bg-rose-600" : "bg-slate-200"
                } ${isMaintenanceLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    maintenanceActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 border-t border-slate-100 pt-6">
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
