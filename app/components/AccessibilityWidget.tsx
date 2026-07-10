"use client";

import { useEffect, useRef, useState } from "react";
import { Accessibility, Moon, Sun, Type, Contrast, X, BookA } from "lucide-react";


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

  // Dragging state and position
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });
  const clickPrevent = useRef(false);

  // Load preferences from localStorage
  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const opt of OPTIONS) {
      const on = window.localStorage.getItem(opt.storageKey) === "1";
      next[opt.key] = on;
      document.documentElement.classList.toggle(opt.key, on);
    }
    setState(next);
  }, []);

  // Close accessibility panel when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Handle drag move window events
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        clickPrevent.current = true;
      }
      
      const newX = posStart.current.x + dx;
      const newY = posStart.current.y + dy;

      const maxLeft = -(window.innerWidth - 70);
      const maxRight = 10;
      const maxUp = -(window.innerHeight - 70);
      const maxDown = 10;

      setPosition({
        x: Math.max(maxLeft, Math.min(maxRight, newX)),
        y: Math.max(maxUp, Math.min(maxDown, newY))
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const dx = touch.clientX - dragStart.current.x;
      const dy = touch.clientY - dragStart.current.y;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        clickPrevent.current = true;
      }

      const newX = posStart.current.x + dx;
      const newY = posStart.current.y + dy;

      const maxLeft = -(window.innerWidth - 70);
      const maxRight = 10;
      const maxUp = -(window.innerHeight - 70);
      const maxDown = 10;

      setPosition({
        x: Math.max(maxLeft, Math.min(maxRight, newX)),
        y: Math.max(maxUp, Math.min(maxDown, newY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);

  // Constrain position on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        const maxLeft = -(window.innerWidth - 70);
        const maxRight = 10;
        const maxUp = -(window.innerHeight - 70);
        const maxDown = 10;
        return {
          x: Math.max(maxLeft, Math.min(maxRight, prev.x)),
          y: Math.max(maxUp, Math.min(maxDown, prev.y))
        };
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggle = (opt: (typeof OPTIONS)[number]) => {
    const on = !state[opt.key];
    setState((prev) => ({ ...prev, [opt.key]: on }));
    document.documentElement.classList.toggle(opt.key, on);
    window.localStorage.setItem(opt.storageKey, on ? "1" : "0");
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click drag
    dragStart.current = { x: e.clientX, y: e.clientY };
    posStart.current = { x: position.x, y: position.y };
    setIsDragging(true);
    clickPrevent.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    dragStart.current = { x: touch.clientX, y: touch.clientY };
    posStart.current = { x: position.x, y: position.y };
    setIsDragging(true);
    clickPrevent.current = false;
  };

  const darkOn = state["theme-dark"];

  return (
    <div
      ref={containerRef}
      className="fixed bottom-5 right-5 z-[100] flex flex-col items-end"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      data-noinvert
    >
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
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={() => {
          if (!clickPrevent.current) {
            setOpen((prev) => !prev);
          }
        }}
        aria-label="Pengaturan aksesibilitas"
        className={`flex h-12 w-12 items-center justify-center rounded-full bg-[#2563eb] text-white shadow-xl ring-2 ring-white transition hover:scale-105 active:scale-95 ${
          isDragging ? "cursor-grabbing select-none" : "cursor-grab"
        }`}
        style={{
          touchAction: "none"
        }}
      >
        {darkOn ? <Moon size={20} /> : <Accessibility size={20} />}
      </button>
    </div>
  );
}
