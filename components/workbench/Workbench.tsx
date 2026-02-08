"use client";

import { Canvas } from "./Canvas";
import { Dock } from "./Dock";
import { useState, useCallback } from "react";

export function Workbench() {
  const [dockWidth, setDockWidth] = useState(420);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isResizing) return;
      const containerWidth = window.innerWidth;
      const newDockWidth = containerWidth - e.clientX;
      // Clamp between 280 and 600px
      setDockWidth(Math.max(280, Math.min(600, newDockWidth)));
    },
    [isResizing]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  return (
    <div
      className="flex h-screen w-full bg-background"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Left Canvas */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <Canvas />
      </div>

      {/* Resize Handle */}
      <div
        className={`w-1 cursor-col-resize transition-colors ${
          isResizing ? "bg-primary/50" : "bg-border hover:bg-primary/30"
        }`}
        onMouseDown={handleMouseDown}
      />

      {/* Right Dock */}
      <div
        className="flex-shrink-0 overflow-hidden border-l border-border"
        style={{ width: dockWidth }}
      >
        <Dock />
      </div>
    </div>
  );
}
