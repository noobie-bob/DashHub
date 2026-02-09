"use client";

import { StoreProvider } from "@/lib/store";
import { TamboProvider } from "@tambo-ai/react";

import { DataTable } from "@/components/tambo/DataTable";
import { Graph } from "@/components/tambo/Graph";
import { SummaryCard } from "@/components/tambo/SummaryCard";
import { DataTableSchema, GraphSchema, SummaryCardSchema } from "@/lib/schemas";

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const apiKey = process.env.NEXT_PUBLIC_TAMBO_API_KEY;
  const hasTambo = Boolean(apiKey);

  const components = [
    {
      name: "SummaryCard",
      description:
        "Use this tool to display a summary of content. Always prefer this over plain text when asked to summarize, list items, or provide a snapshot of information.",
      component: SummaryCard,
      propsSchema: SummaryCardSchema,
    },
    {
      name: "DataTable",
      description:
        "Display structured data in a table format with columns and rows.",
      component: DataTable,
      propsSchema: DataTableSchema,
    },
    {
      name: "Graph",
      description: "Display a simple chart (bar, line, or pie).",
      component: Graph,
      propsSchema: GraphSchema,
    },
  ];

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      throw new Error("Missing NEXT_PUBLIC_TAMBO_API_KEY");
    }

    console.error("Missing NEXT_PUBLIC_TAMBO_API_KEY");

    return (
      <StoreProvider hasTambo={hasTambo}>
        <div
          role="alert"
          className="mx-auto my-4 w-fit rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
        >
          Missing <code className="font-mono">NEXT_PUBLIC_TAMBO_API_KEY</code>.
          Tambo features are disabled.
        </div>
        {children}
      </StoreProvider>
    );
  }

  return (
    <TamboProvider apiKey={apiKey} components={components}>
      <StoreProvider hasTambo={hasTambo}>{children}</StoreProvider>
    </TamboProvider>
  );
}
