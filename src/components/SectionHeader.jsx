import React, { useRef } from "react";
import { navigateToSection } from "../utils/thunder";

export default function SectionHeader({
  badge = "PORTFOLIO",
  title = "My",
  highlight = "Skills",
  subtitle = "Tools, technologies, and systems I work with.",
  sectionId = "",
}) {
  const containerRef = useRef(null);

  const handleHeadingClick = () => {
    if (sectionId) {
      navigateToSection(sectionId);
    }
  };

  return (
    <div className="text-center mb-16 flex flex-col items-center">
      {/* 3D Perspective Floating Heading Container */}
      <div className="section-heading-container perspective-1000">
        <div
          ref={containerRef}
          onClick={handleHeadingClick}
          data-section-heading="true"
          className="floating-3d-heading group select-none cursor-default"
        >
          {/* Cybernetic 3D Red Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/60 border border-red-700/50 text-red-400 text-xs font-mono font-semibold tracking-widest mb-3 backdrop-blur-md shadow-lg shadow-red-950/60 transition-all">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>{badge}</span>
          </div>

          {/* 3D Extruded Title */}
          <h2 className="section-title flex items-center justify-center gap-3">
            <span>{title}</span>
            <span className="gradient-text">{highlight}</span>
          </h2>
        </div>
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="section-subtitle mt-3">
          {subtitle}
        </p>
      )}

      {/* 3D Glowing Red Bar Accent */}
      <div className="relative flex items-center justify-center w-36 h-1 mt-1">
        <div className="w-full h-0.5 rounded-full bg-gradient-to-r from-transparent via-red-600 to-transparent shadow-lg shadow-red-600/80" />
        <div className="absolute w-2 h-2 rounded-full bg-red-500 shadow-md shadow-red-500" />
      </div>
    </div>
  );
}
