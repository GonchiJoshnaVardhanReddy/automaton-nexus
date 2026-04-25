import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bot,
  ArrowLeft,
  Check,
  Edit,
  User,
  Sparkles,
  Volume2
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/services/api';
import { toast } from 'sonner';

const AgentPreviewPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    loadAgent();
  }, [id]);

  const loadAgent = async () => {
    try {
      const data = await api.getAgent(id);
      setAgent(data);
    } catch (error) {
      toast.error('Failed to load agent');
      navigate('/agents');
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      await api.activateAgent(id);
      toast.success('Agent deployed successfully!');
      navigate('/agents');
    } catch (error) {
      toast.error('Failed to deploy agent');
    } finally {
      setIsDeploying(false);
    }
  };

  // Generate sample conversation based on use case
  const getSampleConversation = () => {
    if (!agent) return [];
    
    const customerName = 'Mr. Sharma';
    const conversations = {
      order_confirmation: [
        { role: 'ai', message: `Hello! This is ${agent.name} from TechStore. Am I speaking with ${customerName}?` },
        { role: 'user', message: 'Yes, this is Sharma speaking.' },
        { role: 'ai', message: 'Great! I\'m calling to confirm your order #12345 placed yesterday. Your order includes a Samsung Galaxy S24 Ultra for ₹1,29,999. The delivery is scheduled for January 28th. Would you like to confirm this order?' },
        { role: 'user', message: 'Yes, please confirm it.' },
        { role: 'ai', message: 'Wonderful! Your order has been confirmed. You\'ll receive a confirmation SMS shortly. Is there anything else I can help you with?' },
        { role: 'user', message: 'No, that\'s all. Thank you!' },
        { role: 'ai', message: 'Thank you for choosing TechStore. Have a great day!' },
      ],
      appointment_reminder: [
        { role: 'ai', message: `Hello! This is ${agent.name} calling from HealthCare Clinic. Am I speaking with ${customerName}?` },
        { role: 'user', message: 'Yes, speaking.' },
        { role: 'ai', message: 'I\'m calling to remind you about your appointment scheduled for tomorrow at 10:00 AM with Dr. Patel. Can you confirm your attendance?' },
        { role: 'user', message: 'Yes, I\'ll be there.' },
        { role: 'ai', message: 'Perfect! Please arrive 10 minutes early. See you tomorrow!' },
      ],
      delivery_update: [
        { role: 'ai', message: `Hello! This is ${agent.name} from FastDelivery. Am I speaking with ${customerName}?` },
        { role: 'user', message: 'Yes, that\'s me.' },
        { role: 'ai', message: 'Your package is out for delivery and will arrive today between 2-4 PM. Is someone available to receive it?' },
        { role: 'user', message: 'Yes, I\'ll be home.' },
        { role: 'ai', message: 'Great! You\'ll receive a notification when the driver is nearby. Thank you!' },
      ],
    };
    
    return conversations[agent.use_case] || conversations.order_confirmation;
  };

  if (loading) {
    return (
      <DashboardLayout title="Agent Preview" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!agent) return null;

  const sampleConversation = getSampleConversation();

  return (
    <DashboardLayout title="Agent Preview" subtitle="Review and deploy your agent">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/agents')}
          data-testid="back-to-agents"
          className="flex items-center gap-2 text-[#94A3B8] hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Agents
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Generated Script */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-[#0B1F3A] border border-[#1E293B] rounded-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-[#1E293B]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2563EB]/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#2563EB]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Generated Script</h3>
                    <p className="text-sm text-[#64748B]">AI-generated conversation flow</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 max-h-[500px] overflow-y-auto">
              <pre className="text-[#94A3B8] text-sm whitespace-pre-wrap font-mono leading-relaxed">
                {agent.generated_script || 'Script not generated yet.'}
              </pre>
            </div>
          </motion.div>

          {/* Sample Conversation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-[#0B1F3A] border border-[#1E293B] rounded-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-[#1E293B]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#A855F7]/20 flex items-center justify-center">
                  <Volume2 className="w-5 h-5 text-[#A855F7]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Sample Conversation</h3>
                  <p className="text-sm text-[#64748B]">Preview how conversations will flow</p>
                </div>
              </div>
            </div>
            <div className="p-6 max-h-[500px] overflow-y-auto space-y-4">
              {sampleConversation.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                >
                  {msg.role === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#22D3EE] flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      msg.role === 'ai'
                        ? 'bg-[#1E293B] text-white rounded-tl-none'
                        : 'bg-[#2563EB] text-white rounded-tr-none'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-[#64748B]/30 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Agent Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-[#0B1F3A] border border-[#1E293B] rounded-2xl p-6 mt-6"
        >
          <h3 className="font-semibold text-white mb-4">Agent Configuration</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#1E293B]/50">
              <p className="text-sm text-[#64748B] mb-1">Name</p>
              <p className="font-medium text-white">{agent.name}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#1E293B]/50">
              <p className="text-sm text-[#64748B] mb-1">Language</p>
              <p className="font-medium text-white capitalize">{agent.language}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#1E293B]/50">
              <p className="text-sm text-[#64748B] mb-1">Use Case</p>
              <p className="font-medium text-white capitalize">{agent.use_case.replace('_', ' ')}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#1E293B]/50">
              <p className="text-sm text-[#64748B] mb-1">Voice</p>
              <p className="font-medium text-white capitalize">{agent.voice.replace('_', ' ')}</p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-end mt-8"
        >
          <button
            onClick={() => navigate('/agents/create')}
            data-testid="edit-agent-btn"
            className="btn-secondary px-8 py-4"
          >
            <Edit className="w-5 h-5" />
            Create New Agent
          </button>
          <button
            onClick={handleDeploy}
            data-testid="deploy-agent-btn"
            disabled={isDeploying || agent.status === 'active'}
            className="btn-primary px-8 py-4"
          >
            {isDeploying ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Deploying...
              </span>
            ) : agent.status === 'active' ? (
              <span className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                Already Active
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                Approve & Deploy
              </span>
            )}
          </button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AgentPreviewPage;
