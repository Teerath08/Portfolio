import { projects } from "../data";
import { GitBranch, ExternalLink, Code2 } from "lucide-react";

const statusColors = {
  Live: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  "In Progress": "bg-amber-500/15 text-amber-400 border-amber-500/25",
  Planning: "bg-slate-500/15 text-slate-400 border-slate-500/25",
};

export default function Projects() {
  return (
    <section id="projects" className="py-24 px-4 bg-slate-900/30">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="section-title">
            My <span className="gradient-text">Projects</span>
          </h2>
          <p className="section-subtitle max-w-xl mx-auto">
            Things I've built while learning and experimenting with technology.
          </p>
          <div className="w-16 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 mx-auto" />
        </div>

        {/* Projects grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div key={project.title} className="project-card group relative overflow-hidden">
              {/* Subtle gradient top accent */}
              <div
                className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${project.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${project.color} flex items-center justify-center text-xl flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  {project.emoji}
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium flex-shrink-0 ${
                    statusColors[project.status]
                  }`}
                >
                  {project.status}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                {project.title}
              </h3>

              {/* Description */}
              <p className="text-slate-400 text-sm leading-relaxed flex-1">
                {project.description}
              </p>

              {/* Tech stack */}
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-400"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors font-medium"
                >
                  <GitBranch size={15} />
                  Code
                </a>
                <a
                  href={project.demo}
                  className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-400 transition-colors font-medium"
                >
                  <ExternalLink size={15} />
                  View Project
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* GitHub CTA */}
        <div className="mt-12 text-center">
          <a
            href="https://github.com/Teerath08"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline inline-flex"
          >
            <GitBranch size={18} />
            See All Projects on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
