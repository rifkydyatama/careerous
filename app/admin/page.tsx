"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Users,
  UserCog,
  Building2,
  Crown,
  BookOpenCheck,
  Sparkles,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { fetchAdminOverview, AdminStats } from "./utils";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const result = await fetchAdminOverview();
        if (mounted) setStats(result);
      } catch (error) {
        if (mounted) setErrorMessage(error instanceof Error ? error.message : "Gagal memuat statistik");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const roleData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Siswa", value: stats.students, color: "#3b82f6" },
      { name: "Konselor", value: stats.counselors, color: "#14b8a6" },
      { name: "Admin", value: stats.admins, color: "#64748b" },
    ].filter((d) => d.value > 0);
  }, [stats]);

  const planData = useMemo(() => {
    if (!stats) return [];
    const free = Math.max(0, stats.students - stats.premiumUsers);
    return [
      { name: "Premium", value: stats.premiumUsers, color: "#3b82f6" },
      { name: "Free", value: free, color: "#cbd5e1" },
    ].filter((d) => d.value > 0);
  }, [stats]);

  const institutionData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Berlangganan", jumlah: stats.subscribedInstitutions },
      { name: "Belum", jumlah: Math.max(0, stats.institutions - stats.subscribedInstitutions) },
    ];
  }, [stats]);

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-slate-900">Dasbor Sistem</h2>
        <p className="mt-1 text-[13px] text-slate-500">
          Pemantauan menyeluruh platform Careerous — pengguna, institusi, dan aktivitas.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <RefreshCw size={18} className="animate-spin text-[#2563eb]" />
            <p className="text-sm font-bold text-slate-900">Memuat statistik</p>
          </div>
        </div>
      ) : errorMessage || !stats ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
          <p className="text-sm font-bold text-rose-900">Gagal memuat statistik</p>
          <p className="mt-1 text-[13px] text-rose-700">{errorMessage || "Pastikan Anda masuk sebagai administrator."}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Users} label="Total Siswa" value={stats.students} color="from-blue-600 to-blue-400" />
            <StatCard icon={UserCog} label="Total Konselor" value={stats.counselors} color="from-teal-600 to-teal-400" />
            <StatCard icon={Building2} label="Institusi" value={stats.institutions} color="from-indigo-600 to-indigo-400" sub={`${stats.subscribedInstitutions} berlangganan`} />
            <StatCard icon={Crown} label="Siswa Premium" value={stats.premiumUsers} color="from-amber-600 to-amber-400" />
            <StatCard icon={BookOpenCheck} label="Modul Selesai" value={stats.completedModules} color="from-emerald-600 to-emerald-400" />
            <StatCard icon={Sparkles} label="Laporan AI" value={stats.reports} color="from-blue-600 to-blue-400" />
            <StatCard icon={ShieldCheck} label="Administrator" value={stats.admins} color="from-slate-700 to-slate-500" />
          </div>

          {}
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <ChartCard title="Distribusi Peran">
              <DonutChart data={roleData} />
            </ChartCard>
            <ChartCard title="Paket Siswa">
              <DonutChart data={planData} />
            </ChartCard>
            <ChartCard title="Langganan Institusi">
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={institutionData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: "rgba(99,102,241,0.06)" }} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                    <Bar dataKey="jumlah" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={56} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <QuickLink href="/admin/users" icon={<Users size={18} />} title="Kelola Pengguna" desc="Atur peran, paket, dan institusi pengguna." />
            <QuickLink href="/admin/institutions" icon={<Building2 size={18} />} title="Kelola Institusi" desc="Buat institusi & atur langganan sekolah." />
            <QuickLink href="/admin/modules" icon={<BookOpenCheck size={18} />} title="Konten Modul" desc="Edit judul & pertanyaan 12 modul." />
          </div>
        </>
      )}
    </>
  );
}

function StatCard({ icon: Icon, label, value, color, sub }: any) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r ${color}`}></div>
      <div className="flex items-center gap-2 text-slate-400">
        <Icon size={15} />
        <p className="text-[10px] font-bold uppercase tracking-wider">{label}</p>
      </div>
      <p className="mt-2 text-[30px] font-extrabold leading-none text-slate-900">{value}</p>
      {sub && <p className="mt-1.5 text-[11.5px] text-slate-500">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-2 text-[14px] font-extrabold text-slate-900">{title}</h3>
      {children}
    </div>
  );
}

function DonutChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-[12px] text-slate-400">
        Belum ada data.
      </div>
    );
  }
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={46} outerRadius={74} paddingAngle={3}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function QuickLink({ href, icon, title, desc }: { href: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#2563eb]/30 hover:shadow-md"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2563eb]/5 text-[#2563eb]">{icon}</div>
      <div className="flex-1">
        <h4 className="text-[14px] font-extrabold text-slate-900">{title}</h4>
        <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500">{desc}</p>
        <span className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-bold text-[#2563eb]">
          Buka <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
