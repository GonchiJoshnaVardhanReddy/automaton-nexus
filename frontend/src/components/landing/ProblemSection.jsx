import React from "react";
import { motion } from "framer-motion";
import { Users, Languages, Clock4 } from "lucide-react";
import SectionHeading from "./shared/SectionHeading";

const problems = [
  {
    icon: Users,
    title: "Human agents are costly",
    desc: "Staffing a 24×7 outbound calling team drains margins — salaries, training, attrition, and overtime compound fast.",
    stat: "₹8–15L / agent / year",
  },
  {
    icon: Languages,
    title: "Language barriers hurt reach",
    desc: "Customers in Bharat expect their native language. Finding fluent agents across Hindi, Kannada, Marathi and more is nearly impossible.",
    stat: "74% prefer regional",
  },
  {
    icon: Clock4,
    title: "Delayed confirmations kill deals",
    desc: "Every hour a call goes unanswered is a canceled order, a missed upsell, or a lost repeat customer.",
    stat: "38% order drop-offs",
  },
];

const ProblemSection = () => {
  return (
    <section
      className="relative py-28 sm:py-36 overflow-hidden"
      data-testid="problem-section"
    >
      <div className="absolute inset-0 vignette pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8">
        <SectionHeading
          chip="The problem"
          title={
            <>
              Manual call operations{" "}
              <span className="text-gradient">don't scale</span>
            </>
          }
          subtitle="Businesses lose thousands of orders every day because their humans can't call fast enough, in enough languages, at the right time."
        />

        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {problems.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -6 }}
                className="relative group rounded-3xl p-8 glass-strong overflow-hidden"
                data-testid={`problem-card-${i}`}
              >
                {/* Top gradient accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, #00C2FF 50%, transparent)",
                  }}
                />

                {/* Hover glow */}
                <div
                  className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(400px circle at var(--x, 50%) var(--y, 50%), rgba(0,194,255,0.08), transparent 60%)",
                  }}
                />

                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(0,194,255,0.12), rgba(224,37,206,0.12))",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <Icon size={22} className="text-[#00C2FF]" />
                </div>

                <h3 className="font-display text-xl font-bold text-white mb-3 tracking-tight">
                  {p.title}
                </h3>
                <p className="text-[#A0AEC0] leading-relaxed text-[15px]">
                  {p.desc}
                </p>

                <div className="mt-6 pt-5 border-t border-white/5">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8794AB] mb-1">
                    Impact
                  </div>
                  <div className="font-display font-bold text-2xl text-gradient-cool">
                    {p.stat}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
