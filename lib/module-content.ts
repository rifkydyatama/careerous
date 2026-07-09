// Konten modul yang dapat dikelola admin. Default berasal dari lib/modules.ts;
// admin dapat menimpanya via tabel ModuleContent. Fungsi-fungsi ini server-side.

import { prisma } from "./prisma";
import { MODULES, getModule } from "./modules";

export type ModuleContentItem = {
  number: number;
  title: string;
  prompt: string;
  prompts: string[];
  phaseLabel: string;
  deadlineAt: Date | null; // batas waktu absolut modul (diatur admin)
};

export function parsePrompts(promptStr: string): string[] {
  if (!promptStr) return [];
  if (promptStr.includes("|||")) {
    return promptStr.split("|||").map((p) => p.trim()).filter(Boolean);
  }
  if (promptStr.includes("\n\n")) {
    return promptStr.split("\n\n").map((p) => p.trim()).filter(Boolean);
  }
  return [promptStr.trim()];
}

// Pastikan 12 baris konten ada (di-seed dari default bila belum).
export async function ensureModuleContents(): Promise<void> {
  const existing = await prisma.moduleContent.findMany({ select: { number: true } });
  const have = new Set(existing.map((m) => m.number));
  const missing = MODULES.filter((m) => !have.has(m.number)).map((m) => ({
    number: m.number,
    title: m.title,
    prompt: m.prompt,
    phaseLabel: m.phaseLabel,
  }));
  if (missing.length > 0) {
    await prisma.moduleContent.createMany({ data: missing, skipDuplicates: true });
  }
}

// Map nomor modul -> konten (DB override, fallback default).
export async function getModuleContents(): Promise<Map<number, ModuleContentItem>> {
  const rows = await prisma.moduleContent.findMany();
  const map = new Map<number, ModuleContentItem>();
  for (const m of MODULES) {
    map.set(m.number, {
      number: m.number,
      title: m.title,
      prompt: m.prompt,
      prompts: m.prompts,
      phaseLabel: m.phaseLabel,
      deadlineAt: null,
    });
  }
  for (const row of rows) {
    map.set(row.number, {
      number: row.number,
      title: row.title,
      prompt: row.prompt,
      prompts: parsePrompts(row.prompt),
      phaseLabel: row.phaseLabel,
      deadlineAt: row.deadlineAt ?? null,
    });
  }
  return map;
}

// Konten satu modul (DB override, fallback default). `contents` opsional untuk reuse.
export function resolveModule(
  n: number,
  contents?: Map<number, ModuleContentItem>
): ModuleContentItem | null {
  if (contents?.has(n)) return contents.get(n)!;
  const def = getModule(n);
  if (!def) return null;
  return {
    number: def.number,
    title: def.title,
    prompt: def.prompt,
    prompts: def.prompts,
    phaseLabel: def.phaseLabel,
    deadlineAt: null,
  };
}

// Batas waktu absolut satu modul (null bila belum diatur admin).
export async function getModuleDeadline(n: number): Promise<Date | null> {
  const row = await prisma.moduleContent.findUnique({
    where: { number: n },
    select: { deadlineAt: true },
  });
  return row?.deadlineAt ?? null;
}
