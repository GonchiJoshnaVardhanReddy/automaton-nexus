import React from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import ProblemSection from "./ProblemSection";
import SolutionSection from "./SolutionSection";
import HowItWorks from "./HowItWorks";
import LiveDemo from "./LiveDemo";
import FeaturesSection from "./FeaturesSection";
import DashboardPreview from "./DashboardPreview";
import FinalCTA from "./FinalCTA";
import Footer from "./Footer";

const LandingPage = () => {
  return (
    <div className="relative grain" data-testid="landing-page">
      <Navbar />
      <main className="relative">
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <HowItWorks />
        <LiveDemo />
        <FeaturesSection />
        <DashboardPreview />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
