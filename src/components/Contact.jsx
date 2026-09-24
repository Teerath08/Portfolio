import React, { useState } from "react";
import { personalInfo } from "../data";
import SectionHeader from "./SectionHeader";
import { Mail, Link2, GitBranch, MapPin, Copy, Check, Send, MessageSquare } from "lucide-react";

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null);

  const copyEmail = () => {
    navigator.clipboard.writeText(personalInfo.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setStatus("error");
      setTimeout(() => setStatus(null), 3000);
      return;
    }
    const subject = encodeURIComponent(`Portfolio Inquiry from ${form.name}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`
    );
    window.location.href = `mailto:${personalInfo.email}?subject=${subject}&body=${body}`;
    setStatus("success");
    setForm({ name: "", email: "", message: "" });
    setTimeout(() => setStatus(null), 4000);
  };

  const contactLinks = [
    {
      icon: <Mail size={20} />,
      label: "Email",
      value: personalInfo.email,
      href: `mailto:${personalInfo.email}`,
      color: "from-red-600 to-rose-700",
      action: copyEmail,
      actionLabel: copied ? "Copied!" : "Copy",
      actionIcon: copied ? <Check size={13} /> : <Copy size={13} />,
    },
    {
      icon: <Link2 size={20} />,
      label: "LinkedIn",
      value: "teerath-jangid",
      href: personalInfo.linkedin,
      color: "from-rose-600 to-red-800",
    },
    {
      icon: <GitBranch size={20} />,
      label: "GitHub",
      value: "Teerath08",
      href: personalInfo.github,
      color: "from-red-500 to-amber-600",
    },
    {
      icon: <MapPin size={20} />,
      label: "Location",
      value: personalInfo.location,
      href: "https://maps.google.com/?q=Jaipur,Rajasthan,India",
      color: "from-red-700 to-rose-950",
    },
  ];

  return (
    <section id="contact" className="py-24 px-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-red-950/20 blur-[160px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Floating 3D Section Header */}
        <SectionHeader
          badge="COMMUNICATION & INQUIRIES"
          title="Get In"
          highlight="Touch"
          subtitle="Interested in collaborating on robotics, microprocessors, or engineering projects? Let's connect!"
          sectionId="contact"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Contact Info Cards */}
          <div className="flex flex-col gap-5">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <span>Let's collaborate</span>
              <MessageSquare size={18} className="text-red-500" />
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed -mt-2">
              Whether you have a hardware design discussion, a robotics project, or want to connect on embedded systems — my inbox is open!
            </p>

            <div className="flex flex-col gap-4">
              {contactLinks.map((item) => (
                <div
                  key={item.label}
                  className="glass-card p-4 flex items-center gap-4 hover:border-red-500/60 hover:-translate-y-0.5 transition-all duration-300 group"
                >
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white flex-shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-red-950/60 border border-red-400/20`}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-zinc-500 mb-0.5 font-mono">{item.label}</div>
                    <a
                      href={item.href}
                      target={item.href.startsWith("mailto") ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-zinc-200 hover:text-red-400 transition-colors truncate block"
                    >
                      {item.value}
                    </a>
                  </div>
                  {item.action && (
                    <button
                      onClick={item.action}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-red-950 text-xs text-zinc-300 hover:text-white hover:border-red-600/50 transition-colors flex-shrink-0 cursor-pointer"
                    >
                      {item.actionIcon}
                      {item.actionLabel}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="glass-card p-6 md:p-8 hover:border-red-900/80">
            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
              <span>Send a Message</span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 font-medium" htmlFor="name">
                  Your Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Alex Mercer"
                  className="w-full px-4 py-3 rounded-xl bg-black/80 border border-red-950 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 font-medium" htmlFor="email">
                  Your Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="alex@domain.com"
                  className="w-full px-4 py-3 rounded-xl bg-black/80 border border-red-950 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 font-medium" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell me about your project, idea, or hardware inquiry..."
                  className="w-full px-4 py-3 rounded-xl bg-black/80 border border-red-950 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-colors resize-none"
                  required
                />
              </div>

              {/* Status messages */}
              {status === "success" && (
                <p className="text-emerald-400 text-xs text-center font-mono">
                  ✅ Launching mail client...
                </p>
              )}
              {status === "error" && (
                <p className="text-rose-400 text-xs text-center font-mono">
                  ⚠️ Please fill in all fields.
                </p>
              )}

              <button type="submit" className="btn-primary w-full justify-center mt-2">
                <Send size={16} />
                Send Transmission
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
