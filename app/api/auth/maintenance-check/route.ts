import { NextResponse } from "next/server";
import { getAppSetting } from "../../../../lib/app-setting";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const setting = await getAppSetting();
    const response = NextResponse.json({ maintenanceMode: setting.maintenanceMode });
    
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    
    return response;
  } catch {
    return NextResponse.json(
      { maintenanceMode: false },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  }
}
