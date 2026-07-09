// Generator Career Exploration Report (AI Insight) — versi MOCK rule-based.
//
// Setelah siswa menyelesaikan 12 modul, laporan dirakit dari seluruh teks journaling:
// analisis sentimen sederhana + ekstraksi tema karier dominan + minat RIASEC teratas.
// `isAiGenerated=false` menandai ini pratinjau; integrasi AI penuh = roadmap.

import { prisma } from "./prisma";
import { TOTAL_MODULES } from "./modules";
import { getModuleContents, resolveModule } from "./module-content";

// Kamus kecil Bahasa Indonesia untuk sentimen.
const POSITIVE_WORDS = [
  "senang", "suka", "tertarik", "semangat", "bangga", "yakin", "mampu", "berhasil",
  "menikmati", "antusias", "percaya", "optimis", "puas", "nyaman", "berkembang",
  "termotivasi", "menyenangkan", "bersyukur", "harapan", "bisa",
];
const NEGATIVE_WORDS = [
  "bingung", "takut", "cemas", "khawatir", "sulit", "susah", "gagal", "ragu",
  "bosan", "lelah", "stres", "kecewa", "bimbang", "minder", "menyerah", "berat",
  "tidak yakin", "kesulitan", "putus asa", "malas",
];

// Kamus tema karier: label tema -> kata kunci pemicu.
const THEME_KEYWORDS: Array<{ theme: string; keywords: string[] }> = [
  { theme: "Teknologi & Komputer", keywords: ["komputer", "teknologi", "coding", "program", "software", "aplikasi", "digital", "data"] },
  { theme: "Seni & Kreativitas", keywords: ["seni", "desain", "gambar", "kreatif", "menulis", "musik", "lukis", "estetika"] },
  { theme: "Sosial & Membantu Orang", keywords: ["membantu", "orang", "sosial", "mengajar", "peduli", "masyarakat", "empati", "relawan"] },
  { theme: "Sains & Penelitian", keywords: ["sains", "penelitian", "eksperimen", "analisis", "ilmiah", "riset", "menyelidiki", "logika"] },
  { theme: "Bisnis & Kepemimpinan", keywords: ["bisnis", "usaha", "memimpin", "wirausaha", "jual", "uang", "organisasi", "manajemen"] },
  { theme: "Kesehatan", keywords: ["kesehatan", "dokter", "perawat", "medis", "rumah sakit", "obat", "tubuh"] },
  { theme: "Teknik & Praktik", keywords: ["mesin", "alat", "teknik", "membangun", "memperbaiki", "konstruksi", "praktik", "merakit"] },
  { theme: "Pendidikan", keywords: ["belajar", "sekolah", "guru", "pendidikan", "kuliah", "jurusan", "ilmu"] },
];

function countMatches(text: string, words: string[]): number {
  return words.reduce((acc, word) => {
    const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "gi");
    const matches = text.match(re);
    return acc + (matches ? matches.length : 0);
  }, 0);
}

export type CareerReportData = {
  summary: string;
  dominantThemes: string; // CSV
  sentimentLabel: string; // POSITIF | NETRAL | CAMPURAN
  sentimentScore: number; // 0-100
  topInterest: string | null;
  isAiGenerated: boolean;
};

export function buildReportFromText(
  reflections: string[]
): CareerReportData {
  const corpus = reflections.join(" \n ").toLowerCase();

  // Sentimen
  const pos = countMatches(corpus, POSITIVE_WORDS);
  const neg = countMatches(corpus, NEGATIVE_WORDS);
  const totalSentiment = pos + neg;
  const sentimentScore =
    totalSentiment === 0 ? 50 : Math.round((pos / totalSentiment) * 100);
  let sentimentLabel: string;
  if (totalSentiment === 0) {
    sentimentLabel = "NETRAL";
  } else if (sentimentScore >= 65) {
    sentimentLabel = "POSITIF";
  } else if (sentimentScore <= 40) {
    sentimentLabel = "CAMPURAN";
  } else {
    sentimentLabel = "NETRAL";
  }

  // Tema dominan (top 3 yang muncul)
  const themeScores = THEME_KEYWORDS.map((entry) => ({
    theme: entry.theme,
    score: countMatches(corpus, entry.keywords),
  }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((entry) => entry.theme);

  const dominantThemes = themeScores.join(", ");
  // Laporan hanya merangkum modul eksplorasi; hasil RIASEC/gaya belajar tidak disertakan.
  const topInterest = null;

  // Ringkasan
  const sentimentSentence =
    sentimentLabel === "POSITIF"
      ? "Secara umum, refleksimu menunjukkan sikap yang positif dan antusias terhadap perjalanan kariermu."
      : sentimentLabel === "CAMPURAN"
        ? "Refleksimu menunjukkan perasaan yang beragam — ada antusiasme sekaligus keraguan yang wajar dalam proses eksplorasi."
        : "Refleksimu menunjukkan sikap yang cukup seimbang dan reflektif terhadap pilihan kariermu.";

  const themeSentence =
    themeScores.length > 0
      ? `Tema karier yang paling sering muncul dalam tulisanmu adalah ${dominantThemes}.`
      : "Belum ada tema karier dominan yang menonjol secara jelas — ini kesempatan untuk menjelajah lebih jauh.";

  const summary = [
    `Kamu telah menyelesaikan seluruh ${TOTAL_MODULES} modul eksplorasi karier. Berikut ringkasan perjalananmu.`,
    sentimentSentence,
    themeSentence,
    "Gunakan laporan ini sebagai bahan diskusi bersama guru BK untuk menyusun langkah selanjutnya.",
  ].join(" ");

  return {
    summary,
    dominantThemes,
    sentimentLabel,
    sentimentScore,
    topInterest,
    isAiGenerated: false,
  };
}

// ── Integrasi AI sungguhan (Claude API) ──
// Menghasilkan report via Claude. Mengembalikan null bila ANTHROPIC_API_KEY tidak
// di-set atau panggilan gagal, sehingga pemanggil jatuh ke generator mock.

type QAPair = { question: string; answer: string };

const REPORT_SCHEMA = {
  type: "object",
  properties: {
    summary: {
      type: "string",
      description: "Ringkasan naratif 3-5 kalimat perjalanan eksplorasi karier siswa, dalam Bahasa Indonesia, hangat dan suportif.",
    },
    dominantThemes: {
      type: "array",
      items: { type: "string" },
      description: "2-4 tema karier dominan (mis. 'Teknologi', 'Seni & Kreativitas').",
    },
    sentimentLabel: {
      type: "string",
      enum: ["POSITIF", "NETRAL", "CAMPURAN"],
    },
    sentimentScore: {
      type: "integer",
      description: "Skor sentimen positif 0-100.",
    },
  },
  required: ["summary", "dominantThemes", "sentimentLabel", "sentimentScore"],
  additionalProperties: false,
} as const;

async function generateReportWithAI(
  qaPairs: QAPair[]
): Promise<CareerReportData | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  try {
    const journalText = qaPairs
      .map((qa, i) => `Modul ${i + 1} — ${qa.question}\nJawaban siswa: ${qa.answer}`)
      .join("\n\n");

    const systemPrompt =
      "Anda adalah asisten konselor karier untuk siswa SMA di Indonesia. " +
      "Analisis jawaban journaling eksplorasi karier siswa dan hasilkan laporan ringkas " +
      "yang reflektif, akurat, dan suportif. Gunakan Bahasa Indonesia yang baik. " +
      "Jangan mengarang fakta yang tidak ada dalam jawaban siswa.";

    const userPrompt =
      `Berikut seluruh jawaban journaling eksplorasi karier seorang siswa selama 12 modul.\n\n` +
      `${journalText}\n\n` +
      `Hasilkan Career Exploration Report sesuai skema HANYA berdasarkan jawaban modul di atas. ` +
      `Jangan menyertakan hasil tes RIASEC atau gaya belajar.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "career_report",
            strict: true,
            schema: {
              type: "object",
              properties: {
                summary: {
                  type: "string",
                  description: "Ringkasan naratif 3-5 kalimat perjalanan eksplorasi karier siswa, dalam Bahasa Indonesia, hangat dan suportif."
                },
                dominantThemes: {
                  type: "array",
                  items: { type: "string" },
                  description: "2-4 tema karier dominan (mis. 'Teknologi', 'Seni & Kreativitas')."
                },
                sentimentLabel: {
                  type: "string",
                  enum: ["POSITIF", "NETRAL", "CAMPURAN"]
                },
                sentimentScore: {
                  type: "integer",
                  description: "Skor sentimen positif 0-100."
                }
              },
              required: ["summary", "dominantThemes", "sentimentLabel", "sentimentScore"],
              additionalProperties: false
            }
          }
        },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const responseData = await response.json();
    const content = responseData?.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as {
      summary: string;
      dominantThemes: string[];
      sentimentLabel: string;
      sentimentScore: number;
    };

    return {
      summary: parsed.summary,
      dominantThemes: Array.isArray(parsed.dominantThemes)
        ? parsed.dominantThemes.join(", ")
        : "",
      sentimentLabel: ["POSITIF", "NETRAL", "CAMPURAN"].includes(parsed.sentimentLabel)
        ? parsed.sentimentLabel
        : "NETRAL",
      sentimentScore: Math.max(0, Math.min(100, Math.round(parsed.sentimentScore ?? 50))),
      topInterest: null,
      isAiGenerated: true,
    };
  } catch {
    // Jatuh ke generator mock bila AI gagal (key salah, kuota, jaringan, dll).
    return null;
  }
}

/**
 * Membuat / memperbarui Career Exploration Report untuk siswa.
 * Mengembalikan null bila siswa belum menyelesaikan seluruh modul.
 * Memakai Claude API bila tersedia; jika tidak, jatuh ke generator rule-based (mock).
 */
export async function generateCareerReport(studentId: string) {
  const journals = await prisma.journalProgress.findMany({
    where: { studentId },
    orderBy: { weekNumber: "asc" },
  });

  const completed = journals.filter((j) => j.status === "COMPLETED");
  if (completed.length < TOTAL_MODULES) {
    return null;
  }

  const reflections = completed
    .map((j) => j.reflectionText?.trim() || "")
    .filter(Boolean);

  const contents = await getModuleContents();
  const qaPairs: QAPair[] = completed
    .filter((j) => j.reflectionText?.trim())
    .map((j) => ({
      question:
        resolveModule(j.weekNumber, contents)?.prompt || `Refleksi modul ${j.weekNumber}`,
      answer: j.reflectionText!.trim(),
    }));

  // Coba AI dulu; bila tidak tersedia, pakai mock rule-based.
  // Laporan hanya merangkum modul eksplorasi (tanpa RIASEC/gaya belajar).
  const data =
    (await generateReportWithAI(qaPairs)) ??
    buildReportFromText(reflections);

  return prisma.careerExplorationReport.upsert({
    where: { studentId },
    create: { studentId, ...data },
    update: { ...data },
  });
}
