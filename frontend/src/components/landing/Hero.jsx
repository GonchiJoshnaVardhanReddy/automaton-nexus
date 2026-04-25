import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PhoneCall,
  ArrowRight,
  Play,
  Sparkles,
  Activity,
  Globe2,
} from "lucide-react";
import Waveform from "./shared/Waveform";
import PhoneMockup from "./shared/PhoneMockup";
import Particles from "./shared/Particles";

const LOGOS = [
  "ACME Logistics",
  "Nimbus Retail",
  "Orbit Telecom",
  "Zenith Bank",
  "Volt Fintech",
  "Polaris Health",
];

const Hero = () => {
  return (
    <section
      id="top"
      className="relative pt-36 sm:pt-40 pb-28 overflow-hidden"
      data-testid="hero-section"
    >
      {/* Ambient glow orbs */}
      <div
        className="glow-orb w-[520px] h-[520px] -top-40 -left-20"
        style={{ background: "rgba(0, 194, 255, 0.35)" }}
      />
      <div
        className="glow-orb w-[420px] h-[420px] top-10 right-0"
        style={{ background: "rgba(224, 37, 206, 0.22)" }}
      />
      <div
        className="glow-orb w-[360px] h-[360px] top-60 left-1/3"
        style={{ background: "rgba(0, 194, 255, 0.18)" }}
      />

      {/* Mesh grid at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[55%] mesh-grid pointer-events-none [mask-image:linear-gradient(to_top,black_10%,transparent_90%)]" />

      <Particles count={22} />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
        {/* LEFT — copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="chip mb-6"
            data-testid="hero-chip"
          >
            <span className="chip-dot" />
            <span>Now live · Multilingual voice AI</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.1,
            }}
            className="font-display text-5xl sm:text-6xl lg:text-[72px] font-bold leading-[1.04] tracking-tight text-white"
            data-testid="hero-headline"
          >
            Automate <span className="text-gradient">Customer Calls</span>
            <br />
            with AI Voice Agents
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            className="mt-7 text-lg sm:text-xl text-[#A0AEC0] max-w-xl leading-relaxed"
            data-testid="hero-subheadline"
          >
            Automaton Nexus lets businesses deploy{" "}
            <span className="text-white">multilingual AI agents</span> that
            call customers, confirm orders, and handle conversations
            automatically — at the scale of thousands, with the warmth of one.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link to="/get-started" className="btn-primary" data-testid="hero-create-agent-btn">
              <Sparkles size={16} />
              Get Started
              <ArrowRight size={16} />
            </Link>
            <a href="#demo" className="btn-secondary" data-testid="hero-watch-demo-btn">
              <Play size={14} />
              Watch Demo
            </a>
          </motion.div>

          {/* Value pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-10 flex flex-wrap gap-6 text-sm text-[#A0AEC0]"
          >
            <div className="flex items-center gap-2">
              <Globe2 size={15} className="text-[#00C2FF]" />
              <span>4+ Indian languages</span>
            </div>
            <div className="flex items-center gap-2">
              <PhoneCall size={15} className="text-[#00C2FF]" />
              <span>24/7 auto-dialing</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-[#00C2FF]" />
              <span>Real-time analytics</span>
            </div>
          </motion.div>
        </div>

        {/* RIGHT — visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative min-h-[520px] flex items-center justify-center"
        >
          {/* Decorative ring */}
          <div className="absolute inset-10 rounded-full border border-white/5" />
          <div className="absolute inset-20 rounded-full border border-white/5" />
          <div className="absolute inset-28 rounded-full border border-dashed border-white/10 animate-[spin_60s_linear_infinite]" />

          <PhoneMockup />

          {/* Floating waveform card */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-4 sm:-left-8 top-16 glass-strong rounded-2xl p-4 w-56 hidden sm:block"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-[#A0AEC0] uppercase tracking-widest">
                Live Voice
              </span>
              <div className="flex items-center gap-1">
                <span className="chip-dot" />
                <span className="text-[10px] text-[#00C2FF] font-mono">
                  ACTIVE
                </span>
              </div>
            </div>
            <Waveform height={36} bars={22} />
            <div className="mt-3 text-[11px] text-[#8794AB] font-mono">
              00:08 · Hindi · confirming order
            </div>
          </motion.div>

          {/* Floating stats card */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-2 sm:-right-6 bottom-10 glass-strong rounded-2xl p-4 w-52 hidden sm:block"
          >
            <div className="text-xs text-[#A0AEC0] mb-1">Calls today</div>
            <div className="flex items-baseline gap-2">
              <div className="font-display text-3xl font-bold text-white">
                1,204
              </div>
              <div className="text-xs text-[#00C2FF] font-medium">
                +18.2%
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: "82%",
                    background:
                      "linear-gradient(90deg, #00C2FF, #00C2FF, #E025CE)",
                  }}
                />
              </div>
              <span className="text-[11px] text-[#A0AEC0] font-mono">82%</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Trust row */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.3 }}
        className="relative max-w-7xl mx-auto px-6 sm:px-8 mt-24"
      >
        <div className="text-center text-xs font-mono text-[#8794AB] uppercase tracking-[0.3em] mb-6">
          Built for teams that call at scale
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-60">
          {LOGOS.map((name) => (
            <span
              key={name}
              className="font-display text-[#A0AEC0] text-sm tracking-tight"
              data-testid={`logo-${name.replace(/\s/g, "-").toLowerCase()}`}
            >
              {name}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
