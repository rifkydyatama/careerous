"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { UNIVERSITY } from "@/lib/identity";
import {
  Home, Users, BookOpen, Calendar, Settings, LogOut,
  Bell, UserPlus, CheckCheck, Building2, HelpCircle,
  Menu, X
} from "lucide-react";
import {
  fetchCurrentUser,
  fetchCounselorNotifications,
  markCounselorNotificationsRead,
  formatDateTimeId,
  CounselorNotification,
  CurrentUser,
} from "./utils";


function initialsOf(name: string | null | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "BK";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function CounselorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [me, setMe] = useState<CurrentUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    void fetchCurrentUser().then((user) => {
      if (mounted) setMe(user);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const schoolName = me?.institution?.name ?? UNIVERSITY.name;
  const counselorName = me?.name?.trim() || "Konselor";

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
            <Image
              src={UNIVERSITY.logo}
              alt={UNIVERSITY.name}
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover bg-white"
            />
            <div>
              <h1 className="text-sm font-extrabold leading-tight text-slate-900">{UNIVERSITY.app} BK</h1>
              <p className="mt-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-slate-400 truncate max-w-[130px]" title={schoolName}>
                {schoolName}
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

        <div className="mx-3 mt-3 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-extrabold text-white">
            {me?.avatar ? (
              <Image src={me.avatar} alt="Avatar" width={36} height={36} className="h-full w-full object-cover" />
            ) : (
              initialsOf(me?.name)
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[11.5px] font-bold text-slate-900">{counselorName}</p>
            <p className="mt-0.5 text-[9.5px] text-slate-500">Konselor / Guru BK</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2 scrollbar-hide">
          <MenuSection title="Menu Utama" />
          <NavItem href="/counselor" icon={<Home size={17} />} label="Dasbor" active={pathname === "/counselor"} />
          <NavItem href="/counselor/students" icon={<Users size={17} />} label="Daftar Siswa" active={pathname === "/counselor/students"} />
          <NavItem href="/counselor/journals" icon={<BookOpen size={17} />} label="Reviu Modul" active={pathname === "/counselor/journals"} />

          <MenuSection title="Program" />
          <NavItem href="/counselor/program" icon={<Calendar size={17} />} label="Jadwal Program" active={pathname === "/counselor/program"} />
          <NavItem href="/counselor/institution" icon={<Building2 size={17} />} label="Langganan Institusi" active={pathname === "/counselor/institution"} />
          <NavItem href="/counselor/settings" icon={<Settings size={17} />} label="Pengaturan" active={pathname === "/counselor/settings"} />
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
              <b className="hidden sm:inline font-bold text-slate-900">Panel BK</b>
            </div>
          </div>
          <div className="flex items-center gap-2.5 lg:gap-3">
            <Link
              href="/guide"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              <HelpCircle size={13} />
              <span className="hidden sm:inline">Panduan</span>
            </Link>
            <CounselorNotificationBell />
            <button
              onClick={handleAddStudent}
              className="flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1d4ed8] transition"
            >
              <UserPlus size={13} />
              <span className="hidden sm:inline">Tambah Siswa</span>
            </button>
          </div>
        </header>

        <main className="p-4 pb-24 lg:p-7">
          {children}
        </main>

        <footer className="mt-auto border-t border-slate-200 bg-white px-4 lg:px-7 py-4 pb-24 lg:pb-4 text-[11px] text-slate-400 leading-normal">
          {UNIVERSITY.copyright} · {UNIVERSITY.unit} · {UNIVERSITY.app} — {UNIVERSITY.appTagline}
        </footer>
      </div>

      {/* Bottom Navigation for Mobile Devices */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 border-t border-slate-200 bg-white/95 backdrop-blur-md px-2 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] lg:hidden pb-safe">
        <BottomNavItem href="/counselor" icon={<Home size={18} />} label="Dasbor" active={pathname === "/counselor"} />
        <BottomNavItem href="/counselor/students" icon={<Users size={18} />} label="Siswa" active={pathname === "/counselor/students"} />
        <BottomNavItem href="/counselor/journals" icon={<BookOpen size={18} />} label="Reviu" active={pathname === "/counselor/journals"} />
        <BottomNavItem href="/counselor/program" icon={<Calendar size={18} />} label="Program" active={pathname === "/counselor/program"} />
        <BottomNavItem icon={<Menu size={18} />} label="Lainnya" onClick={() => setSidebarOpen(true)} />
      </nav>
    </div>
  );
}


function CounselorNotificationBell() {
  const [userId, setUserId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CounselorNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    void fetchCurrentUser().then((user) => {
      if (mounted && user) setUserId(user.id);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const load = async (id: string) => {
    try {
      const res = await fetchCounselorNotifications(id);
      setItems(res.notifications);
      setUnread(res.unreadCount);
    } catch {
      
    }
  };

  useEffect(() => {
    if (!userId) return;
    void load(userId);
    const timer = setInterval(() => void load(userId), 60_000);
    return () => clearInterval(timer);
  }, [userId]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkAll = async () => {
    if (!userId) return;
    try {
      const count = await markCounselorNotificationsRead(userId, { markAllRead: true });
      setUnread(count);
      setItems((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch {
      
    }
  };

  const handleClickItem = async (item: CounselorNotification) => {
    if (!userId || item.read) return;
    try {
      const count = await markCounselorNotificationsRead(userId, { id: item.id });
      setUnread(count);
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
    } catch {
      
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
      >
        <Bell size={15} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-red-600 px-1 text-[8px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
            <p className="text-[12px] font-extrabold text-slate-900">Notifikasi</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => void handleMarkAll()}
                className="inline-flex items-center gap-1 text-[10.5px] font-bold text-blue-600 hover:text-blue-800"
              >
                <CheckCheck size={12} /> Tandai semua dibaca
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-[12px] text-slate-400">Belum ada notifikasi.</p>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void handleClickItem(item)}
                  className={`flex w-full flex-col gap-0.5 border-b border-slate-50 px-4 py-3 text-left transition hover:bg-slate-50 ${
                    item.read ? "opacity-70" : "bg-blue-50/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {!item.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600"></span>}
                    <span className="text-[12px] font-bold text-slate-900">{item.title}</span>
                  </div>
                  <span className="text-[11px] leading-snug text-slate-500">{item.body}</span>
                  <span className="mt-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-slate-400">
                    {formatDateTimeId(item.createdAt)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}


const MenuSection = ({ title }: { title: string }) => (
  <div className="px-5 pb-1 pt-4 text-[9px] font-bold uppercase tracking-[1.2px] text-slate-400">{title}</div>
);

const NavItem = ({ href, icon, label, badge, active }: any) => (
  <Link href={href} className={`mx-2 my-0.5 flex items-center gap-2.5 rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-medium transition-colors ${
    active ? "border-blue-200 bg-blue-50 font-bold text-blue-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`}>
    <span className={active ? "text-blue-600" : "text-slate-400"}>{icon}</span>
    {label}
    {badge && <span className="ml-auto rounded-full bg-red-600 px-1.5 py-0.5 text-[9.5px] font-bold text-white">{badge}</span>}
  </Link>
);

const BottomNavItem = ({ href, icon, label, active, onClick }: any) => {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-1.5 py-2 transition-colors ${
      active ? "text-blue-600 font-extrabold" : "text-slate-500"
    }`}>
      <span className={active ? "text-blue-600 scale-105 transition-transform" : "text-slate-400"}>{icon}</span>
      <span className="text-[10px] font-bold leading-none tracking-wide">{label}</span>
    </div>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="flex-1 focus:outline-none">
        {content}
      </button>
    );
  }

  return (
    <Link href={href} className="flex-1">
      {content}
    </Link>
  );
};