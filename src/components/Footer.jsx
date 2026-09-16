import { personalInfo } from "../data";
import { GitBranch, Link2, Mail, Heart, ArrowUp } from "lucide-react";

const quickLinks = [
  { label: "About", href: "#about" },
  { label: "Education", href: "#education" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Achievements", href: "#achievements" },
  { label: "Contact", href: "#contact" },
];

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const navClick = (href) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="border-t border-slate-800 bg-slate-950/80 mt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-sm">
                TJ
              </div>
              <span className="font-bold text-white">Teerath Jangid</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              B.Tech ECE Student at JECRC University, Jaipur. Building, learning,
              and growing every day.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
                aria-label="GitHub"
              >
                <GitBranch size={16} />
              </a>
              <a
                href={personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
                aria-label="LinkedIn"
              >
                <Link2 size={16} />
              </a>
              <a
                href={`mailto:${personalInfo.email}`}
                className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
                aria-label="Email"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Quick Links
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => navClick(link.href)}
                  className="text-left text-sm text-slate-500 hover:text-indigo-400 transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Contact
            </h4>
            <div className="space-y-3 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-indigo-400 flex-shrink-0" />
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="hover:text-white transition-colors break-all"
                >
                  {personalInfo.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Link2 size={14} className="text-blue-400 flex-shrink-0" />
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
                <GitBranch size={14} className="text-slate-400 flex-shrink-0" />
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
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-sm flex items-center gap-1.5">
            Made with <Heart size={13} className="text-rose-500 fill-rose-500" /> by{" "}
            <span className="text-slate-400">Teerath Jangid</span> · {new Date().getFullYear()}
          </p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-400 transition-colors"
          >
            <ArrowUp size={14} />
            Back to top
          </button>
        </div>
      </div>
    </footer>
  );
}
