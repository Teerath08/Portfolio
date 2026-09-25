"use client";

import { useCallback, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const THEME_STORAGE_KEY = "portfolio-theme";

function applyTheme(theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  root.classList.toggle("light", theme === "light");
  root.classList.toggle("dark", theme === "dark");

  const themeColor = theme === "light" ? "#fafafa" : "#030303";
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", themeColor);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState("dark");

  // The inline script in the document head has already applied the stored
  // theme before first paint, so read it back instead of re-deriving it.
  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    // oxlint-disable-next-line react/set-state-in-effect
    setTheme(current === "light" ? "light" : "dark");
  }, []);

  useEffect(() => {
    const handleStorage = (event) => {
      if (
        event.key === THEME_STORAGE_KEY &&
        ["light", "dark"].includes(event.newValue)
      ) {
        applyTheme(event.newValue);
        setTheme(event.newValue);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === "light" ? "dark" : "light";
    applyTheme(nextTheme);
    setTheme(nextTheme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch (error) {
      console.warn("Failed to persist theme preference", error);
    }
  }, [theme]);

  const nextThemeLabel = theme === "light" ? "dark" : "light";
  const label = `Switch to ${nextThemeLabel} theme`;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="group relative p-2.5 rounded-xl border border-red-900/70 bg-zinc-950/70 text-zinc-400 hover:border-red-500/70 hover:bg-red-950/30 hover:text-red-400 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
      aria-label={label}
      title={label}
      aria-pressed={theme === "dark"}
      data-theme-state={theme}
    >
      <Sun
        size={19}
        strokeWidth={2}
        className="theme-toggle-icon theme-toggle-sun absolute inset-0 m-auto"
        aria-hidden="true"
      />
      <Moon
        size={19}
        strokeWidth={2}
        className="theme-toggle-icon theme-toggle-moon absolute inset-0 m-auto"
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </button>
  );
}
