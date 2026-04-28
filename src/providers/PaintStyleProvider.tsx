"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { PaintStyle } from "@/lib/brand/paint-assets";

type PaintStyleContextValue = {
  style: PaintStyle;
  setStyle: (next: PaintStyle) => void;
  toggle: () => void;
};

const STORAGE_KEY = "pv-paint-style";
const DEFAULT_STYLE: PaintStyle = "waveHorizon";

const PaintStyleContext = createContext<PaintStyleContextValue | null>(null);

function readStoredStyle(raw: string | null): PaintStyle | null {
  if (!raw) return null;
  if (raw === "waveHorizon" || raw === "vortexOrbital") return raw;
  // Legacy values from the previous oil/realistic register names — map
  // them to the new equivalents so users keep their preference across
  // the V3 migration without seeing a default-flash.
  if (raw === "brand") return "waveHorizon";
  if (raw === "realistic") return "vortexOrbital";
  return null;
}

/**
 * Provides the active homepage paint register ("waveHorizon" or
 * "vortexOrbital"). Hydrates from localStorage on mount and persists
 * user changes back. The first paint uses DEFAULT_STYLE to avoid
 * SSR/CSR mismatch; users who stored the previous register names see
 * a one-shot migration on hydrate so their preference survives V3.
 */
export function PaintStyleProvider({ children }: { children: ReactNode }) {
  const [style, setStyleState] = useState<PaintStyle>(DEFAULT_STYLE);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const resolved = readStoredStyle(stored);
      if (resolved) {
        // SSR-safe hydration: server renders DEFAULT_STYLE; on mount we
        // sync from localStorage. Migrating to useSyncExternalStore would
        // remove this rule violation but breaks the one-shot legacy-value
        // migration write below, so we keep the effect-based approach.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStyleState(resolved);
        if (resolved !== stored) {
          window.localStorage.setItem(STORAGE_KEY, resolved);
        }
      }
    } catch {
      // localStorage unavailable (privacy mode etc) — keep default.
    }
  }, []);

  const setStyle = useCallback((next: PaintStyle) => {
    setStyleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Persistence failure is non-fatal — the in-memory state still
      // takes effect for this session.
    }
  }, []);

  const toggle = useCallback(() => {
    setStyleState((prev) => {
      const next: PaintStyle =
        prev === "waveHorizon" ? "vortexOrbital" : "waveHorizon";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const value = useMemo<PaintStyleContextValue>(
    () => ({ style, setStyle, toggle }),
    [style, setStyle, toggle]
  );

  return (
    <PaintStyleContext.Provider value={value}>
      {children}
    </PaintStyleContext.Provider>
  );
}

/**
 * Read the active paint style. Throws if the consumer is rendered
 * outside the provider — surfaces wiring mistakes fast rather than
 * silently falling back to a default.
 */
export function usePaintStyle(): PaintStyleContextValue {
  const ctx = useContext(PaintStyleContext);
  if (!ctx) {
    throw new Error("usePaintStyle must be used within a PaintStyleProvider");
  }
  return ctx;
}
