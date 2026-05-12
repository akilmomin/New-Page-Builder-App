import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Page Builder",
  description: "Next.js page builder with Cosine-inspired GridLayout system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
