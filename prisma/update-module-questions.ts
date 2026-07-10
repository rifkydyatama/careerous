import "dotenv/config";
import { prisma } from "../lib/prisma";
import { MODULES } from "../lib/modules";

async function main() {
  console.log("Updating module contents in the database...");
  for (const m of MODULES) {
    await prisma.moduleContent.upsert({
      where: { number: m.number },
      update: {
        title: m.title,
        prompt: m.prompt,
        phaseLabel: m.phaseLabel,
      },
      create: {
        number: m.number,
        title: m.title,
        prompt: m.prompt,
        phaseLabel: m.phaseLabel,
      },
    });
    console.log(`Updated module ${m.number}: ${m.title}`);
  }
  console.log("Database update completed successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
