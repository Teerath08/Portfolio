import { ImageResponse } from "next/og";

import { personalInfo, seo, site } from "@/data";

/**
 * Social share image, generated at build time.
 *
 * Drawn with the same visual language as the site — charcoal canvas, cyan
 * accent, circuit traces — so a link preview looks like it belongs to the page
 * rather than like a generic template.
 */
export const alt = `${site.name} — ${personalInfo.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#05080b",
          backgroundImage:
            "radial-gradient(60rem 40rem at 10% -10%, rgba(34,211,238,0.16), transparent 60%)",
          padding: "72px 80px",
          color: "#e2ecf3",
          fontFamily: "sans-serif",
        }}
      >
        {/* Trace decoration */}
        <svg width="1040" height="40" viewBox="0 0 1040 40" fill="none">
          <path
            d="M0 20 H220 L260 6 H520 L560 20 H760 L800 34 H960 L1000 20 H1040"
            stroke="#22d3ee"
            strokeOpacity="0.45"
            strokeWidth="2"
            strokeDasharray="8 7"
          />
        </svg>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 22,
              letterSpacing: 6,
              color: "#22d3ee",
              textTransform: "uppercase",
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                background: "#22d3ee",
              }}
            />
            {site.tagline}
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: -3, lineHeight: 1.05 }}>
              {personalInfo.name}
            </div>
            {/* Satori requires an explicit display on any element with more than
                one child, so this stays a single interpolated string. */}
            <div style={{ display: "flex", fontSize: 38, color: "#94a3b1", marginTop: 14, letterSpacing: -1 }}>
              {`${personalInfo.role} · ${personalInfo.college}`}
            </div>
          </div>

          <div style={{ display: "flex", fontSize: 26, color: "#607080", maxWidth: 900 }}>
            {seo.description}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#607080",
            borderTop: "1px solid rgba(148,197,214,0.18)",
            paddingTop: 26,
          }}
        >
          <span>{personalInfo.location}</span>
          <span style={{ color: "#22d3ee" }}>Embedded · Sensors · Robotics · Web</span>
        </div>
      </div>
    ),
    size,
  );
}
