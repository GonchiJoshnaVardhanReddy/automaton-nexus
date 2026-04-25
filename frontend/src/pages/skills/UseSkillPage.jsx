import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Eye, Edit, Sparkles, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/services/api';
import { toast } from 'sonner';

const VOICES = [
  { value: 'professional_female', label: 'Professional Female', desc: 'Clear and friendly' },
  { value: 'professional_male', label: 'Professional Male', desc: 'Confident and warm' },
  { value: 'young_female', label: 'Young Female', desc: 'Energetic and casual' },
  { value: 'young_male', label: 'Young Male', desc: 'Modern and approachable' },
];

const STEPS = ['Load Prompt', 'Edit & Configure', 'Generate Agent'];

export default function UseSkillPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [editedMarkdown, setEditedMarkdown] = useState('');
  const [agentName, setAgentName] = useState('');
  const [voice, setVoice] = useState('professional_female');
  const [previewMode, setPreviewMode] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getSkill(id);
        setSkill(data);
        setEditedMarkdown(data.markdown_content);
        setAgentName(`${data.title} Agent`);
        // Track usage
        api.useSkill(id).catch(() => {});
        setStep(1);
      } catch (err) {
        toast.error('Skill not found');
        navigate('/skills');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleGenerate = async () => {
    if (!agentName.trim()) { toast.error('Agent name is required'); return; }
    if (!editedMarkdown.trim()) { toast.error('Prompt content is required'); return; }

    setGenerating(true);
    setStep(2);
    try {
      const result = await api.generateAgentFromSkill({
        skill_id: id,
        edited_markdown: editedMarkdown,
        agent_name: agentName,
        voice,
      });
      toast.success('Agent created successfully!');
      navigate(`/agents/${result.id}/preview`);
    } catch (err) {
      toast.error(err.message || 'Failed to generate agent');
      setStep(1);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Use Skill">
        <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
          <div className="h-8 bg-[#1E293B] rounded w-1/2" />
          <div className="h-64 bg-[#1E293B] rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Use Skill" subtitle="Generate an AI agent from this prompt">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(`/skills/${id}`)}
          className="flex items-center gap-2 text-[#94A3B8] hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Skill
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                i < step ? 'bg-[#10B981] text-white' :
                i === step ? 'bg-[#3B82F6] text-white' :
                'bg-[#1E293B] text-[#64748B]'
              }`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-sm ${i === step ? 'text-white' : 'text-[#64748B]'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="w-8 h-px bg-[#1E293B] mx-1" />}
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Skill info */}
          {skill && (
            <div className="bg-[#0B1F3A] border border-[#1E293B] rounded-xl px-5 py-4">
              <p className="text-xs text-[#64748B] mb-1 uppercase tracking-wide">Using Skill</p>
              <p className="text-white font-semibold">{skill.title}</p>
              <p className="text-[#94A3B8] text-sm mt-1">{skill.description}</p>
            </div>
          )}

          {/* Agent Name */}
          <div className="bg-[#0B1F3A] border border-[#1E293B] rounded-xl px-5 py-4">
            <label className="block text-xs text-[#64748B] mb-2 uppercase tracking-wide">Agent Name *</label>
            <input
              type="text"
              value={agentName}
              onChange={e => setAgentName(e.target.value)}
              placeholder="e.g. Order Confirmation Bot"
              className="w-full px-4 py-2.5 bg-[#060D18] border border-[#1E293B] rounded-xl text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#3B82F6]"
            />
          </div>

          {/* Voice */}
          <div className="bg-[#0B1F3A] border border-[#1E293B] rounded-xl px-5 py-4">
            <label className="block text-xs text-[#64748B] mb-3 uppercase tracking-wide">Voice</label>
            <div className="grid grid-cols-2 gap-2">
              {VOICES.map(v => (
                <button
                  key={v.value}
                  onClick={() => setVoice(v.value)}
                  className={`text-left px-4 py-3 rounded-xl border transition-colors ${
                    voice === v.value
                      ? 'border-[#3B82F6] bg-[#3B82F6]/10'
                      : 'border-[#1E293B] hover:border-[#243447]'
                  }`}
                >
                  <p className={`text-sm font-medium ${voice === v.value ? 'text-[#3B82F6]' : 'text-white'}`}>{v.label}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">{v.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Markdown Editor */}
          <div className="bg-[#0B1F3A] border border-[#1E293B] rounded-xl px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs text-[#64748B] uppercase tracking-wide">Edit Prompt</label>
              <div className="flex gap-1 bg-[#060D18] border border-[#1E293B] rounded-lg p-0.5">
                <button
                  onClick={() => setPreviewMode(false)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-colors ${
                    !previewMode ? 'bg-[#1E293B] text-white' : 'text-[#64748B]'
                  }`}
                >
                  <Edit className="w-3 h-3" />Edit
                </button>
                <button
                  onClick={() => setPreviewMode(true)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-colors ${
                    previewMode ? 'bg-[#1E293B] text-white' : 'text-[#64748B]'
                  }`}
                >
                  <Eye className="w-3 h-3" />Preview
                </button>
              </div>
            </div>

            {previewMode ? (
              <div className="min-h-[240px] max-h-[400px] overflow-y-auto px-4 py-3 bg-[#060D18] border border-[#1E293B] rounded-xl prose prose-invert prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{editedMarkdown}</ReactMarkdown>
              </div>
            ) : (
              <textarea
                value={editedMarkdown}
                onChange={e => setEditedMarkdown(e.target.value)}
                rows={14}
                spellCheck={false}
                className="w-full px-4 py-3 bg-[#060D18] border border-[#1E293B] rounded-xl text-sm text-white font-mono placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] resize-none"
              />
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
          >
            {generating ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                Generating Agent...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Generate AI Agent
              </>
            )}
          </button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
