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
  moodDocumentUrl?: string | null;
  premiumLocked?: boolean;
  title?: string | null;
  prompt?: string | null;
  phaseLabel?: string | null;
};

export type StudentProfile = {
  id: string;
  name: string | null;
  email: string | null;
  avatar?: string | null;
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

// RIASEC: pernyataan yang dicentang (sesuai) atau tidak. Skor tiap dimensi = jumlah centang.
export type RiasecStatement = {
  id: string;
  dimension: RiasecScoreKey;
  text: string;
};

// Peta centang RIASEC: id pernyataan -> true bila dicentang.
export type RiasecCheckMap = Record<string, boolean>;

// Gaya belajar: tiap soal dijawab a/b/c (a=Visual, b=Auditorial, c=Kinestetik).
export type LearningStyleChoice = "a" | "b" | "c";

export type LearningStyleQuestion = {
  id: string;
  prompt: string;
  options: { a: string; b: string; c: string };
};

export type LearningStyleAnswerMap = Record<string, LearningStyleChoice>;

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

// 48 pernyataan RIASEC (8 per dimensi), diurutkan selang-seling agar tidak terlihat
// mengelompok per huruf di tampilan. Siswa cukup mencentang yang sesuai dirinya.
export const RIASEC_STATEMENTS: RiasecStatement[] = [
  { id: "r1", dimension: "riasecRealistic", text: "Saya adalah seseorang yang praktis" },
  { id: "i1", dimension: "riasecInvestigative", text: "Saya adalah seseorang yang memiliki rasa ingin tahu" },
  { id: "a1", dimension: "riasecArtistic", text: "Saya adalah seseorang yang kreatif" },
  { id: "s1", dimension: "riasecSocial", text: "Saya senang membantu orang lain" },
  { id: "e1", dimension: "riasecEnterprising", text: "Saya adalah seseorang yang percaya diri" },
  { id: "c1", dimension: "riasecConventional", text: "Saya adalah seseorang yang teratur dan rapi" },

  { id: "r2", dimension: "riasecRealistic", text: "Saya suka bekerja menggunakan tangan dan peralatan" },
  { id: "i2", dimension: "riasecInvestigative", text: "Saya suka memecahkan soal atau teka-teki" },
  { id: "a2", dimension: "riasecArtistic", text: "Saya suka menggambar, melukis, atau mendesain" },
  { id: "s2", dimension: "riasecSocial", text: "Saya suka mengajar atau menjelaskan sesuatu kepada teman" },
  { id: "e2", dimension: "riasecEnterprising", text: "Saya suka memimpin sebuah tim atau kegiatan" },
  { id: "c2", dimension: "riasecConventional", text: "Saya teliti dalam mengerjakan tugas" },

  { id: "r3", dimension: "riasecRealistic", text: "Saya mampu memperbaiki peralatan elektronik" },
  { id: "i3", dimension: "riasecInvestigative", text: "Saya senang melakukan percobaan atau penelitian" },
  { id: "a3", dimension: "riasecArtistic", text: "Saya senang menulis cerita, puisi, atau lagu" },
  { id: "s3", dimension: "riasecSocial", text: "Saya mudah berempati dengan perasaan orang lain" },
  { id: "e3", dimension: "riasecEnterprising", text: "Saya mampu meyakinkan orang lain dengan pendapat saya" },
  { id: "c3", dimension: "riasecConventional", text: "Saya suka bekerja dengan angka atau data" },

  { id: "r4", dimension: "riasecRealistic", text: "Saya senang melakukan kegiatan di luar ruangan" },
  { id: "i4", dimension: "riasecInvestigative", text: "Saya tertarik memahami cara kerja sesuatu" },
  { id: "a4", dimension: "riasecArtistic", text: "Saya menikmati bermain musik atau bernyanyi" },
  { id: "s4", dimension: "riasecSocial", text: "Saya senang bekerja dalam kelompok" },
  { id: "e4", dimension: "riasecEnterprising", text: "Saya tertarik pada dunia bisnis atau wirausaha" },
  { id: "c4", dimension: "riasecConventional", text: "Saya senang mengikuti prosedur dan aturan yang jelas" },

  { id: "r5", dimension: "riasecRealistic", text: "Saya tertarik pada mesin, kendaraan, atau teknologi" },
  { id: "i5", dimension: "riasecInvestigative", text: "Saya suka menganalisis data dan fakta" },
  { id: "a5", dimension: "riasecArtistic", text: "Saya suka tampil atau berakting" },
  { id: "s5", dimension: "riasecSocial", text: "Saya suka mendengarkan masalah orang lain" },
  { id: "e5", dimension: "riasecEnterprising", text: "Saya senang menyampaikan ide di depan banyak orang" },
  { id: "c5", dimension: "riasecConventional", text: "Saya suka mencatat dan menyusun informasi" },

  { id: "r6", dimension: "riasecRealistic", text: "Saya lebih suka melakukan langsung daripada membaca teori" },
  { id: "i6", dimension: "riasecInvestigative", text: "Saya menikmati pelajaran sains atau matematika" },
  { id: "a6", dimension: "riasecArtistic", text: "Saya senang berimajinasi dan menghasilkan ide baru" },
  { id: "s6", dimension: "riasecSocial", text: "Saya tertarik pada kegiatan sosial atau relawan" },
  { id: "e6", dimension: "riasecEnterprising", text: "Saya suka mengambil keputusan dan tanggung jawab" },
  { id: "c6", dimension: "riasecConventional", text: "Saya nyaman mengerjakan tugas administratif" },

  { id: "r7", dimension: "riasecRealistic", text: "Saya menikmati aktivitas fisik atau olahraga" },
  { id: "i7", dimension: "riasecInvestigative", text: "Saya suka membaca hal-hal ilmiah" },
  { id: "a7", dimension: "riasecArtistic", text: "Saya menghargai keindahan dan seni" },
  { id: "s7", dimension: "riasecSocial", text: "Saya nyaman berkenalan dengan orang baru" },
  { id: "e7", dimension: "riasecEnterprising", text: "Saya bersemangat mencapai target atau kemenangan" },
  { id: "c7", dimension: "riasecConventional", text: "Saya suka membuat jadwal dan rencana yang terperinci" },

  { id: "r8", dimension: "riasecRealistic", text: "Saya suka membuat atau merakit sesuatu" },
  { id: "i8", dimension: "riasecInvestigative", text: "Saya senang berpikir mendalam tentang suatu masalah" },
  { id: "a8", dimension: "riasecArtistic", text: "Saya suka mengekspresikan diri dengan cara yang unik" },
  { id: "s8", dimension: "riasecSocial", text: "Saya senang merawat atau membimbing orang lain" },
  { id: "e8", dimension: "riasecEnterprising", text: "Saya suka menjual atau mempromosikan sesuatu" },
  { id: "c8", dimension: "riasecConventional", text: "Saya lebih suka pekerjaan yang terstruktur" },
];

// Kuesioner gaya belajar (14 soal). Pilihan a=Visual, b=Auditorial, c=Kinestetik.
export const LEARNING_STYLE_QUESTIONS: LearningStyleQuestion[] = [
  { id: "ls1", prompt: "Saya sangat suka…", options: { a: "Mencatat", b: "Bercerita", c: "Menjiplak" } },
  { id: "ls2", prompt: "Saya suka membaca dengan…", options: { a: "Cepat", b: "Suara keras", c: "Jari sebagai penunjuk" } },
  { id: "ls3", prompt: "Saya paling suka belajar dengan…", options: { a: "Membaca", b: "Mendengarkan", c: "Bergerak" } },
  { id: "ls4", prompt: "Saya mudah mengingat dengan apa yang…", options: { a: "Saya lihat", b: "Saya dengar", c: "Saya tulis" } },
  { id: "ls5", prompt: "Apabila mencatat, saya…", options: { a: "Banyak catatan disertai gambar", b: "Sedikit mencatat karena lebih suka mendengarkan", c: "Banyak catatan namun tidak disertai gambar" } },
  { id: "ls6", prompt: "Saya menjawab pertanyaan dengan jawaban…", options: { a: "Ya atau tidak", b: "Panjang lebar (suka bercerita)", c: "Diikuti dengan gerakan anggota tubuh" } },
  { id: "ls7", prompt: "Saat belajar saya…", options: { a: "Tidak mudah terganggu dengan keributan", b: "Mudah terganggu dengan keributan", c: "Tidak dapat duduk diam dalam waktu lama" } },
  { id: "ls8", prompt: "Saya mengingat dengan cara…", options: { a: "Membayangkan", b: "Mengucapkan", c: "Sambil berjalan dan melihat" } },
  { id: "ls9", prompt: "Saya berbicara lebih suka…", options: { a: "Melihat wajah langsung", b: "Lewat telepon", c: "Memperhatikan gerakan tubuh" } },
  { id: "ls10", prompt: "Ketika berbicara saya…", options: { a: "Cepat", b: "Intonasi/berirama", c: "Lambat" } },
  { id: "ls11", prompt: "Cara saya belajar biasanya suka…", options: { a: "Mengikuti petunjuk gambar", b: "Sambil berbicara", c: "Berbicara sambil menulis" } },
  { id: "ls12", prompt: "Saya sering mengisi waktu luang dengan…", options: { a: "Menonton", b: "Mendengarkan musik", c: "Bermain game" } },
  { id: "ls13", prompt: "Saya lebih mudah memahami pelajaran dengan…", options: { a: "Melihat peraga", b: "Berdiskusi", c: "Praktik" } },
  { id: "ls14", prompt: "Saya lebih menyukai…", options: { a: "Gambar", b: "Musik", c: "Permainan" } },
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

// Jumlah pernyataan per dimensi (untuk skala tampilan).
export const RIASEC_MAX_PER_DIMENSION = RIASEC_STATEMENTS.reduce<RiasecScores>(
  (acc, s) => {
    acc[s.dimension] += 1;
    return acc;
  },
  { ...DEFAULT_RIASEC_SCORES }
);

// Skor RIASEC = jumlah pernyataan yang dicentang pada tiap dimensi.
export function computeRiasecScores(checks: RiasecCheckMap) {
  const scores: RiasecScores = { ...DEFAULT_RIASEC_SCORES };
  let checkedCount = 0;
  for (const statement of RIASEC_STATEMENTS) {
    if (checks[statement.id]) {
      scores[statement.dimension] += 1;
      checkedCount += 1;
    }
  }
  return { scores, checkedCount };
}

// Gaya belajar dari jawaban a/b/c: hitung tiap pilihan, terbanyak = dominan.
// a=Visual, b=Auditorial(AUDITORY), c=Kinestetik. Seri di puncak -> MULTIMODAL.
export function computeLearningStyle(answers: LearningStyleAnswerMap): {
  style: LearningStyle;
  counts: { a: number; b: number; c: number };
  answeredCount: number;
} {
  const counts = { a: 0, b: 0, c: 0 };
  let answeredCount = 0;
  for (const q of LEARNING_STYLE_QUESTIONS) {
    const choice = answers[q.id];
    if (choice === "a" || choice === "b" || choice === "c") {
      counts[choice] += 1;
      answeredCount += 1;
    }
  }

  const max = Math.max(counts.a, counts.b, counts.c);
  const topCount = [counts.a, counts.b, counts.c].filter((n) => n === max).length;
  let style: LearningStyle = "MULTIMODAL";
  if (max > 0 && topCount === 1) {
    if (counts.a === max) style = "VISUAL";
    else if (counts.b === max) style = "AUDITORY";
    else style = "KINESTHETIC";
  }

  return { style, counts, answeredCount };
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

// Unggah satu file ke server (Vercel Blob) dan kembalikan URL publiknya.
export async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch("/api/upload", { method: "POST", body: form });
  if (!response.ok) {
    throw new Error(await readApiError(response, "Gagal mengunggah file"));
  }
  const payload = (await response.json()) as { url: string };
  return payload.url;
}

// Mood board: kirim URL dokumen yang diunggah untuk membuka kembali modul terblokir.
export async function submitMoodDocument(
  studentId: string,
  weekNumber: number,
  documentUrl: string
): Promise<void> {
  const response = await fetch(`/api/journals/${studentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ weekNumber, documentUrl }),
  });
  if (!response.ok) {
    throw new Error(await readApiError(response, "Gagal mengirim dokumen"));
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
