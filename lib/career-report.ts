import { prisma } from "./prisma";
import { TOTAL_MODULES } from "./modules";
import { getModuleContents, resolveModule } from "./module-content";

// ---------------------------------------------------------------------------
// Sentiment helpers
// ---------------------------------------------------------------------------

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

// Mapping RIASEC type → human-readable label (Indonesian)
const RIASEC_LABELS: Record<string, string> = {
  riasecRealistic:     "Realistic (Praktis / Teknik)",
  riasecInvestigative: "Investigative (Analitis / Penelitian)",
  riasecArtistic:      "Artistic (Kreatif / Seni)",
  riasecSocial:        "Social (Sosial / Membantu)",
  riasecEnterprising:  "Enterprising (Kepemimpinan / Bisnis)",
  riasecConventional:  "Conventional (Administratif / Terstruktur)",
};

const LEARNING_STYLE_LABELS: Record<string, string> = {
  VISUAL:       "Visual (belajar melalui gambar, diagram, dan tampilan)",
  AUDITORY:     "Auditori (belajar melalui mendengar dan diskusi)",
  KINESTHETIC:  "Kinestetik (belajar melalui praktik dan pengalaman langsung)",
  READ_WRITE:   "Baca/Tulis (belajar melalui membaca dan mencatat)",
  MULTIMODAL:   "Multimodal (fleksibel dengan berbagai gaya belajar)",
};

function countMatches(text: string, words: string[]): number {
  return words.reduce((acc, word) => {
    const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "gi");
    const matches = text.match(re);
    return acc + (matches ? matches.length : 0);
  }, 0);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CareerReportData = {
  summary: string;
  dominantThemes: string;   // CSV
  sentimentLabel: string;   // POSITIF | NETRAL | CAMPURAN
  sentimentScore: number;   // 0-100
  topInterest: string | null;
  isAiGenerated: boolean;
};

type AssessmentSnapshot = {
  riasecRealistic: number;
  riasecInvestigative: number;
  riasecArtistic: number;
  riasecSocial: number;
  riasecEnterprising: number;
  riasecConventional: number;
  riasecTop3: string | null;
  learningStyle: string;
};

type QAPair = { question: string; answer: string };

// ---------------------------------------------------------------------------
// Rule-based fallback (no OpenAI)
// ---------------------------------------------------------------------------

export function buildReportFromText(
  reflections: string[],
  assessment: AssessmentSnapshot | null,
): CareerReportData {
  const corpus = reflections.join(" \n ").toLowerCase();

  // Sentiment
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

  // Dominant themes from journal text
  const themeScores = THEME_KEYWORDS.map((entry) => ({
    theme: entry.theme,
    score: countMatches(corpus, entry.keywords),
  }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((entry) => entry.theme);

  const dominantThemes = themeScores.join(", ");

  // topInterest from RIASEC data (most reliable source)
  let topInterest: string | null = null;
  if (assessment) {
    if (assessment.riasecTop3?.trim()) {
      topInterest = assessment.riasecTop3.trim();
    } else {
      // Derive from scores
      const riasecScores: Record<string, number> = {
        riasecRealistic:     assessment.riasecRealistic,
        riasecInvestigative: assessment.riasecInvestigative,
        riasecArtistic:      assessment.riasecArtistic,
        riasecSocial:        assessment.riasecSocial,
        riasecEnterprising:  assessment.riasecEnterprising,
        riasecConventional:  assessment.riasecConventional,
      };
      const sorted = Object.entries(riasecScores).sort((a, b) => b[1] - a[1]).slice(0, 3);
      topInterest = sorted
        .filter(([, score]) => score > 0)
        .map(([key]) => RIASEC_LABELS[key] ?? key)
        .join(", ") || null;
    }
  }

  // Build summary narrative
  const sentimentSentence =
    sentimentLabel === "POSITIF"
      ? "Secara umum, refleksi perjalananmu menunjukkan sikap yang positif dan antusias terhadap eksplorasi karier."
      : sentimentLabel === "CAMPURAN"
      ? "Refleksimu menunjukkan perasaan yang beragam — ada antusiasme sekaligus keraguan yang wajar dalam proses ini."
      : "Refleksimu menunjukkan sikap yang seimbang dan reflektif terhadap pilihan kariermu.";

  const themeSentence =
    themeScores.length > 0
      ? `Berdasarkan seluruh jawaban journaling, tema karier yang paling menonjol adalah ${dominantThemes}.`
      : "Belum ada tema karier yang dominan — jadikan ini kesempatan untuk menjelajah lebih jauh.";

  const riasecSentence = topInterest
    ? `Hasil Tes RIASEC menunjukkan bahwa tipe minat dominanmu adalah ${topInterest}.`
    : "";

  const learnSentence = assessment
    ? `Gaya belajarmu teridentifikasi sebagai ${LEARNING_STYLE_LABELS[assessment.learningStyle] ?? assessment.learningStyle}, yang dapat kamu manfaatkan dalam memilih jurusan atau lingkungan kerja yang sesuai.`
    : "";

  const summary = [
    `Kamu telah menyelesaikan seluruh ${TOTAL_MODULES} modul eksplorasi karier dan Tes Asesmen. Berikut ringkasan perjalananmu.`,
    sentimentSentence,
    themeSentence,
    riasecSentence,
    learnSentence,
    "Gunakan laporan ini sebagai bahan diskusi bersama guru BK untuk menyusun langkah kariermu selanjutnya.",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    summary,
    dominantThemes,
    sentimentLabel,
    sentimentScore,
    topInterest,
    isAiGenerated: false,
  };
}

// ---------------------------------------------------------------------------
// AI-powered generation (Google Gemini)
// ---------------------------------------------------------------------------

async function generateReportWithAI(
  qaPairs: QAPair[],
  assessment: AssessmentSnapshot | null,
): Promise<CareerReportData | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  try {
    // Build RIASEC section
    let riasecSection = "";
    if (assessment) {
      const riasecScores: Record<string, number> = {
        riasecRealistic:     assessment.riasecRealistic,
        riasecInvestigative: assessment.riasecInvestigative,
        riasecArtistic:      assessment.riasecArtistic,
        riasecSocial:        assessment.riasecSocial,
        riasecEnterprising:  assessment.riasecEnterprising,
        riasecConventional:  assessment.riasecConventional,
      };
      const riasecLines = Object.entries(riasecScores)
        .sort((a, b) => b[1] - a[1])
        .map(([key, score]) => `  - ${RIASEC_LABELS[key] ?? key}: ${score}`)
        .join("\n");
      const top3 = assessment.riasecTop3?.trim() ||
        Object.entries(riasecScores)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .filter(([, s]) => s > 0)
          .map(([k]) => RIASEC_LABELS[k])
          .join(", ");
      riasecSection = `\n\n=== HASIL TES RIASEC ===\nSkor lengkap:\n${riasecLines}\nTiga tipe minat teratas: ${top3 || "–"}`;
    }

    const learnSection = assessment
      ? `\n\n=== GAYA BELAJAR ===\n${LEARNING_STYLE_LABELS[assessment.learningStyle] ?? assessment.learningStyle}`
      : "";

    const journalSection = qaPairs
      .map((qa, i) => `Modul ${i + 1} — ${qa.question}\nJawaban siswa: ${qa.answer}`)
      .join("\n\n");

    const fullPrompt =
      `Anda adalah konselor karier profesional untuk siswa SMA di Indonesia. ` +
      `Analisis SELURUH data eksplorasi karier siswa secara HOLISTIK dan KONSISTEN. ` +
      `Gabungkan jawaban journaling 12 modul, skor RIASEC, dan gaya belajar menjadi satu narasi yang akurat dan suportif. ` +
      `PENTING: Jangan membuat kesimpulan yang tidak didukung data. ` +
      `Jika jawaban siswa menyebut bidang tertentu, pastikan tema yang dihasilkan konsisten dengan RIASEC. ` +
      `Tulis dalam Bahasa Indonesia yang hangat, reflektif, dan profesional.\n\n` +
      `=== JAWABAN JOURNALING 12 MODUL ===\n${journalSection}` +
      riasecSection +
      learnSection +
      `\n\n` +
      `Hasilkan Career Exploration Report dalam format JSON berikut (tanpa markdown, tanpa teks lain):\n` +
      `{\n` +
      `  "summary": "<ringkasan naratif 4-6 kalimat dalam Bahasa Indonesia, menghubungkan jurnal + RIASEC + gaya belajar>",\n` +
      `  "dominantThemes": ["<tema1>", "<tema2>"],\n` +
      `  "sentimentLabel": "<POSITIF | NETRAL | CAMPURAN>",\n` +
      `  "sentimentScore": <angka 0-100>\n` +
      `}`;

    // Gemini REST API — gemini-2.0-flash (free tier, fast)
    const geminiUrl =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.5,
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Gemini API error:", response.status, errBody);
      return null;
    }

    const responseData = await response.json();
    // Gemini response: candidates[0].content.parts[0].text
    const rawText: string =
      responseData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!rawText) {
      console.error("Gemini returned empty text");
      return null;
    }

    // Strip markdown fences if present (safety)
    const jsonText = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

    const parsed = JSON.parse(jsonText) as {
      summary: string;
      dominantThemes: string[];
      sentimentLabel: string;
      sentimentScore: number;
    };

    // Derive topInterest from RIASEC (authoritative source — not inferred by AI)
    let topInterest: string | null = null;
    if (assessment) {
      if (assessment.riasecTop3?.trim()) {
        topInterest = assessment.riasecTop3.trim();
      } else {
        const riasecScores: Record<string, number> = {
          riasecRealistic:     assessment.riasecRealistic,
          riasecInvestigative: assessment.riasecInvestigative,
          riasecArtistic:      assessment.riasecArtistic,
          riasecSocial:        assessment.riasecSocial,
          riasecEnterprising:  assessment.riasecEnterprising,
          riasecConventional:  assessment.riasecConventional,
        };
        topInterest =
          Object.entries(riasecScores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .filter(([, score]) => score > 0)
            .map(([key]) => RIASEC_LABELS[key] ?? key)
            .join(", ") || null;
      }
    }

    return {
      summary: parsed.summary,
      dominantThemes: Array.isArray(parsed.dominantThemes)
        ? parsed.dominantThemes.join(", ")
        : "",
      sentimentLabel: ["POSITIF", "NETRAL", "CAMPURAN"].includes(parsed.sentimentLabel)
        ? parsed.sentimentLabel
        : "NETRAL",
      sentimentScore: Math.max(0, Math.min(100, Math.round(parsed.sentimentScore ?? 50))),
      topInterest,
      isAiGenerated: true,
    };
  } catch (err) {
    console.error("generateReportWithAI (Gemini) error:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Generates (or regenerates) the Career Exploration Report for a student.
 *
 * Requirements before generating:
 *  - All TOTAL_MODULES journal entries must have status COMPLETED
 *  - The student must have completed the Assessment (RIASEC + Learning Style)
 *
 * Returns null if requirements are not met.
 */
export async function generateCareerReport(studentId: string) {
  // 1. Check all 12 modules are completed
  const journals = await prisma.journalProgress.findMany({
    where: { studentId },
    orderBy: { weekNumber: "asc" },
  });

  const completed = journals.filter((j) => j.status === "COMPLETED");
  if (completed.length < TOTAL_MODULES) {
    return null;
  }

  // 2. Fetch assessment (RIASEC + learning style) — required for holistic report
  const assessment = await prisma.assessment.findFirst({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    select: {
      riasecRealistic: true,
      riasecInvestigative: true,
      riasecArtistic: true,
      riasecSocial: true,
      riasecEnterprising: true,
      riasecConventional: true,
      riasecTop3: true,
      learningStyle: true,
    },
  });

  // Assessment is required to generate a holistic report
  if (!assessment) {
    return null;
  }

  // 3. Build Q&A pairs from journals (for AI prompt)
  const contents = await getModuleContents();
  const qaPairs: QAPair[] = completed
    .filter((j) => j.reflectionText?.trim())
    .map((j) => ({
      question:
        resolveModule(j.weekNumber, contents)?.prompt || `Refleksi modul ${j.weekNumber}`,
      answer: j.reflectionText!.trim(),
    }));

  const reflections = completed
    .map((j) => j.reflectionText?.trim() || "")
    .filter(Boolean);

  // 4. Generate report (AI preferred, rule-based fallback)
  const data =
    (await generateReportWithAI(qaPairs, assessment)) ??
    buildReportFromText(reflections, assessment);

  // 5. Upsert into database
  return prisma.careerExplorationReport.upsert({
    where: { studentId },
    create: { studentId, ...data },
    update: { ...data },
  });
}
