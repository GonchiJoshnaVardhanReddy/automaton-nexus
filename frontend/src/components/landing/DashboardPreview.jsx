import React, { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { CheckCircle2, XCircle, Clock, TrendingUp, PhoneCall } from "lucide-react";
import SectionHeading from "./shared/SectionHeading";

const rows = [
  {
    name: "Rahul Sharma",
    phone: "+91 98••• 45210",
    lang: "Hindi",
    status: "confirmed",
    time: "2s ago",
  },
  {
    name: "Ankit Rao",
    phone: "+91 98••• 11782",
    lang: "English",
    status: "rejected",
    time: "14s ago",
  },
  {
    name: "Priya Nair",
    phone: "+91 97••• 77129",
    lang: "Kannada",
    status: "confirmed",
    time: "28s ago",
  },
  {
    name: "Sneha Patil",
    phone: "+91 98••• 23019",
    lang: "Marathi",
    status: "in-call",
    time: "live",
  },
  {
    name: "Vikram Iyer",
    phone: "+91 96••• 55214",
    lang: "English",
    status: "confirmed",
    time: "1m ago",
  },
];

const statusMap = {
  confirmed: {
    label: "Confirmed",
    color: "#6EE7B7",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.35)",
    Icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    color: "#FCA5A5",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.35)",
    Icon: XCircle,
  },
  "in-call": {
    label: "In call",
    color: "#00C2FF",
    bg: "rgba(0,194,255,0.12)",
    border: "rgba(0,194,255,0.35)",
    Icon: PhoneCall,
  },
};

const AnimatedNumber = ({ value, suffix = "", decimals = 0 }) => {
  const [display, setDisplay] = useState(0);
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView) return;
    const duration = 1600;
    const start = performance.now();
    const animate = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {display.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
};

const DashboardPreview = () => {
  return (
    <section
      id="dashboard"
      className="relative py-28 sm:py-36 overflow-hidden"
      data-testid="dashboard-section"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <SectionHeading
          chip="Command center"
          title={
            <>
              Every call,{" "}
              <span className="text-gradient">visible in real-time</span>
            </>
          }
          subtitle="Watch your campaigns run live. Know exactly who confirmed, who rejected, and what happened on every call — all from one pane of glass."
        />

        <div className="mt-16 relative">
          {/* Main dashboard card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-3xl glass-strong overflow-hidden"
            data-testid="dashboard-card"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                </div>
                <div className="font-mono text-xs text-[#8794AB] tracking-wider">
                  nexus.app / campaigns / order-confirmation-q1
                </div>
              </div>
              <div className="chip">
                <span className="chip-dot" />
                <span>Campaign active</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 grid lg:grid-cols-[1.2fr_1fr] gap-8">
              {/* Table */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#8794AB] mb-1">
                      Live Call Log
                    </div>
                    <div className="font-display font-bold text-white text-lg">
                      Recent results
                    </div>
                  </div>
                  <div className="text-xs font-mono text-[#8794AB]">
                    Refreshing · 1s
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 overflow-hidden">
                  <div className="grid grid-cols-[1.4fr_1fr_0.8fr_0.8fr] px-4 py-3 bg-white/[0.02] text-[11px] font-mono uppercase tracking-wider text-[#8794AB]">
                    <div>Customer</div>
                    <div className="hidden sm:block">Language</div>
                    <div>Status</div>
                    <div className="text-right">Time</div>
                  </div>

                  {rows.map((r, i) => {
                    const s = statusMap[r.status];
                    return (
                      <motion.div
                        key={r.name}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-20px" }}
                        transition={{ duration: 0.5, delay: i * 0.08 }}
                        className="grid grid-cols-[1.4fr_1fr_0.8fr_0.8fr] px-4 py-4 border-t border-white/5 items-center hover:bg-white/[0.02] transition-colors"
                        data-testid={`dashboard-row-${i}`}
                      >
                        <div>
                          <div className="font-medium text-white text-sm">
                            {r.name}
                          </div>
                          <div className="text-xs text-[#8794AB] font-mono mt-0.5">
                            {r.phone}
                          </div>
                        </div>
                        <div className="hidden sm:block text-sm text-[#C7D1E0]">
                          {r.lang}
                        </div>
                        <div>
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{
                              background: s.bg,
                              color: s.color,
                              border: `1px solid ${s.border}`,
                            }}
                          >
                            <s.Icon size={12} />
                            {s.label}
                          </span>
                        </div>
                        <div className="text-xs text-[#A0AEC0] font-mono text-right">
                          {r.time}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Stats column */}
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4">
                  <StatCard
                    icon={PhoneCall}
                    label="Calls made"
                    value={<AnimatedNumber value={1204} />}
                    delta="+18.2%"
                    accent="#00C2FF"
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="Success rate"
                    value={<AnimatedNumber value={98} suffix="%" />}
                    delta="+3.1%"
                    accent="#6EE7B7"
                  />
                  <StatCard
                    icon={Clock}
                    label="Avg. duration"
                    value={<AnimatedNumber value={42} suffix="s" />}
                    delta="-5s"
                    accent="#E025CE"
                  />
                  <StatCard
                    icon={CheckCircle2}
                    label="Orders confirmed"
                    value={<AnimatedNumber value={1180} />}
                    delta="+21%"
                    accent="#00C2FF"
                  />
                </div>

                {/* Bar chart */}
                <div className="rounded-2xl border border-white/5 p-5 bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#8794AB] mb-1">
                        This week
                      </div>
                      <div className="font-display font-bold text-white text-base">
                        Calls per day
                      </div>
                    </div>
                    <div className="text-xs text-[#00C2FF] font-medium">
                      +12.4%
                    </div>
                  </div>
                  <div className="flex items-end justify-between gap-2 h-24">
                    {[42, 65, 58, 80, 95, 72, 88].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.9,
                          delay: i * 0.08,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="flex-1 rounded-t-md"
                        style={{
                          background:
                            "linear-gradient(180deg, #00C2FF 0%, #00C2FF 60%, #E025CE 100%)",
                          boxShadow: "0 0 12px rgba(0,194,255,0.25)",
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] font-mono text-[#8794AB]">
                    {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                      <span key={`day-${i}`}>{d}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating accent orbs */}
          <div
            className="absolute -top-10 -left-10 -z-10 w-60 h-60 rounded-full blur-3xl"
            style={{ background: "rgba(0,194,255,0.25)" }}
          />
          <div
            className="absolute -bottom-10 -right-10 -z-10 w-72 h-72 rounded-full blur-3xl"
            style={{ background: "rgba(224,37,206,0.2)" }}
          />
        </div>
      </div>
    </section>
  );
};

const StatCard = ({ icon: Icon, label, value, delta, accent }) => (
  <div className="rounded-2xl border border-white/5 p-5 bg-white/[0.02] relative overflow-hidden">
    <div
      className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-40"
      style={{ background: accent }}
    />
    <div className="relative">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
        style={{
          background: `${accent}18`,
          border: `1px solid ${accent}44`,
        }}
      >
        <Icon size={15} style={{ color: accent }} />
      </div>
      <div className="text-[11px] font-mono uppercase tracking-wider text-[#8794AB] mb-1">
        {label}
      </div>
      <div className="font-display font-bold text-white text-2xl tracking-tight">
        {value}
      </div>
      <div
        className="text-xs font-medium mt-1"
        style={{ color: accent }}
      >
        {delta}
      </div>
    </div>
  </div>
);

export default DashboardPreview;
