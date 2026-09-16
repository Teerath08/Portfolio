import { personalInfo } from "../data";
import { Cpu, Globe, Brain, Zap, Camera } from "lucide-react";

const passions = [
  {
    icon: <Cpu size={22} />,
    title: "Robotics & Automation",
    desc: "Fascinated by intelligent machines and automated systems that interact with the physical world.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: <Brain size={22} />,
    title: "Artificial Intelligence",
    desc: "Exploring how AI and Generative AI can solve complex problems and create value across industries.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: <Globe size={22} />,
    title: "Web Development",
    desc: "Building modern, responsive web applications that deliver great user experiences.",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: <Zap size={22} />,
    title: "Digital Productivity",
    desc: "Leveraging tools, AI assistants, and workflows to maximize efficiency and output quality.",
    color: "from-emerald-500 to-teal-500",
  },
];

const stats = [
  { label: "B.Tech Year", value: "1st" },
  { label: "Projects Built", value: "3+" },
  { label: "Tech Interests", value: "6+" },
  { label: "Learning Streak", value: "Daily" },
];

export default function About({ profileImage, onOpenPhotoModal }) {
  return (
    <section id="about" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="section-title">
            About <span className="gradient-text">Me</span>
          </h2>
          <p className="section-subtitle max-w-xl mx-auto">
            Engineering student by degree, builder by passion.
          </p>
          <div className="w-16 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Avatar / Visual */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Outer ring */}
              <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full border-2 border-indigo-500/30 p-4 animate-float">
                {/* Inner circle */}
                <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-2xl shadow-indigo-500/30 group">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Teerath Jangid Profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-7xl sm:text-8xl font-black text-white/90 select-none">
                      TJ
                    </span>
                  )}

                  {/* Camera overlay button */}
                  <button
                    onClick={onOpenPhotoModal}
                    className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 text-white font-medium transition-all duration-300 backdrop-blur-xs cursor-pointer"
                    title="Upload & Crop Profile Photo"
                  >
                    <Camera size={32} className="text-indigo-400 animate-bounce" />
                    <span className="text-xs sm:text-sm font-semibold bg-indigo-600/90 px-3.5 py-1.5 rounded-full border border-indigo-400/30 shadow-lg">
                      {profileImage ? "Edit Photo" : "Upload Photo"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Direct Upload button badge below avatar on mobile/small screens */}
              <button
                onClick={onOpenPhotoModal}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-xs font-medium transition-all shadow-md sm:hidden"
              >
                <Camera size={14} className="text-indigo-400" />
                <span>{profileImage ? "Edit Profile Photo" : "Upload Profile Photo"}</span>
              </button>
              {/* Floating decorative badge */}
              <div className="absolute -bottom-2 -right-2 sm:bottom-4 sm:right-0 bg-slate-900 border border-slate-700 rounded-2xl px-4 py-2 shadow-xl">
                <div className="text-xs text-slate-400">📍 Location</div>
                <div className="text-sm font-semibold text-white">Jaipur, India</div>
              </div>
              <div className="absolute -top-2 -left-2 sm:top-4 sm:left-0 bg-slate-900 border border-slate-700 rounded-2xl px-4 py-2 shadow-xl">
                <div className="text-xs text-slate-400">🎓 Status</div>
                <div className="text-sm font-semibold text-white">B.Tech Student</div>
              </div>
            </div>
          </div>

          {/* Bio text */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Hi, I'm{" "}
              <span className="gradient-text">{personalInfo.name}</span> 👋
            </h3>
            <div className="space-y-4 text-slate-400 leading-relaxed">
              {personalInfo.about.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="text-center p-3 rounded-xl bg-slate-800/50 border border-slate-700"
                >
                  <div className="text-2xl font-bold text-indigo-400">{s.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Passion cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {passions.map((p) => (
            <div key={p.title} className="glass-card p-5 hover:-translate-y-1 transition-all duration-300 hover:border-slate-600 group">
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}
              >
                {p.icon}
              </div>
              <h4 className="font-semibold text-white text-sm mb-2">{p.title}</h4>
              <p className="text-slate-500 text-xs leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
