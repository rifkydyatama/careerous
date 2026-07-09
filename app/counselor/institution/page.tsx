"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  RefreshCw,
  Crown,
  CalendarClock,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  Save,
} from "lucide-react";
import {
  fetchSubscriptionRequestState,
  submitSubscriptionRequest,
  formatDateTimeId,
  SubscriptionRequest,
  SubscriptionRequestState,
} from "../utils";

export default function InstitutionPage() {
  const [state, setState] = useState<SubscriptionRequestState | null>(null);
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      setState(await fetchSubscriptionRequestState());
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

  const handleSubmit = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await submitSubscriptionRequest(note);
      setNote("");
      await load();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal mengirim pengajuan"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const institution = state?.institution ?? null;
  const requests = state?.requests ?? [];
  const active = institution?.subscriptionActive ?? false;
  const pending = requests.find((r) => r.status === "PENDING") ?? null;
  const lastRejected =
    !pending && requests[0]?.status === "REJECTED" ? requests[0] : null;

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Langganan Institusi</h2>
          <p className="mt-1 text-[13px] text-slate-500">
            Ajukan langganan Premium ke admin agar seluruh siswa sekolah mendapat akses penuh.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <RefreshCw size={18} className="animate-spin text-[#2563eb]" />
            <p className="text-sm font-bold text-slate-900">Memuat data institusi</p>
          </div>
        </div>
      ) : !institution ? (
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
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1d4ed8] via-[#2563eb] to-[#0ea5e9] p-7 shadow-md shadow-blue-500/20">
            <div className="absolute -right-16 -top-16 h-[250px] w-[250px] rounded-full bg-white/10 blur-2xl"></div>
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
              <div className="text-white">
                <div className="flex items-center gap-2">
                  <Building2 size={18} className="text-sky-100" />
                  <h3 className="text-xl font-extrabold">{institution.name}</h3>
                </div>
                <p className="mt-1 text-[13px] text-white/70">Langganan akses Premium institusi</p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold ${
                  active ? "bg-emerald-400/25 text-emerald-50" : "bg-white/15 text-white/80"
                }`}
              >
                {active ? <CheckCircle2 size={14} /> : <Crown size={14} />}
                {active ? "Berlangganan Aktif" : "Belum Berlangganan"}
              </span>
            </div>
          </div>

          {active && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <CalendarClock size={15} />
                  <p className="text-[10px] font-extrabold uppercase tracking-wider">Berlaku Hingga</p>
                </div>
                <p className="mt-2 text-[15px] font-bold text-slate-900">
                  {institution.subscriptionExpiresAt
                    ? formatDateTimeId(institution.subscriptionExpiresAt)
                    : "—"}
                </p>
                <p className="mt-0.5 text-[12px] text-slate-500">
                  Seluruh siswa institusi ini memiliki akses penuh ke 12 modul, AI Insight, dan konseling.
                </p>
              </div>
            </div>
          )}

          <SchoolDeadlinesCard />

          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
              {errorMessage}
            </div>
          )}

          {}
          {active ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 size={16} />
                <p className="text-[13px] font-bold">Langganan institusi aktif</p>
              </div>
              <p className="mt-1 text-[12px] text-emerald-700">
                Tidak perlu tindakan. Ajukan kembali menjelang masa berlaku berakhir.
              </p>
            </div>
          ) : pending ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-center gap-2 text-amber-800">
                <Clock size={16} />
                <p className="text-[13px] font-bold">Menunggu persetujuan admin</p>
              </div>
              <p className="mt-1 text-[12px] text-amber-700">
                Pengajuan Anda dikirim {formatDateTimeId(pending.createdAt)} dan sedang ditinjau admin.
              </p>
              {pending.note && (
                <p className="mt-2 rounded-lg border border-amber-200 bg-white/60 px-3 py-2 text-[12px] text-slate-600">
                  Catatan Anda: {pending.note}
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[13px] font-bold text-slate-900">Ajukan langganan Premium</p>
              <p className="mt-0.5 text-[12px] text-slate-500">
                Pengajuan akan ditinjau admin. Setelah disetujui, seluruh siswa institusi
                otomatis mendapat akses Premium.
              </p>

              {lastRejected && (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-[12px] text-rose-700">
                  <XCircle size={14} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold">Pengajuan sebelumnya ditolak.</p>
                    {lastRejected.decisionNote && (
                      <p className="mt-0.5">Catatan admin: {lastRejected.decisionNote}</p>
                    )}
                  </div>
                </div>
              )}

              <label className="mt-4 mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Catatan untuk admin (opsional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="mis. Jumlah siswa aktif, kebutuhan program semester ini, dll."
                className="w-full resize-none rounded-lg border border-slate-300 bg-white p-3 text-[13px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={isSaving}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-4 py-2.5 text-[12px] font-bold text-white transition hover:bg-[#1d4ed8] disabled:bg-slate-300"
              >
                <Send size={14} /> {isSaving ? "Mengirim..." : "Ajukan Langganan ke Admin"}
              </button>
            </div>
          )}

          {}
          {requests.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-3 text-[13px] font-bold text-slate-900">Riwayat Pengajuan</p>
              <div className="flex flex-col gap-2.5">
                {requests.map((r) => (
                  <RequestRow key={r.id} req={r} />
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </>
  );
}

function SchoolDeadlinesCard() {
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const moduleTitles = [
    "Mengeksplorasi Minat & Bakat",
    "Menemukan Gaya Belajar",
    "Merumuskan Target Karier",
    "Merancang Rencana Belajar",
    "Mengenal Dunia Kerja",
    "Analisis Peluang Industri",
    "Mengenal Pendidikan Lanjut",
    "Memetakan Pilihan Jurusan",
    "Menyusun Portofolio Diri",
    "Latihan Wawancara & CV",
    "Mengatasi Hambatan Karier",
    "Finalisasi Peta Jalan Karier"
  ];

  const loadDeadlines = async () => {
    try {
      const res = await fetch("/api/counselor/deadlines", { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal memuat batas waktu sekolah");
      const data = await res.json();
      setDeadlines(data.deadlines || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat batas waktu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDeadlines();
  }, []);

  const handleSave = async (moduleNumber: number, localVal: string) => {
    setIsSaving((prev) => ({ ...prev, [moduleNumber]: true }));
    try {
      const deadlineAt = localVal ? new Date(localVal).toISOString() : null;
      const res = await fetch("/api/counselor/deadlines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleNumber, deadlineAt }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      await loadDeadlines();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setIsSaving((prev) => ({ ...prev, [moduleNumber]: false }));
    }
  };

  const getDeadlineVal = (moduleNumber: number) => {
    const d = deadlines.find((dl) => dl.moduleNumber === moduleNumber);
    if (!d || !d.deadlineAt) return "";
    const dateObj = new Date(d.deadlineAt);
    if (isNaN(dateObj.getTime())) return "";
    const pad = (num: number) => String(num).padStart(2, "0");
    return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}T${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs text-slate-500">Memuat batas waktu modul...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-[14px] font-extrabold text-slate-900">Batas Waktu (Deadline) Modul</h3>
        <p className="text-[11.5px] text-slate-500 mt-0.5 mb-4">
          Tentukan batas waktu (tanggal & jam) penyelesaian tiap modul khusus untuk siswa di sekolah Anda. Kosongkan jika tidak ada batas waktu.
        </p>
      </div>

      {error && <p className="text-xs text-rose-600 mb-3">{error}</p>}

      <div className="space-y-3.5">
        {Array.from({ length: 12 }, (_, idx) => {
          const moduleNumber = idx + 1;
          const initialVal = getDeadlineVal(moduleNumber);
          return (
            <ModuleRow
              key={moduleNumber}
              moduleNumber={moduleNumber}
              title={moduleTitles[idx]}
              initialVal={initialVal}
              isSaving={!!isSaving[moduleNumber]}
              onSave={(val) => void handleSave(moduleNumber, val)}
            />
          );
        })}
      </div>
    </div>
  );
}

function ModuleRow({
  moduleNumber,
  title,
  initialVal,
  isSaving,
  onSave,
}: {
  moduleNumber: number;
  title: string;
  initialVal: string;
  isSaving: boolean;
  onSave: (val: string) => void;
}) {
  const [val, setVal] = useState(initialVal);

  useEffect(() => {
    setVal(initialVal);
  }, [initialVal]);

  const hasChanged = val !== initialVal;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
      <div className="min-w-0">
        <p className="text-[12px] font-extrabold text-slate-800">
          Modul {moduleNumber}
        </p>
        <p className="text-[11px] text-slate-500 truncate">{title}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <input
          type="datetime-local"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11.5px] font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
        />
        <button
          type="button"
          onClick={() => onSave(val)}
          disabled={isSaving || !hasChanged}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            hasChanged
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          {isSaving ? (
            <RefreshCw size={13} className="animate-spin" />
          ) : (
            <Save size={13} />
          )}
        </button>
      </div>
    </div>
  );
}

function RequestRow({ req }: { req: SubscriptionRequest }) {
  const badge =
    req.status === "APPROVED"
      ? { cls: "bg-emerald-100 text-emerald-700", label: "Disetujui", icon: CheckCircle2 }
      : req.status === "REJECTED"
        ? { cls: "bg-rose-100 text-rose-700", label: "Ditolak", icon: XCircle }
        : { cls: "bg-amber-100 text-amber-700", label: "Menunggu", icon: Clock };
  const Icon = badge.icon;
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3.5 py-2.5">
      <div className="min-w-0">
        <p className="text-[12px] font-bold text-slate-800">
          Diajukan {formatDateTimeId(req.createdAt)}
        </p>
        {req.note && <p className="mt-0.5 truncate text-[11.5px] text-slate-500">{req.note}</p>}
        {req.status === "REJECTED" && req.decisionNote && (
          <p className="mt-0.5 text-[11.5px] text-rose-600">Alasan: {req.decisionNote}</p>
        )}
      </div>
      <span
        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-bold ${badge.cls}`}
      >
        <Icon size={12} /> {badge.label}
      </span>
    </div>
  );
}
