import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zensure — AI Income Protection",
  description: "Parametric income protection for quick-commerce delivery workers. Zero claims, automatic payouts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
