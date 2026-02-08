"use client";

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { type EventRecord, createEvent, type EventKind, type EventRefs } from "./events";

export const DOCK_TABS = ["chat", "events", "artifacts", "mcp", "db"] as const;
export type DockTab = (typeof DOCK_TABS)[number];

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
  recordEvent: (kind: EventKind, data: { inputs?: unknown; outputs?: unknown }, refs?: EventRefs) => EventRecord;
  setActiveDockTab: (tab: UIState["activeDockTab"]) => void;
  setDockWidth: (width: number) => void;
}

const defaultState: SessionState = {
  events: [],
  ui: {
    dockWidth: 400,
    activeDockTab: "events",
  },
};

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const hasTambo = Boolean(process.env.NEXT_PUBLIC_TAMBO_API_KEY);

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
      setState((prev) => ({
        ...prev,
        events: [...prev.events, event],
      }));
      return event;
    },
    []
  );

  const setActiveDockTab = useCallback((tab: UIState["activeDockTab"]) => {
    setState((prev) => ({
      ...prev,
      ui: { ...prev.ui, activeDockTab: tab },
    }));
  }, []);

  const setDockWidth = useCallback((width: number) => {
    setState((prev) => ({
      ...prev,
      ui: { ...prev.ui, dockWidth: width },
    }));
  }, []);

  return (
    <StoreContext.Provider value={{ state, recordEvent, setActiveDockTab, setDockWidth }}>
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
