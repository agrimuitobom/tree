import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TreeScope - 樹木識別アプリ",
  description: "カメラで樹木を撮影して、AIが名前や特徴を即座に教えてくれるWebアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
