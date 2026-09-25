import { Plus_Jakarta_Sans } from "next/font/google";
import "react-easy-crop/react-easy-crop.css";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
  variable: "--font-plus-jakarta",
});

const themeScript = `
(function () {
  try {
    var storedTheme = localStorage.getItem("portfolio-theme");
    var systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    var theme = storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : systemPrefersLight ? "light" : "dark";
    var root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    root.classList.toggle("light", theme === "light");
    root.classList.toggle("dark", theme === "dark");
  } catch (error) {
    document.documentElement.dataset.theme = "dark";
  }
})();
`;

export const metadata = {
  title: {
    default: "Teerath Jangid | B.Tech Student & AI Enthusiast",
    template: "%s | Teerath Jangid",
  },
  description:
    "Portfolio of Teerath Jangid, a B.Tech ECE student at JECRC University interested in robotics, automation, AI, and web technologies.",
  keywords: [
    "Teerath Jangid",
    "B.Tech",
    "JECRC University",
    "ECE",
    "Robotics",
    "Microprocessors",
    "Portfolio",
  ],
  authors: [{ name: "Teerath Jangid" }],
  creator: "Teerath Jangid",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    title: "Teerath Jangid | B.Tech Student & AI Enthusiast",
    description:
      "B.Tech ECE student exploring robotics, microprocessor architecture, automation, and intelligent web systems.",
    siteName: "Teerath Jangid Portfolio",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#030303" },
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} scroll-smooth dark`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={plusJakartaSans.className}>{children}</body>
    </html>
  );
}
