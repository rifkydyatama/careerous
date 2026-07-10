import { prisma } from "./prisma";
import { MODULES, getModule, parseModulePrompt } from "./modules";

export type ModuleContentItem = {
  number: number;
  title: string;
  introduction: string | null;
  prompt: string;
  prompts: string[];
  phaseLabel: string;
  deadlineAt: Date | null; 
};

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

export async function getModuleContents(): Promise<Map<number, ModuleContentItem>> {
  const rows = await prisma.moduleContent.findMany();
  const map = new Map<number, ModuleContentItem>();
  for (const m of MODULES) {
    map.set(m.number, {
      number: m.number,
      title: m.title,
      introduction: m.introduction,
      prompt: m.prompt,
      prompts: m.prompts,
      phaseLabel: m.phaseLabel,
      deadlineAt: null,
    });
  }
  for (const row of rows) {
    const { introduction, prompts } = parseModulePrompt(row.prompt);
    map.set(row.number, {
      number: row.number,
      title: row.title,
      introduction,
      prompt: row.prompt,
      prompts,
      phaseLabel: row.phaseLabel,
      deadlineAt: row.deadlineAt ?? null,
    });
  }
  return map;
}

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
    introduction: def.introduction,
    prompt: def.prompt,
    prompts: def.prompts,
    phaseLabel: def.phaseLabel,
    deadlineAt: null,
  };
}

export async function getModuleDeadline(n: number, institutionId?: string | null): Promise<Date | null> {
  if (institutionId) {
    const schoolDeadline = await prisma.institutionModuleDeadline.findUnique({
      where: {
        institutionId_moduleNumber: {
          institutionId,
          moduleNumber: n,
        },
      },
    });
    if (schoolDeadline) {
      return schoolDeadline.deadlineAt;
    }
  }
  const row = await prisma.moduleContent.findUnique({
    where: { number: n },
    select: { deadlineAt: true },
  });
  return row?.deadlineAt ?? null;
}
