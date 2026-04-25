import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Zap, Copy, Edit, Tag, Globe, User, Clock,
  TrendingUp, Eye, Lock, Star,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/services/api';
import { toast } from 'sonner';
import ShareSkillModal from './ShareSkillModal';

export default function SkillPreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [cloning, setCloning] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getSkill(id);
        setSkill(data);
      } catch (err) {
        toast.error('Skill not found');
        navigate('/skills');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleClone = async () => {
    setCloning(true);
    try {
      const cloned = await api.cloneSkill(id);
      toast.success('Skill cloned to your library');
      navigate(`/skills/${cloned.id}/edit`);
    } catch (err) {
      toast.error(err.message || 'Failed to clone');
    } finally {
      setCloning(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Skill Preview">
        <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
          <div className="h-8 bg-[#1E293B] rounded w-1/2" />
          <div className="h-4 bg-[#1E293B] rounded w-3/4" />
          <div className="h-64 bg-[#1E293B] rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!skill) return null;

  return (
    <DashboardLayout title="Skill Preview" subtitle={skill.title}>
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/skills')}
          className="flex items-center gap-2 text-[#94A3B8] hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Community Skills
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0B1F3A] border border-[#1E293B] rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#1E293B]">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-xl font-bold text-white">{skill.title}</h1>
              <div className="flex items-center gap-2 flex-shrink-0">
                {skill.is_official && skill.category === 'advanced' && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-[#F59E0B]/15 text-[#F59E0B] rounded-full text-xs font-medium">
                    <Star className="w-3 h-3" />Pro
                  </span>
                )}
                {skill.is_official && skill.category !== 'advanced' && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-[#3B82F6]/15 text-[#3B82F6] rounded-full text-xs font-medium">
                    <Star className="w-3 h-3" />Official
                  </span>
                )}
                {skill.visibility === 'private' && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-[#1E293B] text-[#64748B] rounded-full text-xs">
                    <Lock className="w-3 h-3" />Private
                  </span>
                )}
              </div>
            </div>
            <p className="text-[#94A3B8] text-sm mb-4">{skill.description}</p>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-xs text-[#64748B]">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {skill.author_name}
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                {skill.usage_count} uses
              </span>
              <span className="flex items-center gap-1.5">
                <Copy className="w-3.5 h-3.5" />
                {skill.clone_count} clones
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {new Date(skill.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Tags & Languages */}
          <div className="px-6 py-4 border-b border-[#1E293B] flex flex-wrap gap-4">
            {skill.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {skill.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-full text-xs">
                    <Tag className="w-3 h-3" />#{tag}
                  </span>
                ))}
              </div>
            )}
            {skill.languages?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {skill.languages.map(lang => (
                  <span key={lang} className="flex items-center gap-1 px-2.5 py-1 bg-[#10B981]/10 text-[#10B981] rounded-full text-xs">
                    <Globe className="w-3 h-3" />{lang}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Markdown Preview */}
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-[#64748B]" />
              <span className="text-xs text-[#64748B] uppercase tracking-wide">Prompt Preview</span>
            </div>
            <div className="bg-[#060D18] border border-[#1E293B] rounded-xl px-5 py-4 prose prose-invert prose-sm max-w-none overflow-auto max-h-[400px]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{skill.markdown_content}</ReactMarkdown>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-[#1E293B] flex flex-wrap gap-3">
            <button
              onClick={() => navigate(`/skills/${skill.id}/use`)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Zap className="w-4 h-4" />
              Use Skill
            </button>

            {skill.is_owner ? (
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1E293B] hover:bg-[#243447] text-[#94A3B8] rounded-xl text-sm transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Skill
              </button>
            ) : (
              <button
                onClick={handleClone}
                disabled={cloning}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1E293B] hover:bg-[#243447] disabled:opacity-50 text-[#94A3B8] rounded-xl text-sm transition-colors"
              >
                <Copy className="w-4 h-4" />
                {cloning ? 'Cloning...' : 'Clone Skill'}
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {showEditModal && (
        <ShareSkillModal
          initialData={skill}
          onClose={() => setShowEditModal(false)}
          onSaved={() => {
            setShowEditModal(false);
            api.getSkill(id).then(setSkill);
          }}
        />
      )}
    </DashboardLayout>
  );
}
