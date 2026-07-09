import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "걱정 은행 · Worry Bank",
  description:
    "걱정에도 이자가 붙어요. 오늘의 걱정 명세서와 창구직원의 상환 플랜을 받아보세요.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
