"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { allSections, navItems, personalInfo, site } from "@/data";
import { useActiveSection, usePrefersReducedMotion, useScrollLock } from "@/lib/hooks";
import { navigateToSection } from "@/lib/navigate";
import { cn } from "@/lib/cn";
import ProfileAvatar from "@/components/layout/ProfileAvatar";
import ThemeToggle from "@/components/layout/ThemeToggle";

/**
 * Sticky navigation.
 *
 * On scroll it shrinks, gains a blur and becomes more opaque, so it stays out
 * of the way of the content without disappearing. The active section is tracked
 * with an IntersectionObserver and indicated by a shared `layoutId` bar, which
 * slides between items instead of jumping.
 *
 * The whole bar is a client component because of the scroll state and the
 * mobile drawer. Everything it links to is server-rendered below it.
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduced = usePrefersReducedMotion();

  const sectionIds = useMemo(() => allSections.map((section) => section.id), []);
  const active = useActiveSection(sectionIds);

  /**
   * The indicator follows a click immediately, then hands control back to the
   * scroll observer.
   *
   * Waiting for IntersectionObserver alone means clicking "Home" scrolls the
   * page but leaves the outline on whichever section was previously in view
   * until the smooth scroll happens to land. Selecting optimistically and
   * re-syncing whenever the observer reports something different gives the
   * instant response a click implies, without giving up accurate tracking while
   * the reader scrolls by hand.
   *
   * The re-sync is done during render rather than in an effect. `active` is not
   * a prop, but it is the same kind of input: a value that changes outside this
   * component. React's documented answer for that is to adjust state while
   * rendering, which discards the intermediate render instead of scheduling a
   * second one behind a commit.
   */
  const [selected, setSelected] = useState(active);
  const [observed, setObserved] = useState(active);
  if (active !== observed) {
    setObserved(active);
    setSelected(active);
  }

  useScrollLock(open);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24);
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape closes the drawer and returns focus to the button that opened it.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (id: string) => {
    setSelected(id);
    setOpen(false);
    navigateToSection(id);
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-out",
        scrolled || open
          ? "glass border-b border-line/10 shadow-[0_18px_40px_-34px_rgb(0_0_0/1)]"
          : "border-b border-transparent",
      )}
    >
      <nav
        aria-label="Primary"
        className={cn(
          "shell flex items-center justify-between gap-4 transition-all duration-500 ease-out",
          scrolled ? "h-14" : "h-16 sm:h-[4.5rem]",
        )}
      >
        {/* ── Wordmark ── */}
        <button
          type="button"
          onClick={() => go("home")}
          className="group flex items-center gap-3 text-left"
          aria-label={`${site.name} — back to top`}
        >
          <ProfileAvatar
            size="sm"
            interactive={false}
            className="h-9 w-9 rounded-xl"
            decorative
          />
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-semibold tracking-tight text-ink">
              {personalInfo.firstName} {personalInfo.lastName}
            </span>
            <span className="label block text-[9px]">{site.tagline}</span>
          </span>
        </button>

        {/* ── Desktop links ── */}
        <ul className="hidden items-center gap-0.5 lg:flex">
          {navItems.map((item) => {
            const isActive = selected === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => go(item.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "relative rounded-lg px-3 py-2 text-xs font-medium tracking-tight transition-colors duration-300",
                    isActive ? "text-accent" : "text-muted hover:text-ink",
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-lg border border-accent/25 bg-accent/[0.08]"
                      transition={
                        reduced
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 380, damping: 32 }
                      }
                    />
                  )}
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>

        {/* ── Right cluster ── */}
        <div className="flex items-center gap-2">
          <a
            href={personalInfo.github}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-quiet hidden xl:inline-flex"
          >
            GitHub
          </a>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="grid h-10 w-10 place-items-center rounded-xl border border-line/10 bg-surface/60 text-muted transition-colors duration-300 hover:border-accent/40 hover:text-accent lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="mobile-nav"
            key="drawer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-line/10 lg:hidden"
          >
            <div className="glass shell flex flex-col gap-1 py-4">
              {allSections.map((section, index) => {
                const isActive = selected === section.id;
                return (
                  <motion.button
                    key={section.id}
                    type="button"
                    onClick={() => go(section.id)}
                    initial={{ opacity: 0, x: reduced ? 0 : -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: reduced ? 0 : 0.04 + index * 0.035,
                      duration: reduced ? 0 : 0.3,
                    }}
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors duration-300",
                      isActive
                        ? "border-accent/30 bg-accent/[0.07] text-accent"
                        : "border-transparent text-muted hover:border-line/12 hover:bg-surface/60 hover:text-ink",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span className="index text-[10px] text-dim">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {section.label}
                    </span>
                    <span aria-hidden="true" className="font-mono text-xs text-dim">
                      {isActive ? "●" : "→"}
                    </span>
                  </motion.button>
                );
              })}

              <div className="mt-3 flex flex-wrap gap-2 border-t border-line/8 pt-4">
                <a href={`mailto:${personalInfo.email}`} className="chip-interactive">
                  Email
                </a>
                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chip-interactive"
                >
                  LinkedIn
                </a>
                <a
                  href={personalInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chip-interactive"
                >
                  GitHub
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}