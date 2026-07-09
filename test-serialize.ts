import { prisma } from './lib/prisma';

function serialize(req: any) {
  return {
    id: req.id,
    months: req.months,
    note: req.note,
    status: req.status,
    decisionNote: req.decisionNote,
    decidedAt: req.decidedAt ? req.decidedAt.toISOString() : null,
    createdAt: req.createdAt.toISOString(),
    institution: {
      id: req.institution.id,
      name: req.institution.name,
      subscriptionActive: req.institution.subscriptionActive,
      subscriptionExpiresAt: req.institution.subscriptionExpiresAt
        ? req.institution.subscriptionExpiresAt.toISOString()
        : null,
    },
    requestedBy: {
      id: req.requestedBy.id,
      name: req.requestedBy.name,
      email: req.requestedBy.email,
    },
  };
}

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
  
  const serialized = requests.map(serialize);
  console.log(JSON.stringify(serialized, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
