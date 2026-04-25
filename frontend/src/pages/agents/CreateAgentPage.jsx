import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Globe,
  Mic,
  FileText,
  Check
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/services/api';
import { toast } from 'sonner';

const CreateAgentPage = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    language: 'english',
    use_case: 'order_confirmation',
    custom_instructions: '',
    voice: 'professional_female',
  });

  const languages = [
    { value: 'english', label: 'English', flag: '🇺🇸' },
    { value: 'hindi', label: 'Hindi', flag: '🇮🇳' },
    { value: 'kannada', label: 'Kannada', flag: '🇮🇳' },
    { value: 'marathi', label: 'Marathi', flag: '🇮🇳' },
  ];

  const useCases = [
    { value: 'order_confirmation', label: 'Order Confirmation', icon: '📦' },
    { value: 'appointment_reminder', label: 'Appointment Reminder', icon: '📅' },
    { value: 'delivery_update', label: 'Delivery Update', icon: '🚚' },
    { value: 'feedback_collection', label: 'Feedback Collection', icon: '⭐' },
    { value: 'payment_reminder', label: 'Payment Reminder', icon: '💳' },
    { value: 'custom', label: 'Custom Use Case', icon: '✨' },
  ];

  const voices = [
    { value: 'professional_female', label: 'Professional Female', desc: 'Clear and friendly' },
    { value: 'professional_male', label: 'Professional Male', desc: 'Confident and warm' },
    { value: 'young_female', label: 'Young Female', desc: 'Energetic and casual' },
    { value: 'young_male', label: 'Young Male', desc: 'Modern and approachable' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      const agent = await api.createAgent(formData);
      toast.success('Agent created successfully!');
      navigate(`/agents/${agent.id}/preview`);
    } catch (error) {
      toast.error(error.message || 'Failed to create agent');
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout title="Create Agent" subtitle="Build a new AI voice agent">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/agents')}
          data-testid="back-to-agents"
          className="flex items-center gap-2 text-[#94A3B8] hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Agents
        </button>

        <form onSubmit={handleSubmit}>
          {/* Agent Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-[#0B1F3A] border border-[#1E293B] rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB]/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Agent Name</h3>
                <p className="text-sm text-[#64748B]">Give your agent a descriptive name</p>
              </div>
            </div>
            <input
              type="text"
              data-testid="agent-name-input"
              placeholder="e.g., Order Confirmation Bot"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field text-lg"
              required
            />
          </motion.div>

          {/* Language Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-[#0B1F3A] border border-[#1E293B] rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#22D3EE]/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#22D3EE]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Language</h3>
                <p className="text-sm text-[#64748B]">Select the primary language for your agent</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {languages.map((lang) => (
                <button
                  key={lang.value}
                  type="button"
                  data-testid={`lang-${lang.value}`}
                  onClick={() => setFormData({ ...formData, language: lang.value })}
                  className={`p-4 rounded-xl border transition-all duration-200 text-left ${
                    formData.language === lang.value
                      ? 'bg-[#2563EB]/20 border-[#2563EB]'
                      : 'bg-white/5 border-[#1E293B] hover:border-[#334155]'
                  }`}
                >
                  <span className="text-2xl mb-2 block">{lang.flag}</span>
                  <span className="font-medium text-white">{lang.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Use Case */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-[#0B1F3A] border border-[#1E293B] rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#A855F7]/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#A855F7]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Use Case</h3>
                <p className="text-sm text-[#64748B]">What will this agent be used for?</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {useCases.map((useCase) => (
                <button
                  key={useCase.value}
                  type="button"
                  data-testid={`usecase-${useCase.value}`}
                  onClick={() => setFormData({ ...formData, use_case: useCase.value })}
                  className={`p-4 rounded-xl border transition-all duration-200 text-left ${
                    formData.use_case === useCase.value
                      ? 'bg-[#A855F7]/20 border-[#A855F7]'
                      : 'bg-white/5 border-[#1E293B] hover:border-[#334155]'
                  }`}
                >
                  <span className="text-2xl mb-2 block">{useCase.icon}</span>
                  <span className="font-medium text-white text-sm">{useCase.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Custom Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-[#0B1F3A] border border-[#1E293B] rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#EC4899]/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#EC4899]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Custom Instructions (Optional)</h3>
                <p className="text-sm text-[#64748B]">Add specific instructions for your agent</p>
              </div>
            </div>
            <textarea
              data-testid="custom-prompt-input"
              placeholder="e.g., Always confirm the order number before proceeding. Be polite and patient with elderly customers."
              value={formData.custom_instructions}
              onChange={(e) => setFormData({ ...formData, custom_instructions: e.target.value })}
              className="input-field min-h-[120px] resize-none"
              rows={4}
            />
          </motion.div>

          {/* Voice Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="bg-[#0B1F3A] border border-[#1E293B] rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                <Mic className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Voice Selection</h3>
                <p className="text-sm text-[#64748B]">Choose a voice for your agent</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {voices.map((voice) => (
                <button
                  key={voice.value}
                  type="button"
                  data-testid={`voice-${voice.value}`}
                  onClick={() => setFormData({ ...formData, voice: voice.value })}
                  className={`p-4 rounded-xl border transition-all duration-200 text-left flex items-center gap-4 ${
                    formData.voice === voice.value
                      ? 'bg-[#10B981]/20 border-[#10B981]'
                      : 'bg-white/5 border-[#1E293B] hover:border-[#334155]'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2563EB] to-[#22D3EE] flex items-center justify-center">
                    <Mic className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{voice.label}</p>
                    <p className="text-sm text-[#64748B]">{voice.desc}</p>
                  </div>
                  {formData.voice === voice.value && (
                    <Check className="w-5 h-5 text-[#10B981]" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="flex justify-end"
          >
            <button
              type="submit"
              data-testid="generate-agent-btn"
              disabled={!formData.name || isGenerating}
              className="btn-primary px-8 py-4 text-lg"
            >
              {isGenerating ? (
                <span className="flex items-center gap-3">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating Agent...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Generate Agent
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateAgentPage;
