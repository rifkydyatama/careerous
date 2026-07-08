"use client";

import { STUDENT_SCHEDULE_ITEMS } from "../utils";

export default function SchedulePage() {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Jadwal Konseling</h2>
          <p className="mt-1 text-[13px] text-slate-500">Lihat jadwal kegiatan rutin dan sesi bersama konselor.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="mb-5 text-[10px] font-bold uppercase tracking-wider text-[#2e1065]">Kegiatan Mingguan</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {STUDENT_SCHEDULE_ITEMS.map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition-transform hover:-translate-y-0.5">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600 shadow-sm">{item.day}</span>
                <span className="text-[11.5px] font-bold text-blue-600">{item.time}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
              <p className="mt-1.5 text-[12px] leading-relaxed text-slate-600">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}