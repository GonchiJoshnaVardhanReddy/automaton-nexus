import React from "react";
import { motion } from "framer-motion";

/**
 * Animated voice waveform made of discrete bars.
 * Pure CSS animations — no canvas required.
 */
const Waveform = ({
  bars = 28,
  height = 48,
  color = "linear-gradient(180deg, #00C2FF 0%, #00C2FF 50%, #E025CE 100%)",
}) => {
  return (
    <div
      className="flex items-center justify-between gap-[3px]"
      style={{ height }}
      aria-hidden
    >
      {Array.from({ length: bars }).map((_, i) => {
        // random-ish duration and delay for organic motion
        const duration = 0.7 + ((i * 37) % 11) / 10;
        const delay = ((i * 53) % 100) / 100;
        const baseHeight = 20 + ((i * 41) % 60);
        return (
          <motion.span
            key={i}
            className="flex-1 rounded-full"
            style={{
              background: color,
              minWidth: 2,
              maxWidth: 5,
              height: `${baseHeight}%`,
              transformOrigin: "center",
              boxShadow: "0 0 8px rgba(0, 194, 255, 0.3)",
            }}
            animate={{ scaleY: [0.25, 1, 0.4, 0.85, 0.3] }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
};

export default Waveform;
