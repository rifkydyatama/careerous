"use client";

import { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";

export function AccountSettingsForm({
  initialName,
  initialEmail,
  initialAvatar,
  onSuccess,
}: {
  initialName: string;
  initialEmail: string;
  initialAvatar: string | null;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(initialName || "");
  const [email, setEmail] = useState(initialEmail || "");
  const [avatarBase64, setAvatarBase64] = useState<string | null>(initialAvatar);
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resizeImageAndConvertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const MAX_WIDTH = 256;
          const MAX_HEIGHT = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height *= MAX_WIDTH / width));
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width *= MAX_HEIGHT / height));
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject("Canvas context not supported");
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with webp or jpeg
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG/PNG).");
      return;
    }

    try {
      const base64 = await resizeImageAndConvertToBase64(file);
      setAvatarBase64(base64);
      setError(null);
    } catch (err) {
      setError("Gagal memproses gambar.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, avatar: avatarBase64 }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Gagal menyimpan perubahan.");
      }

      setSuccessMsg("Profil berhasil diperbarui!");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
        <h3 className="text-sm font-extrabold text-slate-900">Informasi Pribadi</h3>
        <p className="text-[12px] text-slate-500 mt-0.5">Perbarui nama, email, dan foto profil Anda di sini.</p>
      </div>

      <form onSubmit={handleSave} className="p-6">
        {/* Avatar Upload */}
        <div className="mb-6 flex flex-col items-center sm:flex-row sm:items-start gap-6">
          <div className="relative group">
            <div 
              className="h-24 w-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarBase64 ? (
                <img src={avatarBase64} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-extrabold text-slate-300">
                  {name.charAt(0).toUpperCase() || "?"}
                </span>
              )}
              
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={20} className="text-white" />
              </div>
            </div>
            
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp"
              className="hidden" 
            />
          </div>
          
          <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0">
            <p className="text-[13px] font-bold text-slate-900">Foto Profil</p>
            <p className="text-[12px] text-slate-500 mt-1 max-w-sm">
              Gunakan foto persegi dengan format JPG atau PNG agar terlihat rapi. Sistem akan otomatis menyesuaikan ukuran.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 text-[12px] font-bold text-[#2e1065] hover:text-[#3b0764] transition-colors"
            >
              Ubah Foto
            </button>
            {avatarBase64 && (
              <button
                type="button"
                onClick={() => setAvatarBase64(null)}
                className="mt-3 ml-4 text-[12px] font-bold text-red-500 hover:text-red-700 transition-colors"
              >
                Hapus
              </button>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid gap-5">
          <div>
            <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Nama Lengkap</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[13px] outline-none focus:border-[#2e1065] focus:ring-1 focus:ring-[#2e1065]"
            />
          </div>
          
          <div>
            <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Alamat Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[13px] outline-none focus:border-[#2e1065] focus:ring-1 focus:ring-[#2e1065]"
            />
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[12.5px] font-medium text-rose-700">
            {error}
          </div>
        )}
        
        {successMsg && (
          <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[12.5px] font-medium text-emerald-700">
            {successMsg}
          </div>
        )}

        <div className="mt-6 border-t border-slate-100 pt-5 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-[#2e1065] px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#3b0764] disabled:opacity-70"
          >
            {isSaving && <Loader2 size={14} className="animate-spin" />}
            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
