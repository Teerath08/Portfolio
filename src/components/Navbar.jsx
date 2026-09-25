import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { personalInfo } from "../data";
import { navigateToSection } from "../utils/thunder";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#education", label: "Education" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#achievements", label: "Achievements" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar({ profileImage }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);

          // Highlight active section
          const sections = navLinks.map((l) => l.href.slice(1));
          for (let i = sections.length - 1; i >= 0; i--) {
            const el = document.getElementById(sections[i]);
            if (el && window.scrollY >= el.offsetTop - 120) {
              setActiveSection(sections[i]);
              break;
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href, e) => {
    if (e) e.preventDefault();
    setMobileOpen(false);
    navigateToSection(href.slice(1));
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-red-950/70 shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#home"
          onClick={(e) => handleNavClick("#home", e)}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="accent-text w-9 h-9 rounded-lg overflow-hidden bg-gradient-to-br from-red-600 via-rose-600 to-red-800 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform border border-red-400/40">
            {profileImage ? (
              <img src={profileImage} alt="Teerath Jangid" className="w-full h-full object-cover" />
            ) : (
              "TJ"
            )}
          </div>
          <span className="font-extrabold text-white text-sm hidden sm:block tracking-wide">
            {personalInfo.firstName}{" "}
            <span className="text-red-500 font-black">Jangid</span>
          </span>
        </a>

        <div className="flex items-center gap-2">
          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={(e) => handleNavClick(link.href, e)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeSection === link.href.slice(1)
                    ? "text-red-400 bg-red-950/50 border border-red-800/50 shadow-sm shadow-red-900/30"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/70 hover:border-red-950 border border-transparent"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <ThemeToggle />

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div id="mobile-navigation" className="md:hidden bg-background/95 backdrop-blur-md border-b border-red-950 px-4 pb-4 pt-2">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={(e) => handleNavClick(link.href, e)}
                className={`text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  activeSection === link.href.slice(1)
                    ? "bg-red-950/60 text-red-400 border border-red-800/50"
                    : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
