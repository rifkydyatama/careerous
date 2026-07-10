"use client";

import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";

// Halaman fokus-kerja: maskot disembunyikan agar tidak mengganggu tugas.
// Mencakup form autentikasi, pengisian modul/tes, pengaturan, dan ruang konseling video.
const HIDDEN_PATTERNS: RegExp[] = [
  /^\/$/, // landing page — hero sudah menampilkan maskot besar
  /^\/login/,
  /^\/register/,
  /^\/forgot-password/,
  /^\/maintenance/,
  /^\/room\//, // ruang konseling video (Jitsi)
  /^\/dashboard\/student\/[^/]+\/journals/, // isi modul/jurnal
  /^\/dashboard\/student\/[^/]+\/riasec/, // pengerjaan tes RIASEC
  /\/settings\/?$/, // halaman pengaturan (form) siswa & konselor
  /^\/counselor\/journals/, // reviu modul (fokus baca/menulis umpan balik)
];

export default function FloatingMascot() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  if (!pathname) return null;
  if (HIDDEN_PATTERNS.some((re) => re.test(pathname))) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-[90] hidden sm:block">
      <div className="relative h-20 w-20 lg:h-24 lg:w-24">
        {/* bayangan tanah — tetap diam saat maskot bergoyang */}
        <motion.div
          className="absolute inset-x-3 -bottom-1 h-2.5 rounded-full bg-blue-900/15 blur-md"
          animate={reduceMotion ? undefined : { scaleX: [1, 0.82, 1], opacity: [0.9, 0.6, 0.9] }}
          transition={reduceMotion ? undefined : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 origin-bottom"
          initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.8 }}
          animate={
            reduceMotion
              ? { opacity: 1 }
              : {
                  opacity: 1,
                  scale: 1,
                  y: [0, -10, 0],
                  // goyangan badan menyerupai lambaian (gambar maskot statis)
                  rotate: [0, -6, 5, -6, 5, 0],
                }
          }
          transition={
            reduceMotion
              ? { duration: 0.3 }
              : {
                  opacity: { duration: 0.5 },
                  scale: { duration: 0.5 },
                  y: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
                  rotate: {
                    duration: 2.6,
                    repeat: Infinity,
                    repeatDelay: 1.6,
                    ease: "easeInOut",
                  },
                }
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/robot.png"
            alt="Maskot Careerous"
            className="h-full w-full object-contain drop-shadow-xl"
          />
        </motion.div>
      </div>
    </div>
  );
}
