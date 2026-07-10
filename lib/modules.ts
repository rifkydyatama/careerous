export const TOTAL_MODULES = 12;
export const FREE_MODULE_LIMIT = 4;

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
  introduction: string | null;
  prompts: string[];
  prompt: string;
};

export function parseModulePrompt(promptStr: string): { introduction: string | null; prompts: string[] } {
  if (!promptStr) return { introduction: null, prompts: [] };
  
  if (promptStr.includes("---")) {
    const parts = promptStr.split("---").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) {
      const firstIsIntro = parts[0].toLowerCase().startsWith("pengantar:") || parts[0].toLowerCase().startsWith("[pengantar]");
      const introduction = firstIsIntro 
        ? parts[0].replace(/^(pengantar:|\[pengantar\])\s*/i, "").trim()
        : null;
      
      const prompts = firstIsIntro ? parts.slice(1) : parts;
      return { introduction, prompts };
    }
  }

  // Fallback parsing by ||| or \n\n
  let prompts: string[] = [];
  if (promptStr.includes("|||")) {
    prompts = promptStr.split("|||").map((p) => p.trim()).filter(Boolean);
  } else if (promptStr.includes("\n\n")) {
    prompts = promptStr.split("\n\n").map((p) => p.trim()).filter(Boolean);
  } else {
    prompts = [promptStr.trim()];
  }

  return {
    introduction: null,
    prompts,
  };
}

const RAW_MODULES: Array<Omit<ModuleInfo, "phase" | "phaseLabel" | "introduction" | "prompts">> = [
  {
    number: 1,
    title: "Siapa Aku?",
    prompt: `Pengantar: Sebelum kamu mulai menjelajahi dunia karier, hal pertama yang perlu kamu lakukan adalah mengenal diri sendiri. Bukan tentang nilai rapor atau prestasi akademis, tapi tentang siapa kamu sesungguhnya.
---
Ceritakan 3 momen dalam hidupmu di mana kamu merasa paling bersemangat dan bahagia. Bisa dari hal kecil sekalipun! Kenapa momen itu berkesan buat kamu?
---
Apa 3 hal yang paling kamu nikmati dalam keseharian? (Boleh hobi, kebiasaan, atau aktivitas apapun)
---
Kalau orang-orang terdekatmu diminta mendeskripsikan kamu dalam 5 kata, kira-kira kata apa yang akan mereka pilih? Dan apakah kamu setuju dengan deskripsi itu?`
  },
  {
    number: 2,
    title: "Aku dan Hasil Tesku",
    prompt: `Pengantar: Kamu sudah mengerjakan tes RIASEC dan tes gaya belajar di awal program. Sekarang saatnya kita gali lebih dalam apa artinya hasil tes itu buat kamu?
---
Tuliskan hasil tes RIASEC-mu. Apakah hasilnya mengejutkan atau justru sudah sesuai dengan yang kamu rasakan selama ini?
---
Dari 6 tipe RIASEC (Realistic, Investigative, Artistic, Social, Enterprising, Conventional), tipe mana yang menurutmu paling menggambarkan dirimu? Apakah sama dengan hasil tesmu?
---
Bagaimana dengan gaya belajarmu? Apakah kamu sudah merasakannya dalam kehidupan sehari-hari? Berikan contoh konkretnya!
---
Kalau ada hasil tes yang menurutmu kurang tepat, ceritakan kenapa kamu tidak setuju.`
  },
  {
    number: 3,
    title: "Aku di Sekolah",
    prompt: `Pengantar: Tanpa kamu sadari, aktivitas sehari-hari di sekolah sudah banyak mengungkap kekuatan dan minat yang kamu miliki. Sekarang saatnya kita perhatikan hal itu lebih dalam.
---
Mata pelajaran apa yang paling kamu sukai? Bukan yang nilainya paling bagus ya, tapi yang paling kamu nikmati saat belajarnya. Kenapa?
---
Kalau ada tugas sekolah yang bikin kamu lupa waktu karena terlalu asyik mengerjakannya, tugas seperti apa itu?
---
Kegiatan ekstrakurikuler atau organisasi apa yang kamu ikuti? Apa yang paling kamu sukai dari kegiatan itu?
---
Dari semua yang kamu tulis di atas, kira-kira kekuatan apa yang kamu punya yang mungkin belum kamu sadari sebelumnya?`
  },
  {
    number: 4,
    title: "Kompas Hidupku",
    prompt: `Pengantar: Sebelum kamu mulai menjelajahi dunia karier di luar sana, ada satu hal penting yang perlu kamu tentukan dulu, nilai-nilai hidup apa yang paling penting buat kamu? Ini akan jadi kompas yang membantumu menilai apakah sebuah karier cocok untukmu atau tidak.
---
Dari daftar berikut, urutkan dari nilai yang paling penting buat kamu dalam hidup, lalu jelaskan kenapa: (Kebebasan berekspresi, Stabilitas dan keamanan finansial, Membantu orang lain, Kreativitas, Pengakuan dan prestasi, Keseimbangan kerja dan kehidupan pribadi, Petualangan dan hal-hal baru, Kebersamaan dan teamwork, Kemandirian, Dampak sosial yang besar)
---
Bayangkan hidupmu 10 tahun ke depan, bukan soal karier spesifiknya dulu, tapi gaya hidupnya. Kamu tinggal di mana? Keseharianmu seperti apa? Kamu merasa puas dengan apa?
---
Ada tidak nilai hidup yang kamu pegang tapi justru sering dipertentangkan oleh orang-orang di sekitarmu (misalnya keluarga atau teman)? Bagaimana kamu menyikapinya?`
  },
  {
    number: 5,
    title: "Profesi Impianku di Bawah Kaca Pembesar 🔍",
    prompt: `Pengantar: Sekarang saatnya kamu mulai menjelajahi dunia di luar dirimu! Di modul ini, kamu akan menggali lebih dalam tentang profesi yang selama ini menarik minatmu. Bukan sekadar tahu namanya, tapi benar-benar memahami seperti apa kehidupan nyata di profesi itu.
---
Pilih satu profesi yang paling menarik minatmu saat ini. Kenapa profesi itu yang kamu pilih?
---
Cari informasi tentang profesi tersebut dari minimal 2 sumber berbeda (artikel, video, podcast, LinkedIn, dll). Tuliskan sumber yang kamu gunakan!
---
Apa yang sebenarnya dikerjakan orang di profesi ini sehari-hari?
---
Skill dan pendidikan apa yang biasanya dibutuhkan?
---
Apa yang menarik dari profesi ini menurutmu?
---
Apa yang menurutmu akan menjadi tantangan terbesarnya?
---
Setelah riset, apakah minatmu terhadap profesi ini semakin kuat, sama saja, atau justru berubah? Ceritakan!`
  },
  {
    number: 6,
    title: "Profesi Apa yang Cocok Untukku? 🎯",
    prompt: `Pengantar: Di modul sebelumnya kamu mengeksplorasi profesi impianmu sendiri. Sekarang saatnya kamu menjelajahi profesi-profesi yang direkomendasikan berdasarkan hasil tes RIASEC-mu. Siapa tahu ada profesi yang belum pernah kamu bayangkan sebelumnya tapi ternyata sangat cocok!
---
Lihat kembali hasil tes RIASEC-mu. Profesi apa saja yang biasanya direkomendasikan untuk tipe kepribadianmu?
---
Pilih 2 profesi dari rekomendasi RIASEC yang paling menarik perhatianmu (boleh yang sudah dikenal atau baru). Sebutkan kedua profesi tersebut!
---
Untuk Profesi Pertama: Apa yang dikerjakan sehari-hari, apa kesamaannya dengan kepribadian RIASEC-mu, dan kenapa menarik bagimu?
---
Untuk Profesi Kedua: Apa yang dikerjakan sehari-hari, apa kesamaannya dengan kepribadian RIASEC-mu, dan kenapa menarik bagimu?
---
Dari kedua profesi tersebut, mana yang lebih sesuai denganmu? Apakah ada hal yang mengejutkan?
---
Apakah ada kesamaan antara profesi impianmu (Modul 5) dengan rekomendasi RIASEC-mu? Atau justru berbeda jauh?`
  },
  {
    number: 7,
    title: "Ngobrol Sama yang Sudah Duluan! 🎤",
    prompt: `Pengantar: Riset dari internet itu penting, tapi tidak ada yang bisa menggantikan cerita langsung dari orang yang sudah menjalani profesi tersebut. Di modul ini, kamu akan melakukan wawancara dengan seseorang yang bekerja di bidang yang paling menarik minatmu, boleh keluarga, kenalan, atau siapapun yang kamu kenal!
---
Tentukan siapa yang akan kamu wawancara dan di bidang apa mereka bekerja. Kenapa kamu memilih orang ini?
---
Tuliskan ringkasan jalannya wawancara dan jawaban narasumber atas pertanyaan-pertanyaan yang diajukan.
---
Apa saja pelajaran penting yang kamu dapatkan dari wawancara tersebut?
---
Apa hal paling mengejutkan atau paling berkesan dari kisah narasumber?
---
Setelah melakukan wawancara langsung ini, apakah minatmu terhadap profesi tersebut berubah? Jelaskan!`
  },
  {
    number: 8,
    title: "Ngobrol Lagi, Perspektif Baru! 🎤✨",
    prompt: `Pengantar: Wawancara pertamamu pasti sudah membuka banyak perspektif baru! Sekarang saatnya kamu melakukan wawancara kedua kali ini dengan seseorang yang bekerja di bidang yang direkomendasikan oleh hasil RIASEC-mu. Ini mungkin bidang yang belum pernah kamu bayangkan sebelumnya, jadi buka pikiranmu selebar-lebarnya ya!
---
Tentukan siapa yang akan kamu wawancara dan di bidang apa mereka bekerja. Apakah bidang ini sesuai dengan rekomendasi RIASEC-mu?
---
Tuliskan ringkasan jalannya wawancara kedua ini dan jawaban narasumber atas pertanyaan yang diajukan.
---
Bandingkan wawancara pertama (Modul 7) dan kedua ini. Apa perbedaan dan persamaan penting yang kamu temukan?
---
Dari kedua profesi yang sudah kamu telusuri lewat wawancara, profesi mana yang menurutmu lebih menarik untuk masa depanmu? Kenapa?`
  },
  {
    number: 9,
    title: "Setelah Ngobrol Sama Mereka",
    prompt: `Pengantar: Kamu udah ngobrol sama dua orang yang beneran menjalani profesi itu. Sekarang, yuk kita renungin lagi apa aja yang berubah dari semua obrolan itu?
---
Dari obrolan Modul 7 dan 8, ceritakan bagian mana yang ternyata berbeda jauh dari bayangan awalmu tentang dunia kerja (keseharian, tantangan, atau perjalanan karier narasumber).
---
Hubungkan dengan nilai hidupmu (Modul 4). Nilai mana yang ada di profesi-profesi tersebut, dan mana yang tidak cocok?
---
Apakah pandanganmu tentang arti "bekerja" berubah setelah melewati eksplorasi dan wawancara ini? Jika ya, jelaskan perubahannya.
---
Apakah ada profesi lain yang tiba-tiba terpikirkan atau mulai menarik perhatianmu setelah mendengar cerita narasumber?`
  },
  {
    number: 10,
    title: "Milih di Antara Banyak Pilihan 🗺️",
    prompt: `Pengantar: Sekarang kamu udah punya banyak bahan: profesi impianmu, rekomendasi dari tes RIASEC, sama cerita dari dua orang yang udah ngejalanin. Yuk kita coba lihat semuanya bareng-bareng, biar makin jelas mana yang paling cocok buat kamu.
---
Sebutkan 2–3 profesi paling menarik sejauh ini. Jelaskan apa yang membuatmu tertarik, apa yang masih membuatmu ragu, dan seberapa cocok profesi tersebut dengan nilai hidupmu (Modul 4).
---
Jika membayangkan menjalani pekerjaan itu sehari-hari, mana yang dirasa paling pas dan nyaman dari segi minat, nilai, dan kekuatan pribadimu? Apa alasannya?
---
Jika masih bingung di antara beberapa pilihan, tuliskan kendala atau kebingungan yang sedang kamu rasakan saat ini secara jujur.`
  },
  {
    number: 11,
    title: "Langkah Nyata Mulai Sekarang 🎯",
    prompt: `Pengantar: Punya rencana itu penting, tapi hidup juga sering nggak sesuai rencana dan itu wajar banget! Di modul ini, kamu bakal bikin langkah-langkah konkret, sekaligus siap-siap kalau ada hal nggak terduga di jalan.
---
Pilih 1 atau maksimal 2 profesi yang ingin kamu fokuskan saat ini.
---
Tuliskan rencana aksi jangka pendekmu (semester ini/tahun ini), jangka menengah (1–2 tahun ke depan, seperti jurusan/kursus), dan jangka panjang (5–10 tahun ke depan).
---
Hambatan apa saja yang mungkin menghadang rencanamu (biaya, restu, nilai, dll), dan apa rencana cadanganmu (Back-up Plan)?
---
Siapa saja pendukung (support system) yang bisa membantumu di perjalanan ini, dan apa bantuan yang kamu harapkan dari mereka?`
  },
  {
    number: 12,
    title: "Surat Buat Diriku di Masa Depan ✉️",
    prompt: `Pengantar: Ini modul terakhir dari perjalanan panjangmu, 11 modul refleksi dan eksplorasi diri! Sekarang saatnya nulis surat buat diri kamu sendiri, sebagai kenang-kenangan dari siapa kamu hari ini.
---
Tulis surat hangat untuk dirimu sendiri 5–10 tahun ke depan, menceritakan proses refleksi yang sudah kamu lalui di program ini.
---
Apa hal terpenting tentang dirimu (alasan awal, nilai, atau perjuanganmu) yang ingin kamu ingatkan jika suatu saat nanti kamu merasa lelah atau ragu di masa depan?
---
Apa harapan terbesarmu untuk dirimu di masa depan, dan pesan penyemangat apa yang ingin kamu sampaikan?
---
Tuliskan 1–2 pertanyaan reflektif yang ingin kamu tanyakan kepada dirimu di masa depan (misal: "Apakah kamu bahagia dengan pilihanmu saat ini?").`
  },
];

function phaseForNumber(n: number): PhaseInfo {
  return (
    PHASES.find((phase) => n >= phase.range[0] && n <= phase.range[1]) ?? PHASES[0]
  );
}

export const MODULES: ModuleInfo[] = RAW_MODULES.map((mod) => {
  const phase = phaseForNumber(mod.number);
  const { introduction, prompts } = parseModulePrompt(mod.prompt);
  return {
    ...mod,
    phase: phase.key,
    phaseLabel: phase.label,
    introduction,
    prompts,
  };
});

export function getModule(n: number): ModuleInfo | null {
  return MODULES.find((mod) => mod.number === n) ?? null;
}

export function isPremiumModule(moduleNumber: number): boolean {
  return moduleNumber > FREE_MODULE_LIMIT;
}

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
