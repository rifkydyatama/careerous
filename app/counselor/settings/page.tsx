"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import {
  fetchCounselorOverview,
  fetchCurrentUser,
  CounselorStudent,
  CurrentUser,
} from "../utils";
import { AccountSettingsForm } from "../../components/AccountSettingsForm";

export default function SettingsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<CounselorStudent[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [overviewRes, userRes] = await Promise.all([
        fetchCounselorOverview(),
        fetchCurrentUser(),
      ]);
      setStudents(overviewRes.students);
      setCurrentUser(userRes);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal memuat data pengaturan"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const summary = useMemo(() => {
    const totalStudents = students.length;
    const totalPending = students.reduce(
      (acc, student) => acc + student.pendingFeedback,
      0
    );
    return { totalStudents, totalPending };
  }, [students]);

  const latestUpdatedAt = useMemo(() => {
    const timestamps = students.flatMap((student) =>
      student.journals
        .map((journal) => journal.updatedAt ? new Date(journal.updatedAt).getTime() : null)
        .filter((value): value is number => value !== null && !Number.isNaN(value))
    );

    if (timestamps.length === 0) {
      return null;
    }

    return new Date(Math.max(...timestamps));
  }, [students]);

  const lastSyncedLabel = latestUpdatedAt
    ? new Intl.DateTimeFormat("id-ID", {
        dateStyle: "full",
        timeStyle: "short",
      }).format(latestUpdatedAt)
    : "Belum ada sinkronisasi";

  const handleAddStudent = () => {
    router.push("/register?role=STUDENT");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Pengaturan Akun</h2>
          <p className="mt-1 text-[13px] text-slate-500">Kelola akses, tambah siswa, dan keluar dari sesi konselor.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <RefreshCw size={18} className="animate-spin text-[#2563eb]" />
            <div>
              <p className="text-sm font-bold text-slate-900">Memuat data pengaturan</p>
              <p className="text-[13px] text-slate-500">Menghubungkan panel konselor ke database.</p>
            </div>
          </div>
        </div>
      ) : errorMessage && students.length === 0 ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
          <p className="text-sm font-bold text-rose-900">Gagal memuat data pengaturan</p>
          <p className="mt-1 text-[13px] text-rose-700">{errorMessage}</p>
          <button
            onClick={() => void loadOverview()}
            className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-rose-700"
          >
            Coba Lagi
          </button>
        </div>
      ) : (
        <>
          {errorMessage && (
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
              {errorMessage}
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col gap-4">
              <AccountSettingsForm
                initialName={currentUser?.name || ""}
                initialEmail={currentUser?.email || ""}
                initialPhone={currentUser?.phone || ""}
                initialAvatar={currentUser?.avatar || null}
                onSuccess={() => void loadOverview()}
              />
              
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#2563eb]">Akses Sistem</p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Peran</p>
                    <p className="mt-1 text-[12px] font-semibold text-slate-900">COUNSELOR</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Siswa Aktif</p>
                    <p className="mt-1 text-[12px] font-semibold text-slate-900">{summary.totalStudents} orang</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Reviu Tertunda</p>
                    <p className="mt-1 text-[12px] font-semibold text-slate-900">{summary.totalPending} jurnal</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={handleAddStudent}
                    className="rounded-lg bg-[#2563eb] px-4 py-2.5 text-[12px] font-bold text-white transition-colors hover:bg-[#1d4ed8]"
                  >
                    Tambah Siswa Baru
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-[12px] font-bold text-red-700 transition-colors hover:bg-red-100"
                  >
                    Keluar dari Sistem
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-[#FAFBFD] p-6 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Akses Cepat</p>
              <div className="mt-4 space-y-4 text-[13px] text-slate-600">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tindakan berikutnya</p>
                  <p className="mt-2 leading-relaxed">
                    Gunakan menu Siswa untuk membuka detail jurnal, menu Jurnal untuk memfilter yang masih menunggu umpan balik, dan menu Program untuk melihat alur layanan.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Sinkron terakhir</p>
                  <p className="mt-2 leading-relaxed">
                    {lastSyncedLabel}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Saran operasi</p>
                  <p className="mt-2 leading-relaxed">
                    Klik "Tambah Siswa" untuk membuka formulir registrasi, lalu arahkan siswa baru ke dashboard setelah akun berhasil dibuat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}