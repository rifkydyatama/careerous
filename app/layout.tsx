import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AccessibilityWidget from "./components/AccessibilityWidget";


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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: A11Y_BOOTSTRAP }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <AccessibilityWidget />
      </body>
    </html>
  );
}
