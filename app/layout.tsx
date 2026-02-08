"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { TamboProvider } from "@tambo-ai/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TamboProvider apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY || ""}>
          {children}
        </TamboProvider>
      </body>
    </html>
  );
}
