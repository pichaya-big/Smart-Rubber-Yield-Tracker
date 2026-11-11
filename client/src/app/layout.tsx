import type { Metadata } from "next";
import "./globals.css";
import { MobileNav, SideNav } from "@/components/nav";
import { TopBar } from "@/components/top-bar";

export const metadata: Metadata = {
  title: "Smart Rubber Yield Tracker",
  description: "ระบบบันทึกและวิเคราะห์ผลผลิตยางพารา",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght,GRAD@0,17..18,400..700,-3;1,17..18,400..700,-3&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-dvh bg-canvas text-ink">
        <SideNav />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="flex-1 px-4 pt-6 pb-28 md:px-8 lg:pb-10">{children}</main>
        </div>
        <MobileNav />
      </body>
    </html>
  );
}
