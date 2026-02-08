"use client";

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { type EventRecord, createEvent, type EventKind, type EventRefs } from "./events";

export const DOCK_TABS = ["chat", "events", "artifacts", "mcp", "db"] as const;
export type DockTab = (typeof DOCK_TABS)[number];

export const DOCK_WIDTH_MIN = 280;
export const DOCK_WIDTH_MAX = 600;

export function clampDockWidth(width: number): number {
  return Math.max(DOCK_WIDTH_MIN, Math.min(DOCK_WIDTH_MAX, width));
}

// UI State
export interface UIState {
  dockWidth: number;
  activeDockTab: DockTab;
}

// Session State
export interface SessionState {
  events: EventRecord[];
  ui: UIState;
}

// Store Context Type
interface StoreContextType {
  state: SessionState;
  hasTambo: boolean;
  recordEvent: (kind: EventKind, data: { inputs?: unknown; outputs?: unknown }, refs?: EventRefs) => EventRecord;
  setActiveDockTab: (tab: UIState["activeDockTab"]) => void;
  setDockWidth: (width: number) => void;
}

const MAX_EVENTS = 1000;

const defaultState: SessionState = {
  events: [],
  ui: {
    dockWidth: clampDockWidth(400),
    activeDockTab: "events",
  },
};

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children, hasTambo }: { children: ReactNode; hasTambo: boolean }) {
  const [state, setState] = useState<SessionState>(() => ({
    ...defaultState,
    ui: {
      ...defaultState.ui,
      activeDockTab: hasTambo ? "chat" : "events",
    },
  }));

  const recordEvent = useCallback(
    (kind: EventKind, data: { inputs?: unknown; outputs?: unknown }, refs?: EventRefs): EventRecord => {
      const event = createEvent(kind, data, refs);
      setState((prev) => {
        const nextEvents = [...prev.events, event];
        const nextLength = nextEvents.length;
        return {
          ...prev,
          events: nextLength > MAX_EVENTS ? nextEvents.slice(nextLength - MAX_EVENTS) : nextEvents,
        };
      });
      return event;
    },
    []
  );

  const setActiveDockTab = useCallback(
    (tab: UIState["activeDockTab"]) => {
      if (!hasTambo && tab === "chat") return;

      setState((prev) => ({
        ...prev,
        ui: { ...prev.ui, activeDockTab: tab },
      }));
    },
    [hasTambo]
  );

  const setDockWidth = useCallback((width: number) => {
    setState((prev) => ({
      ...prev,
      ui: { ...prev.ui, dockWidth: clampDockWidth(width) },
    }));
  }, []);

  return (
    <StoreContext.Provider value={{ state, hasTambo, recordEvent, setActiveDockTab, setDockWidth }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextType {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
