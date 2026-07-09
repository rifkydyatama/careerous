export type JournalStatus = "LOCKED" | "UNLOCKED" | "COMPLETED";

export type LearningStyle = "VISUAL" | "AUDITORY" | "KINESTHETIC" | "READ_WRITE" | "MULTIMODAL";

export type RiasecScoreKey =
  | "riasecRealistic"
  | "riasecInvestigative"
  | "riasecArtistic"
  | "riasecSocial"
  | "riasecEnterprising"
  | "riasecConventional";

export type CounselorAssessment = {
  id: string;
  studentId: string;
  riasecRealistic: number;
  riasecInvestigative: number;
  riasecArtistic: number;
  riasecSocial: number;
  riasecEnterprising: number;
  riasecConventional: number;
  riasecTop3: string | null;
  learningStyle: LearningStyle;
  createdAt: string;
};

export type PlanTier = "FREE" | "PREMIUM";

export type CounselorJournal = {
  id: string;
  weekNumber: number;
  status: JournalStatus;
  reflectionText?: string | null;
  evidenceImageUrl?: string | null;
  counselorFeedback?: string | null;
  deadlineAt?: string | null;
  lockedUntil?: string | null;
  lateCount?: number;
  lateReason?: string | null;
  lateMood?: string | null;
  moodDocumentUrl?: string | null;
  updatedAt?: string;
};

export type PremiumSource = "NONE" | "PERSONAL" | "INSTITUTION";

export type CounselorStudent = {
  id: string;
  name: string | null;
  email: string | null;
  plan: PlanTier;
  premium: boolean;
  premiumSource: PremiumSource;
  institutionName: string | null;
  latestAssessment: CounselorAssessment | null;
  totalWeeks: number;
  completedCount: number;
  pendingFeedback: number;
  lateModules: number;
  lockedModules: number;
  journals: CounselorJournal[];
};

export type Institution = {
  id: string;
  name: string;
  subscriptionActive: boolean;
  subscriptionExpiresAt: string | null;
  studentCount: number;
};

export type CurrentUser = {
  id: string;
  name: string | null;
  role: string;
  institutionId: string | null;
  institution: {
    id: string;
    name: string;
    subscriptionActive: boolean;
    subscriptionExpiresAt: string | null;
  } | null;
};

export type CounselorOverviewResponse = {
  totalWeeks: number;
  students: CounselorStudent[];
};

export type CounselorNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  moduleNumber: number | null;
  relatedStudentId: string | null;
  createdAt: string;
};

export type CounselorFeedbackPayload = {
  weekNumber: number;
  counselorFeedback: string;
};

export const COUNSELOR_TOTAL_WEEKS = 12;

export const COUNSELOR_RIASEC_DIMENSIONS: Array<{ key: RiasecScoreKey; label: string }> = [
  { key: "riasecRealistic", label: "Realistic" },
  { key: "riasecInvestigative", label: "Investigative" },
  { key: "riasecArtistic", label: "Artistic" },
  { key: "riasecSocial", label: "Social" },
  { key: "riasecEnterprising", label: "Enterprising" },
  { key: "riasecConventional", label: "Conventional" },
];

export const COUNSELOR_LEARNING_STYLE_LABELS: Record<LearningStyle, string> = {
  VISUAL: "Visual",
  AUDITORY: "Auditory",
  KINESTHETIC: "Kinesthetic",
  READ_WRITE: "Read/Write",
  MULTIMODAL: "Multimodal",
};

async function readApiError(response: Response, fallback: string) {
  try {
    const payload = await response.json().catch(() => null);
    if (payload && typeof payload.error === "string" && payload.error.trim()) {
      return payload.error;
    }
  } catch {
    // Fall through to the fallback message.
  }

  return fallback;
}

export async function fetchCounselorOverview(): Promise<CounselorOverviewResponse> {
  const response = await fetch("/api/counselor/overview", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Gagal memuat data siswa")
    );
  }

  return (await response.json()) as CounselorOverviewResponse;
}

export async function submitCounselorFeedback(
  studentId: string,
  payload: CounselorFeedbackPayload
): Promise<CounselorJournal> {
  const response = await fetch(`/api/journals/${studentId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Gagal menyimpan feedback")
    );
  }

  return (await response.json()) as CounselorJournal;
}

// Konselor membuka modul yang terkunci karena batas waktu (setelah eskalasi moodboard).
export async function unlockStudentModule(
  studentId: string,
  weekNumber: number
): Promise<void> {
  const response = await fetch(`/api/journals/${studentId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ weekNumber, unlock: true }),
  });
  if (!response.ok) {
    throw new Error(await readApiError(response, "Gagal membuka modul"));
  }
}

export type CounselorCareerReport = {
  summary: string;
  dominantThemes: string[];
  sentimentLabel: string;
  sentimentScore: number;
  topInterest: string | null;
  isAiGenerated: boolean;
  generatedAt: string;
};

// Mengembalikan { report } bila tersedia, atau { notReady, completed, total } bila belum 12 modul.
export async function fetchStudentReport(studentId: string): Promise<
  | { report: CounselorCareerReport }
  | { notReady: true; completed: number; total: number }
> {
  const response = await fetch(`/api/reports/career-exploration/${studentId}`, {
    cache: "no-store",
  });
  if (response.status === 409) {
    const payload = await response.json().catch(() => null);
    return {
      notReady: true,
      completed: payload?.completed ?? 0,
      total: payload?.total ?? 12,
    };
  }
  if (!response.ok) {
    throw new Error(await readApiError(response, "Gagal memuat laporan"));
  }
  const payload = (await response.json()) as { report: CounselorCareerReport };
  return { report: payload.report };
}

export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  const response = await fetch("/api/auth/me", { cache: "no-store" });
  if (!response.ok) return null;
  const payload = (await response.json()) as { user: CurrentUser };
  return payload.user ?? null;
}

export async function fetchInstitution(id: string): Promise<Institution | null> {
  const response = await fetch(`/api/institutions?id=${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as { institution: Institution };
  return payload.institution ?? null;
}

export async function setInstitutionSubscription(
  institutionId: string,
  active: boolean
): Promise<Institution> {
  const response = await fetch("/api/institutions/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ institutionId, active }),
  });
  if (!response.ok) {
    throw new Error(await readApiError(response, "Gagal memperbarui langganan"));
  }
  const payload = (await response.json()) as { institution: Institution };
  return payload.institution;
}

export async function fetchCounselorNotifications(
  userId: string
): Promise<{ notifications: CounselorNotification[]; unreadCount: number }> {
  const response = await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(await readApiError(response, "Gagal memuat notifikasi"));
  }
  return (await response.json()) as {
    notifications: CounselorNotification[];
    unreadCount: number;
  };
}

export async function markCounselorNotificationsRead(
  userId: string,
  options: { id?: string; markAllRead?: boolean }
): Promise<number> {
  const response = await fetch("/api/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, ...options }),
  });
  if (!response.ok) {
    throw new Error(await readApiError(response, "Gagal memperbarui notifikasi"));
  }
  const payload = (await response.json()) as { unreadCount: number };
  return payload.unreadCount;
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

export const getInitials = (name?: string | null) => {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "??";
  }

  return words
    .slice(0, 2)
    .map((word) => word[0] || "")
    .join("")
    .toUpperCase();
};
