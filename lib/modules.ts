// Metadata 12 Modul Eksplorasi Karier Careerous.
//
// Konsep: Career Construction Theory (Savickas) — 3 fase eksplorasi x 4 modul = 12 modul,
// setara 1 semester efektif. Nomor modul memakai field DB `weekNumber` (1-12) yang tidak
// di-rename agar tidak perlu migrasi data; di tampilan disebut "Modul".

export const TOTAL_MODULES = 12;

// Batas modul gratis (freemium). Modul 1-3 gratis, 4-12 butuh Premium.
export const FREE_MODULE_LIMIT = 3;

export type ModulePhase = "EKSPLORASI_DIRI" | "EKSPLORASI_LINGKUNGAN" | "SINTESIS_REFLEKSI";

export type PhaseInfo = {
  key: ModulePhase;
  label: string;
  description: string;
  range: [number, number];
};

export const PHASES: PhaseInfo[] = [
  {
    key: "EKSPLORASI_DIRI",
    label: "Eksplorasi Diri",
    description: "Mengenali minat, nilai, kekuatan, dan gaya belajar pribadi.",
    range: [1, 4],
  },
  {
    key: "EKSPLORASI_LINGKUNGAN",
    label: "Eksplorasi Lingkungan",
    description: "Menjelajah dunia kerja, jurusan, dan peluang di sekitar.",
    range: [5, 8],
  },
  {
    key: "SINTESIS_REFLEKSI",
    label: "Sintesis & Refleksi",
    description: "Menyatukan temuan menjadi arah karier yang lebih jelas.",
    range: [9, 12],
  },
];

export type ModuleInfo = {
  number: number;
  phase: ModulePhase;
  phaseLabel: string;
  title: string;
  prompts: string[];
  /** @deprecated Use prompts instead. Kept for backward compat with DB. */
  prompt: string;
};

const RAW_MODULES: Array<Omit<ModuleInfo, "phase" | "phaseLabel" | "prompt">> = [
  // ── Fase 1: Eksplorasi Diri (1-4) ──
  {
    number: 1,
    title: "Mengenali Diri",
    prompts: [
      "Tuliskan tiga hal yang paling kamu nikmati saat melakukannya sampai lupa waktu. Apa yang membuat aktivitas itu terasa menyenangkan?",
      "Ceritakan satu momen di mana kamu merasa paling percaya diri. Apa yang sedang kamu lakukan saat itu?",
    ],
  },
  {
    number: 2,
    title: "Nilai & Motivasi",
    prompts: [
      "Hal apa yang menurutmu paling penting dalam hidup dan pekerjaan (misalnya membantu orang, kebebasan, penghasilan, kreativitas)? Mengapa hal itu penting bagimu?",
      "Bayangkan kamu sudah bekerja. Situasi seperti apa yang membuatmu merasa puas dan bermakna?",
    ],
  },
  {
    number: 3,
    title: "Kekuatan & Kelemahan",
    prompts: [
      "Sebutkan dua kelebihan yang sering dipuji orang lain darimu dan satu hal yang masih ingin kamu kembangkan. Beri contoh nyatanya.",
      "Apa satu kebiasaan atau keahlian yang kamu miliki yang jarang dimiliki teman-temanmu?",
    ],
  },
  {
    number: 4,
    title: "Gaya Belajarku",
    prompts: [
      "Bagaimana cara belajar yang paling cocok untukmu (melihat, mendengar, praktik, atau membaca/menulis)? Ceritakan satu pengalaman belajar yang berhasil.",
      "Apa yang biasanya menghambat proses belajarmu, dan bagaimana kamu mengatasinya?",
    ],
  },
  // ── Fase 2: Eksplorasi Lingkungan (5-8) ──
  {
    number: 5,
    title: "Dunia Profesi",
    prompts: [
      "Pilih satu profesi yang membuatmu penasaran. Apa yang sebenarnya dikerjakan orang dalam profesi itu sehari-hari? Apa yang menarik darinya?",
      "Keterampilan apa yang dibutuhkan profesi tersebut? Apakah kamu sudah memiliki sebagian dari keterampilan itu?",
    ],
  },
  {
    number: 6,
    title: "Wawancara Mini",
    prompts: [
      "Ajak bicara (langsung atau lewat artikel/video) seseorang yang bekerja di bidang yang kamu minati. Apa pelajaran terpenting yang kamu dapat dari kisahnya?",
      "Apa satu hal mengejutkan yang kamu pelajari dari pengalaman orang tersebut tentang dunia kerja?",
    ],
  },
  {
    number: 7,
    title: "Jurusan & Jalur Studi",
    prompts: [
      "Cari satu jurusan kuliah atau jalur pendidikan yang relevan dengan minatmu. Mata pelajaran/keterampilan apa yang dibutuhkan, dan seberapa cocok dengan dirimu?",
      "Apa rencana cadanganmu jika kamu tidak diterima di jurusan pilihan pertamamu?",
    ],
  },
  {
    number: 8,
    title: "Peluang di Sekitar",
    prompts: [
      "Peluang, komunitas, atau kegiatan apa di sekitarmu (sekolah, kota, online) yang bisa membantu mengembangkan minat kariermu? Bagaimana cara memulainya?",
      "Sebutkan satu langkah kecil yang bisa kamu ambil minggu ini untuk mendekatkan dirimu ke peluang tersebut.",
    ],
  },
  // ── Fase 3: Sintesis & Refleksi (9-12) ──
  {
    number: 9,
    title: "Menghubungkan Titik",
    prompts: [
      "Lihat kembali catatan modul-modul sebelumnya. Pola atau benang merah apa yang kamu temukan antara minat, nilai, dan peluang yang sudah kamu jelajahi?",
      "Apakah ada hal baru tentang dirimu yang baru kamu sadari setelah menjalani modul-modul sebelumnya?",
    ],
  },
  {
    number: 10,
    title: "Membayangkan Masa Depan",
    prompts: [
      "Bayangkan dirimu 5 tahun ke depan dalam versi terbaik. Sedang melakukan apa kamu? Lingkungan seperti apa yang ada di sekitarmu?",
      "Apa satu pencapaian yang ingin kamu raih dalam 5 tahun dan mengapa itu bermakna bagimu?",
    ],
  },
  {
    number: 11,
    title: "Hambatan & Strategi",
    prompts: [
      "Apa hambatan terbesar yang mungkin menghalangimu mencapai arah karier itu? Tuliskan satu strategi konkret untuk menghadapinya.",
      "Siapa orang di sekitarmu yang bisa membantumu mengatasi hambatan tersebut? Bagaimana kamu bisa meminta bantuannya?",
    ],
  },
  {
    number: 12,
    title: "Rencana Langkah Pertama",
    prompts: [
      "Tetapkan satu langkah nyata yang bisa kamu mulai bulan ini menuju arah kariermu. Kapan dan bagaimana kamu akan melakukannya?",
      "Tuliskan satu kalimat komitmen untuk dirimu sendiri tentang perjalanan kariermu ke depan.",
    ],
  },
];

function phaseForNumber(n: number): PhaseInfo {
  return (
    PHASES.find((phase) => n >= phase.range[0] && n <= phase.range[1]) ?? PHASES[0]
  );
}

export const MODULES: ModuleInfo[] = RAW_MODULES.map((mod) => {
  const phase = phaseForNumber(mod.number);
  return {
    ...mod,
    phase: phase.key,
    phaseLabel: phase.label,
    prompt: mod.prompts[0] ?? "",
  };
});

export function getModule(n: number): ModuleInfo | null {
  return MODULES.find((mod) => mod.number === n) ?? null;
}

// Apakah modul ini terkunci oleh paket gratis (freemium)?
export function isPremiumModule(moduleNumber: number): boolean {
  return moduleNumber > FREE_MODULE_LIMIT;
}

// ── Moodboard ──
// Perasaan yang bisa dipilih siswa saat modul terlambat/terkunci. Dikirim ke konselor
// bersama alasan keterlambatan agar pendampingan lebih tepat sasaran.
export type MoodKey =
  | "STRESSED"
  | "CONFUSED"
  | "TIRED"
  | "UNMOTIVATED"
  | "UNWELL"
  | "OKAY";

export type MoodOption = { key: MoodKey; emoji: string; label: string };

export const MOOD_OPTIONS: MoodOption[] = [
  { key: "STRESSED", emoji: "😟", label: "Stres / cemas" },
  { key: "CONFUSED", emoji: "😕", label: "Bingung materi" },
  { key: "TIRED", emoji: "😴", label: "Lelah / capek" },
  { key: "UNMOTIVATED", emoji: "😔", label: "Kurang motivasi" },
  { key: "UNWELL", emoji: "🤒", label: "Kurang sehat" },
  { key: "OKAY", emoji: "🙂", label: "Baik-baik saja" },
];

export function getMood(key: string | null | undefined): MoodOption | null {
  if (!key) return null;
  return MOOD_OPTIONS.find((mood) => mood.key === key) ?? null;
}

export function isValidMood(key: unknown): key is MoodKey {
  return typeof key === "string" && MOOD_OPTIONS.some((mood) => mood.key === key);
}
