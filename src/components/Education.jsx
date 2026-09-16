import { education } from "../data";
import { GraduationCap, MapPin, Calendar, BookOpen } from "lucide-react";

export default function Education() {
  const edu = education[0];

  return (
    <section id="education" className="py-24 px-4 bg-slate-900/30">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="section-title">
            My <span className="gradient-text">Education</span>
          </h2>
          <p className="section-subtitle max-w-xl mx-auto">
            Building a strong engineering foundation at JECRC University.
          </p>
          <div className="w-16 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 mx-auto" />
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="hidden md:block absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500 via-violet-500 to-transparent" />

          {/* Timeline dot */}
          <div className="hidden md:flex absolute left-4 top-8 w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 items-center justify-center shadow-lg shadow-indigo-500/30 z-10">
            <GraduationCap size={18} className="text-white" />
          </div>

          {/* Card */}
          <div className="md:ml-24">
            <div className="glass-card p-6 md:p-8 hover:border-indigo-500/40 transition-all duration-300">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 mb-3 inline-block">
                    🎓 {edu.status}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold text-white">
                    {edu.degree}
                  </h3>
                  <p className="text-indigo-400 font-semibold mt-1">{edu.field}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-slate-400 text-sm justify-end mb-1">
                    <Calendar size={14} />
                    <span>{edu.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-sm justify-end">
                    <MapPin size={14} />
                    <span>{edu.location}</span>
                  </div>
                </div>
              </div>

              {/* Institution */}
              <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  JU
                </div>
                <div>
                  <div className="font-semibold text-white">{edu.institution}</div>
                  <div className="text-sm text-slate-400">{edu.location}</div>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {edu.description}
              </p>

              {/* Relevant areas */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen size={16} className="text-indigo-400" />
                  <span className="text-sm font-semibold text-slate-300">
                    Relevant Learning Areas
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {edu.areas.map((area) => (
                    <span
                      key={area}
                      className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:border-indigo-500/50 hover:text-indigo-300 transition-colors cursor-default"
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
            { emoji: "📚", label: "Programme", value: "B.Tech ECE" },
            { emoji: "📅", label: "Expected Graduation", value: "2030" },
          ].map((item) => (
            <div
              key={item.label}
              className="glass-card p-5 text-center hover:border-indigo-500/40 transition-all duration-300"
            >
              <div className="text-3xl mb-2">{item.emoji}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                {item.label}
              </div>
              <div className="font-semibold text-white">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
