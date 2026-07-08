"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Building2, BookOpen, Clock, LogOut } from "lucide-react";
import { UNIVERSITY } from "@/lib/identity";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F6FA] font-sans text-slate-900">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col bg-[#0B1D3A] shadow-2xl">
        <div className="flex items-center gap-3 border-b border-white/10 p-5">
          <Image src={UNIVERSITY.logo} alt={UNIVERSITY.name} width={40} height={40} className="h-10 w-10" />
          <div>
            <h1 className="text-sm font-extrabold leading-tight text-white">{UNIVERSITY.app} Admin</h1>
            <p className="mt-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-white/40">
              {UNIVERSITY.name}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <MenuSection title="Manajemen" />
          <NavItem href="/admin" icon={<LayoutDashboard size={17} />} label="Dasbor Sistem" active={pathname === "/admin"} />
          <NavItem href="/admin/users" icon={<Users size={17} />} label="Kelola Pengguna" active={pathname === "/admin/users"} />
          <NavItem href="/admin/institutions" icon={<Building2 size={17} />} label="Kelola Institusi" active={pathname === "/admin/institutions"} />
          <NavItem href="/admin/modules" icon={<BookOpen size={17} />} label="Konten Modul" active={pathname === "/admin/modules"} />
          <NavItem href="/admin/settings" icon={<Clock size={17} />} label="Batas Waktu Modul" active={pathname === "/admin/settings"} />
        </div>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12.5px] font-semibold text-white/45 transition-colors hover:bg-red-500/15 hover:text-red-400"
          >
            <LogOut size={16} /> Keluar dari Sistem
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="ml-[260px] flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-7">
          <div className="flex items-center gap-2 text-[13px] text-slate-400">
            <span>{UNIVERSITY.app}</span> <span>›</span>{" "}
            <b className="font-bold text-slate-900">Panel Administrator</b>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="text-right">
              <p className="text-[11.5px] font-bold text-slate-900">Administrator</p>
              <p className="text-[9.5px] font-semibold uppercase tracking-wider text-slate-400">
                {UNIVERSITY.unit}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B1D3A] text-xs font-extrabold text-white">
              A
            </div>
          </div>
        </header>

        <main className="p-7">{children}</main>

        <footer className="mt-auto border-t border-slate-200 bg-white px-7 py-4 text-[11px] text-slate-400">
          {UNIVERSITY.copyright} · {UNIVERSITY.unit} · {UNIVERSITY.app}
        </footer>
      </div>
    </div>
  );
}

const MenuSection = ({ title }: { title: string }) => (
  <div className="px-5 pb-1 pt-4 text-[9px] font-bold uppercase tracking-[1.2px] text-white/30">{title}</div>
);

const NavItem = ({ href, icon, label, active }: any) => (
  <Link
    href={href}
    className={`mx-2 my-0.5 flex items-center gap-2.5 rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-medium transition-colors ${
      active
        ? "border-[#C9920A]/30 bg-[#C9920A]/20 font-bold text-[#F5C842]"
        : "text-white/55 hover:bg-white/5 hover:text-white/90"
    }`}
  >
    <span className={active ? "text-[#F5C842]" : ""}>{icon}</span>
    {label}
  </Link>
);
