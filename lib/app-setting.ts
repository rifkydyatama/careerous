import { prisma } from "./prisma";

export async function getAppSetting() {
  try {
    let setting = await prisma.appSetting.findUnique({
      where: { id: "singleton" },
    });

    if (!setting) {
      setting = await prisma.appSetting.create({
        data: {
          id: "singleton",
          deadlineHours: 48,
          lockHours: 72,
          maintenanceMode: false,
          maintenanceEndsAt: null,
        },
      });
    }

    return setting;
  } catch (error) {
    return {
      id: "singleton",
      deadlineHours: 48,
      lockHours: 72,
      maintenanceMode: false,
      maintenanceEndsAt: null as Date | null,
      updatedAt: new Date(),
    };
  }
}

export async function setMaintenanceMode(active: boolean) {
  return prisma.appSetting.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      deadlineHours: 48,
      lockHours: 72,
      maintenanceMode: active,
    },
    update: {
      maintenanceMode: active,
    },
  });
}

export async function setMaintenanceSettings(active: boolean, endsAt: Date | null) {
  return prisma.appSetting.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      deadlineHours: 48,
      lockHours: 72,
      maintenanceMode: active,
      maintenanceEndsAt: endsAt,
    },
    update: {
      maintenanceMode: active,
      maintenanceEndsAt: endsAt,
    },
  });
}
