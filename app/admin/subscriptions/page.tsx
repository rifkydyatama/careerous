"use client";

import { useCallback, useEffect, useState } from "react";
import {
  RefreshCw,
  Inbox,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  User as UserIcon,
} from "lucide-react";
import {
  fetchSubscriptionRequests,
  decideSubscriptionRequest,
  formatDateTimeId,
  AdminSubscriptionRequest,
} from "../utils";

export default function AdminSubscriptionsPage() {
  const [requests, setRequests] = useState<AdminSubscriptionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  // Input per-pengajuan: durasi (bulan) & catatan penolakan.
  const [months, setMonths] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      setRequests(await fetchSubscriptionRequests());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal memuat pengajuan");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDecide = async (
    req: AdminSubscriptionRequest,
    action: "APPROVE" | "REJECT"
  ) => {
    setBusyId(req.id);
    setErrorMessage(null);
    try {
      const updated = await decideSubscriptionRequest(
        req.id,
        action,
        months[req.id] ?? req.months,
        notes[req.id]
      );
      setRequests((prev) => prev.map((r) => (r.id === req.id ? updated : r)));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal memproses pengajuan");
    } finally {
      setBusyId(null);
    }
  };

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-slate-900">Pengajuan Langganan</h2>
        <p className="mt-1 text-[13px] text-slate-500">
          Tinjau pengajuan langganan Premium dari konselor (BK). Menyetujui akan mengaktifkan
          langganan institusi untuk seluruh siswanya.
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
            <p className="text-sm font-bold text-slate-900">Memuat pengajuan</p>
          </div>
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
          <Inbox size={24} className="mx-auto text-slate-400" />
          <p className="mt-2 text-[13px] text-slate-500">Belum ada pengajuan langganan.</p>
        </div>
      ) : (
        <>
          {pendingCount > 0 && (
            <p className="mb-3 text-[12px] font-semibold text-amber-700">
              {pendingCount} pengajuan menunggu tinjauan.
            </p>
          )}
          <div className="grid gap-3">
            {requests.map((req) => (
              <RequestCard
                key={req.id}
                req={req}
                busy={busyId === req.id}
                months={months[req.id] ?? req.months}
                note={notes[req.id] ?? ""}
                onMonths={(v) => setMonths((m) => ({ ...m, [req.id]: v }))}
                onNote={(v) => setNotes((n) => ({ ...n, [req.id]: v }))}
                onDecide={(action) => void handleDecide(req, action)}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}

function StatusBadge({ status }: { status: AdminSubscriptionRequest["status"] }) {
  const map =
    status === "APPROVED"
      ? { cls: "bg-emerald-100 text-emerald-700", label: "Disetujui", icon: CheckCircle2 }
      : status === "REJECTED"
        ? { cls: "bg-rose-100 text-rose-700", label: "Ditolak", icon: XCircle }
        : { cls: "bg-amber-100 text-amber-700", label: "Menunggu", icon: Clock };
  const Icon = map.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-bold ${map.cls}`}>
      <Icon size={12} /> {map.label}
    </span>
  );
}

function RequestCard({
  req,
  busy,
  months,
  note,
  onMonths,
  onNote,
  onDecide,
}: {
  req: AdminSubscriptionRequest;
  busy: boolean;
  months: number;
  note: string;
  onMonths: (v: number) => void;
  onNote: (v: string) => void;
  onDecide: (action: "APPROVE" | "REJECT") => void;
}) {
  const isPending = req.status === "PENDING";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Building2 size={18} />
          </div>
          <div>
            <h4 className="text-[14px] font-bold text-slate-900">{req.institution.name}</h4>
            <p className="flex items-center gap-1 text-[11.5px] text-slate-500">
              <UserIcon size={12} /> {req.requestedBy.name || "Konselor"}
              {req.requestedBy.email ? ` · ${req.requestedBy.email}` : ""}
            </p>
          </div>
        </div>
        <StatusBadge status={req.status} />
      </div>

      <div className="mt-3 grid gap-1 text-[12px] text-slate-500">
        <p>Diajukan {formatDateTimeId(req.createdAt)} · durasi diminta {req.months} bulan</p>
        {req.note && (
          <p className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-slate-600">
            Catatan BK: {req.note}
          </p>
        )}
        {req.status === "APPROVED" && req.institution.subscriptionExpiresAt && (
          <p className="text-emerald-700">
            Aktif hingga {formatDateTimeId(req.institution.subscriptionExpiresAt)}.
          </p>
        )}
        {req.status === "REJECTED" && req.decisionNote && (
          <p className="text-rose-600">Alasan penolakan: {req.decisionNote}</p>
        )}
      </div>

      {isPending && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                Durasi (bulan)
              </label>
              <input
                type="number"
                min={1}
                max={36}
                value={months}
                onChange={(e) => onMonths(Math.max(1, Number(e.target.value) || 1))}
                className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="min-w-[200px] flex-1">
              <label className="mb-1 block text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                Catatan (untuk penolakan, opsional)
              </label>
              <input
                value={note}
                onChange={(e) => onNote(e.target.value)}
                placeholder="mis. Data institusi belum lengkap"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => onDecide("APPROVE")}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-[12px] font-bold text-white transition hover:bg-emerald-700 disabled:bg-slate-300"
            >
              <CheckCircle2 size={14} /> {busy ? "Memproses..." : "Setujui"}
            </button>
            <button
              type="button"
              onClick={() => onDecide("REJECT")}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-[12px] font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
            >
              <XCircle size={14} /> Tolak
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
