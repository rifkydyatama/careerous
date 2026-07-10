"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Trash2, Search, KeyRound } from "lucide-react";
import {
  fetchAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  formatDateId,
  AdminUser,
  AdminInstitutionOption,
} from "../utils";

const ROLE_LABEL: Record<string, string> = {
  STUDENT: "Siswa",
  COUNSELOR: "Konselor",
  ADMIN: "Admin",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [institutions, setInstitutions] = useState<AdminInstitutionOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await fetchAdminUsers();
      setUsers(result.users);
      setInstitutions(result.institutions);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal memuat pengguna");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = async (
    id: string,
    data: { role?: string; plan?: string; institutionId?: string | null; counselorId?: string | null }
  ) => {
    setSavingId(id);
    setErrorMessage(null);
    
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              role: (data.role as AdminUser["role"]) ?? u.role,
              plan: (data.plan as AdminUser["plan"]) ?? u.plan,
              institution:
                data.institutionId === undefined
                  ? u.institution
                  : institutions.find((i) => i.id === data.institutionId) ?? null,
              counselor:
                data.counselorId === undefined
                  ? u.counselor
                  : (() => {
                      if (!data.counselorId) return null;
                      const matched = users.find((x) => x.id === data.counselorId);
                      return matched ? { id: matched.id, name: matched.name || "Konselor" } : null;
                    })(),
            }
          : u
      )
    );
    try {
      await updateAdminUser(id, data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal memperbarui");
      await load();
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (u: AdminUser) => {
    if (!window.confirm(`Hapus akun ${u.name || u.email}? Tindakan ini permanen.`)) return;
    try {
      await deleteAdminUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal menghapus");
    }
  };

  const handleResetPassword = async () => {
    if (!resetTarget || resetPassword.length < 8) {
      setResetError("Kata sandi baru minimal 8 karakter.");
      return;
    }
    setIsResetting(true);
    setResetError(null);
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: resetTarget.id, newPassword: resetPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Gagal mereset kata sandi");
      }
      setResetSuccess(`Kata sandi ${resetTarget.name || resetTarget.email} berhasil direset.`);
      setResetPassword("");
      setTimeout(() => {
        setResetTarget(null);
        setResetSuccess(null);
      }, 2000);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "Gagal mereset");
    } finally {
      setIsResetting(false);
    }
  };

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (u.name ?? "").toLowerCase().includes(q) ||
      (u.email ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Kelola Pengguna</h2>
          <p className="mt-1 text-[13px] text-slate-500">
            Ubah peran, paket, dan institusi pengguna, atau hapus akun.
          </p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama / email..."
            className="w-64 rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-[12.5px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <RefreshCw size={18} className="animate-spin text-[#2563eb]" />
            <p className="text-sm font-bold text-slate-900">Memuat pengguna</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[820px] text-left text-[12.5px]">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Nama / Email</th>
                <th className="px-4 py-3">Peran</th>
                <th className="px-4 py-3">Paket</th>
                <th className="px-4 py-3">Institusi</th>
                <th className="px-4 py-3">Konselor (Plotting)</th>
                <th className="px-4 py-3">Terdaftar</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className={savingId === u.id ? "opacity-60" : ""}>
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900">{u.name || "—"}</p>
                    <p className="text-[11px] text-slate-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => void patch(u.id, { role: e.target.value })}
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-[11.5px] outline-none focus:border-blue-500"
                    >
                      {Object.keys(ROLE_LABEL).map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABEL[r]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.plan}
                      onChange={(e) => void patch(u.id, { plan: e.target.value })}
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-[11.5px] outline-none focus:border-blue-500"
                    >
                      <option value="FREE">Free</option>
                      <option value="PREMIUM">Premium</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.institution?.id ?? ""}
                      onChange={(e) => void patch(u.id, { institutionId: e.target.value || null })}
                      className="max-w-[180px] rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-[11.5px] outline-none focus:border-blue-500"
                    >
                      <option value="">— Tanpa institusi —</option>
                      {institutions.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {u.role === "STUDENT" && u.institution ? (
                      <select
                        value={u.counselor?.id ?? ""}
                        onChange={(e) => void patch(u.id, { counselorId: e.target.value || null })}
                        disabled={savingId === u.id}
                        className="max-w-[170px] rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-[11.5px] outline-none focus:border-blue-500 disabled:opacity-50"
                      >
                        <option value="">— Belum Di-plot —</option>
                        {users
                          .filter((c) => c.role === "COUNSELOR" && c.institution?.id === u.institution?.id)
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name || c.email}
                            </option>
                          ))}
                      </select>
                    ) : u.role === "STUDENT" ? (
                      <span className="text-[11.5px] text-slate-400 italic">Pilih institusi dulu</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDateId(u.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => { setResetTarget(u); setResetPassword(""); setResetError(null); setResetSuccess(null); }}
                        className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-2.5 py-1.5 text-[11px] font-bold text-blue-600 transition hover:bg-blue-50"
                      >
                        <KeyRound size={12} /> Reset
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(u)}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-[11px] font-bold text-rose-600 transition hover:bg-rose-50"
                      >
                        <Trash2 size={12} /> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Tidak ada pengguna.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {}
      {resetTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-extrabold text-slate-900">Reset Kata Sandi</h3>
            <p className="mt-1 text-[13px] text-slate-500">
              Atur ulang kata sandi untuk <b>{resetTarget.name || resetTarget.email}</b>
            </p>
            <input
              type="password"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              placeholder="Kata sandi baru (min. 8 karakter)"
              className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            {resetError && <p className="mt-2 text-[12px] font-semibold text-rose-600">{resetError}</p>}
            {resetSuccess && <p className="mt-2 text-[12px] font-semibold text-emerald-600">{resetSuccess}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setResetTarget(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-[12px] font-bold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => void handleResetPassword()}
                disabled={isResetting}
                className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-bold text-white hover:bg-blue-700 disabled:bg-slate-300"
              >
                {isResetting ? "Menyimpan..." : "Reset Kata Sandi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
