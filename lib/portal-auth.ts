export type PortalRole = "STUDENT" | "COUNSELOR" | "ADMIN";

export type PortalRoleOption = {
  value: PortalRole;
  label: string;
  description: string;
};


export const PORTAL_ROLE_OPTIONS: PortalRoleOption[] = [
  {
    value: "STUDENT",
    label: "Siswa",
    description: "Mengisi jurnal dan membaca umpan balik konselor.",
  },
  {
    value: "COUNSELOR",
    label: "Konselor",
    description: "Memantau progres dan memberi tindak lanjut.",
  },
];


export const LOGIN_ROLE_OPTIONS: PortalRoleOption[] = [
  ...PORTAL_ROLE_OPTIONS,
  {
    value: "ADMIN",
    label: "Administrator",
    description: "Mengelola pengguna, institusi, dan konten platform.",
  },
];

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}


export function normalizeRole(value: unknown): PortalRole | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  return normalized === "STUDENT" || normalized === "COUNSELOR" || normalized === "ADMIN"
    ? (normalized as PortalRole)
    : null;
}

export function getDashboardPath(role: PortalRole, userId?: string) {
  if (role === "ADMIN") {
    return "/admin";
  }

  if (role === "COUNSELOR") {
    return "/counselor";
  }

  return userId ? `/dashboard/student/${encodeURIComponent(userId)}` : "/login";
}
