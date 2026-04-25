import React, { useMemo } from "react";
import { motion } from "framer-motion";

/** Subtle floating particles overlay. */
const Particles = ({ count = 18 }) => {
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        size: 2 + ((i * 13) % 4),
        left: `${(i * 37) % 100}%`,
        top: `${(i * 71) % 100}%`,
        duration: 10 + ((i * 7) % 14),
        delay: (i * 0.4) % 6,
        hue: i % 3,
      })),
    [count]
  );

  const colorMap = ["#00C2FF", "#00C2FF", "#E025CE"];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            top: p.top,
            background: colorMap[p.hue],
            boxShadow: `0 0 12px ${colorMap[p.hue]}`,
            opacity: 0.35,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.1, 0.5, 0.1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default Particles;
