import React, { useState } from "react";
import { skills } from "../data";
import SectionHeader from "./SectionHeader";
import { Cpu, Bot, Zap, CircuitBoard, Sparkles, ShieldCheck } from "lucide-react";
import { triggerThunderNav } from "../utils/thunder";

export default function Skills() {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(skills.map((s) => s.category)))];

  const filtered =
    activeCategory === "All"
      ? skills
      : skills.filter((s) => s.category === activeCategory);

  const handleCardClick = (skillName, e) => {
    // Interactive thunder crackle on card click
    triggerThunderNav("skills", e);
  };

  return (
    <section id="skills" className="py-24 px-4 relative overflow-hidden">
      {/* Ambient Red Glow in Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Floating 3D Section Header */}
        <SectionHeader
          badge="HARDWARE & EMBEDDED"
          title="My"
          highlight="Skills"
          subtitle="Specialized domain mastery in Robotics systems and Microprocessor architecture."
          sectionId="skills"
        />

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2.5 justify-center mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer ${
                activeCategory === cat
                  ? "bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-lg shadow-red-600/40 border border-red-400/40 scale-105"
                  : "bg-zinc-950/70 text-zinc-400 border border-red-950/80 hover:text-white hover:border-red-600/50 hover:bg-red-950/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3D Skills Cards Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {filtered.map((skill) => (
            <div
              key={skill.name}
              onClick={(e) => handleCardClick(skill.name, e)}
              className="group relative rounded-2xl bg-zinc-950/90 border border-red-950/80 p-7 hover:border-red-500/80 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-red-600/25 cursor-pointer overflow-hidden backdrop-blur-xl"
              style={{
                transformStyle: "preserve-3d",
              }}
            >
              {/* Top Accent Gradient Bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${skill.color} opacity-80 group-hover:opacity-100 group-hover:h-1.5 transition-all`}
              />

              {/* Background Cyber Grid Accent */}
              <div className="absolute inset-0 bg-cyber-grid opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity" />

              {/* Header: Icon, Category & Level */}
              <div className="flex items-start justify-between gap-4 mb-5 relative z-10">
                <div className="flex items-center gap-4">
                  {/* 3D Glowing Icon Container */}
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${skill.color} border border-red-400/30 flex items-center justify-center text-3xl shadow-xl shadow-red-950/80 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                  >
                    {skill.name === "Robotics" ? (
                      <Bot className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" size={32} />
                    ) : (
                      <Cpu className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" size={32} />
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-red-400/80 block mb-0.5">
                      {skill.category}
                    </span>
                    <h3 className="text-2xl font-black text-white group-hover:text-red-400 transition-colors">
                      {skill.name}
                    </h3>
                  </div>
                </div>

                {/* Level Badge */}
                <span className="text-xs px-3 py-1 rounded-full border border-red-500/40 bg-red-950/60 text-red-300 font-semibold shadow-inner flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  {skill.level}
                </span>
              </div>

              {/* Tagline */}
              {skill.tagline && (
                <div className="text-xs font-mono font-medium text-red-300/90 mb-3 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-yellow-400" />
                  <span>{skill.tagline}</span>
                </div>
              )}

              {/* Description */}
              <p className="text-zinc-400 text-sm leading-relaxed mb-6 relative z-10">
                {skill.description}
              </p>

              {/* Core Skill Chips */}
              {skill.highlights && (
                <div className="space-y-2 relative z-10 pt-4 border-t border-red-950/60">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                    <CircuitBoard size={12} className="text-red-500" />
                    <span>Key Competencies & Interfacing</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {skill.highlights.map((item) => (
                      <span
                        key={item}
                        className="text-xs px-2.5 py-1 rounded-lg bg-zinc-900 border border-red-950 text-zinc-300 group-hover:border-red-900/60 group-hover:text-zinc-200 transition-colors"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Card Footer Interactive Indicator */}
              <div className="mt-6 flex items-center justify-between text-xs text-zinc-500 pt-3 border-t border-red-950/40">
                <span className="font-mono text-[11px] text-red-500/80 flex items-center gap-1">
                  <ShieldCheck size={13} className="text-red-500" />
                  ECE Core Curriculum & Practical Labs
                </span>
                <span className="text-zinc-400 group-hover:text-yellow-400 transition-colors flex items-center gap-1 font-mono text-[11px]">
                  <Zap size={11} className="fill-yellow-400" />
                  Strike Thunder
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Hardware Architecture Callout */}
        <div className="mt-14 max-w-2xl mx-auto text-center p-6 rounded-2xl bg-zinc-950/60 border border-red-950/60 backdrop-blur-md">
          <div className="inline-flex items-center gap-2 text-red-400 text-xs font-mono mb-2">
            <CircuitBoard size={14} className="text-red-500" />
            <span>HARDWARE & EMBEDDED FOCUS</span>
          </div>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
            Combining digital electronics, 8085/8086 assembly, and robotic sensor-actuator loops
            to build intelligent physical computing and automation systems.
          </p>
        </div>
      </div>
    </section>
  );
}
