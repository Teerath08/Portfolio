"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Send } from "lucide-react";

import { personalInfo } from "@/data";
import { cn } from "@/lib/cn";

/**
 * Copy-to-clipboard, with a fallback.
 *
 * `navigator.clipboard` is unavailable on insecure origins and in some
 * embedded browsers, so the legacy `execCommand` path stays. Either way the
 * button reports the outcome in a live region rather than only changing colour.
 */
export function CopyEmailButton({ className }: { className?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(personalInfo.email);
      ok = true;
    } catch {
      // Fallback for insecure origins.
      const field = document.createElement("textarea");
      field.value = personalInfo.email;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      document.body.removeChild(field);
    }

    setState(ok ? "copied" : "failed");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2200);
  };

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line/12 bg-surface/60 px-2.5 py-1.5",
          "font-mono text-[10px] uppercase tracking-label text-muted transition-colors duration-300",
          "hover:border-accent/45 hover:text-accent",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
          className,
        )}
      >
        {state === "copied" ? (
          <Check size={12} aria-hidden="true" />
        ) : (
          <Copy size={12} aria-hidden="true" />
        )}
        {state === "copied" ? "Copied" : state === "failed" ? "Failed" : "Copy"}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {state === "copied"
          ? "Email address copied to the clipboard."
          : state === "failed"
            ? "Could not copy. Select the address and copy it manually."
            : ""}
      </span>
    </>
  );
}

type Status = "idle" | "error" | "sent";

/**
 * The contact form.
 *
 * There is no backend and no third-party form service: a submit composes a
 * `mailto:` link and hands it to the visitor's own client. That is deliberate —
 * it means the form cannot break, cannot leak an address to a service, and
 * cannot silently drop a message because someone else's quota ran out.
 *
 * Validation is native (`required`, `type="email"`), so the browser handles it
 * first; the inline messages are the second line of defence, and the field
 * focus moves to whatever is missing.
 */
export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const update = (field: keyof typeof form) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    if (status !== "idle") setStatus("idle");
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus("error");
      const firstEmpty = !form.name.trim()
        ? "#contact-name"
        : !form.email.trim()
          ? "#contact-email"
          : "#contact-message";
      document.querySelector<HTMLInputElement>(firstEmpty)?.focus();
      return;
    }

    const subject = encodeURIComponent(`Portfolio inquiry from ${form.name.trim()}`);
    const body = encodeURIComponent(
      `Name: ${form.name.trim()}\nEmail: ${form.email.trim()}\n\nMessage:\n${form.message.trim()}`,
    );

    setStatus("sent");
    setForm({ name: "", email: "", message: "" });
    window.location.href = `mailto:${personalInfo.email}?subject=${subject}&body=${body}`;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 6000);
  };

  const fields = [
    {
      id: "contact-name",
      name: "name" as const,
      label: "Your name",
      type: "text",
      autoComplete: "name",
      placeholder: "e.g. Alex Mercer",
    },
    {
      id: "contact-email",
      name: "email" as const,
      label: "Your email",
      type: "email",
      autoComplete: "email",
      placeholder: "alex@domain.com",
    },
  ];

  return (
    <form onSubmit={submit} noValidate={false} className="panel p-5 sm:p-6">
      <h3 className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-ink">
        Send a message
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
      </h3>

      <p className="mt-2 text-xs leading-relaxed text-dim">
        Opens in your own mail client. Nothing is stored, and nothing is sent to
        a third party.
      </p>

      <div className="mt-5 space-y-4">
        {fields.map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id} className="label mb-1.5 block">
              {field.label}
            </label>
            <input
              id={field.id}
              name={field.name}
              type={field.type}
              required
              autoComplete={field.autoComplete}
              placeholder={field.placeholder}
              value={form[field.name]}
              onChange={update(field.name)}
              className="field"
            />
          </div>
        ))}

        <div>
          <label htmlFor="contact-message" className="label mb-1.5 block">
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={4}
            required
            placeholder="Tell me about your project, idea or hardware question…"
            value={form.message}
            onChange={update("message")}
            className="field resize-y"
          />
        </div>
      </div>

      <div aria-live="polite" className="mt-4 min-h-5">
        {status === "error" && (
          <p className="font-mono text-[11px] text-amber-300">
            Fill in all three fields and try again.
          </p>
        )}
        {status === "sent" && (
          <p className="flex items-center gap-2 font-mono text-[11px] text-accent">
            <Check size={13} aria-hidden="true" />
            Your mail client should be opening.
          </p>
        )}
      </div>

      <button type="submit" className="btn-primary mt-1 w-full">
        <Send size={15} aria-hidden="true" />
        Send transmission
      </button>
    </form>
  );
}
