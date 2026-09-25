import React from "react";
import { personalInfo } from "../data";
import { GitBranch, Link2, Mail, ArrowUp } from "lucide-react";
import { navigateToSection } from "../utils/thunder";

const quickLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Education", href: "#education" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Achievements", href: "#achievements" },
  { label: "Contact", href: "#contact" },
];

export default function Footer() {
  const scrollToTop = () => {
    navigateToSection("home");
  };

  const navClick = (href, e) => {
    if (e) e.preventDefault();
    navigateToSection(href.slice(1));
  };

  return (
    <footer className="border-t border-red-950/80 bg-background/95 mt-12 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="accent-text w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 via-rose-600 to-red-800 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-red-600/30 border border-red-400/40">
                TJ
              </div>
              <span className="font-extrabold text-white tracking-wide">
                Teerath <span className="text-red-500">Jangid</span>
              </span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed">
              B.Tech ECE Student at JECRC University, Jaipur. Specializing in Robotics,
              Microprocessor architecture, and embedded automation systems.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-zinc-950 border border-red-950 text-zinc-400 hover:text-white hover:border-red-600/60 transition-colors"
                aria-label="GitHub"
              >
                <GitBranch size={16} />
              </a>
              <a
                href={personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-zinc-950 border border-red-950 text-zinc-400 hover:text-white hover:border-red-600/60 transition-colors"
                aria-label="LinkedIn"
              >
                <Link2 size={16} />
              </a>
              <a
                href={`mailto:${personalInfo.email}`}
                className="p-2.5 rounded-lg bg-zinc-950 border border-red-950 text-zinc-400 hover:text-white hover:border-red-600/60 transition-colors"
                aria-label="Email"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-mono font-bold text-red-400 mb-4 uppercase tracking-widest">
              Quick Links
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={(e) => navClick(link.href, e)}
                  className="text-left text-sm text-zinc-400 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1.5 group"
                >
                  <span className="w-1 h-1 rounded-full bg-red-600 group-hover:w-2 transition-all" />
                  <span>{link.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="text-xs font-mono font-bold text-red-400 mb-4 uppercase tracking-widest">
              Direct Contact
            </h4>
            <div className="space-y-3 text-sm text-zinc-400">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-red-500 flex-shrink-0" />
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="hover:text-white transition-colors break-all"
                >
                  {personalInfo.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Link2 size={14} className="text-red-500 flex-shrink-0" />
                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  LinkedIn Profile
                </a>
              </div>
              <div className="flex items-center gap-2">
                <GitBranch size={14} className="text-red-500 flex-shrink-0" />
                <a
                  href={personalInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  GitHub / Teerath08
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-red-950/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-xs sm:text-sm font-mono flex items-center gap-2">
            <span>© {new Date().getFullYear()} Teerath Jangid</span>
            <span>·</span>
            <span className="text-red-500/80">ECE & Physical Computing</span>
          </p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-red-400 transition-colors cursor-pointer group"
          >
            <span>Back to top</span>
            <ArrowUp size={14} className="group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
}
