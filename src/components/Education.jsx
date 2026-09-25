import React from "react";
import { education } from "../data";
import SectionHeader from "./SectionHeader";
import { GraduationCap, MapPin, Calendar, BookOpen } from "lucide-react";
import { navigateToSection } from "../utils/thunder";

export default function Education() {
  const edu = education[0];

  const handleAreaClick = (area) => {
    if (area.toLowerCase().includes("robotic") || area.toLowerCase().includes("microprocessor")) {
      navigateToSection("skills");
    }
  };

  return (
    <section id="education" className="py-24 px-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-red-950/20 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Floating 3D Section Header */}
        <SectionHeader
          badge="ACADEMICS & CURRICULUM"
          title="My"
          highlight="Education"
          subtitle="Building a rigorous engineering and hardware foundation at JECRC University."
          sectionId="education"
        />

        {/* Timeline */}
        <div className="relative">
          {/* Red Glowing Timeline line */}
          <div className="hidden md:block absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-red-600 via-rose-600 to-transparent shadow-lg shadow-red-600/50" />

          {/* Timeline dot */}
          <div className="accent-text hidden md:flex absolute left-4 top-8 w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-rose-700 items-center justify-center shadow-lg shadow-red-600/40 z-10 border border-red-400/30">
            <GraduationCap size={18} className="text-white" />
          </div>

          {/* Card */}
          <div className="md:ml-24">
            <div className="glass-card p-6 md:p-8 hover:border-red-500/60 transition-all duration-300">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-red-950/70 text-red-400 border border-red-700/50 mb-3 inline-block shadow-sm">
                    🎓 {edu.status}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white">
                    {edu.degree}
                  </h3>
                  <p className="text-red-400 font-semibold mt-1 font-mono">{edu.field}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-sm justify-end mb-1">
                    <Calendar size={14} className="text-red-400" />
                    <span>{edu.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-400 text-sm justify-end">
                    <MapPin size={14} className="text-red-400" />
                    <span>{edu.location}</span>
                  </div>
                </div>
              </div>

              {/* Institution */}
              <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-zinc-900/60 border border-red-950/70">
                <div className="accent-text w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-red-800 flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0 shadow-lg shadow-red-600/30 border border-red-400/30">
                  JU
                </div>
                <div>
                  <div className="font-bold text-white">{edu.institution}</div>
                  <div className="text-sm text-zinc-400">{edu.location}</div>
                </div>
              </div>

              {/* Description */}
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Pursuing a B.Tech in Electronics & Communication Engineering with a core focus on microprocessor architecture, autonomous robotics, digital logic systems, and embedded circuit prototyping.
              </p>

              {/* Relevant areas */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen size={16} className="text-red-400" />
                  <span className="text-sm font-bold text-zinc-300">
                    Key Engineering Focus Areas
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Robotics & Automation",
                    "Microprocessor Architecture (8085/8086)",
                    "Digital Electronics & Logic",
                    "Embedded Systems",
                    "Sensor Interfacing",
                    "Signal Processing",
                    "Assembly Language (ALP)",
                    "Python & Control Systems",
                  ].map((area) => (
                    <span
                      key={area}
                      onClick={(e) => handleAreaClick(area, e)}
                      className="px-3 py-1.5 text-xs rounded-lg bg-zinc-950 border border-red-950/80 text-zinc-300 hover:border-red-500/60 hover:text-red-300 transition-colors cursor-pointer"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-8">
          {[
            { emoji: "🏛️", label: "Institution", value: "JECRC University" },
            { emoji: "⚡", label: "Programme", value: "B.Tech ECE" },
            { emoji: "📅", label: "Graduation Expected", value: "2030" },
          ].map((item) => (
            <div
              key={item.label}
              className="glass-card p-5 text-center hover:border-red-500/50 transition-all duration-300"
            >
              <div className="text-3xl mb-2">{item.emoji}</div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                {item.label}
              </div>
              <div className="font-extrabold text-white text-base">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
