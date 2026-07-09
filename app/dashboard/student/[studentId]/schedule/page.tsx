"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Clock, User, Users, RefreshCw, X } from "lucide-react";

type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

type StudentSchedule = {
  id: string;
  type: "INDIVIDUAL" | "GROUP";
  counselorName: string | null;
  maxCapacity: number;
  startTime: string;
  endTime: string;
  bookedCount: number;
  isFull: boolean;
  myBookingStatus: BookingStatus | null;
  myBookingId: string | null;
};

function formatId(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeStyle: "short" }).format(d);
}
function formatTime(value: string): string {
  return new Intl.DateTimeFormat("id-ID", { timeStyle: "short" }).format(new Date(value));
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<StudentSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<StudentSchedule | null>(null);
  const [topic, setTopic] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/counseling/schedules", { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal memuat jadwal");
      const data = await res.json();
      setSchedules(data.schedules ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat jadwal");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const myBookings = useMemo(
    () => schedules.filter((s) => s.myBookingStatus && s.myBookingStatus !== "CANCELLED"),
    [schedules]
  );
  const available = useMemo(
    () => schedules.filter((s) => (!s.myBookingStatus || s.myBookingStatus === "CANCELLED") && !s.isFull),
    [schedules]
  );

  const handleBook = async () => {
    if (!selected || !topic.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/counseling/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId: selected.id, topic: topic.trim() }),
      });
      if (!res.ok) {
        const p = await res.json().catch(() => null);
        throw new Error(p?.error ?? "Gagal memesan slot");
      }
      setSelected(null);
      setTopic("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memesan slot");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    await fetch("/api/counseling/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: bookingId, status: "CANCELLED" }),
    });
    await load();
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-slate-900">Jadwal Konseling</h2>
        <p className="mt-1 text-[13px] text-slate-500">Pesan sesi konseling dengan konselor dan pantau statusnya.</p>
      </div>

      {error && <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-700">{error}</p>}

      {isLoading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
          <RefreshCw size={16} className="animate-spin" /> Memuat jadwal...
        </div>
      ) : (
        <div className="space-y-8">
          {/* Booking saya */}
          {myBookings.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-extrabold text-slate-900">Booking Saya</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {myBookings.map((s) => (
                  <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-white">
                          {s.type === "GROUP" ? <Users size={18} /> : <User size={18} />}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-slate-900">{formatId(s.startTime)}</p>
                          <p className="mt-0.5 text-[11.5px] text-slate-500">
                            {formatTime(s.startTime)}–{formatTime(s.endTime)} · {s.counselorName || "Konselor"}
                          </p>
                        </div>
                      </div>
                      {s.myBookingStatus && <StatusBadge status={s.myBookingStatus} />}
                    </div>
                    {(s.myBookingStatus === "PENDING" || s.myBookingStatus === "APPROVED") && s.myBookingId && (
                      <button
                        onClick={() => handleCancel(s.myBookingId!)}
                        className="mt-3 text-[11.5px] font-bold text-rose-600 hover:text-rose-800"
                      >
                        Batalkan booking
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slot tersedia */}
          <div>
            <h3 className="mb-3 text-sm font-extrabold text-slate-900">Slot Tersedia</h3>
            {available.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-[13px] text-slate-400">
                Belum ada slot konseling tersedia. Cek lagi nanti ya.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {available.map((s) => (
                  <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-transform hover:-translate-y-0.5">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded-full bg-fuchsia-50 px-2.5 py-1 text-[10px] font-bold text-fuchsia-700">
                        {s.type === "GROUP" ? "Kelompok" : "Individu"}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">{s.bookedCount}/{s.maxCapacity} terisi</span>
                    </div>
                    <p className="text-[13px] font-bold text-slate-900">{formatId(s.startTime)}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-slate-500">
                      <Clock size={12} /> {formatTime(s.startTime)}–{formatTime(s.endTime)} · {s.counselorName || "Konselor"}
                    </p>
                    <button
                      onClick={() => { setSelected(s); setTopic(""); }}
                      className="mt-4 w-full rounded-lg bg-[#2e1065] py-2.5 text-[12px] font-bold text-white transition-colors hover:bg-[#3b0764]"
                    >
                      Pesan Sesi
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal pesan */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-2 text-[#2e1065]">
                <CalendarClock size={18} />
                <h4 className="text-base font-extrabold text-slate-900">Pesan Sesi Konseling</h4>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700"><X size={18} /></button>
            </div>
            <p className="mb-4 rounded-lg bg-slate-50 px-3 py-2 text-[12px] text-slate-600">
              {formatId(selected.startTime)} · {formatTime(selected.startTime)}–{formatTime(selected.endTime)}
            </p>
            <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">Topik yang ingin dibahas</label>
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Mis. bingung memilih jurusan, ingin cerita kendala belajar..."
              className="w-full resize-none rounded-lg border border-slate-300 bg-white p-3 text-[13px] outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/20"
            />
            {error && <p className="mt-2 text-[12px] font-semibold text-rose-600">{error}</p>}
            <button
              onClick={handleBook}
              disabled={!topic.trim() || isSaving}
              className="mt-4 w-full rounded-lg bg-[#2e1065] py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#3b0764] disabled:bg-slate-300"
            >
              {isSaving ? "Memesan..." : "Kirim Permintaan"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const map: Record<BookingStatus, { label: string; cls: string }> = {
    PENDING: { label: "Menunggu", cls: "bg-amber-100 text-amber-700" },
    APPROVED: { label: "Disetujui", cls: "bg-emerald-100 text-emerald-700" },
    REJECTED: { label: "Ditolak", cls: "bg-rose-100 text-rose-700" },
    CANCELLED: { label: "Dibatalkan", cls: "bg-slate-100 text-slate-500" },
  };
  const m = map[status];
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-bold ${m.cls}`}>{m.label}</span>;
}
