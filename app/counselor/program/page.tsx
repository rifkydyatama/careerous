"use client";

import { useRouter } from "next/navigation";

const COUNSELOR_PROGRAM_STEPS = [
  {
    title: "Pemetaan progres",
    badge: "Minggu 1-4",
    detail: "Pantau siswa yang baru mulai mengisi jurnal dan identifikasi pola minat.",
  },
  {
    title: "Reviu & tindak lanjut",
    badge: "Minggu 5-8",
    detail: "Simpan feedback langsung dari jurnal yang sudah selesai diisi siswa.",
  },
  {
    title: "Laporan akhir",
    badge: "Minggu 9-12",
    detail: "Rangkum capaian, refleksi, dan tindak lanjut untuk akhir periode.",
  },
];

export default function ProgramPage() {
  const router = useRouter();

  const handleAddStudent = () => {
    router.push("/register?role=STUDENT");
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Jadwal Program Konseling</h2>
          <p className="mt-1 text-[13px] text-slate-500">Pantau tahapan program, jadwal layanan, dan alur tindak lanjut.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#0B1D3A]">Jadwal Program</p>
            <h3 className="mt-1 text-sm font-extrabold text-slate-900">Alur kerja konseling yang sedang berjalan</h3>
          </div>
          <button
            type="button"
            onClick={handleAddStudent}
            className="rounded-lg bg-[#0B1D3A] px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-[#132848]"
          >
            Tambah Siswa
          </button>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {COUNSELOR_PROGRAM_STEPS.map((step) => (
            <div key={step.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600 shadow-sm">{step.badge}</span>
              <h4 className="mt-3 text-sm font-bold text-slate-900">{step.title}</h4>
              <p className="mt-2 text-[12px] leading-relaxed text-slate-600">{step.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}