// Tipe & helper untuk panel admin.

export type AdminStats = {
  students: number;
  counselors: number;
  admins: number;
  institutions: number;
  subscribedInstitutions: number;
  completedModules: number;
  reports: number;
  premiumUsers: number;
};

export type AdminUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: "STUDENT" | "COUNSELOR" | "ADMIN";
  plan: "FREE" | "PREMIUM";
  createdAt: string;
  institution: { id: string; name: string } | null;
};

export type AdminInstitutionOption = { id: string; name: string };

export type AdminInstitution = {
  id: string;
  name: string;
  subscriptionActive: boolean;
  subscriptionExpiresAt: string | null;
  userCount: number;
};

export type AdminModule = {
  number: number;
  title: string;
  prompt: string;
  phaseLabel: string;
};

// Batas waktu absolut per modul (tanggal & jam).
export type ModuleDeadline = {
  number: number;
  title: string;
  phaseLabel: string;
  deadlineAt: string | null; // ISO string atau null (belum diatur)
};

async function readApiError(response: Response, fallback: string) {
  try {
    const payload = await response.json().catch(() => null);
    if (payload && typeof payload.error === "string" && payload.error.trim()) {
      return payload.error;
    }
  } catch {
    // fallback
  }
  return fallback;
}

export function formatDateId(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(date);
}

export function formatDateTimeId(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export async function fetchAdminOverview(): Promise<AdminStats> {
  const res = await fetch("/api/admin/overview", { cache: "no-store" });
  if (!res.ok) throw new Error(await readApiError(res, "Gagal memuat statistik"));
  return ((await res.json()) as { stats: AdminStats }).stats;
}

export async function fetchAdminUsers(): Promise<{
  users: AdminUser[];
  institutions: AdminInstitutionOption[];
}> {
  const res = await fetch("/api/admin/users", { cache: "no-store" });
  if (!res.ok) throw new Error(await readApiError(res, "Gagal memuat pengguna"));
  return (await res.json()) as { users: AdminUser[]; institutions: AdminInstitutionOption[] };
}

export async function updateAdminUser(
  id: string,
  data: { role?: string; plan?: string; institutionId?: string | null }
): Promise<void> {
  const res = await fetch("/api/admin/users", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...data }),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Gagal memperbarui pengguna"));
}

export async function deleteAdminUser(id: string): Promise<void> {
  const res = await fetch(`/api/admin/users?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(await readApiError(res, "Gagal menghapus pengguna"));
}

export async function fetchAdminInstitutions(): Promise<AdminInstitution[]> {
  const res = await fetch("/api/admin/institutions", { cache: "no-store" });
  if (!res.ok) throw new Error(await readApiError(res, "Gagal memuat institusi"));
  return ((await res.json()) as { institutions: AdminInstitution[] }).institutions;
}

export async function createAdminInstitution(name: string): Promise<AdminInstitution> {
  const res = await fetch("/api/admin/institutions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Gagal membuat institusi"));
  return ((await res.json()) as { institution: AdminInstitution }).institution;
}

export async function subscribeAdminInstitution(
  id: string,
  active: boolean
): Promise<AdminInstitution> {
  const res = await fetch("/api/admin/institutions", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, active }),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Gagal memperbarui langganan"));
  return ((await res.json()) as { institution: AdminInstitution }).institution;
}

export async function fetchAdminModules(): Promise<AdminModule[]> {
  const res = await fetch("/api/admin/modules", { cache: "no-store" });
  if (!res.ok) throw new Error(await readApiError(res, "Gagal memuat modul"));
  return ((await res.json()) as { modules: AdminModule[] }).modules;
}

export async function updateAdminModule(
  number: number,
  title: string,
  prompt: string
): Promise<void> {
  const res = await fetch("/api/admin/modules", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ number, title, prompt }),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Gagal memperbarui modul"));
}

export async function fetchModuleDeadlines(): Promise<ModuleDeadline[]> {
  const res = await fetch("/api/admin/settings", { cache: "no-store" });
  if (!res.ok) throw new Error(await readApiError(res, "Gagal memuat pengaturan"));
  return ((await res.json()) as { modules: ModuleDeadline[] }).modules;
}

export async function updateModuleDeadline(
  number: number,
  deadlineAt: string | null
): Promise<ModuleDeadline> {
  const res = await fetch("/api/admin/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ number, deadlineAt }),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Gagal menyimpan pengaturan"));
  return ((await res.json()) as { module: ModuleDeadline }).module;
}

// ISO string -> nilai untuk <input type="datetime-local"> (waktu lokal, "YYYY-MM-DDTHH:mm").
export function isoToLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

// Nilai <input type="datetime-local"> (waktu lokal) -> ISO string, atau null bila kosong.
export function localInputToIso(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}
