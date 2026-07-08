"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, RefreshCw, Crown, Users, CalendarClock, CheckCircle2 } from "lucide-react";
import {
  fetchCurrentUser,
  fetchInstitution,
  setInstitutionSubscription,
  formatDateTimeId,
  Institution,
} from "../utils";

export default function InstitutionPage() {
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user = await fetchCurrentUser();
      const id = user?.institutionId ?? null;
      setInstitutionId(id);
      if (id) {
        setInstitution(await fetchInstitution(id));
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal memuat data institusi"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleToggle = async (active: boolean) => {
    if (!institutionId) return;
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const updated = await setInstitutionSubscription(institutionId, active);
      setInstitution(updated);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal memperbarui langganan"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const active = institution?.subscriptionActive ?? false;

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Langganan Institusi</h2>
          <p className="mt-1 text-[13px] text-slate-500">
            Kelola langganan sekolah agar seluruh siswa mendapat akses Premium otomatis.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <RefreshCw size={18} className="animate-spin text-[#2e1065]" />
            <p className="text-sm font-bold text-slate-900">Memuat data institusi</p>
          </div>
        </div>
      ) : !institutionId || !institution ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
          <Building2 size={24} className="mx-auto text-slate-400" />
          <h4 className="mt-3 text-sm font-bold text-slate-900">Belum tertaut institusi</h4>
          <p className="mt-1 text-[13px] text-slate-500">
            Akun Anda belum terhubung dengan sekolah/institusi. Daftarkan ulang dengan mengisi
            nama institusi, atau hubungi admin untuk menautkan akun Anda.
          </p>
          {errorMessage && (
            <p className="mt-3 text-[12px] font-semibold text-rose-600">{errorMessage}</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="relative overflow-hidden rounded-2xl bg-[#2e1065] p-7 shadow-md">
            <div className="absolute -right-16 -top-16 h-[250px] w-[250px] rounded-full bg-[#a855f7]/10 blur-2xl"></div>
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
              <div className="text-white">
                <div className="flex items-center gap-2">
                  <Building2 size={18} className="text-[#e879f9]" />
                  <h3 className="text-xl font-extrabold">{institution.name}</h3>
                </div>
                <p className="mt-1 text-[13px] text-white/60">Langganan akses Premium institusi</p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold ${
                  active ? "bg-emerald-400/20 text-emerald-300" : "bg-white/10 text-white/60"
                }`}
              >
                {active ? <CheckCircle2 size={14} /> : <Crown size={14} />}
                {active ? "Berlangganan Aktif" : "Belum Berlangganan"}
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <Users size={15} />
                <p className="text-[10px] font-extrabold uppercase tracking-wider">Siswa Terdampak</p>
              </div>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{institution.studentCount}</p>
              <p className="mt-0.5 text-[12px] text-slate-500">
                siswa otomatis mendapat Premium saat langganan aktif.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <CalendarClock size={15} />
                <p className="text-[10px] font-extrabold uppercase tracking-wider">Berlaku Hingga</p>
              </div>
              <p className="mt-2 text-[15px] font-bold text-slate-900">
                {active && institution.subscriptionExpiresAt
                  ? formatDateTimeId(institution.subscriptionExpiresAt)
                  : "—"}
              </p>
              <p className="mt-0.5 text-[12px] text-slate-500">
                Langganan berlaku 1 semester (6 bulan) per aktivasi.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
              {errorMessage}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex-1">
              <p className="text-[13px] font-bold text-slate-900">
                {active ? "Langganan institusi aktif" : "Aktifkan langganan institusi"}
              </p>
              <p className="mt-0.5 text-[12px] text-slate-500">
                {active
                  ? "Seluruh siswa institusi ini memiliki akses penuh ke 12 modul, AI Insight, dan konseling."
                  : "Aktifkan untuk membuka seluruh fitur Premium bagi semua siswa institusi sekaligus."}
              </p>
            </div>
            {active ? (
              <button
                type="button"
                onClick={() => void handleToggle(false)}
                disabled={isSaving}
                className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-[12px] font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
              >
                {isSaving ? "Memproses..." : "Nonaktifkan"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleToggle(true)}
                disabled={isSaving}
                className="rounded-lg bg-[#2e1065] px-4 py-2.5 text-[12px] font-bold text-white transition hover:bg-[#3b0764] disabled:bg-slate-300"
              >
                {isSaving ? "Memproses..." : "Aktifkan Langganan (Mock)"}
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-400">
            Catatan: aktivasi ini adalah simulasi (mock) untuk demo. Integrasi pembayaran nyata
            merupakan bagian dari roadmap.
          </p>
        </div>
      )}
    </>
  );
}
