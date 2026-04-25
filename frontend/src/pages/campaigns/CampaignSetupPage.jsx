import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Upload,
  Plus,
  X,
  Phone,
  ArrowRight,
  Bot,
  CheckCircle,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/services/api';
import { toast } from 'sonner';

const CampaignSetupPage = () => {
  const navigate = useNavigate();
  const [uploadMethod, setUploadMethod] = useState('manual');
  const [phoneNumbers, setPhoneNumbers] = useState([{ phone_number: '', customer_name: '' }]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [orderContext, setOrderContext] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const data = await api.getAgents();
      // Filter only active agents
      setAgents(data.filter(a => a.status === 'active' || a.status === 'draft'));
      if (data.length > 0) {
        setSelectedAgent(data[0].id);
      }
    } catch (error) {
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const addPhoneNumber = () => {
    setPhoneNumbers([...phoneNumbers, { phone_number: '', customer_name: '' }]);
  };

  const removePhoneNumber = (index) => {
    setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index));
  };

  const updatePhoneNumber = (index, field, value) => {
    const updated = [...phoneNumbers];
    updated[index][field] = value;
    setPhoneNumbers(updated);
  };

  const handleStartCampaign = async () => {
    // Validate
    const validNumbers = phoneNumbers.filter(p => p.phone_number.trim());
    if (validNumbers.length === 0) {
      toast.error('Please add at least one phone number');
      return;
    }

    if (!selectedAgent) {
      toast.error('Please select an agent');
      return;
    }

    setIsStarting(true);

    try {
      // Create campaign
      const campaign = await api.createCampaign({
        agent_id: selectedAgent,
        phone_numbers: validNumbers,
        order_context: orderContext,
      });

      // Start campaign
      await api.startCampaign(campaign.id);
      
      toast.success('Campaign started!');
      navigate(`/campaigns/${campaign.id}/live`);
    } catch (error) {
      toast.error(error.message || 'Failed to start campaign');
      setIsStarting(false);
    }
  };

  const isValid = selectedAgent && phoneNumbers.some(p => p.phone_number.trim());

  if (loading) {
    return (
      <DashboardLayout title="Campaign Setup" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Campaign Setup" subtitle="Configure and launch a calling campaign">
      <div className="max-w-4xl mx-auto">
        {/* Select Agent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[#0B1F3A] border border-[#1E293B] rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#2563EB]/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Select Agent</h3>
              <p className="text-sm text-[#64748B]">Choose which AI agent will make the calls</p>
            </div>
          </div>

          {agents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#64748B] mb-4">No agents available</p>
              <button
                onClick={() => navigate('/agents/create')}
                className="text-[#2563EB] hover:text-[#22D3EE] transition-colors font-medium"
              >
                Create your first agent →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  type="button"
                  data-testid={`select-agent-${agent.id}`}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={`p-4 rounded-xl border transition-all duration-200 text-left ${
                    selectedAgent === agent.id
                      ? 'bg-[#2563EB]/20 border-[#2563EB]'
                      : 'bg-white/5 border-[#1E293B] hover:border-[#334155]'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#22D3EE] flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    {selectedAgent === agent.id && (
                      <CheckCircle className="w-5 h-5 text-[#10B981] ml-auto" />
                    )}
                  </div>
                  <p className="font-medium text-white">{agent.name}</p>
                  <p className="text-sm text-[#64748B] capitalize">{agent.language}</p>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Phone Numbers Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-[#0B1F3A] border border-[#1E293B] rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#22D3EE]/20 flex items-center justify-center">
              <Phone className="w-5 h-5 text-[#22D3EE]" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Add Recipients</h3>
              <p className="text-sm text-[#64748B]">Add phone numbers to call</p>
            </div>
          </div>

          <div className="space-y-3">
            {phoneNumbers.map((entry, index) => (
              <div key={index} className="flex gap-3">
                <input
                  type="tel"
                  data-testid={`phone-input-${index}`}
                  placeholder="+91 98765 43210"
                  value={entry.phone_number}
                  onChange={(e) => updatePhoneNumber(index, 'phone_number', e.target.value)}
                  className="input-field flex-1"
                />
                <input
                  type="text"
                  placeholder="Customer name (optional)"
                  value={entry.customer_name}
                  onChange={(e) => updatePhoneNumber(index, 'customer_name', e.target.value)}
                  className="input-field flex-1"
                />
                {phoneNumbers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePhoneNumber(index)}
                    className="p-3 rounded-xl bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              data-testid="add-phone-btn"
              onClick={addPhoneNumber}
              className="flex items-center gap-2 text-[#22D3EE] hover:text-[#2563EB] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add another number
            </button>
          </div>
        </motion.div>

        {/* Order Context */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-[#0B1F3A] border border-[#1E293B] rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#A855F7]/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#A855F7]" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Order Context (Optional)</h3>
              <p className="text-sm text-[#64748B]">Add context for the AI to reference during calls</p>
            </div>
          </div>

          <textarea
            data-testid="order-context-input"
            placeholder="e.g., All orders are from the January sale. Delivery is expected within 3-5 business days."
            value={orderContext}
            onChange={(e) => setOrderContext(e.target.value)}
            className="input-field min-h-[120px] resize-none"
            rows={4}
          />
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex justify-end"
        >
          <button
            onClick={handleStartCampaign}
            data-testid="start-campaign-btn"
            disabled={!isValid || isStarting}
            className="btn-primary px-8 py-4 text-lg"
          >
            {isStarting ? (
              <span className="flex items-center gap-3">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Starting Campaign...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Start Calling
                <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default CampaignSetupPage;
