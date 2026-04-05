import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "家禽交易行情洞察",
  description: "以白肉雞與雞蛋行情資料打造的資料分析作品網站第一版。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
