"use client";

import { Canvas } from "./Canvas";
import { Dock } from "./Dock";
import { useState, useCallback, useRef } from "react";
import { DOCK_WIDTH_MAX, DOCK_WIDTH_MIN, useStore } from "@/lib/store";

export function Workbench() {
  const { state, setDockWidth } = useStore();
  const [dockWidthDraft, setDockWidthDraft] = useState<number | null>(null);
  const [resizingPointerId, setResizingPointerId] = useState<number | null>(null);
  const isResizing = resizingPointerId !== null;
  const containerRef = useRef<HTMLDivElement>(null);

  const clampDockWidth = useCallback((width: number) => {
    return Math.max(DOCK_WIDTH_MIN, Math.min(DOCK_WIDTH_MAX, width));
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
        className="group relative w-2 cursor-col-resize"
        style={{ touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onLostPointerCapture={handlePointerUp}
      >
        <div
          className={`absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition-colors ${
            isResizing
              ? "bg-primary/50"
              : "bg-border group-hover:bg-primary/30"
          }`}
        />
      </div>

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
