import { MapPin, MessageSquare, Radio } from "lucide-react";

import { personalInfo } from "@/data";
import ContactForm, { CopyEmailButton } from "@/components/sections/ContactForm";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import Waveform from "@/components/ui/Waveform";
import {
  GitHubIcon,
  LinkedInIcon,
  type IconComponent,
} from "@/components/ui/BrandIcons";

/**
 * Contact.
 *
 * Everything here is a real, working link: a mail link, two profiles and a map.
 * The address can be copied in one click, with a fallback for browsers that
 * refuse clipboard access.
 *
 * The form is on the right and behaves exactly as it did before the redesign —
 * it composes a `mailto:` in the visitor's own client, so there is no backend
 * to break and no third party holding the address.
 */
export default function Contact() {
  const channels: {
    id: string;
    icon: IconComponent;
    label: string;
    value: string;
    href: string;
    external: boolean;
    copyable: boolean;
  }[] = [
    {
      id: "email",
      icon: Radio,
      label: "Email",
      value: personalInfo.email,
      href: `mailto:${personalInfo.email}`,
      external: false,
      copyable: true,
    },
    {
      id: "linkedin",
      icon: LinkedInIcon,
      label: "LinkedIn",
      value: personalInfo.linkedinHandle,
      href: personalInfo.linkedin,
      external: true,
      copyable: false,
    },
    {
      id: "github",
      icon: GitHubIcon,
      label: "GitHub",
      value: `@${personalInfo.githubHandle}`,
      href: personalInfo.github,
      external: true,
      copyable: false,
    },
    {
      id: "location",
      icon: MapPin,
      label: "Location",
      value: personalInfo.location,
      href: "https://maps.google.com/?q=Jaipur,Rajasthan,India",
      external: true,
      copyable: false,
    },
  ];

  return (
    <section id="contact" aria-labelledby="contact-title" className="section">
      <div className="shell">
        <SectionHeader
          id="contact-title"
          index="09"
          eyebrow="Contact"
          title="Open to"
          highlight="a conversation"
          lede="Whether it's a hardware design question, a robotics idea, or just an interesting problem with a microcontroller attached — the inbox is open."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* ── Channels ──────────────────────────────────────────────────── */}
          <Reveal>
            <div className="panel flex h-full flex-col overflow-hidden">
              <div className="flex items-center gap-2.5 border-b border-line/8 px-5 py-4">
                <MessageSquare size={15} className="text-accent" aria-hidden="true" />
                <h3 className="text-base font-semibold tracking-tight text-ink">
                  Direct channels
                </h3>
              </div>

              <ul className="stack-divider flex-1">
                {channels.map((channel) => {
                  const Icon = channel.icon;
                  return (
                    <li
                      key={channel.id}
                      className="flex items-center gap-4 px-5 py-4 transition-colors duration-300 hover:bg-surface-2/40"
                    >
                      <span
                        aria-hidden="true"
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line/12 bg-surface2/70 text-accent"
                      >
                        <Icon size={17} strokeWidth={1.8} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="label block">{channel.label}</span>
                        <a
                          href={channel.href}
                          {...(channel.external
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                          className="mt-0.5 block truncate text-sm font-medium text-ink transition-colors duration-300 hover:text-accent"
                        >
                          {channel.value}
                          {channel.external && <span className="sr-only"> (opens in a new tab)</span>}
                        </a>
                      </span>

                      {channel.copyable && <CopyEmailButton />}
                    </li>
                  );
                })}
              </ul>

              {/* Availability */}
              <div className="border-t border-line/8 px-5 py-4">
                <p className="flex items-center gap-2.5 font-mono text-[11px] text-muted">
                  <span aria-hidden="true" className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/70" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                  </span>
                  Replies usually within a couple of days.
                </p>
              </div>
            </div>
          </Reveal>

          {/* ── Form ──────────────────────────────────────────────────────── */}
          <Reveal delay={0.08}>
            <ContactForm />
          </Reveal>
        </div>

        {/* Closing waveform — the page's last piece of instrumentation. */}
        <Reveal delay={0.12}>
          <div className="mt-10 h-16 w-full opacity-60" aria-hidden="true">
            <Waveform opacity={0.55} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
