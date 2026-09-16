import { useState } from "react";
import { achievements } from "../data";
import { Award, BookOpen, Code2, Trophy, Plus } from "lucide-react";

const tabs = [
  { key: "certifications", label: "Certifications", icon: <Award size={16} /> },
  { key: "hackathons", label: "Hackathons", icon: <Code2 size={16} /> },
  { key: "courses", label: "Courses", icon: <BookOpen size={16} /> },
  { key: "awards", label: "Awards", icon: <Trophy size={16} /> },
];

const tabColors = {
  certifications: "from-amber-500 to-orange-500",
  hackathons: "from-indigo-500 to-violet-500",
  courses: "from-sky-500 to-blue-500",
  awards: "from-emerald-500 to-green-500",
};

export default function Achievements() {
  const [activeTab, setActiveTab] = useState("certifications");
  const items = achievements[activeTab];

  return (
    <section id="achievements" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="section-title">
            My <span className="gradient-text">Achievements</span>
          </h2>
          <p className="section-subtitle max-w-xl mx-auto">
            Milestones, certifications, and accomplishments on my journey.
          </p>
          <div className="w-16 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 mx-auto" />
        </div>

        {/* Tab navigation */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? `bg-gradient-to-r ${tabColors[tab.key]} text-white shadow-lg`
                  : "bg-slate-800/60 text-slate-400 border border-slate-700 hover:text-white hover:border-slate-500"
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
              // Placeholder card — shows how to add new entries
              <div
                key={index}
                className="glass-card p-6 border-dashed border-slate-700 hover:border-indigo-500/40 transition-all duration-300 flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-dashed border-slate-600 flex items-center justify-center mx-auto mb-3">
                    <Plus size={20} className="text-slate-500" />
                  </div>
                  <p className="text-slate-500 text-sm font-medium">
                    {item.title}
                  </p>
                  <p className="text-slate-600 text-xs mt-1">
                    Edit <code className="text-indigo-500">src/data.js</code> to add entries
                  </p>
                </div>
              </div>
            ) : (
              // Real achievement card
              <div
                key={index}
                className="glass-card p-6 hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tabColors[activeTab]} flex items-center justify-center flex-shrink-0`}
                  >
                    {tabs.find((t) => t.key === activeTab)?.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white text-sm mb-1">
                      {item.title}
                    </div>
                    <div className="text-slate-400 text-xs">
                      {item.issuer || item.event || item.platform}
                    </div>
                    <div className="text-slate-600 text-xs mt-2">{item.date}</div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Coming soon banner */}
        <div className="mt-10 glass-card p-6 text-center border-indigo-500/20">
          <div className="text-3xl mb-3">🚀</div>
          <h3 className="font-semibold text-white mb-2">More Coming Soon!</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Currently working on certifications, hackathons, and other achievements.
            This section will grow as I continue my learning journey.
          </p>
        </div>
      </div>
    </section>
  );
}
