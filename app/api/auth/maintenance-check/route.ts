import { NextResponse } from "next/server";
import { getAppSetting } from "../../../../lib/app-setting";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const setting = await getAppSetting();
    return NextResponse.json({ maintenanceMode: setting.maintenanceMode });
  } catch {
    return NextResponse.json({ maintenanceMode: false });
  }
}
