import React from "react";
import { personalInfo } from "../data";
import SectionHeader from "./SectionHeader";
import { Cpu, Bot, Zap, CircuitBoard, Camera } from "lucide-react";
import { triggerThunderNav } from "../utils/thunder";

const passions = [
  {
    icon: <Bot size={22} />,
    title: "Robotics & Kinematics",
    desc: "Designing autonomous machines, mobile robots, kinematics, and motor actuation systems.",
    color: "from-red-600 to-rose-700",
  },
  {
    icon: <Cpu size={22} />,
    title: "Microprocessors & Architecture",
    desc: "Studying 8085 & 8086 instruction sets, bus timing, assembly programming, and memory interfacing.",
    color: "from-rose-600 to-red-800",
  },
  {
    icon: <CircuitBoard size={22} />,
    title: "Embedded Hardware & Sensors",
    desc: "Integrating sensor networks (IR, Ultrasonic, IMU) with microcontrollers for responsive control loops.",
    color: "from-red-500 to-amber-600",
  },
  {
    icon: <Zap size={22} />,
    title: "Physical Computing & AI",
    desc: "Bridging intelligent algorithms with physical hardware to solve real-world automation challenges.",
    color: "from-red-700 to-rose-950",
  },
];

const stats = [
  { label: "B.Tech Year", value: "1st" },
  { label: "Hardware Focus", value: "Robotics" },
  { label: "Architecture", value: "8085 / 8086" },
  { label: "Learning Streak", value: "Daily" },
];

export default function About({ profileImage, onOpenPhotoModal }) {
  return (
    <section id="about" className="py-24 px-4 relative">
      <div className="max-w-6xl mx-auto">
        {/* Floating 3D Section Header */}
        <SectionHeader
          badge="PROFILE & PASSION"
          title="About"
          highlight="Me"
          subtitle="Engineering student by degree, hardware & robotics enthusiast by passion."
          sectionId="about"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Avatar / Visual 3D Ring */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Outer glowing red ring */}
              <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full border-2 border-red-600/40 p-4 animate-float shadow-2xl shadow-red-950/80">
                {/* Inner circle */}
                <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-red-900 via-rose-950 to-black flex items-center justify-center shadow-2xl shadow-red-600/30 group border border-red-500/30">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Teerath Jangid Profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-7xl sm:text-8xl font-black text-white/95 select-none tracking-tight">
                      TJ
                    </span>
                  )}

                  {/* Camera overlay button */}
                  <button
                    onClick={onOpenPhotoModal}
                    className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 text-white font-medium transition-all duration-300 backdrop-blur-xs cursor-pointer"
                    title="Upload & Crop Profile Photo"
                  >
                    <Camera size={32} className="text-red-400 animate-bounce" />
                    <span className="text-xs sm:text-sm font-semibold bg-red-600 px-3.5 py-1.5 rounded-full border border-red-400/40 shadow-lg shadow-red-600/50">
                      {profileImage ? "Edit Photo" : "Upload Photo"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Direct Upload button badge below avatar on mobile */}
              <button
                onClick={onOpenPhotoModal}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-zinc-950 border border-red-900/60 text-zinc-300 text-xs font-medium transition-all shadow-md sm:hidden"
              >
                <Camera size={14} className="text-red-400" />
                <span>{profileImage ? "Edit Profile Photo" : "Upload Profile Photo"}</span>
              </button>

              {/* Floating decorative badges with 3D depth */}
              <div className="absolute -bottom-2 -right-2 sm:bottom-4 sm:right-0 bg-black/90 border border-red-900/80 rounded-2xl px-4 py-2 shadow-2xl backdrop-blur-md">
                <div className="text-[11px] font-mono text-zinc-400">📍 Location</div>
                <div className="text-sm font-bold text-white">Jaipur, India</div>
              </div>
              <div className="absolute -top-2 -left-2 sm:top-4 sm:left-0 bg-black/90 border border-red-900/80 rounded-2xl px-4 py-2 shadow-2xl backdrop-blur-md">
                <div className="text-[11px] font-mono text-red-400">🎓 Specialization</div>
                <div className="text-sm font-bold text-white">Robotics & ECE</div>
              </div>
            </div>
          </div>

          {/* Bio text */}
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
              Hi, I'm <span className="gradient-text">{personalInfo.name}</span> 👋
            </h3>
            <div className="space-y-4 text-zinc-400 leading-relaxed text-sm sm:text-base">
              <p>
                I'm a passionate B.Tech Electronics & Communication Engineering (ECE) student at JECRC University, Jaipur. My technical curiosity is centered around the frontiers of physical computing: from autonomous robotic mechanisms and sensor interfacing to internal microprocessor architecture.
              </p>
              <p>
                I thrive at the intersection of embedded hardware and software logic — mastering assembly language, bus communication, and sensor-actuator control loops to build responsive, real-world machines.
              </p>
              <p>
                Currently honing deep practical competencies in <span className="text-red-400 font-semibold">Robotics kinematics</span> and <span className="text-red-400 font-semibold">Microprocessor system designs</span>.
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="text-center p-3 rounded-xl bg-zinc-950/80 border border-red-950/80 hover:border-red-600/50 transition-colors"
                >
                  <div className="text-xl font-black text-red-500 font-mono">{s.value}</div>
                  <div className="text-xs text-zinc-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Passion cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {passions.map((p) => (
            <div
              key={p.title}
              className="glass-card p-5 hover:-translate-y-2 transition-all duration-300 hover:border-red-500/70 group"
            >
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-red-950/80`}
              >
                {p.icon}
              </div>
              <h4 className="font-bold text-white text-sm mb-2 group-hover:text-red-400 transition-colors">
                {p.title}
              </h4>
              <p className="text-zinc-400 text-xs leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
