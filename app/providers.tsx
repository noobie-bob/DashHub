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

    console.error("Missing NEXT_PUBLIC_TAMBO_API_KEY");

    return (
      <>
        <div
          role="alert"
          className="mx-auto my-4 w-fit rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
        >
          Missing <code className="font-mono">NEXT_PUBLIC_TAMBO_API_KEY</code>. Tambo
          features are disabled.
        </div>
        {children}
      </>
    );
  }

  return <TamboProvider apiKey={apiKey}>{children}</TamboProvider>;
}
