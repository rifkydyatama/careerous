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
        },
      });
    }

    return setting;
  } catch (error) {
    // Fallback jika database belum siap/error
    return {
      id: "singleton",
      deadlineHours: 48,
      lockHours: 72,
      maintenanceMode: false,
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
