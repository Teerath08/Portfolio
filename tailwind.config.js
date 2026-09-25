const themeColor = (variable) => `rgb(var(${variable}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        void: themeColor("--theme-background"),
        "cyber-black": themeColor("--theme-surface"),
        background: themeColor("--theme-background"),
        white: themeColor("--theme-foreground"),
        zinc: {
          50: themeColor("--theme-zinc-50"),
          100: themeColor("--theme-zinc-100"),
          200: themeColor("--theme-zinc-200"),
          300: themeColor("--theme-zinc-300"),
          400: themeColor("--theme-zinc-400"),
          500: themeColor("--theme-zinc-500"),
          600: themeColor("--theme-zinc-600"),
          700: themeColor("--theme-zinc-700"),
          800: themeColor("--theme-zinc-800"),
          900: themeColor("--theme-zinc-900"),
          950: themeColor("--theme-zinc-950"),
        },
        red: {
          50: themeColor("--theme-red-50"),
          100: themeColor("--theme-red-100"),
          200: themeColor("--theme-red-200"),
          300: themeColor("--theme-red-300"),
          400: themeColor("--theme-red-400"),
          500: themeColor("--theme-red-500"),
          600: themeColor("--theme-red-600"),
          700: themeColor("--theme-red-700"),
          800: themeColor("--theme-red-800"),
          900: themeColor("--theme-red-900"),
          950: themeColor("--theme-red-950"),
        },
        crimson: {
          50: "hsl(var(--crimson-50) / <alpha-value>)",
          100: "hsl(var(--crimson-100) / <alpha-value>)",
          400: "hsl(var(--crimson-400) / <alpha-value>)",
          500: "hsl(var(--crimson-500) / <alpha-value>)",
          600: "hsl(var(--crimson-600) / <alpha-value>)",
          700: "hsl(var(--crimson-700) / <alpha-value>)",
          800: "hsl(var(--crimson-800) / <alpha-value>)",
          900: "hsl(var(--crimson-900) / <alpha-value>)",
          950: "hsl(var(--crimson-950) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "Inter", "system-ui", "sans-serif"],
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-3d": "float3D 5s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        gradient: "gradientShift 4s ease infinite",
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "pulse-glow": "pulseGlow 2.5s ease-in-out infinite",
        "thunder-flash": "thunderFlash 0.6s ease-out forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        float3D: {
          "0%, 100%": {
            transform:
              "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) translateZ(0px)",
          },
          "25%": {
            transform:
              "perspective(1000px) rotateX(4deg) rotateY(-3deg) translateY(-8px) translateZ(12px)",
          },
          "75%": {
            transform:
              "perspective(1000px) rotateX(-3deg) rotateY(4deg) translateY(-4px) translateZ(8px)",
          },
        },
        pulseGlow: {
          "0%, 100%": {
            opacity: "0.4",
            filter: "drop-shadow(0 0 15px rgba(239,68,68,0.4))",
          },
          "50%": {
            opacity: "0.9",
            filter: "drop-shadow(0 0 30px rgba(239,68,68,0.8))",
          },
        },
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        thunderFlash: {
          "0%": { opacity: "0.95" },
          "20%": { opacity: "0.3" },
          "40%": { opacity: "0.9" },
          "100%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
