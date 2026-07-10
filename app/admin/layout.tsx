"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Users, Building2, BookOpen, Clock, LogOut, Inbox, Menu, X } from "lucide-react";
import { UNIVERSITY } from "@/lib/identity";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [me, setMe] = useState<{ name: string | null; avatar?: string | null } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d?.user) setMe(d.user); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f0f5ff] font-sans text-slate-900">
      {/* Backdrop overlay for mobile screen when sidebar is open */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300 lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-slate-200 bg-white shadow-sm transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <Image src={UNIVERSITY.logo} alt={UNIVERSITY.name} width={40} height={40} className="h-10 w-10 rounded-full border border-slate-200 object-cover bg-white shrink-0" />
            <div>
              <h1 className="text-sm font-extrabold leading-tight text-slate-900">{UNIVERSITY.app} Admin</h1>
              <p className="mt-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-slate-400 truncate max-w-[130px]" title={UNIVERSITY.name}>
                {UNIVERSITY.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden transition"
            aria-label="Tutup menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <MenuSection title="Manajemen" />
          <NavItem href="/admin" icon={<LayoutDashboard size={17} />} label="Dasbor Sistem" active={pathname === "/admin"} />
          <NavItem href="/admin/users" icon={<Users size={17} />} label="Kelola Pengguna" active={pathname === "/admin/users"} />
          <NavItem href="/admin/institutions" icon={<Building2 size={17} />} label="Kelola Institusi" active={pathname === "/admin/institutions"} />
          <NavItem href="/admin/subscriptions" icon={<Inbox size={17} />} label="Pengajuan Langganan" active={pathname === "/admin/subscriptions"} />
          <NavItem href="/admin/modules" icon={<BookOpen size={17} />} label="Konten Modul" active={pathname === "/admin/modules"} />
          <NavItem href="/admin/settings" icon={<Clock size={17} />} label="Batas Waktu Modul" active={pathname === "/admin/settings"} />
        </div>

        <div className="border-t border-slate-200 p-3">
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12.5px] font-semibold text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut size={16} /> Keluar dari Sistem
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ml-0 lg:ml-[260px] flex flex-1 flex-col min-w-0 transition-all duration-300">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 lg:px-7 backdrop-blur-md">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 lg:hidden transition"
              aria-label="Buka menu"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-1.5 text-[13px] text-slate-400">
              <span>{UNIVERSITY.app}</span>
              <span className="hidden sm:inline">›</span>
              <b className="hidden sm:inline font-bold text-slate-900">Panel Admin</b>
            </div>
          </div>
          <div className="flex items-center gap-2.5 lg:gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[11.5px] font-bold text-slate-900">{me?.name || "Administrator"}</p>
              <p className="text-[9.5px] font-semibold uppercase tracking-wider text-slate-400">
                {UNIVERSITY.unit}
              </p>
            </div>
            <div className="flex h-9 w-9 overflow-hidden items-center justify-center rounded-lg bg-[#2563eb] text-xs font-extrabold text-white">
              {me?.avatar ? (
                <Image src={me.avatar} alt="Avatar" width={36} height={36} className="h-full w-full object-cover" />
              ) : (
                (me?.name?.[0] || "A").toUpperCase()
              )}
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-7">{children}</main>

        <footer className="mt-auto border-t border-slate-200 bg-white px-4 lg:px-7 py-4 text-[11px] text-slate-400 leading-normal">
          {UNIVERSITY.copyright} · {UNIVERSITY.unit} · {UNIVERSITY.app}
        </footer>
      </div>
    </div>
  );
}

const MenuSection = ({ title }: { title: string }) => (
  <div className="px-5 pb-1 pt-4 text-[9px] font-bold uppercase tracking-[1.2px] text-slate-400">{title}</div>
);

const NavItem = ({ href, icon, label, active }: any) => (
  <Link
    href={href}
    className={`mx-2 my-0.5 flex items-center gap-2.5 rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-medium transition-colors ${
      active
        ? "border-blue-200 bg-blue-50 font-bold text-blue-700"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`}
  >
    <span className={active ? "text-blue-600" : "text-slate-400"}>{icon}</span>
    {label}
  </Link>
);
