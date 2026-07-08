// Gamifikasi: poin & lencana dihitung dari progres modul + asesmen.
// Fungsi murni (tanpa akses DB) — aman dipakai di client maupun server.

import { PHASES, TOTAL_MODULES } from "./modules";

export const POINTS_PER_MODULE = 10;
export const POINTS_PER_PHASE = 25;
export const POINTS_ASSESSMENT = 20;

export type Badge = {
  key: string;
  label: string;
  description: string;
  earned: boolean;
};

export type GamificationState = {
  points: number;
  completedModules: number;
  totalModules: number;
  phasesCompleted: number;
  level: number;
  levelLabel: string;
  badges: Badge[];
};

function isPhaseComplete(completed: Set<number>, range: [number, number]): boolean {
  for (let n = range[0]; n <= range[1]; n += 1) {
    if (!completed.has(n)) return false;
  }
  return true;
}

function levelFor(points: number): { level: number; label: string } {
  if (points >= 165) return { level: 4, label: "Navigator Karier" };
  if (points >= 100) return { level: 3, label: "Penjelajah Mahir" };
  if (points >= 50) return { level: 2, label: "Penjelajah Aktif" };
  return { level: 1, label: "Pemula" };
}

export function computeGamification(
  completedModuleNumbers: number[],
  hasAssessment: boolean
): GamificationState {
  const completed = new Set(completedModuleNumbers);
  const completedCount = completed.size;

  const phasesCompleted = PHASES.filter((p) => isPhaseComplete(completed, p.range)).length;

  const points =
    completedCount * POINTS_PER_MODULE +
    phasesCompleted * POINTS_PER_PHASE +
    (hasAssessment ? POINTS_ASSESSMENT : 0);

  const { level, label } = levelFor(points);

  const badges: Badge[] = [
    {
      key: "first-step",
      label: "Langkah Pertama",
      description: "Menyelesaikan modul pertama.",
      earned: completed.has(1),
    },
    {
      key: "self-aware",
      label: "Kenali Diri",
      description: "Menyelesaikan Tes RIASEC.",
      earned: hasAssessment,
    },
    {
      key: "self-explorer",
      label: "Penjelajah Diri",
      description: "Menuntaskan fase Eksplorasi Diri (modul 1–4).",
      earned: isPhaseComplete(completed, [1, 4]),
    },
    {
      key: "halfway",
      label: "Separuh Jalan",
      description: "Menyelesaikan 6 modul.",
      earned: completedCount >= 6,
    },
    {
      key: "world-explorer",
      label: "Penjelajah Lingkungan",
      description: "Menuntaskan fase Eksplorasi Lingkungan (modul 5–8).",
      earned: isPhaseComplete(completed, [5, 8]),
    },
    {
      key: "synthesizer",
      label: "Sang Sintesis",
      description: "Menuntaskan fase Sintesis & Refleksi (modul 9–12).",
      earned: isPhaseComplete(completed, [9, 12]),
    },
    {
      key: "graduate",
      label: "Lulusan Eksplorasi",
      description: "Menyelesaikan seluruh 12 modul.",
      earned: completedCount >= TOTAL_MODULES,
    },
  ];

  return {
    points,
    completedModules: completedCount,
    totalModules: TOTAL_MODULES,
    phasesCompleted,
    level,
    levelLabel: label,
    badges,
  };
}
