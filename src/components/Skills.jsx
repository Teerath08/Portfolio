import { useState } from "react";
import { skills } from "../data";

const categories = ["All", "Web", "Programming", "AI", "Engineering", "Productivity"];

const levelColors = {
  Proficient: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Intermediate: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Learning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

export default function Skills() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? skills
      : skills.filter((s) => s.category === activeCategory);

  return (
    <section id="skills" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="section-title">
            My <span className="gradient-text">Skills</span>
          </h2>
          <p className="section-subtitle max-w-xl mx-auto">
            Tools and technologies I work with and learn every day.
          </p>
          <div className="w-16 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 mx-auto" />
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                  : "bg-slate-800/60 text-slate-400 border border-slate-700 hover:text-white hover:border-slate-500"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skills grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((skill) => (
            <div key={skill.name} className="skill-card group">
              {/* Icon with gradient background */}
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${skill.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                {skill.icon}
              </div>

              {/* Name */}
              <div className="text-sm font-semibold text-white text-center leading-tight">
                {skill.name}
              </div>

              {/* Level badge */}
              <span
                className={`text-xs px-2.5 py-1 rounded-full border font-medium ${levelColors[skill.level]}`}
              >
                {skill.level}
              </span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-5 mt-10 pt-8 border-t border-slate-800">
          {Object.entries(levelColors).map(([level, cls]) => (
            <div key={level} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${cls.split(" ")[0]}`} />
              <span className="text-xs text-slate-500">{level}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
