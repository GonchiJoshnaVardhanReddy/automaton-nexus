import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Particles from "./shared/Particles";

const FinalCTA = () => {
  return (
    <section
      className="relative py-32 sm:py-40 overflow-hidden"
      data-testid="final-cta-section"
    >
      {/* Heavy gradient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(0,194,255,0.22), rgba(224,37,206,0.15) 40%, transparent 75%)",
        }}
      />
      <div className="absolute inset-0 mesh-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />

      <Particles count={28} />

      <div className="relative max-w-4xl mx-auto px-6 sm:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="chip mx-auto mb-8"
        >
          <span className="chip-dot" />
          <span>Start in 5 minutes · No credit card</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight"
          data-testid="final-cta-headline"
        >
          Deploy your first
          <br />
          <span className="text-gradient">AI Voice Agent</span> today
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="mt-7 text-lg sm:text-xl text-[#A0AEC0] max-w-2xl mx-auto leading-relaxed"
        >
          Join forward-thinking businesses replacing costly call centers with
          multilingual AI — built for the scale and warmth of Bharat.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link to="/get-started" className="btn-primary" data-testid="final-cta-create-btn">
            <Sparkles size={16} />
            Get Started
            <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn-secondary" data-testid="final-cta-call-btn">
            Book a 15-min demo call
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-mono uppercase tracking-[0.2em] text-[#8794AB]"
        >
          <span>✶ No credit card</span>
          <span>✶ 100 free calls</span>
          <span>✶ Cancel anytime</span>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
