import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "NGSL Trainer",
  description: "Learn core NGSL vocabulary with a simple, focused workflow."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
