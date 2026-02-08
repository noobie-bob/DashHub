"use client";

import { TamboProvider } from "@tambo-ai/react";

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const apiKey = process.env.NEXT_PUBLIC_TAMBO_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      throw new Error("Missing NEXT_PUBLIC_TAMBO_API_KEY");
    }

    return <>{children}</>;
  }

  return <TamboProvider apiKey={apiKey}>{children}</TamboProvider>;
}
