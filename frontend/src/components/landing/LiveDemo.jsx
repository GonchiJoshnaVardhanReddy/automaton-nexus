import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Phone, Volume2 } from "lucide-react";
import SectionHeading from "./shared/SectionHeading";
import Waveform from "./shared/Waveform";

const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "mr", label: "Marathi", native: "मराठी" },
];

const SCRIPTS = {
  en: [
    { who: "ai", text: "Hello Rahul, this is Nexus from Acme Logistics. Do you confirm your order to Indiranagar?" },
    { who: "user", text: "Yes, please go ahead." },
    { who: "ai", text: "Perfect. Your order has been confirmed. It will be delivered by 7 PM today." },
    { who: "sys", text: "Order status → CONFIRMED · logged to CRM" },
  ],
  hi: [
    { who: "ai", text: "नमस्ते राहुल जी, मैं एक्मे लॉजिस्टिक्स से नेक्सस बोल रही हूँ। क्या आप अपना ऑर्डर कन्फर्म करते हैं?" },
    { who: "user", text: "हाँ, कन्फर्म है।" },
    { who: "ai", text: "बहुत अच्छा। आपका ऑर्डर कन्फर्म हो गया है, आज शाम 7 बजे तक डिलीवर हो जाएगा।" },
    { who: "sys", text: "Order status → CONFIRMED · CRM में सेव हो गया" },
  ],
  kn: [
    { who: "ai", text: "ನಮಸ್ಕಾರ ರಾಹುಲ್ ಅವರೇ, ನಾನು Acme ಲಾಜಿಸ್ಟಿಕ್ಸ್‌ನಿಂದ ನೆಕ್ಸಸ್ ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ. ನಿಮ್ಮ ಆರ್ಡರ್ ಖಚಿತಪಡಿಸುತ್ತೀರಾ?" },
    { who: "user", text: "ಹೌದು, ಖಚಿತ." },
    { who: "ai", text: "ಚೆನ್ನಾಗಿದೆ. ನಿಮ್ಮ ಆರ್ಡರ್ ಖಚಿತವಾಗಿದೆ. ಇಂದು ಸಂಜೆ 7 ಗಂಟೆಯೊಳಗೆ ತಲುಪಲಿದೆ." },
    { who: "sys", text: "Order status → CONFIRMED · CRM ಗೆ ಸೇರಿಸಲಾಗಿದೆ" },
  ],
  mr: [
    { who: "ai", text: "नमस्कार राहुलजी, मी Acme Logistics कडून नेक्सस बोलत आहे. तुम्ही तुमची ऑर्डर कन्फर्म करता का?" },
    { who: "user", text: "होय, कन्फर्म आहे." },
    { who: "ai", text: "छान. तुमची ऑर्डर कन्फर्म झाली आहे, आज संध्याकाळी 7 पर्यंत पोहोचेल." },
    { who: "sys", text: "Order status → CONFIRMED · CRM मध्ये जतन केले" },
  ],
};

const LiveDemo = () => {
  const [lang, setLang] = useState("en");
  const [visibleCount, setVisibleCount] = useState(0);
  const script = SCRIPTS[lang];

  useEffect(() => {
    setVisibleCount(0);
    const timers = script.map((_, i) =>
      setTimeout(() => setVisibleCount((v) => Math.max(v, i + 1)), 800 * (i + 1))
    );
    return () => timers.forEach(clearTimeout);
  }, [lang, script]);

  return (
    <section
      id="demo"
      className="relative py-28 sm:py-36 overflow-hidden"
      data-testid="live-demo-section"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(224,37,206,0.08), transparent 70%)",
        }}
      />

      <div className="relative max-w-5xl mx-auto px-6 sm:px-8">
        <SectionHeading
          chip="Live voice demo"
          title={
            <>
              Switch language —{" "}
              <span className="text-gradient">watch it adapt instantly</span>
            </>
          }
          subtitle="This is an actual script Nexus uses for order confirmations. Click any language and see the same flow localize in real-time."
        />

        {/* Language toggle */}
        <div className="mt-12 flex justify-center">
          <div
            className="inline-flex p-1.5 rounded-full glass-strong gap-1 overflow-x-auto no-scrollbar max-w-full"
            data-testid="language-toggle"
          >
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLang(l.code)}
                className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  lang === l.code
                    ? "text-white"
                    : "text-[#A0AEC0] hover:text-white"
                }`}
                data-testid={`lang-btn-${l.code}`}
              >
                {lang === l.code && (
                  <motion.div
                    layoutId="lang-pill"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "linear-gradient(135deg, #00C2FF, #E025CE, #00C2FF)",
                      boxShadow: "0 8px 24px -8px rgba(224,37,206,0.5)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <span>{l.label}</span>
                  <span className="text-[11px] opacity-70">{l.native}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat window */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="mt-10 rounded-3xl glass-strong overflow-hidden"
          data-testid="demo-chat"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #00C2FF, #E025CE, #00C2FF)",
                }}
              >
                <Phone size={16} className="text-white" />
              </div>
              <div>
                <div className="font-display font-semibold text-white text-sm">
                  Nexus Agent · Order Confirmation
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#8794AB]">
                  <span className="chip-dot" />
                  <span>Live · {LANGUAGES.find((l) => l.code === lang).label}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[#8794AB]">
              <Volume2 size={16} />
            </div>
          </div>

          {/* Messages */}
          <div className="p-6 sm:p-8 space-y-4 min-h-[320px]">
            <AnimatePresence mode="popLayout">
              {script.slice(0, visibleCount).map((m, i) => (
                <motion.div
                  key={`${lang}-${i}`}
                  layout
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`flex ${
                    m.who === "user"
                      ? "justify-end"
                      : m.who === "sys"
                      ? "justify-center"
                      : "justify-start"
                  }`}
                  data-testid={`demo-msg-${i}`}
                >
                  {m.who === "ai" && (
                    <div
                      className="max-w-[80%] rounded-2xl rounded-bl-sm px-5 py-3.5 text-[15px] leading-relaxed"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(0,194,255,0.25), rgba(224,37,206,0.18))",
                        border: "1px solid rgba(0,194,255,0.25)",
                        color: "#ffffff",
                      }}
                    >
                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#00C2FF] mb-1.5">
                        AI Agent
                      </div>
                      {m.text}
                    </div>
                  )}
                  {m.who === "user" && (
                    <div
                      className="max-w-[75%] rounded-2xl rounded-br-sm px-5 py-3.5 text-[15px] leading-relaxed bg-white/5 border border-white/10 text-white"
                    >
                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A0AEC0] mb-1.5 text-right">
                        Customer
                      </div>
                      {m.text}
                    </div>
                  )}
                  {m.who === "sys" && (
                    <div
                      className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono"
                      style={{
                        background: "rgba(16,185,129,0.12)",
                        border: "1px solid rgba(16,185,129,0.3)",
                        color: "#6EE7B7",
                      }}
                    >
                      <Check size={14} /> {m.text}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {visibleCount < script.length && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-3 bg-white/5 border border-white/10">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        className="w-1.5 h-1.5 rounded-full bg-[#00C2FF]"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1.2,
                          delay: d * 0.2,
                          repeat: Infinity,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer waveform */}
          <div className="px-6 py-4 border-t border-white/5 bg-black/20">
            <Waveform bars={40} height={28} />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LiveDemo;
