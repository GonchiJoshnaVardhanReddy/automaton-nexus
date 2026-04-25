import React from "react";
import { motion } from "framer-motion";
import {
  Mic,
  PhoneOutgoing,
  Gauge,
  Settings2,
  ServerCog,
  Sparkles,
} from "lucide-react";
import SectionHeading from "./shared/SectionHeading";

const features = [
  {
    icon: Mic,
    title: "Multilingual AI Voice Agents",
    desc: "Speak English, Hindi, Kannada, Marathi and more with natural, human-like voices — no accent mismatch.",
    size: "lg",
    accent: "#00C2FF",
  },
  {
    icon: PhoneOutgoing,
    title: "Automated Call Execution",
    desc: "Dial thousands of customers in parallel. Nexus handles retries, voicemail, and timezone logic.",
    size: "lg",
    accent: "#E025CE",
  },
  {
    icon: Gauge,
    title: "Real-Time Response Processing",
    desc: "Sub-second speech understanding with live CRM sync.",
    size: "sm",
    accent: "#00C2FF",
  },
  {
    icon: Settings2,
    title: "Easy Agent Configuration",
    desc: "Describe goals in plain text — no code, no prompt engineering.",
    size: "sm",
    accent: "#E025CE",
  },
  {
    icon: ServerCog,
    title: "Scalable Infrastructure",
    desc: "From 10 calls to 100,000 — built on elastic voice infrastructure.",
    size: "sm",
    accent: "#00C2FF",
  },
];

const FeaturesSection = () => {
  return (
    <section
      id="features"
      className="relative py-28 sm:py-36 overflow-hidden"
      data-testid="features-section"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <SectionHeading
          chip="Built for scale"
          title={
            <>
              Everything you need to{" "}
              <span className="text-gradient">automate calls</span>
            </>
          }
          subtitle="A complete voice AI stack — from agent creation to live call infrastructure — in one calm, enterprise-grade platform."
        />

        {/* Bento grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-6 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            const span =
              f.size === "lg"
                ? "md:col-span-3"
                : "md:col-span-2";
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -4 }}
                className={`group relative rounded-3xl p-7 md:p-8 glass-strong overflow-hidden ${span}`}
                data-testid={`feature-card-${i}`}
              >
                {/* Corner glow */}
                <div
                  className="absolute -top-20 -right-20 w-52 h-52 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-opacity duration-700"
                  style={{ background: f.accent }}
                />

                {/* Icon */}
                <div
                  className="relative w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                  style={{
                    background: `linear-gradient(135deg, ${f.accent}22, ${f.accent}0a)`,
                    border: `1px solid ${f.accent}44`,
                    boxShadow: `0 0 20px ${f.accent}22`,
                  }}
                >
                  <Icon size={22} style={{ color: f.accent }} />
                </div>

                <h3 className="font-display font-bold text-white text-xl md:text-2xl mb-3 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-[#A0AEC0] leading-relaxed text-[15px] max-w-md">
                  {f.desc}
                </p>

                {/* Bottom tech chip for large cards */}
                {f.size === "lg" && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {(f.title.includes("Multilingual")
                      ? ["English", "हिन्दी", "ಕನ್ನಡ", "मराठी"]
                      : ["Parallel dialing", "Auto-retry", "Voicemail detect"]
                    ).map((t) => (
                      <span
                        key={t}
                        className="text-[11px] font-mono px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-[#C7D1E0]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Final CTA card inside the grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="relative rounded-3xl p-8 md:col-span-6 overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,194,255,0.2), rgba(224,37,206,0.18), rgba(0,194,255,0.15))",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            data-testid="features-cta-card"
          >
            <div className="absolute inset-0 mesh-grid-fine opacity-40" />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #00C2FF, #E025CE, #00C2FF)",
                  }}
                >
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <div className="font-display font-bold text-white text-lg md:text-xl">
                    Enterprise-ready from day one
                  </div>
                  <div className="text-[#C7D1E0] text-sm">
                    SOC-2 aligned · PII masking · regional data residency
                  </div>
                </div>
              </div>
              <button className="btn-secondary" data-testid="features-enterprise-btn">
                Talk to sales
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
