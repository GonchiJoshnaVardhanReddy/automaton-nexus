import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const LOGO =
  "https://customer-assets.emergentagent.com/job_3eb1fdca-da4b-4a5d-9b60-309896ef758e/artifacts/8vqfic72_automaton%20logo.png";

const navLinks = [
  { label: "Solution", href: "#solution" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Live Demo", href: "#demo" },
  { label: "Features", href: "#features" },
  { label: "Dashboard", href: "#dashboard" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "py-3 backdrop-blur-xl bg-[#0B1221]/70 border-b border-white/5"
          : "py-5 bg-transparent"
      }`}
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        <a
          href="#top"
          className="flex items-center gap-2.5 group"
          data-testid="navbar-logo-link"
        >
          <img
            src={LOGO}
            alt="Automaton Nexus"
            className="h-9 w-auto"
          />
          <span className="font-display font-bold text-white text-lg tracking-tight">
            Automaton <span className="text-[#22D3EE]">Nexus</span>
          </span>
        </a>

        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-4 py-2 rounded-full text-sm text-[#C7D1E0] hover:text-white hover:bg-white/5 transition-all"
              data-testid={`nav-link-${link.label.toLowerCase().replace(/\s/g, "-")}`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/login"
            className="btn-ghost"
            data-testid="navbar-signin-btn"
          >
            Sign in
          </Link>
          <Link
            to="/get-started"
            className="btn-primary"
            data-testid="navbar-create-agent-btn"
          >
            Get Started
          </Link>
        </div>

        <button
          className="lg:hidden w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center text-white"
          onClick={() => setMobileOpen((v) => !v)}
          data-testid="navbar-mobile-toggle"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden mt-3 mx-6 p-4 rounded-2xl glass-strong"
          data-testid="navbar-mobile-menu"
        >
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-xl text-[#C7D1E0] hover:text-white hover:bg-white/5"
              >
                {link.label}
              </a>
            ))}
            <div className="h-px bg-white/5 my-2" />
            <Link to="/get-started" className="btn-primary w-full text-center" data-testid="mobile-create-agent-btn">
              Get Started
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
