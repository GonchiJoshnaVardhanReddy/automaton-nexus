import React from "react";
import { motion } from "framer-motion";

/** Section heading with chip + headline + optional subtext. */
const SectionHeading = ({ chip, title, subtitle, align = "center", id }) => {
  const alignClasses =
    align === "left" ? "text-left items-start" : "text-center items-center";
  const subtitleClasses =
    align === "left" ? "max-w-2xl" : "max-w-2xl mx-auto";

  return (
    <div className={`flex flex-col ${alignClasses}`} id={id}>
      {chip && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="chip mb-5"
        >
          <span className="chip-dot" />
          <span>{chip}</span>
        </motion.div>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-white"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className={`mt-5 text-lg text-[#A0AEC0] leading-relaxed ${subtitleClasses}`}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};

export default SectionHeading;
