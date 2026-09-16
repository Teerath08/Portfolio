import { ArrowDown, GitBranch, Link2, Mail, Sparkles, Code2, Cpu } from "lucide-react";
import { personalInfo } from "../data";

export default function Hero({ profileImage, onOpenPhotoModal }) {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-16"
    >
      {/* Background gradient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-violet-600/10 blur-3xl animate-pulse [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-sky-600/5 blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Hero Avatar / Badge */}
        {profileImage && (
          <button
            onClick={onOpenPhotoModal}
            className="group relative mb-6 focus:outline-none"
            title="Edit Profile Photo"
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 shadow-xl shadow-indigo-500/25 group-hover:scale-105 transition-all duration-300">
              <img
                src={profileImage}
                alt="Teerath Jangid"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <span className="absolute bottom-0 right-0 bg-slate-900 text-indigo-400 p-1.5 rounded-full border border-indigo-500/40 shadow-md opacity-90 group-hover:opacity-100 transition-opacity">
              <Sparkles size={12} />
            </span>
          </button>
        )}

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-sm font-medium mb-8 animate-fade-in">
          <Sparkles size={14} className="animate-pulse" />
          <span>B.Tech ECE Student · Graduating 2030</span>
        </div>

        {/* Name */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white mb-4 tracking-tight leading-none">
          Hi, I'm{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">
            {personalInfo.firstName}
          </span>{" "}
          <span className="block sm:inline">Jangid</span>
        </h1>

        {/* Role */}
        <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-300 mb-6">
          {personalInfo.role}
        </p>

        {/* Short intro */}
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          B.Tech ECE student at{" "}
          <span className="text-slate-300 font-medium">JECRC University, Jaipur</span>{" "}
          — passionate about Robotics, AI, Web Development, and building things
          that actually work. Learning every day, one project at a time.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <button
            onClick={() => scrollTo("projects")}
            className="btn-primary text-base px-8 py-3.5"
          >
            <Code2 size={18} />
            View Projects
          </button>
          <button
            onClick={() => scrollTo("contact")}
            className="btn-outline text-base px-8 py-3.5"
          >
            <Mail size={18} />
            Contact Me
          </button>
        </div>

        {/* Social links */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <a
            href={personalInfo.github}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-white hover:border-indigo-500/50 hover:bg-slate-700/60 transition-all duration-200"
            aria-label="GitHub"
          >
            <GitBranch size={20} />
          </a>
          <a
            href={personalInfo.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-white hover:border-blue-500/50 hover:bg-slate-700/60 transition-all duration-200"
            aria-label="LinkedIn"
          >
            <Link2 size={20} />
          </a>
          <a
            href={`mailto:${personalInfo.email}`}
            className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-white hover:border-violet-500/50 hover:bg-slate-700/60 transition-all duration-200"
            aria-label="Email"
          >
            <Mail size={20} />
          </a>
        </div>

        {/* Floating tech chips */}
        <div className="hidden md:flex items-center justify-center gap-3 flex-wrap mb-10">
          {["React", "Python", "AI / ML", "Robotics", "Tailwind CSS", "Generative AI"].map(
            (tech) => (
              <span
                key={tech}
                className="px-3 py-1 text-xs rounded-full bg-slate-800/60 border border-slate-700 text-slate-400"
              >
                {tech}
              </span>
            )
          )}
        </div>

        {/* Scroll indicator */}
        <button
          onClick={() => scrollTo("about")}
          className="animate-bounce text-slate-600 hover:text-indigo-400 transition-colors duration-200 mx-auto block"
          aria-label="Scroll down"
        >
          <ArrowDown size={24} />
        </button>
      </div>
    </section>
  );
}
