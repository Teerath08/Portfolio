"use client";

import { useEffect, useSyncExternalStore } from "react";
import { CircuitBoard, FileCode2 } from "lucide-react";
import {
  applyTheme,
  DEFAULT_THEME,
  nextTheme,
  THEME_STORAGE_KEY,
  THEMES,
} from "@/lib/theme";
import { cn } from "@/lib/cn";

const ICONS = {
  board: CircuitBoard,
  blueprint: FileCode2,
} as const;

/**
 * The `data-theme` attribute is the single source of truth.
 *
 * Mirroring it into React state would need an effect to copy it in on mount, and
 * would immediately go stale whenever the inline boot script or another tab
 * changed it. Instead the component subscribes to the attribute and reads it
 * directly, so there is no copy to keep in sync.
 */
function subscribeTheme(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function readTheme(): string {
  return document.documentElement.dataset.theme || DEFAULT_THEME;
}

/**
 * Theme switch.
 *
 * Cycles the two themes and keeps them in sync across tabs. The active theme
 * is read back from the document rather than stored separately in React state,
 * because the inline boot script is what actually decided it.
 */
export default function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => DEFAULT_THEME);

  // Another tab changing the theme fires `storage`; `applyTheme` writes the
  // attribute, which the subscription above already picks up.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY && event.newValue) {
        applyTheme(event.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleClick = () => {
    const upcoming = nextTheme(theme);
    applyTheme(upcoming);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, upcoming);
    } catch (error) {
      console.warn("Could not persist the theme preference", error);
    }
  };

  const upcoming = nextTheme(theme);
  const label = `Switch to the ${upcoming} theme`;

  return (
    <button
      type="button"
      onClick={handleClick}
      title={label}
      aria-label={label}
      data-theme-state={theme}
      className={cn(
        "relative grid h-10 w-10 place-items-center rounded-xl border border-line/10 bg-surface/60",
        "text-muted transition-all duration-300 ease-out",
        "hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent",
        "focus-visible:ring-2 focus-visible:ring-accent/60",
        className,
      )}
    >
      <span className="relative grid h-[18px] w-[18px] place-items-center">
        {THEMES.map((definition) => {
          const Icon = ICONS[definition.icon];
          const active = definition.id === theme;
          return (
            <Icon
              key={definition.id}
              size={17}
              strokeWidth={1.75}
              aria-hidden="true"
              className={cn(
                "absolute transition-all duration-300",
                active ? "scale-100 opacity-100 text-accent" : "scale-75 opacity-0",
              )}
            />
          );
        })}
      </span>
      <span className="sr-only">{label}</span>
    </button>
  );
}