"use client";

import { Canvas } from "./Canvas";
import { Dock } from "./Dock";
import { useState, useCallback, useRef } from "react";
import { useStore } from "@/lib/store";

export function Workbench() {
  const { state, setDockWidth } = useStore();
  const [dockWidthDraft, setDockWidthDraft] = useState<number | null>(null);
  const [resizingPointerId, setResizingPointerId] = useState<number | null>(null);
  const isResizing = resizingPointerId !== null;
  const containerRef = useRef<HTMLDivElement>(null);

  const clampDockWidth = useCallback((width: number) => {
    return Math.max(280, Math.min(600, width));
  }, []);

  const persistedDockWidth = clampDockWidth(state.ui.dockWidth);
  const dockWidth = clampDockWidth(dockWidthDraft ?? persistedDockWidth);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      setResizingPointerId(e.pointerId);
      setDockWidthDraft(persistedDockWidth);
    },
    [persistedDockWidth]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (resizingPointerId !== e.pointerId) return;
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      const newDockWidth = containerRect.right - e.clientX;
      setDockWidthDraft(clampDockWidth(newDockWidth));
    },
    [clampDockWidth, resizingPointerId]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (resizingPointerId !== e.pointerId) return;

      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // no-op
      }

      setResizingPointerId(null);

      if (dockWidthDraft !== null) {
        setDockWidth(clampDockWidth(dockWidthDraft));
        setDockWidthDraft(null);
      }
    },
    [clampDockWidth, dockWidthDraft, resizingPointerId, setDockWidth]
  );

  return (
    <div
      ref={containerRef}
      className={`flex h-screen w-full bg-background ${isResizing ? "select-none" : ""}`}
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
        style={{ touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onLostPointerCapture={handlePointerUp}
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
