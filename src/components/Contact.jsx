import { useState } from "react";
import { personalInfo } from "../data";
import { Mail, Link2, GitBranch, MapPin, Copy, Check, Send } from "lucide-react";

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null); // "success" | "error" | null

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
    // Opens default mail client with pre-filled body
    const subject = encodeURIComponent(`Portfolio Contact from ${form.name}`);
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
      icon: <Mail size={22} />,
      label: "Email",
      value: personalInfo.email,
      href: `mailto:${personalInfo.email}`,
      color: "from-indigo-500 to-violet-500",
      action: copyEmail,
      actionLabel: copied ? "Copied!" : "Copy",
      actionIcon: copied ? <Check size={13} /> : <Copy size={13} />,
    },
    {
      icon: <Link2 size={22} />,
      label: "LinkedIn",
      value: "teerath-jangid",
      href: personalInfo.linkedin,
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <GitBranch size={22} />,
      label: "GitHub",
      value: "Teerath08",
      href: personalInfo.github,
      color: "from-slate-500 to-slate-400",
    },
    {
      icon: <MapPin size={22} />,
      label: "Location",
      value: personalInfo.location,
      href: "https://maps.google.com/?q=Jaipur,Rajasthan,India",
      color: "from-rose-500 to-pink-500",
    },
  ];

  return (
    <section id="contact" className="py-24 px-4 bg-slate-900/30">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="section-title">
            Get In <span className="gradient-text">Touch</span>
          </h2>
          <p className="section-subtitle max-w-xl mx-auto">
            Interested in collaborating or just want to say hi? I'd love to hear from you!
          </p>
          <div className="w-16 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left — contact cards */}
          <div className="flex flex-col gap-5">
            <h3 className="text-lg font-bold text-white mb-1">
              Let's connect 👋
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed -mt-2">
              Whether you have a project idea, a collaboration proposal, or just want to connect — my inbox is always open!
            </p>

            <div className="flex flex-col gap-4">
              {contactLinks.map((item) => (
                <div
                  key={item.label}
                  className="glass-card p-4 flex items-center gap-4 hover:border-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300 group"
                >
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white flex-shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-500 mb-0.5">{item.label}</div>
                    <a
                      href={item.href}
                      target={item.href.startsWith("mailto") ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-slate-300 hover:text-white transition-colors truncate block"
                    >
                      {item.value}
                    </a>
                  </div>
                  {item.action && (
                    <button
                      onClick={item.action}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-400 hover:text-white transition-colors flex-shrink-0"
                    >
                      {item.actionIcon}
                      {item.actionLabel}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right — contact form */}
          <div className="glass-card p-6 md:p-8">
            <h3 className="text-lg font-bold text-white mb-6">Send a Message</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium" htmlFor="name">
                  Your Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium" htmlFor="email">
                  Your Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell me about your project or idea..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors resize-none"
                  required
                />
              </div>

              {/* Status messages */}
              {status === "success" && (
                <p className="text-emerald-400 text-sm text-center">
                  ✅ Opening your mail client...
                </p>
              )}
              {status === "error" && (
                <p className="text-rose-400 text-sm text-center">
                  ⚠️ Please fill in all fields.
                </p>
              )}

              <button type="submit" className="btn-primary w-full justify-center mt-1">
                <Send size={16} />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
