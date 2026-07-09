import { prisma } from './lib/prisma';

async function main() {
  const SELECT = {
    id: true,
    months: true,
    note: true,
    status: true,
    decisionNote: true,
    decidedAt: true,
    createdAt: true,
    institution: {
      select: {
        id: true,
        name: true,
        subscriptionActive: true,
        subscriptionExpiresAt: true,
      },
    },
    requestedBy: { select: { id: true, name: true, email: true } },
  };

  const requests = await prisma.subscriptionRequest.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    select: SELECT as any,
  });
  console.log(JSON.stringify(requests, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
