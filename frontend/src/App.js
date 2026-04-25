import "@/App.css";
import "@/index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "@/contexts/AuthContext";
import { Toaster } from "sonner";

// Pages
import LandingPage from "@/components/landing/LandingPage";
import GetStartedPage from "@/pages/auth/GetStartedPage";
import LoginPage from "@/pages/auth/LoginPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import AgentsPage from "@/pages/agents/AgentsPage";
import CreateAgentPage from "@/pages/agents/CreateAgentPage";
import AgentPreviewPage from "@/pages/agents/AgentPreviewPage";
import CampaignSetupPage from "@/pages/campaigns/CampaignSetupPage";
import LiveCampaignPage from "@/pages/campaigns/LiveCampaignPage";
import ResultsPage from "@/pages/results/ResultsPage";
import SettingsPage from "@/pages/settings/SettingsPage";
import SkillsPage from "@/pages/skills/SkillsPage";
import SkillPreviewPage from "@/pages/skills/SkillPreviewPage";
import UseSkillPage from "@/pages/skills/UseSkillPage";
import EditSkillPage from "@/pages/skills/EditSkillPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-[#0B1F3A] text-white antialiased">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/get-started" element={<GetStartedPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes (Dashboard) */}
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/agents" element={
              <ProtectedRoute><AgentsPage /></ProtectedRoute>
            } />
            <Route path="/agents/create" element={
              <ProtectedRoute><CreateAgentPage /></ProtectedRoute>
            } />
            <Route path="/agents/:id/preview" element={
              <ProtectedRoute><AgentPreviewPage /></ProtectedRoute>
            } />
            <Route path="/campaigns/setup" element={
              <ProtectedRoute><CampaignSetupPage /></ProtectedRoute>
            } />
            <Route path="/campaigns/live" element={
              <ProtectedRoute><LiveCampaignPage /></ProtectedRoute>
            } />
            <Route path="/campaigns/:id/live" element={
              <ProtectedRoute><LiveCampaignPage /></ProtectedRoute>
            } />
            <Route path="/results" element={
              <ProtectedRoute><ResultsPage /></ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute><SettingsPage /></ProtectedRoute>
            } />
            <Route path="/skills" element={
              <ProtectedRoute><SkillsPage /></ProtectedRoute>
            } />
            <Route path="/skills/:id" element={
              <ProtectedRoute><SkillPreviewPage /></ProtectedRoute>
            } />
            <Route path="/skills/:id/use" element={
              <ProtectedRoute><UseSkillPage /></ProtectedRoute>
            } />
            <Route path="/skills/:id/edit" element={
              <ProtectedRoute><EditSkillPage /></ProtectedRoute>
            } />
          </Routes>
          <Toaster position="top-right" theme="dark" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
