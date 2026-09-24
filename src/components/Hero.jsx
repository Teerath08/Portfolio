import { ArrowDown, GitBranch, Link2, Mail, Sparkles, Code2, Cpu, Zap, Bot } from "lucide-react";
import { personalInfo } from "../data";
import { triggerThunderNav } from "../utils/thunder";

export default function Hero({ profileImage, onOpenPhotoModal }) {
  const handleThunderScroll = (id, e) => {
    triggerThunderNav(id, e);
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-20 pb-16"
    >
      {/* Background 3D Cyber Grids & Crimson Ambient Lights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Ambient blood red glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-red-600/15 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-rose-600/15 blur-[120px] animate-pulse [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-red-950/20 blur-[150px]" />

        {/* 3D Cyber Grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(rgba(239,68,68,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(239,68,68,0.6) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative max-w-5xl mx-auto text-center flex flex-col items-center z-10">
        {/* Hero Avatar / Badge with Red Glow */}
        {profileImage && (
          <button
            onClick={onOpenPhotoModal}
            className="group relative mb-6 focus:outline-none cursor-pointer"
            title="Edit Profile Photo"
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-r from-red-600 via-rose-600 to-red-800 shadow-xl shadow-red-600/40 group-hover:scale-105 transition-all duration-300">
              <img
                src={profileImage}
                alt="Teerath Jangid"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <span className="absolute bottom-0 right-0 bg-black text-red-400 p-1.5 rounded-full border border-red-500/50 shadow-md opacity-90 group-hover:opacity-100 transition-opacity">
              <Sparkles size={12} className="text-yellow-400" />
            </span>
          </button>
        )}

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/50 border border-red-700/50 text-red-400 text-xs sm:text-sm font-mono font-semibold mb-8 animate-fade-in shadow-lg shadow-red-950/50">
          <Zap size={14} className="text-yellow-400 animate-pulse fill-yellow-400" />
          <span>ECE Student · Robotics & Microprocessors</span>
        </div>

        {/* 3D Floating Name */}
        <div className="perspective-1000 mb-4">
          <h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-none preserve-3d animate-float-3d"
            style={{
              textShadow:
                "0 2px 0 #991b1b, 0 4px 0 #7f1d1d, 0 6px 0 #450a0a, 0 8px 0 #200000, 0 0 35px rgba(239, 68, 68, 0.65)",
            }}
          >
            Hi, I'm{" "}
            <span className="bg-gradient-to-r from-red-500 via-rose-500 to-red-400 bg-clip-text text-transparent">
              {personalInfo.firstName}
            </span>{" "}
            <span className="block sm:inline">Jangid</span>
          </h1>
        </div>

        {/* Role */}
        <p className="text-lg sm:text-xl md:text-2xl font-semibold text-zinc-300 mb-6 font-mono tracking-wide">
          B.Tech ECE Student | <span className="text-red-500 font-bold">Robotics</span> & <span className="text-red-500 font-bold">Microprocessors</span>
        </p>

        {/* Short intro */}
        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Electronics & Communication Engineering student at{" "}
          <span className="text-white font-medium">JECRC University, Jaipur</span>.
          Passionate about autonomous robotics, microprocessor architectures (8085/8086),
          and intelligent physical automation systems.
        </p>

        {/* Thunder Interactive CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <button
            onClick={(e) => handleThunderScroll("skills", e)}
            className="btn-primary text-base px-8 py-3.5"
          >
            <Bot size={18} />
            Explore My Skills
          </button>
          <button
            onClick={(e) => handleThunderScroll("projects", e)}
            className="btn-outline text-base px-8 py-3.5"
          >
            <Code2 size={18} />
            View Projects
          </button>
          <button
            onClick={(e) => handleThunderScroll("contact", e)}
            className="btn-outline text-base px-8 py-3.5"
          >
            <Mail size={18} />
            Contact Me
          </button>
        </div>

        {/* Social links */}
        <div className="flex items-center justify-center gap-4 mb-14">
          <a
            href={personalInfo.github}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-zinc-950/80 border border-red-950/80 text-zinc-400 hover:text-white hover:border-red-500/60 hover:bg-red-950/30 transition-all duration-200"
            aria-label="GitHub"
          >
            <GitBranch size={20} />
          </a>
          <a
            href={personalInfo.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-zinc-950/80 border border-red-950/80 text-zinc-400 hover:text-white hover:border-red-500/60 hover:bg-red-950/30 transition-all duration-200"
            aria-label="LinkedIn"
          >
            <Link2 size={20} />
          </a>
          <a
            href={`mailto:${personalInfo.email}`}
            className="p-3 rounded-xl bg-zinc-950/80 border border-red-950/80 text-zinc-400 hover:text-white hover:border-red-500/60 hover:bg-red-950/30 transition-all duration-200"
            aria-label="Email"
          >
            <Mail size={20} />
          </a>
        </div>

        {/* 3D Floating Tech Chips with Thunder Navigation */}
        <div className="hidden md:flex items-center justify-center gap-3 flex-wrap mb-10">
          {[
            { label: "⚡ Robotics", target: "skills" },
            { label: "💽 Microprocessor", target: "skills" },
            { label: "⚙️ 8085 / 8086 ALP", target: "skills" },
            { label: "🤖 Autonomous Navigation", target: "skills" },
            { label: "⚡ Sensor Interfacing", target: "skills" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={(e) => handleThunderScroll(item.target, e)}
              className="px-3.5 py-1.5 text-xs font-mono rounded-full bg-zinc-950/80 border border-red-950 text-zinc-300 hover:border-red-500/70 hover:text-red-400 hover:scale-105 transition-all cursor-pointer shadow-md"
              title="Click to strike thunder"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Scroll indicator with Thunder Trigger */}
        <button
          onClick={(e) => handleThunderScroll("about", e)}
          className="animate-bounce text-zinc-600 hover:text-red-400 transition-colors duration-200 mx-auto block cursor-pointer"
          aria-label="Scroll down to About"
          title="Strike thunder to About"
        >
          <ArrowDown size={24} />
        </button>
      </div>
    </section>
  );
}
