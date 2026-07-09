import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getSession } from "../../../lib/auth-guard";
import { promises as fs } from "fs";
import path from "path";

const MAX_BYTES = 8 * 1024 * 1024; 

export async function POST(request: NextRequest) {
  const session = getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "File wajib diunggah" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Ukuran file maksimal 8 MB" }, { status: 400 });
  }

  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80) || "dokumen";
    
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const key = `journals/${session.userId}/${Date.now()}-${safeName}`;
      const blob = await put(key, file, { access: "public" });
      return NextResponse.json({ url: blob.url });
    } else {
      const buffer = Buffer.from(await file.arrayBuffer());
      const publicDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(publicDir, { recursive: true });
      
      const filename = `${Date.now()}-${safeName}`;
      const filePath = path.join(publicDir, filename);
      await fs.writeFile(filePath, buffer);
      
      return NextResponse.json({ url: `/uploads/${filename}` });
    }
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengunggah file" }, { status: 500 });
  }
}
