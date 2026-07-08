import {
  Home,
  BookOpen,
  Calendar,
  Settings,
  LogOut,
  Bell,
  RefreshCw,
  CheckCircle2,
  Clock,
  Lock,
  ExternalLink,
  UploadCloud,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export type JournalStatus = "LOCKED" | "UNLOCKED" | "COMPLETED";

export type PlanTier = "FREE" | "PREMIUM";

export type JournalItem = {
  id: string;
  weekNumber: number;
  status: JournalStatus;
  reflectionText?: string | null;
  evidenceImageUrl?: string | null;
  counselorFeedback?: string | null;
  unlockedAt?: string | null;
  deadlineAt?: string | null;
  lockedUntil?: string | null;
  lateCount?: number;
  lateReason?: string | null;
  lateMood?: string | null;
  premiumLocked?: boolean;
  title?: string | null;
  prompt?: string | null;
  phaseLabel?: string | null;
};

export type StudentProfile = {
  id: string;
  name: string | null;
  email: string | null;
};

export type PremiumSource = "NONE" | "PERSONAL" | "INSTITUTION";

export type StudentDashboardResponse = {
  studentId: string;
  totalWeeks: number;
  plan: PlanTier;
  premium: boolean;
  premiumSource: PremiumSource;
  institutionName: string | null;
  freeModuleLimit: number;
  hasReport: boolean;
  student: StudentProfile | null;
  journals: JournalItem[];
};

export type CareerReport = {
  id: string;
  studentId: string;
  summary: string;
  dominantThemes: string[];
  sentimentLabel: string;
  sentimentScore: number;
  topInterest: string | null;
  isAiGenerated: boolean;
  generatedAt: string;
};

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  moduleNumber: number | null;
  createdAt: string;
};

export type JournalSubmissionPayload = {
  weekNumber: number;
  reflectionText: string;
  evidenceImageUrl: string | null;
};

export const TOTAL_WEEKS = 12;

export type LearningStyle = "VISUAL" | "AUDITORY" | "KINESTHETIC" | "READ_WRITE" | "MULTIMODAL";

export type RiasecScoreKey =
  | "riasecRealistic"
  | "riasecInvestigative"
  | "riasecArtistic"
  | "riasecSocial"
  | "riasecEnterprising"
  | "riasecConventional";

export type RiasecScores = Record<RiasecScoreKey, number>;

export type AssessmentRecord = {
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

export type AssessmentSubmissionPayload = {
  studentId: string;
  riasecRealistic: number;
  riasecInvestigative: number;
  riasecArtistic: number;
  riasecSocial: number;
  riasecEnterprising: number;
  riasecConventional: number;
  riasecTop3: string;
  learningStyle: LearningStyle;
};

export type RiasecResponseMap = Partial<Record<string, number>>;

export type RiasecQuestion = {
  id: string;
  dimension: RiasecScoreKey;
  prompt: string;
  context: string;
};

export const STUDENT_SCHEDULE_ITEMS = [
  {
    title: "Konseling individu",
    day: "Selasa",
    time: "10.00",
    detail: "Tinjau progres jurnal dan arahkan langkah karier berikutnya.",
  },
  {
    title: "Konseling kelompok",
    day: "Kamis",
    time: "13.30",
    detail: "Diskusi minat, pilihan studi, dan peluang aktivitas kampus.",
  },
  {
    title: "Tindak lanjut refleksi",
    day: "Jumat",
    time: "09.00",
    detail: "Bahas umpan balik terbaru dari konselor dan target minggu depan.",
  },
];

export const RIASEC_DIMENSIONS: Array<{
  key: RiasecScoreKey;
  label: string;
  description: string;
}> = [
  {
    key: "riasecRealistic",
    label: "Realistic",
    description: "Menunjukkan ketertarikan pada aktivitas praktis, alat, dan hasil konkret.",
  },
  {
    key: "riasecInvestigative",
    label: "Investigative",
    description: "Menggambarkan minat pada analisis, penelitian, dan pemecahan masalah.",
  },
  {
    key: "riasecArtistic",
    label: "Artistic",
    description: "Mencerminkan kreativitas, ekspresi, dan ide-ide yang orisinal.",
  },
  {
    key: "riasecSocial",
    label: "Social",
    description: "Menunjukkan minat membantu, membimbing, dan berinteraksi dengan orang lain.",
  },
  {
    key: "riasecEnterprising",
    label: "Enterprising",
    description: "Mengarah ke kepemimpinan, persuasi, dan pengambilan keputusan.",
  },
  {
    key: "riasecConventional",
    label: "Conventional",
    description: "Mewakili ketelitian, struktur, dan pengelolaan data atau prosedur.",
  },
];

export const LEARNING_STYLE_OPTIONS: Array<{ value: LearningStyle; label: string; description: string }> = [
  {
    value: "VISUAL",
    label: "Visual",
    description: "Lebih mudah menangkap materi dari gambar, diagram, dan pola warna.",
  },
  {
    value: "AUDITORY",
    label: "Auditory",
    description: "Nyaman belajar lewat penjelasan lisan, diskusi, dan rekaman suara.",
  },
  {
    value: "KINESTHETIC",
    label: "Kinesthetic",
    description: "Cocok dengan aktivitas praktik, simulasi, dan pembelajaran bergerak.",
  },
  {
    value: "READ_WRITE",
    label: "Read/Write",
    description: "Suka membaca, mencatat, dan menyusun ide dalam bentuk tulisan.",
  },
  {
    value: "MULTIMODAL",
    label: "Multimodal",
    description: "Menggabungkan beberapa gaya belajar sesuai konteks.",
  },
];

export const RIASEC_RESPONSE_OPTIONS = [
  { value: 0, label: "Sangat tidak sesuai" },
  { value: 1, label: "Tidak sesuai" },
  { value: 2, label: "Sesuai" },
  { value: 3, label: "Sangat sesuai" },
] as const;

export const RIASEC_QUESTIONS: RiasecQuestion[] = [
  {
    id: "riasec-q-1",
    dimension: "riasecRealistic",
    prompt: "Saya suka merakit, memperbaiki, atau mengutak-atik alat dan benda.",
    context: "Aktivitas yang menekankan kerja langsung dan hasil konkret.",
  },
  {
    id: "riasec-q-2",
    dimension: "riasecRealistic",
    prompt: "Saya lebih nyaman belajar lewat praktik langsung daripada membaca teori panjang.",
    context: "Minat pada pengalaman langsung dan tugas yang bersifat teknis.",
  },
  {
    id: "riasec-q-3",
    dimension: "riasecInvestigative",
    prompt: "Saya senang mencari jawaban lewat analisis data, logika, atau eksperimen.",
    context: "Aktivitas yang menuntut observasi dan penalaran.",
  },
  {
    id: "riasec-q-4",
    dimension: "riasecInvestigative",
    prompt: "Saya tertarik memahami sebab-akibat di balik sebuah masalah.",
    context: "Kecenderungan untuk menyelidiki dan menemukan pola.",
  },
  {
    id: "riasec-q-5",
    dimension: "riasecArtistic",
    prompt: "Saya menikmati membuat karya yang unik seperti desain, tulisan, atau visual.",
    context: "Ruang untuk berekspresi dan menghasilkan ide orisinal.",
  },
  {
    id: "riasec-q-6",
    dimension: "riasecArtistic",
    prompt: "Saya lebih bersemangat saat diberi kebebasan untuk bereksperimen dengan ide baru.",
    context: "Kreativitas yang tidak terlalu dibatasi aturan kaku.",
  },
  {
    id: "riasec-q-7",
    dimension: "riasecSocial",
    prompt: "Saya senang membantu orang lain memahami masalah dan memberi dukungan.",
    context: "Peran yang berhubungan dengan empati dan pendampingan.",
  },
  {
    id: "riasec-q-8",
    dimension: "riasecSocial",
    prompt: "Saya nyaman menjadi pendengar atau fasilitator saat teman membutuhkan bantuan.",
    context: "Kegiatan yang menekankan kerja sama dan hubungan interpersonal.",
  },
  {
    id: "riasec-q-9",
    dimension: "riasecEnterprising",
    prompt: "Saya mudah memimpin diskusi, menyampaikan ide, atau mengajak orang lain bergerak.",
    context: "Situasi yang menuntut inisiatif dan pengaruh sosial.",
  },
  {
    id: "riasec-q-10",
    dimension: "riasecEnterprising",
    prompt: "Saya percaya diri saat harus meyakinkan orang lain tentang sebuah ide.",
    context: "Kecenderungan untuk tampil, memimpin, dan mengambil keputusan.",
  },
  {
    id: "riasec-q-11",
    dimension: "riasecConventional",
    prompt: "Saya teliti saat mengatur jadwal, data, atau langkah kerja yang rapi.",
    context: "Kegiatan yang menuntut ketelitian dan struktur.",
  },
  {
    id: "riasec-q-12",
    dimension: "riasecConventional",
    prompt: "Saya suka memastikan detail dan prosedur berjalan tepat tanpa banyak kesalahan.",
    context: "Preferensi pada keteraturan, sistem, dan akurasi.",
  },
];

export const DEFAULT_RIASEC_SCORES: RiasecScores = {
  riasecRealistic: 0,
  riasecInvestigative: 0,
  riasecArtistic: 0,
  riasecSocial: 0,
  riasecEnterprising: 0,
  riasecConventional: 0,
};

export const DEFAULT_LEARNING_STYLE: LearningStyle = "MULTIMODAL";

export function buildRiasecTop3(scores: RiasecScores) {
  return RIASEC_DIMENSIONS
    .map((dimension) => [dimension.label, scores[dimension.key]] as const)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([label]) => label)
    .join(", ");
}

export function calculateRiasecScoresFromResponses(responses: RiasecResponseMap) {
  const rawScores: RiasecScores = { ...DEFAULT_RIASEC_SCORES };
  const maxScores: RiasecScores = { ...DEFAULT_RIASEC_SCORES };
  let answeredCount = 0;

  for (const question of RIASEC_QUESTIONS) {
    maxScores[question.dimension] += 3;

    const answer = responses[question.id];
    if (typeof answer === "number") {
      rawScores[question.dimension] += answer;
      answeredCount += 1;
    }
  }

  const normalizedScores = RIASEC_DIMENSIONS.reduce<RiasecScores>((accumulator, dimension) => {
    const maxScore = maxScores[dimension.key];
    const score = rawScores[dimension.key];

    accumulator[dimension.key] = maxScore > 0 ? Math.round((score / maxScore) * 10) : 0;
    return accumulator;
  }, { ...DEFAULT_RIASEC_SCORES });

  return {
    scores: normalizedScores,
    answeredCount,
    totalQuestions: RIASEC_QUESTIONS.length,
  };
}

export async function readApiError(response: Response, fallback: string) {
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

export async function fetchStudentDashboard(
  studentId: string
): Promise<StudentDashboardResponse> {
  const response = await fetch(`/api/journals/${studentId}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Gagal mengambil data jurnal")
    );
  }

  return (await response.json()) as StudentDashboardResponse;
}

export async function submitStudentJournal(
  studentId: string,
  payload: JournalSubmissionPayload
): Promise<JournalItem> {
  const response = await fetch(`/api/journals/${studentId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Gagal menyimpan jurnal")
    );
  }

  return (await response.json()) as JournalItem;
}

export async function fetchStudentAssessment(
  studentId: string
): Promise<AssessmentRecord | null> {
  const response = await fetch(`/api/assessments?studentId=${encodeURIComponent(studentId)}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Gagal mengambil hasil RIASEC")
    );
  }

  const payload = (await response.json()) as {
    assessment: AssessmentRecord | null;
  };

  return payload.assessment ?? null;
}

export async function submitStudentAssessment(
  payload: AssessmentSubmissionPayload
): Promise<AssessmentRecord> {
  const response = await fetch("/api/assessments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Gagal menyimpan hasil RIASEC")
    );
  }

  return (await response.json()) as AssessmentRecord;
}

export const STATUS_CONFIG: Record<JournalStatus, { label: string, colorClass: string, badgeClass: string, icon: any }> = {
  LOCKED: { label: "Terkunci", colorClass: "border-slate-200 bg-slate-50 opacity-60", badgeClass: "bg-slate-100 text-slate-500", icon: Lock },
  UNLOCKED: { label: "Tersedia", colorClass: "border-blue-300 bg-blue-50/30 shadow-sm", badgeClass: "bg-blue-100 text-blue-700", icon: Clock },
  COMPLETED: { label: "Selesai", colorClass: "border-slate-200 bg-white shadow-sm hover:shadow-md", badgeClass: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
};

export function formatDateTimeId(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

// Sisa waktu menuju deadline dalam teks ramah (mis. "1 hari 4 jam lagi" / "Lewat 2 jam").
export function formatDeadlineCountdown(deadlineAt?: string | null): {
  text: string;
  overdue: boolean;
} | null {
  if (!deadlineAt) return null;
  const target = new Date(deadlineAt).getTime();
  if (Number.isNaN(target)) return null;

  const diffMs = target - Date.now();
  const overdue = diffMs < 0;
  const absMs = Math.abs(diffMs);
  const hours = Math.floor(absMs / (60 * 60 * 1000));
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;

  const span =
    days > 0 ? `${days} hari ${remHours} jam` : hours > 0 ? `${hours} jam` : "kurang dari 1 jam";

  return {
    text: overdue ? `Lewat ${span}` : `${span} lagi`,
    overdue,
  };
}

// Tugas transisi: kirim alasan keterlambatan (+ mood dari moodboard) untuk membuka
// kembali modul terkunci.
export async function submitLateReason(
  studentId: string,
  weekNumber: number,
  lateReason: string,
  mood?: string | null
): Promise<void> {
  const response = await fetch(`/api/journals/${studentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ weekNumber, lateReason, mood: mood ?? null }),
  });
  if (!response.ok) {
    throw new Error(await readApiError(response, "Gagal mengirim alasan"));
  }
}

export async function fetchCareerReport(studentId: string): Promise<CareerReport | null> {
  const response = await fetch(`/api/reports/career-exploration/${studentId}`, {
    cache: "no-store",
  });

  if (response.status === 409) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await readApiError(response, "Gagal memuat laporan"));
  }

  const payload = (await response.json()) as { report: CareerReport };
  return payload.report;
}

export async function upgradeToPremium(studentId: string): Promise<PlanTier> {
  const response = await fetch("/api/billing/upgrade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId, plan: "PREMIUM" }),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Gagal meng-upgrade paket"));
  }

  const payload = (await response.json()) as { plan: PlanTier };
  return payload.plan;
}

export async function fetchNotifications(
  userId: string
): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
  const response = await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Gagal memuat notifikasi"));
  }

  return (await response.json()) as {
    notifications: NotificationItem[];
    unreadCount: number;
  };
}

export async function markNotificationsRead(
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
