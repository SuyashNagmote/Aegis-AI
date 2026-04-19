import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Sentinel AI",
  description: "Intent-aware transaction security for wallets, operators, and autonomous agents."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
