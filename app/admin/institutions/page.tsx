"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Building2, Plus, Users, CheckCircle2, Crown } from "lucide-react";
import {
  fetchAdminInstitutions,
  createAdminInstitution,
  subscribeAdminInstitution,
  formatDateId,
  AdminInstitution,
} from "../utils";

export default function AdminInstitutionsPage() {
  const [institutions, setInstitutions] = useState<AdminInstitution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      setInstitutions(await fetchAdminInstitutions());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal memuat institusi");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setIsCreating(true);
    setErrorMessage(null);
    try {
      const created = await createAdminInstitution(newName.trim());
      setInstitutions((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal membuat institusi");
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggle = async (inst: AdminInstitution) => {
    setSavingId(inst.id);
    setErrorMessage(null);
    try {
      const updated = await subscribeAdminInstitution(inst.id, !inst.subscriptionActive);
      setInstitutions((prev) => prev.map((i) => (i.id === inst.id ? updated : i)));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal memperbarui langganan");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-slate-900">Kelola Institusi</h2>
        <p className="mt-1 text-[13px] text-slate-500">
          Buat institusi dan kelola langganan Premium untuk seluruh siswanya.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
          {errorMessage}
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex-1">
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Tambah Institusi
          </label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="mis. SMA Negeri 1 Malang"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[12.5px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <button
          type="button"
          onClick={() => void handleCreate()}
          disabled={isCreating || !newName.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#2e1065] px-4 py-2.5 text-[12px] font-bold text-white transition hover:bg-[#3b0764] disabled:bg-slate-300"
        >
          <Plus size={14} /> {isCreating ? "Menyimpan..." : "Tambah"}
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <RefreshCw size={18} className="animate-spin text-[#2e1065]" />
            <p className="text-sm font-bold text-slate-900">Memuat institusi</p>
          </div>
        </div>
      ) : institutions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
          <Building2 size={24} className="mx-auto text-slate-400" />
          <p className="mt-2 text-[13px] text-slate-500">Belum ada institusi. Tambahkan di atas.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {institutions.map((inst) => (
            <div key={inst.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-slate-900">{inst.name}</h4>
                    <p className="flex items-center gap-1 text-[11.5px] text-slate-500">
                      <Users size={12} /> {inst.userCount} anggota
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-bold ${
                    inst.subscriptionActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {inst.subscriptionActive ? <CheckCircle2 size={12} /> : <Crown size={12} />}
                  {inst.subscriptionActive ? "Aktif" : "Nonaktif"}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-[11.5px] text-slate-500">
                  {inst.subscriptionActive && inst.subscriptionExpiresAt
                    ? `Berlaku hingga ${formatDateId(inst.subscriptionExpiresAt)}`
                    : "Tidak berlangganan"}
                </p>
                <button
                  type="button"
                  onClick={() => void handleToggle(inst)}
                  disabled={savingId === inst.id}
                  className={`rounded-lg px-3 py-2 text-[11.5px] font-bold transition disabled:opacity-60 ${
                    inst.subscriptionActive
                      ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                      : "bg-[#2e1065] text-white hover:bg-[#3b0764]"
                  }`}
                >
                  {savingId === inst.id
                    ? "..."
                    : inst.subscriptionActive
                      ? "Nonaktifkan"
                      : "Aktifkan (6 bln)"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
