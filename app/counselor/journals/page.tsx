"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import {
  fetchCounselorOverview,
  CounselorStudent,
} from "../utils";

export default function JournalsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<CounselorStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetchCounselorOverview();
      setStudents(response.students);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal memuat data siswa"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const pendingStudents = useMemo(
    () => students.filter((student) => student.pendingFeedback > 0),
    [students]
  );

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Jurnal yang Menunggu Reviu</h2>
          <p className="mt-1 text-[13px] text-slate-500">Fokus pada siswa yang masih memiliki jurnal selesai tanpa umpan balik.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <RefreshCw size={18} className="animate-spin text-[#0B1D3A]" />
            <div>
              <p className="text-sm font-bold text-slate-900">Memuat data jurnal</p>
              <p className="text-[13px] text-slate-500">Menghubungkan panel konselor ke database.</p>
            </div>
          </div>
        </div>
      ) : errorMessage && students.length === 0 ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
          <p className="text-sm font-bold text-rose-900">Gagal memuat data jurnal</p>
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

          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#0B1D3A]">Jurnal Reviu Tertunda</p>
                <h4 className="mt-1 text-sm font-extrabold text-slate-900">{pendingStudents.length} siswa menunggu tindak lanjut</h4>
              </div>
              <button
                type="button"
                onClick={() => router.push("/counselor/students")}
                className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Buka Daftar Siswa
              </button>
            </div>

            {pendingStudents.length === 0 ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-800">
                Semua jurnal yang sudah dikirim telah mendapatkan umpan balik.
              </div>
            ) : (
              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                {pendingStudents.map((student) => (
                  <div key={student.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{student.name}</p>
                    <p className="mt-2 text-sm font-bold text-slate-900">{student.pendingFeedback} jurnal menunggu reviu</p>
                    <p className="mt-1 text-[12px] text-slate-500">Buka detail di panel siswa untuk memberi catatan tindak lanjut.</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}