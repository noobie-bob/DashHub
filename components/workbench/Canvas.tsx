"use client";

import { Layers } from "lucide-react";

export function Canvas() {
  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Layers className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Canvas</span>
      </div>

      {/* Content area - placeholder for future pinned widgets */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Layers className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Canvas Area</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Generated widgets and pinned components will appear here in future phases.
          </p>
        </div>
      </div>
    </div>
  );
}
