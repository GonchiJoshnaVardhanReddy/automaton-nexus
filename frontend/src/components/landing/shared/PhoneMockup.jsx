import React from "react";
import { motion } from "framer-motion";
import { Phone, Mic, MoreVertical } from "lucide-react";
import Waveform from "./Waveform";

/**
 * Floating phone mockup showing an active AI voice call.
 * Pure HTML/CSS — no 3D library required.
 */
const PhoneMockup = () => {
  return (
    <motion.div
      animate={{ y: [0, -14, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      className="relative"
      data-testid="phone-mockup"
    >
      {/* Glow behind phone */}
      <div
        className="absolute inset-0 -z-10 blur-3xl opacity-80"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,194,255,0.4), rgba(224,37,206,0.25) 50%, transparent 70%)",
        }}
      />

      {/* Phone frame */}
      <div className="relative w-[290px] h-[580px] rounded-[46px] p-[3px] bg-gradient-to-b from-white/20 via-white/5 to-white/20 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
        <div className="relative w-full h-full rounded-[43px] bg-[#0B1221] overflow-hidden">
          {/* Notch */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 rounded-full bg-black z-20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#111A30]" />
          </div>

          {/* Screen content */}
          <div className="absolute inset-0 flex flex-col pt-14 pb-6 px-5">
            {/* Status bar */}
            <div className="flex justify-between items-center text-[10px] text-[#A0AEC0] font-mono mb-6">
              <span>9:41</span>
              <div className="flex gap-1">
                <span className="w-4 h-2 rounded-sm border border-slate-400" />
                <span className="w-3 h-2 rounded-sm bg-slate-400" />
              </div>
            </div>

            {/* Caller info */}
            <div className="text-center">
              <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C2FF] mb-1">
                AI Agent · Calling
              </div>
              <div className="font-display font-bold text-white text-xl">
                Rahul Sharma
              </div>
              <div className="text-xs text-[#8794AB] mt-1">
                +91 · Order Confirmation
              </div>
            </div>

            {/* Avatar with halo */}
            <div className="mt-8 mb-8 flex justify-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-[#00C2FF]/30 animate-ping" />
                <div className="absolute inset-4 rounded-full border border-[#00C2FF]/40" />
                <div
                  className="absolute inset-8 rounded-full"
                  style={{
                    background:
                      "linear-gradient(135deg, #00C2FF, #E025CE, #00C2FF)",
                  }}
                />
                <div className="absolute inset-[46px] rounded-full bg-[#0B1221] flex items-center justify-center">
                  <Mic size={22} className="text-white" />
                </div>
              </div>
            </div>

            {/* Live caption */}
            <div className="mx-auto max-w-[220px] rounded-2xl bg-white/5 border border-white/5 px-4 py-3 mb-6 backdrop-blur-xl">
              <div className="text-[10px] font-mono text-[#8794AB] mb-1">
                LIVE TRANSCRIPT
              </div>
              <div className="text-sm text-white leading-snug">
                "Hello Rahul, is your order to Indiranagar still good for
                delivery today?"
              </div>
            </div>

            {/* Waveform */}
            <div className="px-3 mb-6">
              <Waveform bars={24} height={40} />
            </div>

            {/* Controls */}
            <div className="mt-auto flex items-center justify-center gap-5">
              <button
                type="button"
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white"
              >
                <Mic size={18} />
              </button>
              <button
                type="button"
                className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-[0_10px_30px_-5px_rgba(224,37,206,0.5)]"
                style={{
                  background:
                    "linear-gradient(135deg, #E025CE, #00C2FF, #00C2FF)",
                }}
              >
                <Phone size={22} />
              </button>
              <button
                type="button"
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white"
              >
                <MoreVertical size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PhoneMockup;
