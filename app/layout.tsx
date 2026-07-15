import type { Metadata, Viewport } from "next";
import { Changa, Tajawal } from "next/font/google";
import "./globals.css";

const changa = Changa({
  subsets: ["arabic", "latin"],
  variable: "--font-changa",
  weight: ["600", "700", "800"],
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  variable: "--font-tajawal",
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "تحدي مشلي الخريف",
  description: "لعبة تفاعلية بثيم خريف صلالة — اقطع الجوزة واجمع النقاط!",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "تحدي مشلي الخريف",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FFF8E7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${changa.variable} ${tajawal.variable}`}
    >
      <body className="min-h-svh font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
