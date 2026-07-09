"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  CalendarPlus,
  Users,
  User,
  Trash2,
  Check,
  X,
  Clock,
  RefreshCw,
  Video,
  Phone,
  MapPin,
  MessageSquare,
} from "lucide-react";

type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

type Booking = {
  id: string;
  studentId: string;
  studentName: string | null;
  topic: string;
  status: BookingStatus;
  notes: string | null;
  approvalMessage: string | null;
  createdAt: string;
};

type Schedule = {
  id: string;
  type: "INDIVIDUAL" | "GROUP";
  maxCapacity: number;
  startTime: string;
  endTime: string;
  meetLink: string | null;
  location: string | null;
  phone: string | null;
  status: string;
  bookedCount: number;
  bookings: Booking[];
};

function formatId(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeStyle: "short" }).format(d);
}
function formatTime(value: string): string {
  const d = new Date(value);
  return new Intl.DateTimeFormat("id-ID", { timeStyle: "short" }).format(d);
}

export default function ProgramPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState<"INDIVIDUAL" | "GROUP">("INDIVIDUAL");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [capacity, setCapacity] = useState(1);

  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  
  const [approveTarget, setApproveTarget] = useState<Booking | null>(null);
  const [approvalMessage, setApprovalMessage] = useState("");
  const [isApproving, setIsApproving] = useState(false);

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

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!date || !start || !end) {
      setError("Tanggal, jam mulai, dan jam selesai wajib diisi.");
      return;
    }
    const startTime = new Date(`${date}T${start}`);
    const endTime = new Date(`${date}T${end}`);
    if (endTime <= startTime) {
      setError("Jam selesai harus setelah jam mulai.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/counseling/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          maxCapacity: type === "GROUP" ? capacity : 1,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          location: location.trim() || null,
          phone: phone.trim() || null,
        }),
      });
      if (!res.ok) {
        const p = await res.json().catch(() => null);
        throw new Error(p?.error ?? "Gagal membuat slot");
      }
      setDate("");
      setStart("");
      setEnd("");
      setLocation("");
      setPhone("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal membuat slot");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/counseling/schedules?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await load();
  };

  const handleReject = async (id: string) => {
    await fetch("/api/counseling/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "REJECTED" }),
    });
    await load();
  };

  const handleApproveConfirm = async () => {
    if (!approveTarget) return;
    setIsApproving(true);
    await fetch("/api/counseling/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: approveTarget.id,
        status: "APPROVED",
        approvalMessage: approvalMessage.trim() || null,
      }),
    });
    setApproveTarget(null);
    setApprovalMessage("");
    setIsApproving(false);
    await load();
  };

  const upcoming = useMemo(
    () => schedules.filter((s) => new Date(s.startTime) >= new Date()),
    [schedules]
  );
  const past = useMemo(
    () => schedules.filter((s) => new Date(s.startTime) < new Date()),
    [schedules]
  );

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-slate-900">Jadwal Konseling</h2>
        <p className="mt-1 text-[13px] text-slate-500">Buat slot konseling dan kelola permintaan siswa.</p>
      </div>

      {}
      <form onSubmit={handleCreate} className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#2563eb]">
          <CalendarPlus size={14} /> Buat Slot Baru
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-600">Jenis</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "INDIVIDUAL" | "GROUP")}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-blue-400"
            >
              <option value="INDIVIDUAL">Individu</option>
              <option value="GROUP">Kelompok</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-600">Tanggal</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-600">Jam mulai</label>
            <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-600">Jam selesai</label>
            <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-600">Kuota</label>
            <input
              type="number"
              min={1}
              max={50}
              value={type === "GROUP" ? capacity : 1}
              disabled={type === "INDIVIDUAL"}
              onChange={(e) => setCapacity(Math.max(1, Number(e.target.value)))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-blue-400 disabled:bg-slate-100 disabled:text-slate-400"
            />
          </div>
        </div>

        {}
        <div className="mt-4 rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-blue-700">
            Info Komunikasi (opsional — akan dikirim ke siswa saat disetujui)
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                <Video size={12} className="text-blue-600" /> Link Video Call
              </label>
              <div className="flex h-[38px] w-full items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-[13px] text-slate-500">
                Dibuat otomatis oleh sistem
              </div>
            </div>
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                <Phone size={12} className="text-emerald-600" /> Telepon / WhatsApp
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08123456789"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                <MapPin size={12} className="text-blue-600" /> Lokasi Tatap Muka
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ruang BK Lt.2"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-blue-400"
              />
            </div>
          </div>
        </div>

        {error && <p className="mt-3 text-[12px] font-semibold text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={isSaving}
          className="mt-4 rounded-lg bg-[#2563eb] px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#1d4ed8] disabled:bg-slate-300"
        >
          {isSaving ? "Menyimpan..." : "Tambah Slot"}
        </button>
      </form>

      {isLoading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
          <RefreshCw size={16} className="animate-spin" /> Memuat jadwal...
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900">Slot Mendatang ({upcoming.length})</h3>
          {upcoming.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-[13px] text-slate-400">
              Belum ada slot mendatang. Buat slot baru di atas.
            </p>
          )}
          {upcoming.map((s) => (
            <ScheduleCard
              key={s.id}
              schedule={s}
              onDelete={handleDelete}
              onReject={handleReject}
              onApproveStart={(b) => { setApproveTarget(b); setApprovalMessage(""); }}
            />
          ))}

          {past.length > 0 && (
            <>
              <h3 className="mt-8 text-sm font-extrabold text-slate-500">Slot Lampau ({past.length})</h3>
              {past.map((s) => (
                <ScheduleCard
                  key={s.id}
                  schedule={s}
                  onDelete={handleDelete}
                  onReject={handleReject}
                  onApproveStart={(b) => { setApproveTarget(b); setApprovalMessage(""); }}
                  isPast
                />
              ))}
            </>
          )}
        </div>
      )}

      {}
      {approveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setApproveTarget(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-2 text-emerald-700">
                <Check size={18} />
                <h4 className="text-base font-extrabold text-slate-900">Setujui Booking</h4>
              </div>
              <button onClick={() => setApproveTarget(null)} className="text-slate-400 hover:text-slate-700"><X size={18} /></button>
            </div>

            <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-[12px] text-emerald-800">
              <p className="font-bold">{approveTarget.studentName || "Siswa"}</p>
              <p className="mt-0.5 text-emerald-600">Topik: {approveTarget.topic}</p>
            </div>

            <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-slate-700">
              <MessageSquare size={13} /> Pesan untuk siswa (opsional)
            </label>
            <textarea
              rows={3}
              value={approvalMessage}
              onChange={(e) => setApprovalMessage(e.target.value)}
              placeholder="Mis. Silakan gabung via link Meet yang sudah dikirim, siapkan buku catatan..."
              className="w-full resize-none rounded-lg border border-slate-300 bg-white p-3 text-[13px] outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
            />

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleApproveConfirm}
                disabled={isApproving}
                className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-emerald-700 disabled:bg-slate-300"
              >
                {isApproving ? "Menyetujui..." : "Setujui Booking"}
              </button>
              <button
                onClick={() => setApproveTarget(null)}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ScheduleCard({
  schedule,
  onDelete,
  onReject,
  onApproveStart,
  isPast,
}: {
  schedule: Schedule;
  onDelete: (id: string) => void;
  onReject: (id: string) => void;
  onApproveStart: (b: Booking) => void;
  isPast?: boolean;
}) {
  const Icon = schedule.type === "GROUP" ? Users : User;
  const hasComm = Boolean(schedule.meetLink || schedule.phone || schedule.location);

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${isPast ? "opacity-70" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <Icon size={18} />
          </div>
          <div>
            <p className="text-[13.5px] font-bold text-slate-900">{formatId(schedule.startTime)}</p>
            <p className="mt-0.5 flex items-center gap-2 text-[12px] text-slate-500">
              <Clock size={12} /> {formatTime(schedule.startTime)}–{formatTime(schedule.endTime)} ·{" "}
              {schedule.type === "GROUP" ? "Kelompok" : "Individu"} · {schedule.bookedCount}/{schedule.maxCapacity} terisi
            </p>
          </div>
        </div>
        {!isPast && (
          <button
            onClick={() => onDelete(schedule.id)}
            className="flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-[11px] font-bold text-rose-600 transition hover:bg-rose-50"
          >
            <Trash2 size={12} /> Hapus
          </button>
        )}
      </div>

      {}
      {hasComm && (
        <div className="mt-3 flex flex-wrap gap-2">
          {schedule.meetLink && (
            <a
              href={schedule.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors px-2.5 py-1 text-[10.5px] font-bold text-blue-700"
            >
              <Video size={11} /> Buka Ruang Video
            </a>
          )}
          {schedule.phone && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10.5px] font-bold text-emerald-700">
              <Phone size={11} /> {schedule.phone}
            </span>
          )}
          {schedule.location && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10.5px] font-bold text-blue-700">
              <MapPin size={11} /> {schedule.location}
            </span>
          )}
        </div>
      )}

      {schedule.bookings.filter((b) => b.status !== "CANCELLED").length > 0 && (
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
          {schedule.bookings
            .filter((b) => b.status !== "CANCELLED")
            .map((b) => (
              <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
                <div className="min-w-0">
                  <p className="text-[12.5px] font-bold text-slate-900">{b.studentName || "Siswa"}</p>
                  <p className="truncate text-[11.5px] text-slate-500">Topik: {b.topic}</p>
                </div>
                <div className="flex items-center gap-2">
                  <BookingBadge status={b.status} />
                  {b.status === "PENDING" && !isPast && (
                    <>
                      <button
                        onClick={() => onApproveStart(b)}
                        className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-emerald-700"
                      >
                        <Check size={12} /> Setujui
                      </button>
                      <button
                        onClick={() => onReject(b.id)}
                        className="flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 transition hover:bg-slate-100"
                      >
                        <X size={12} /> Tolak
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function BookingBadge({ status }: { status: BookingStatus }) {
  const map: Record<BookingStatus, { label: string; cls: string }> = {
    PENDING: { label: "Menunggu", cls: "bg-amber-100 text-amber-700" },
    APPROVED: { label: "Disetujui", cls: "bg-emerald-100 text-emerald-700" },
    REJECTED: { label: "Ditolak", cls: "bg-rose-100 text-rose-700" },
    CANCELLED: { label: "Dibatalkan", cls: "bg-slate-100 text-slate-500" },
  };
  const m = map[status];
  return <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold ${m.cls}`}>{m.label}</span>;
}
