const token = (variable) => `rgb(var(${variable}) / <alpha-value>)`;

/**
 * The whole palette lives in `src/app/globals.css` as CSS custom properties, so
 * switching theme is a variable swap rather than a class rewrite. Tailwind only
 * maps the names onto `rgb(var(--x) / <alpha-value>)` — do not add literal
 * colours here.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: token("--canvas"),
        surface: token("--surface"),
        surface2: token("--surface-2"),
        ink: token("--ink"),
        muted: token("--ink-muted"),
        dim: token("--ink-dim"),
        line: token("--line"),
        accent: token("--accent"),
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      maxWidth: {
        shell: "78rem",
      },
      /**
       * Hairline steps.
       *
       * Tailwind only accepts bare opacity modifiers (`border-line/12`) for
       * values present in the opacity scale, so the design's fine border
       * weights have to be declared. Without these they fail silently in
       * components and hard-fail inside `@apply`.
       */
      opacity: {
        8: "0.08",
        12: "0.12",
        18: "0.18",
      },
      letterSpacing: {
        label: "0.16em",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "signal-run": {
          "0%": { transform: "translateX(0)", opacity: "0" },
          "12%": { opacity: "1" },
          "88%": { opacity: "1" },
          "100%": { transform: "translateX(var(--run, 100%))", opacity: "0" },
        },
        "dash-flow": {
          "0%": { strokeDashoffset: "240" },
          "100%": { strokeDashoffset: "0" },
        },
        "pulse-node": {
          "0%, 100%": { opacity: "0.25", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.35)" },
        },
        "float-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "rise": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "sheen": {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(220%)" },
        },
      },
      animation: {
        "signal-run": "signal-run 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "dash-flow": "dash-flow 3s linear infinite",
        "pulse-node": "pulse-node 2.4s ease-in-out infinite",
        "float-soft": "float-soft 6s ease-in-out infinite",
        rise: "rise 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        "spin-slow": "spin-slow 24s linear infinite",
        sheen: "sheen 1.6s ease-out",
      },
    },
  },
  plugins: [],
};