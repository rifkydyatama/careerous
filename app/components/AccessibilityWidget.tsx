"use client";

import { useEffect, useRef, useState } from "react";
import { Accessibility, Moon, Sun, Type, Contrast, X, BookA } from "lucide-react";

// Preferensi aksesibilitas, dipetakan ke class pada <html>.
const OPTIONS = [
  { key: "theme-dark", storageKey: "a11y-theme-dark", label: "Mode Gelap", hint: "Cocok untuk penggunaan malam." },
  { key: "a11y-dyslexia", storageKey: "a11y-dyslexia", label: "Mode Disleksia", hint: "Font & spasi lebih lega." },
  { key: "a11y-contrast", storageKey: "a11y-contrast", label: "Kontras Tinggi", hint: "Ramah low vision / buta warna." },
  { key: "a11y-large", storageKey: "a11y-large", label: "Teks Besar", hint: "Perbesar seluruh tampilan." },
] as const;

const ICONS: Record<string, any> = {
  "theme-dark": Moon,
  "a11y-dyslexia": BookA,
  "a11y-contrast": Contrast,
  "a11y-large": Type,
};

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Muat preferensi dari localStorage saat mount.
  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const opt of OPTIONS) {
      const on = window.localStorage.getItem(opt.storageKey) === "1";
      next[opt.key] = on;
      document.documentElement.classList.toggle(opt.key, on);
    }
    setState(next);
  }, []);

  // Tutup popover saat klik di luar.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (opt: (typeof OPTIONS)[number]) => {
    const on = !state[opt.key];
    setState((prev) => ({ ...prev, [opt.key]: on }));
    document.documentElement.classList.toggle(opt.key, on);
    window.localStorage.setItem(opt.storageKey, on ? "1" : "0");
  };

  const darkOn = state["theme-dark"];

  return (
    <div ref={containerRef} className="fixed bottom-5 right-5 z-[100]" data-noinvert>
      {open && (
        <div className="mb-3 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 bg-[#2563eb] px-4 py-3">
            <div className="flex items-center gap-2 text-white">
              <Accessibility size={16} />
              <p className="text-[12px] font-extrabold">Aksesibilitas</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-white/60 hover:text-white"
              aria-label="Tutup"
            >
              <X size={15} />
            </button>
          </div>
          <div className="flex flex-col gap-1 p-2">
            {OPTIONS.map((opt) => {
              const Icon = ICONS[opt.key];
              const on = state[opt.key];
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => toggle(opt)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    on ? "bg-blue-50" : "hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      on ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {opt.key === "theme-dark" && !on ? <Sun size={16} /> : <Icon size={16} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-[12.5px] font-bold text-slate-900">{opt.label}</p>
                    <p className="text-[11px] text-slate-500">{opt.hint}</p>
                  </div>
                  <span
                    className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                      on ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                        on ? "left-[18px]" : "left-0.5"
                      }`}
                    ></span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="border-t border-slate-100 px-4 py-2.5 text-[10.5px] text-slate-400">
            Preferensi tersimpan di perangkat ini.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Pengaturan aksesibilitas"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2563eb] text-white shadow-xl ring-2 ring-white transition hover:scale-105"
      >
        {darkOn ? <Moon size={20} /> : <Accessibility size={20} />}
      </button>
    </div>
  );
}
