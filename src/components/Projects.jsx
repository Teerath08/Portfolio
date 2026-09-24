import React from "react";
import { projects } from "../data";
import SectionHeader from "./SectionHeader";
import { GitBranch, ExternalLink } from "lucide-react";
import { navigateToSection } from "../utils/thunder";

const statusColors = {
  Live: "bg-red-500/20 text-red-400 border-red-500/40",
  "In Progress": "bg-amber-500/15 text-amber-400 border-amber-500/25",
  Planning: "bg-zinc-800 text-zinc-400 border-zinc-700",
};

export default function Projects() {
  const handleProjectDemoClick = (project, e) => {
    if (project.demo.startsWith("#")) {
      e.preventDefault();
      navigateToSection(project.demo.slice(1));
    }
  };

  return (
    <section id="projects" className="py-24 px-4 relative overflow-hidden">
      {/* Background radial lighting */}
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-red-950/20 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Floating 3D Section Header */}
        <SectionHeader
          badge="PORTFOLIO & BUILDS"
          title="My"
          highlight="Projects"
          subtitle="Things I've engineered while experimenting with hardware, algorithms, and web systems."
          sectionId="projects"
        />

        {/* Projects grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.title}
              className="project-card group relative overflow-hidden hover:border-red-500/60"
            >
              {/* Subtle crimson gradient top accent */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${project.color} opacity-80 group-hover:opacity-100 group-hover:h-1.5 transition-all`}
              />

              {/* Header */}
              <div className="flex items-start justify-between gap-3 pt-1">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${project.color} flex items-center justify-center text-xl flex-shrink-0 shadow-lg shadow-red-950 group-hover:scale-110 transition-transform duration-300 border border-red-400/20`}
                >
                  {project.emoji}
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full border font-mono font-medium flex-shrink-0 ${
                    statusColors[project.status] || "text-zinc-400 border-zinc-800"
                  }`}
                >
                  {project.status}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                {project.title}
              </h3>

              {/* Description */}
              <p className="text-zinc-400 text-sm leading-relaxed flex-1">
                {project.description}
              </p>

              {/* Tech stack */}
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2.5 py-1 rounded-lg bg-zinc-900 border border-red-950 text-zinc-400 font-mono"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-red-950/60">
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors font-medium"
                >
                  <GitBranch size={15} />
                  Code
                </a>
                <a
                  href={project.demo}
                  onClick={(e) => handleProjectDemoClick(project, e)}
                  className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors font-medium ml-auto"
                >
                  <ExternalLink size={15} />
                  View Project
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* GitHub CTA */}
        <div className="mt-14 text-center">
          <a
            href="https://github.com/Teerath08"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline inline-flex items-center gap-2"
          >
            <GitBranch size={18} />
            See All Repositories on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
