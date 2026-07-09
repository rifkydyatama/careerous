"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { UNIVERSITY } from "@/lib/identity";
import {
  Home,
  BookOpen,
  Calendar,
  Settings,
  LogOut,
  Bell,
  Sparkles,
  FileText,
  CheckCheck,
  HelpCircle,
} from "lucide-react";
import {
  fetchNotifications,
  markNotificationsRead,
  formatDateTimeId,
  NotificationItem,
} from "./utils";

type MeUser = {
  id: string;
  name: string | null;
  avatar?: string | null;
  institution?: { name: string } | null;
};

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ studentId: string }>();
  const studentId = params.studentId;

  const [me, setMe] = useState<MeUser | null>(null);

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d?.user) setMe(d.user); })
      .catch(() => {});
  }, []);

  const schoolName = me?.institution?.name ?? UNIVERSITY.name;

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
      

      <aside className="fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 p-5">
          <Image src={UNIVERSITY.logo} alt={UNIVERSITY.name} width={40} height={40} className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover bg-white" />
          <div>
            <h1 className="text-sm font-extrabold leading-tight text-slate-900">{UNIVERSITY.app}</h1>
            <p className="mt-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-slate-400">{schoolName}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-5 scrollbar-hide">
          <MenuSection title="Menu Utama" />
          <NavItem href={`/dashboard/student/${studentId}`} icon={<Home size={17} />} label="Dasbor Utama" active={pathname === `/dashboard/student/${studentId}`} />
          <NavItem href={`/dashboard/student/${studentId}/journals`} icon={<BookOpen size={17} />} label="Modul Eksplorasi" active={pathname === `/dashboard/student/${studentId}/journals`} />
          <NavItem href={`/dashboard/student/${studentId}/report`} icon={<FileText size={17} />} label="Laporan Karier" active={pathname === `/dashboard/student/${studentId}/report`} />
          <NavItem href={`/dashboard/student/${studentId}/schedule`} icon={<Calendar size={17} />} label="Jadwal Konseling" active={pathname === `/dashboard/student/${studentId}/schedule`} />

          <MenuSection title="Asesmen" />
          <NavItem href={`/dashboard/student/${studentId}/riasec`} icon={<Sparkles size={17} />} label="Tes RIASEC & Gaya Belajar" active={pathname === `/dashboard/student/${studentId}/riasec`} />

          <MenuSection title="Sistem" />
          <NavItem href={`/dashboard/student/${studentId}/settings`} icon={<Settings size={17} />} label="Pengaturan Akun" active={pathname === `/dashboard/student/${studentId}/settings`} />
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


      <div className="ml-[260px] flex flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-7">
          <div className="flex items-center gap-2 text-[13px] text-slate-400">
            <span>{UNIVERSITY.app}</span> <span>›</span> <b className="font-bold text-slate-900">Ruang Siswa</b>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/guide"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              <HelpCircle size={13} /> Panduan
            </Link>
            <NotificationBell userId={studentId} />
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <p className="text-[11.5px] font-bold text-slate-900">{me?.name?.split(" ")[0] || "Siswa Aktif"}</p>
                <p className="text-[9.5px] font-semibold uppercase tracking-wider text-slate-400">{schoolName}</p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#2563eb] text-xs font-extrabold text-white shadow-sm">
                {me?.avatar ? (
                  <Image src={me.avatar} alt="Avatar" width={36} height={36} className="h-full w-full object-cover" />
                ) : (
                  (me?.name?.[0] || "S").toUpperCase()
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-7">
          {children}
        </main>

        <footer className="mt-auto border-t border-slate-200 bg-white px-7 py-4 text-[11px] text-slate-400">
          {UNIVERSITY.copyright} · {UNIVERSITY.unit} · {UNIVERSITY.app} — {UNIVERSITY.appTagline}
        </footer>
      </div>
    </div>
  );
}


function NotificationBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const res = await fetchNotifications(userId);
      setItems(res.notifications);
      setUnread(res.unreadCount);
    } catch {
      // diam: notifikasi tidak kritikal
    }
  };

  useEffect(() => {
    if (!userId) return;
    void load();
    const timer = setInterval(() => void load(), 60_000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Tutup dropdown saat klik di luar.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleToggle = () => setOpen((prev) => !prev);

  const handleMarkAll = async () => {
    try {
      const count = await markNotificationsRead(userId, { markAllRead: true });
      setUnread(count);
      setItems((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch {
      // abaikan
    }
  };

  const handleClickItem = async (item: NotificationItem) => {
    if (item.read) return;
    try {
      const count = await markNotificationsRead(userId, { id: item.id });
      setUnread(count);
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
    } catch {
      // abaikan
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
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
    {badge && <span className="ml-auto rounded-full bg-blue-600 px-1.5 py-0.5 text-[9.5px] font-bold text-white">{badge}</span>}
  </Link>
);