import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zensure — AI-Powered Income Protection",
  description:
    "Parametric income protection for quick-commerce delivery workers. Zero-touch, AI-driven, automatic payouts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
