import { Mail, MapPin } from "lucide-react";
import { allSections, personalInfo, site } from "@/data";
import ProfileAvatar from "@/components/layout/ProfileAvatar";
import CircuitRule from "@/components/ui/CircuitRule";
import SectionLink from "@/components/layout/SectionLink";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/BrandIcons";

/**
 * Footer.
 *
 * Minimal by design: identity, the way through to every other section, contact
 * details, and a single animated trace to close the page. Everything else the
 * previous footer carried is either above the fold already or belongs in the
 * contact section.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  const socials = [
    { label: "GitHub", href: personalInfo.github, icon: GitHubIcon },
    { label: "LinkedIn", href: personalInfo.linkedin, icon: LinkedInIcon },
    { label: "Email", href: `mailto:${personalInfo.email}`, icon: Mail },
  ];

  return (
    <footer className="relative border-t border-line/10 bg-canvas/60">
      <div className="shell">
        <CircuitRule className="-mt-4 text-accent/40" />

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:py-14">
          {/* Identity */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <ProfileAvatar size="sm" interactive={false} decorative />
              <div>
                <p className="text-sm font-semibold tracking-tight text-ink">
                  {personalInfo.name}
                </p>
                <p className="label">{personalInfo.role}</p>
              </div>
            </div>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
              {personalInfo.firstName} is studying Electronics &amp; Communication
              Engineering at {personalInfo.college}, building microcontrollers,
              sensors and the web software that puts them to use.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="chip-interactive"
                >
                  <social.icon size={13} aria-hidden="true" />
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          {/* Index */}
          <div>
            <h2 className="label mb-4">On this page</h2>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 lg:grid-cols-1">
              {allSections.map((section) => (
                <li key={section.id}>
                  <SectionLink sectionId={section.id} label={section.label} />
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="label mb-4">Contact</h2>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="break-words text-muted transition-colors hover:text-accent"
                >
                  {personalInfo.email}
                </a>
              </li>
              <li className="flex items-start gap-2 text-dim">
                <MapPin size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                {personalInfo.location}
              </li>
            </ul>

            <a href="#contact" className="btn-ghost mt-6 px-4 py-2.5 text-xs">
              Send a message
            </a>
          </div>
        </div>

        {/* Bottom line */}
        <div className="flex flex-col items-start gap-4 border-t border-line/8 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] text-dim">
            © {year} {site.name} · {site.tagline}
          </p>
          <SectionLink sectionId="home" label="Back to top" trailing />
        </div>
      </div>
    </footer>
  );
}