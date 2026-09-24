import React, { useState, useEffect } from "react";
import { Cpu, User, GraduationCap, Briefcase, Mail, Home, Star } from "lucide-react";
import { navigateToSection } from "../utils/thunder";

const navItems = [
  { id: "home", label: "Home", icon: <Home size={13} /> },
  { id: "about", label: "About", icon: <User size={13} /> },
  { id: "skills", label: "Skills", icon: <Cpu size={13} /> },
  { id: "education", label: "Education", icon: <GraduationCap size={13} /> },
  { id: "projects", label: "Projects", icon: <Briefcase size={13} /> },
  { id: "contact", label: "Contact", icon: <Mail size={13} /> },
];

export default function QuickNav() {
  const [active, setActive] = useState("home");

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPos = window.scrollY + 200;
          for (let i = navItems.length - 1; i >= 0; i--) {
            const el = document.getElementById(navItems[i].id);
            if (el && scrollPos >= el.offsetTop) {
              setActive(navItems[i].id);
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

  const handleClick = (id) => {
    navigateToSection(id);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[95vw]">
      <div className="flex items-center gap-1 p-1.5 rounded-full bg-black/90 border border-red-900/60 shadow-2xl shadow-red-950/80 backdrop-blur-xl transition-all duration-300 hover:border-red-600/70">
        {/* Quick Links */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/40 font-semibold scale-105"
                    : "text-zinc-400 hover:text-white hover:bg-red-950/40"
                }`}
                title={`Go to ${item.label}`}
              >
                {item.icon}
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
