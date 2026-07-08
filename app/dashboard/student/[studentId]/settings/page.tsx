"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { fetchStudentDashboard, StudentDashboardResponse } from "../utils";

export default function SettingsPage() {
  const params = useParams<{ studentId: string }>();
  const studentId = params.studentId;
  const router = useRouter();
  const [data, setData] = useState<StudentDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await fetchStudentDashboard(studentId);
        if (mounted) setData(response);
      } catch (error) {
        if (mounted) {
          setErrorMessage(
            error instanceof Error ? error.message : "Gagal memuat data pengaturan"
          );
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    void load();
    return () => { mounted = false; };
  }, [studentId]);

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
          <p className="mt-1 text-[13px] text-slate-500">Informasi profil dan akses sistem Anda.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <RefreshCw size={18} className="animate-spin text-[#2e1065]" />
            <div>
              <p className="text-sm font-bold text-slate-900">Memuat profil</p>
              <p className="text-[13px] text-slate-500">Menyinkronkan data Anda.</p>
            </div>
          </div>
        </div>
      ) : errorMessage || !data ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
          <p className="text-sm font-bold text-rose-900">Gagal memuat profil</p>
          <p className="mt-1 text-[13px] text-rose-700">{errorMessage || "Data tidak ditemukan."}</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#2e1065]">Profil Anda</p>
            <h3 className="mt-1 text-sm font-extrabold text-slate-900">{data.student?.name || "Siswa Tidak Dikenal"}</h3>
            <p className="mt-1 text-[13px] text-slate-500">{data.student?.email || "Email tidak tersedia"}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">ID Akses</p>
                <p className="mt-1 text-[12px] font-semibold text-slate-900">{studentId.slice(0, 8)}...</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Peran</p>
                <p className="mt-1 text-[12px] font-semibold text-slate-900">STUDENT</p>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-[12px] font-bold text-red-700 transition-colors hover:bg-red-100"
              >
                Keluar dari Sistem
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-[#FAFBFD] p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Bantuan & Informasi</p>
            <div className="mt-4 space-y-4 text-[13px] text-slate-600">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Kontak Konselor</p>
                <p className="mt-2 leading-relaxed">
                  Jika Anda mengalami kendala atau membutuhkan sesi khusus, hubungi konselor melalui menu Jadwal Konseling.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Sinkronisasi Data</p>
                <p className="mt-2 leading-relaxed">
                  Data jurnal dan hasil tes akan otomatis disinkronkan ke panel konselor setiap kali Anda menyimpannya.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}