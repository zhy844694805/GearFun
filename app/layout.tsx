import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "星趣铺 - 潮流生活好物",
  description: "汽车用品、电脑配件、手办、挂饰等兴趣周边商品",
  keywords: "汽车用品,电脑配件,手办,挂饰,潮流周边",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
