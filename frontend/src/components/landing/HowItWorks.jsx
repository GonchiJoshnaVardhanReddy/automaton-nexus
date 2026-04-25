import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Languages,
  Upload,
  PhoneCall,
  ArrowRight,
} from "lucide-react";
import SectionHeading from "./shared/SectionHeading";

const steps = [
  {
    n: "01",
    icon: Bot,
    title: "Create Agent",
    desc: "Describe your agent's goal in plain English. Pick a voice persona — calm, energetic, or professional.",
    accent: "#00C2FF",
  },
  {
    n: "02",
    icon: Languages,
    title: "Select Language",
    desc: "Choose from English, Hindi, Kannada, Marathi — or mix & match for multilingual regions.",
    accent: "#00C2FF",
  },
  {
    n: "03",
    icon: Upload,
    title: "Upload Customers",
    desc: "Drop in a CSV with names and phone numbers. Map columns once — reuse forever.",
    accent: "#E025CE",
  },
  {
    n: "04",
    icon: PhoneCall,
    title: "AI Calls & Updates Results",
    desc: "Nexus dials, talks, captures answers, and updates your dashboard — all in real-time.",
    accent: "#E025CE",
  },
];

const HowItWorks = () => {
  const [active, setActive] = useState(0);

  return (
    <section
      id="how-it-works"
      className="relative py-28 sm:py-36 overflow-hidden"
      data-testid="how-it-works-section"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <SectionHeading
          chip="How it works"
          title={
            <>
              From setup to calls in{" "}
              <span className="text-gradient">4 simple steps</span>
            </>
          }
          subtitle="No engineers. No complex integrations. Launch your first AI voice campaign in under 5 minutes."
        />

        {/* Horizontal flow — desktop */}
        <div className="mt-20 hidden lg:block">
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-10 left-[8%] right-[8%] h-px">
              <div
                className="w-full h-full"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(0,194,255,0.4) 0%, rgba(0,194,255,0.3) 35%, rgba(224,37,206,0.3) 65%, rgba(224,37,206,0.4) 100%)",
                }}
              />
            </div>

            <div className="relative grid grid-cols-4 gap-6">
              {steps.map((s, i) => {
                const Icon = s.icon;
                const isActive = active === i;
                return (
                  <motion.button
                    key={s.n}
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{
                      duration: 0.6,
                      delay: i * 0.12,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="relative text-left group"
                    data-testid={`how-step-${i}`}
                  >
                    {/* Circle marker */}
                    <div className="flex justify-center mb-6">
                      <div
                        className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
                          isActive ? "scale-110" : "scale-100"
                        }`}
                        style={{
                          background: isActive
                            ? `radial-gradient(circle, ${s.accent}33, transparent 70%)`
                            : "transparent",
                        }}
                      >
                        <div
                          className="absolute inset-2 rounded-full border transition-all duration-500"
                          style={{
                            borderColor: isActive
                              ? s.accent
                              : "rgba(255,255,255,0.12)",
                            boxShadow: isActive
                              ? `0 0 30px ${s.accent}66, inset 0 0 20px ${s.accent}33`
                              : "none",
                          }}
                        />
                        <div
                          className="absolute inset-4 rounded-full flex items-center justify-center"
                          style={{
                            background: "rgba(4,9,20,0.95)",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <Icon
                            size={22}
                            className="transition-colors duration-500"
                            style={{
                              color: isActive ? s.accent : "#A0AEC0",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="font-mono text-[11px] tracking-[0.25em] text-[#8794AB] mb-2">
                        STEP · {s.n}
                      </div>
                      <h3 className="font-display font-bold text-white text-xl mb-3 tracking-tight">
                        {s.title}
                      </h3>
                      <p className="text-[#A0AEC0] text-sm leading-relaxed px-2">
                        {s.desc}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Vertical flow — mobile */}
        <div className="mt-16 lg:hidden space-y-5">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="flex gap-4 glass-strong rounded-2xl p-5"
              >
                <div className="shrink-0">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${s.accent}22, ${s.accent}0a)`,
                      border: `1px solid ${s.accent}44`,
                    }}
                  >
                    <Icon size={18} style={{ color: s.accent }} />
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[10px] tracking-[0.25em] text-[#8794AB] mb-1">
                    STEP {s.n}
                  </div>
                  <h3 className="font-display font-bold text-white text-lg mb-1">
                    {s.title}
                  </h3>
                  <p className="text-[#A0AEC0] text-sm leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 flex justify-center"
        >
          <button className="btn-secondary" data-testid="how-start-btn">
            Start building your first agent <ArrowRight size={14} />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
