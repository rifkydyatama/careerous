import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AccessibilityWidget from "./components/AccessibilityWidget";
import { cookies, headers } from "next/headers";
import { getAppSetting } from "@/lib/app-setting";
import { parseSessionToken } from "@/lib/portal-session";
import MaintenancePage from "./maintenance/page";

// Terapkan preferensi aksesibilitas sebelum paint (hindari flash).
const A11Y_BOOTSTRAP = `(function(){try{var k={"a11y-theme-dark":"theme-dark","a11y-dyslexia":"a11y-dyslexia","a11y-contrast":"a11y-contrast","a11y-large":"a11y-large"};for(var s in k){if(localStorage.getItem(s)==="1"){document.documentElement.classList.add(k[s]);}}}catch(e){}})();`;

const geistSans = localFont({
  src: [
    {
      path: "../node_modules/@fontsource/geist-sans/files/geist-sans-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../node_modules/@fontsource/geist-sans/files/geist-sans-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../node_modules/@fontsource/geist-sans/files/geist-sans-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../node_modules/@fontsource/geist-sans/files/geist-sans-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: [
    {
      path: "../node_modules/@fontsource/geist-mono/files/geist-mono-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../node_modules/@fontsource/geist-mono/files/geist-mono-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../node_modules/@fontsource/geist-mono/files/geist-mono-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../node_modules/@fontsource/geist-mono/files/geist-mono-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Careerous Portal | Career Curiosity Platform",
  description: "Portal layanan bimbingan karier untuk siswa dan konselor.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Ambil request path dari header yang diset middleware
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  // Dapatkan pengaturan global sistem dari database
  const setting = await getAppSetting();

  let showMaintenance = false;

  if (setting.maintenanceMode) {
    // Jalur yang dikecualikan (selalu diizinkan)
    const isExempt =
      pathname === "/login" ||
      pathname.startsWith("/api/auth/") ||
      pathname.startsWith("/_next/") ||
      pathname === "/logo.jpg" ||
      pathname === "/favicon.ico";

    if (!isExempt) {
      // Periksa apakah user yang login adalah ADMIN
      const cookieStore = await cookies();
      const token = cookieStore.get("careerous_session")?.value;
      const session = token ? parseSessionToken(token) : null;

      if (!session || session.role !== "ADMIN") {
        showMaintenance = true;
      }
    }
  }

  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: A11Y_BOOTSTRAP }} />
      </head>
      <body className="min-h-full flex flex-col">
        {showMaintenance ? <MaintenancePage /> : children}
        <AccessibilityWidget />
      </body>
    </html>
  );
}
