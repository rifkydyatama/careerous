import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "../../../../lib/auth-guard";
import { getAppSetting, setMaintenanceSettings } from "../../../../lib/app-setting";

export async function GET(request: NextRequest) {
  if (!requireRole(request, "ADMIN")) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  try {
    const setting = await getAppSetting();
    return NextResponse.json({
      maintenanceMode: setting.maintenanceMode,
      maintenanceEndsAt: setting.maintenanceEndsAt?.toISOString() ?? null,
    });
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

    const endsAt = body.endsAt ? new Date(body.endsAt) : null;
    const updated = await setMaintenanceSettings(body.active, endsAt);

    const bypassToken = process.env.AUTH_SECRET
      ? Buffer.from(`admin-bypass:${process.env.AUTH_SECRET}`).toString("base64url").slice(0, 32)
      : "admin-bypass-token";

    return NextResponse.json({
      success: true,
      maintenanceMode: updated.maintenanceMode,
      maintenanceEndsAt: updated.maintenanceEndsAt?.toISOString() ?? null,
      bypassLink: `/admin-access?key=${bypassToken}`,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Gagal mengubah status pemeliharaan"
    }, { status: 500 });
  }
}
