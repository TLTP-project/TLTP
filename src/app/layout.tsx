import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trải Lòng Trần Phú (TLTP) — Diễn đàn phản hồi ẩn danh học đường",
  description:
    "Diễn đàn phản hồi ẩn danh cho cộng đồng trường học, lắng nghe và cải thiện môi trường học tập với sự đồng hành của AI.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col bg-[#fffaf5] text-[#2d2522] antialiased selection:bg-amber-200">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
