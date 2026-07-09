import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "../../../../lib/auth-guard";
import { getAppSetting, setMaintenanceMode } from "../../../../lib/app-setting";

export async function GET(request: NextRequest) {
  if (!requireRole(request, "ADMIN")) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  try {
    const setting = await getAppSetting();
    return NextResponse.json({ maintenanceMode: setting.maintenanceMode });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat status pemeliharaan" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!requireRole(request, "ADMIN")) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => null);
    if (body === null || typeof body.active !== "boolean") {
      return NextResponse.json({ error: "Parameter 'active' bertipe boolean diperlukan" }, { status: 400 });
    }

    const updated = await setMaintenanceMode(body.active);
    return NextResponse.json({ success: true, maintenanceMode: updated.maintenanceMode });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengubah status pemeliharaan" }, { status: 500 });
  }
}
