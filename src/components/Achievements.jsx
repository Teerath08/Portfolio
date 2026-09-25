import React, { useState } from "react";
import { achievements } from "../data";
import SectionHeader from "./SectionHeader";
import { Award, BookOpen, Code2, Trophy, Plus } from "lucide-react";

const tabs = [
  { key: "certifications", label: "Certifications", icon: <Award size={16} /> },
  { key: "hackathons", label: "Hackathons", icon: <Code2 size={16} /> },
  { key: "courses", label: "Courses", icon: <BookOpen size={16} /> },
  { key: "awards", label: "Awards", icon: <Trophy size={16} /> },
];

const tabColors = {
  certifications: "from-red-600 to-rose-700",
  hackathons: "from-rose-600 to-red-800",
  courses: "from-red-500 to-amber-600",
  awards: "from-red-700 to-rose-900",
};

export default function Achievements() {
  const [activeTab, setActiveTab] = useState("certifications");
  const items = achievements[activeTab];

  return (
    <section id="achievements" className="py-24 px-4 relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        {/* Floating 3D Section Header */}
        <SectionHeader
          badge="MILESTONES & HONORS"
          title="My"
          highlight="Achievements"
          subtitle="Certifications, hackathons, and learning milestones in robotics and embedded systems."
          sectionId="achievements"
        />

        {/* Tab navigation */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === tab.key
                  ? `accent-text bg-gradient-to-r ${tabColors[tab.key]} text-white shadow-lg shadow-red-600/35 border border-red-400/30 scale-105`
                  : "bg-zinc-950/70 text-zinc-400 border border-red-950/80 hover:text-white hover:border-red-600/50 hover:bg-red-950/20"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Achievement cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {items.map((item, index) =>
            item.placeholder ? (
              // Placeholder card
              <div
                key={index}
                className="glass-card p-6 border-dashed border-red-950/80 hover:border-red-500/50 transition-all duration-300 flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-zinc-900/80 border border-dashed border-red-800/60 flex items-center justify-center mx-auto mb-3">
                    <Plus size={20} className="text-red-500" />
                  </div>
                  <p className="text-zinc-300 text-sm font-semibold mb-1">
                    {item.title}
                  </p>
                  <p className="text-zinc-500 text-xs">
                    Update in <code className="text-red-400 font-mono">src/data.js</code>
                  </p>
                </div>
              </div>
            ) : (
              // Real achievement card
              <div
                key={index}
                className="glass-card p-6 hover:border-red-500/50 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`accent-text w-10 h-10 rounded-xl bg-gradient-to-br ${tabColors[activeTab]} flex items-center justify-center flex-shrink-0 text-white shadow-md shadow-red-950`}
                  >
                    {tabs.find((t) => t.key === activeTab)?.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white text-sm mb-1">
                      {item.title}
                    </div>
                    <div className="text-zinc-400 text-xs">
                      {item.issuer || item.event || item.platform}
                    </div>
                    <div className="text-zinc-500 text-xs mt-2 font-mono">{item.date}</div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Coming soon banner */}
        <div className="mt-10 glass-card p-6 text-center border-red-900/40">
          <div className="text-3xl mb-3">⚡</div>
          <h3 className="font-bold text-white mb-2">More Milestones in Progress!</h3>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            Actively pursuing certifications in Robotics, Microprocessors, and Hardware Architecture.
          </p>
        </div>
      </div>
    </section>
  );
}
