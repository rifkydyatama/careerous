import { prisma } from './lib/prisma';

async function main() {
  const users = await prisma.user.findMany();
  console.log("Users:", users);
  
  const journals = await prisma.journalProgress.findMany();
  console.log("Journals count:", journals.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
