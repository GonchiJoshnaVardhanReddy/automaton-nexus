import React from "react";
import { motion } from "framer-motion";
import { Check, Zap, ShieldCheck, Repeat } from "lucide-react";
import SectionHeading from "./shared/SectionHeading";
import Waveform from "./shared/Waveform";

const bullets = [
  {
    icon: Zap,
    text: "AI-powered voice agents replace manual calling teams — overnight.",
  },
  {
    icon: Repeat,
    text: "Fully automated. Dials, talks, captures response, updates your CRM.",
  },
  {
    icon: ShieldCheck,
    text: "Multilingual conversations in English, Hindi, Kannada, Marathi & more.",
  },
];

const SolutionSection = () => {
  return (
    <section
      id="solution"
      className="relative py-28 sm:py-36 overflow-hidden"
      data-testid="solution-section"
    >
      {/* Soft gradient backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,194,255,0.12), transparent 70%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 grid lg:grid-cols-[1fr_1.05fr] gap-14 items-center">
        {/* LEFT — copy */}
        <div>
          <SectionHeading
            chip="The solution"
            align="left"
            title={
              <>
                Introducing{" "}
                <span className="text-gradient">Automaton Nexus</span>
              </>
            }
            subtitle="A single platform to deploy, orchestrate, and scale AI voice agents that sound human, speak your customer's language, and get the job done — 24×7."
          />

          <motion.ul
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
            }}
            className="mt-10 space-y-4"
          >
            {bullets.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.li
                  key={i}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    show: { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-start gap-4"
                  data-testid={`solution-bullet-${i}`}
                >
                  <div
                    className="mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(0,194,255,0.15), rgba(0,194,255,0.15))",
                      border: "1px solid rgba(0,194,255,0.25)",
                    }}
                  >
                    <Icon size={16} className="text-[#00C2FF]" />
                  </div>
                  <p className="text-[#C7D1E0] text-[17px] leading-relaxed pt-1.5">
                    {b.text}
                  </p>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>

        {/* RIGHT — visual composition */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="relative rounded-3xl p-8 glass-strong overflow-hidden">
            {/* Top shimmer */}
            <div className="shimmer-line mb-6" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#8794AB] mb-1">
                  Agent · Order Bot
                </div>
                <div className="font-display font-bold text-white text-lg">
                  Nexus Voice Engine
                </div>
              </div>
              <div className="chip">
                <span className="chip-dot" />
                <span>Live</span>
              </div>
            </div>

            {/* Waveform */}
            <div className="rounded-2xl border border-white/5 bg-black/20 p-5 mb-5">
              <Waveform bars={36} height={56} />
              <div className="mt-3 flex justify-between text-[11px] font-mono text-[#8794AB]">
                <span>00:00</span>
                <span>speaking · हिन्दी</span>
                <span>00:12</span>
              </div>
            </div>

            {/* Conversation snippet */}
            <div className="space-y-3">
              <div className="flex justify-start">
                <div
                  className="max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(0,194,255,0.25), rgba(224,37,206,0.18))",
                    border: "1px solid rgba(0,194,255,0.2)",
                  }}
                >
                  नमस्ते राहुल जी, क्या आप अपना ऑर्डर कन्फर्म करते हैं?
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[70%] rounded-2xl rounded-br-sm px-4 py-3 text-sm bg-white/5 border border-white/10 text-white">
                  हाँ, कन्फर्म है।
                </div>
              </div>
              <div className="flex justify-start">
                <div
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-mono"
                  style={{
                    background: "rgba(16,185,129,0.12)",
                    border: "1px solid rgba(16,185,129,0.3)",
                    color: "#6EE7B7",
                  }}
                >
                  <Check size={14} /> Order marked CONFIRMED · CRM synced
                </div>
              </div>
            </div>
          </div>

          {/* Floating accent */}
          <div
            className="absolute -bottom-4 -right-4 -z-10 w-40 h-40 rounded-full blur-3xl"
            style={{ background: "rgba(224,37,206,0.25)" }}
          />
          <div
            className="absolute -top-6 -left-6 -z-10 w-48 h-48 rounded-full blur-3xl"
            style={{ background: "rgba(0,194,255,0.2)" }}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default SolutionSection;
