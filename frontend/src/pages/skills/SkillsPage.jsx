import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Plus, Search, Filter, Tag, Globe, TrendingUp,
  Clock, Star, Copy, Eye, Edit, Zap, X, ChevronDown,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/services/api';
import { toast } from 'sonner';
import ShareSkillModal from './ShareSkillModal';

const TAGS = ['order-confirmation', 'delivery-update', 'campaign', 'support-agent', 'appointment-reminder', 'payment-reminder', 'feedback', 'multilingual'];
const LANGUAGES = ['English', 'Hindi', 'Kannada', 'Marathi'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest', icon: Clock },
  { value: 'popular', label: 'Most Used', icon: TrendingUp },
  { value: 'cloned', label: 'Most Cloned', icon: Copy },
];
const CATEGORY_TABS = [
  { value: '', label: 'All Skills' },
  { value: 'starter', label: 'Starter' },
  { value: 'advanced', label: 'Pro Skills' },
  { value: 'mine', label: 'My Skills' },
];

export default function SkillsPage() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [sort, setSort] = useState('newest');
  const [activeTab, setActiveTab] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    try {
      const data = activeTab === 'mine'
        ? await api.getMySkills()
        : await api.getSkills({ tag: selectedTag, language: selectedLanguage, sort, search });
      setSkills(data);
    } catch (err) {
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  }, [selectedTag, selectedLanguage, sort, search, activeTab]);

  useEffect(() => {
    const timer = setTimeout(fetchSkills, 300);
    return () => clearTimeout(timer);
  }, [fetchSkills]);

  // Client-side category filter (starter / advanced)
  const visibleSkills = activeTab && activeTab !== 'mine'
    ? skills.filter(s => s.category === activeTab)
    : skills;

  const handleClone = async (skill) => {
    try {
      await api.cloneSkill(skill.id);
      toast.success('Skill cloned to your library');
      fetchSkills();
    } catch (err) {
      toast.error(err.message || 'Failed to clone skill');
    }
  };

  const handleDelete = async (skill) => {
    if (!window.confirm(`Delete "${skill.title}"?`)) return;
    try {
      await api.deleteSkill(skill.id);
      toast.success('Skill deleted');
      fetchSkills();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const clearFilters = () => {
    setSelectedTag('');
    setSelectedLanguage('');
    setSearch('');
    setSort('newest');
  };

  const hasFilters = selectedTag || selectedLanguage || search;

  return (
    <DashboardLayout title="Community Skills" subtitle="Browse, share, and reuse AI agent prompts">
      <div className="flex gap-6">
        {/* Left Sidebar Filters */}
        <aside className="hidden lg:flex flex-col gap-4 w-56 flex-shrink-0">
          <div className="bg-[#0B1F3A] border border-[#1E293B] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">Filters</span>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-[#3B82F6] hover:underline">Clear</button>
              )}
            </div>

            {/* Sort */}
            <div className="mb-4">
              <p className="text-xs text-[#64748B] mb-2 uppercase tracking-wide">Sort by</p>
              {SORT_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setSort(value)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
                    sort === value ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'text-[#94A3B8] hover:bg-[#1E293B]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Tags */}
            <div className="mb-4">
              <p className="text-xs text-[#64748B] mb-2 uppercase tracking-wide">Tags</p>
              <div className="flex flex-col gap-1">
                {TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                    className={`text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      selectedTag === tag ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' : 'text-[#94A3B8] hover:bg-[#1E293B]'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <p className="text-xs text-[#64748B] mb-2 uppercase tracking-wide">Language</p>
              <div className="flex flex-col gap-1">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(selectedLanguage === lang ? '' : lang)}
                    className={`text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      selectedLanguage === lang ? 'bg-[#10B981]/20 text-[#10B981]' : 'text-[#94A3B8] hover:bg-[#1E293B]'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Panel */}
        <div className="flex-1 min-w-0">
          {/* Category tabs */}
          <div className="flex gap-1 mb-5 bg-[#060D18] border border-[#1E293B] rounded-xl p-1 w-fit">
            {CATEGORY_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.value
                    ? 'bg-[#0B1F3A] text-white shadow'
                    : 'text-[#64748B] hover:text-[#94A3B8]'
                }`}
              >
                {tab.label}
                {tab.value === 'advanced' && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-[#F59E0B]/20 text-[#F59E0B] rounded text-xs">Pro</span>
                )}
              </button>
            ))}
          </div>

          {/* Header bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search skills..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#0B1F3A] border border-[#1E293B] rounded-xl text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6]"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-[#64748B]" />
                </button>
              )}
            </div>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-[#0B1F3A] border border-[#1E293B] rounded-xl text-sm text-[#94A3B8]"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Share Your Skill
            </button>
          </div>

          {/* Mobile filters */}
          {filterOpen && (
            <div className="lg:hidden bg-[#0B1F3A] border border-[#1E293B] rounded-xl p-4 mb-4">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs text-[#64748B] self-center">Sort:</span>
                {SORT_OPTIONS.map(({ value, label }) => (
                  <button key={value} onClick={() => setSort(value)}
                    className={`px-3 py-1 rounded-full text-xs ${sort === value ? 'bg-[#3B82F6] text-white' : 'bg-[#1E293B] text-[#94A3B8]'}`}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs text-[#64748B] self-center">Tag:</span>
                {TAGS.map(tag => (
                  <button key={tag} onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                    className={`px-3 py-1 rounded-full text-xs ${selectedTag === tag ? 'bg-[#8B5CF6] text-white' : 'bg-[#1E293B] text-[#94A3B8]'}`}>
                    #{tag}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-[#64748B] self-center">Lang:</span>
                {LANGUAGES.map(lang => (
                  <button key={lang} onClick={() => setSelectedLanguage(selectedLanguage === lang ? '' : lang)}
                    className={`px-3 py-1 rounded-full text-xs ${selectedLanguage === lang ? 'bg-[#10B981] text-white' : 'bg-[#1E293B] text-[#94A3B8]'}`}>
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active filter chips */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedTag && (
                <span className="flex items-center gap-1 px-3 py-1 bg-[#8B5CF6]/20 text-[#8B5CF6] rounded-full text-xs">
                  <Tag className="w-3 h-3" />#{selectedTag}
                  <button onClick={() => setSelectedTag('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedLanguage && (
                <span className="flex items-center gap-1 px-3 py-1 bg-[#10B981]/20 text-[#10B981] rounded-full text-xs">
                  <Globe className="w-3 h-3" />{selectedLanguage}
                  <button onClick={() => setSelectedLanguage('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {search && (
                <span className="flex items-center gap-1 px-3 py-1 bg-[#3B82F6]/20 text-[#3B82F6] rounded-full text-xs">
                  <Search className="w-3 h-3" />"{search}"
                  <button onClick={() => setSearch('')}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {/* Skills Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-[#0B1F3A] border border-[#1E293B] rounded-xl p-5 animate-pulse">
                  <div className="h-4 bg-[#1E293B] rounded w-3/4 mb-3" />
                  <div className="h-3 bg-[#1E293B] rounded w-full mb-2" />
                  <div className="h-3 bg-[#1E293B] rounded w-2/3 mb-4" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-[#1E293B] rounded-full w-20" />
                    <div className="h-6 bg-[#1E293B] rounded-full w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : visibleSkills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <BookOpen className="w-12 h-12 text-[#1E293B] mb-4" />
              <p className="text-[#64748B] text-lg mb-2">No skills found</p>
              <p className="text-[#475569] text-sm mb-6">Be the first to share a skill with the community</p>
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Share Your Skill
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {visibleSkills.map((skill, i) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  index={i}
                  onView={() => navigate(`/skills/${skill.id}`)}
                  onUse={() => navigate(`/skills/${skill.id}/use`)}
                  onEdit={() => navigate(`/skills/${skill.id}/edit`)}
                  onClone={() => handleClone(skill)}
                  onDelete={() => handleDelete(skill)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showShareModal && (
        <ShareSkillModal
          onClose={() => setShowShareModal(false)}
          onSaved={() => { setShowShareModal(false); fetchSkills(); }}
        />
      )}
    </DashboardLayout>
  );
}

function SkillCard({ skill, index, onView, onUse, onEdit, onClone, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-[#0B1F3A] border border-[#1E293B] hover:border-[#3B82F6]/40 rounded-xl p-5 flex flex-col gap-3 transition-colors group"
    >
      {/* Title + visibility */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2">{skill.title}</h3>
          {skill.is_official && skill.category === 'advanced' && (
            <span className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 bg-[#F59E0B]/15 text-[#F59E0B] rounded-full text-xs font-medium">
              <Star className="w-3 h-3" />Pro
            </span>
          )}
          {skill.is_official && skill.category !== 'advanced' && (
            <span className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 bg-[#3B82F6]/15 text-[#3B82F6] rounded-full text-xs font-medium">
              <Star className="w-3 h-3" />Official
            </span>
          )}
        </div>
        {skill.visibility === 'private' && (
          <span className="flex-shrink-0 text-xs px-2 py-0.5 bg-[#1E293B] text-[#64748B] rounded-full">Private</span>
        )}
      </div>

      {/* Description */}
      <p className="text-[#94A3B8] text-xs leading-relaxed line-clamp-2">{skill.description}</p>

      {/* Author */}
      <p className="text-[#475569] text-xs">by {skill.author_name}</p>

      {/* Tags */}
      {skill.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skill.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-full text-xs">
              #{tag}
            </span>
          ))}
          {skill.tags.length > 3 && (
            <span className="px-2 py-0.5 bg-[#1E293B] text-[#64748B] rounded-full text-xs">+{skill.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Languages */}
      {skill.languages?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skill.languages.slice(0, 3).map(lang => (
            <span key={lang} className="px-2 py-0.5 bg-[#10B981]/10 text-[#10B981] rounded-full text-xs">
              {lang}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-[#475569]">
        <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{skill.usage_count} uses</span>
        <span className="flex items-center gap-1"><Copy className="w-3 h-3" />{skill.clone_count} clones</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-[#1E293B]">
        <button
          onClick={onUse}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg text-xs font-medium transition-colors"
        >
          <Zap className="w-3.5 h-3.5" />
          Use Skill
        </button>
        <button
          onClick={onView}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#1E293B] hover:bg-[#243447] text-[#94A3B8] rounded-lg text-xs transition-colors"
          title="View Prompt"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
        {skill.is_owner ? (
          <>
            <button
              onClick={onEdit}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#1E293B] hover:bg-[#243447] text-[#94A3B8] rounded-lg text-xs transition-colors"
              title="Edit Prompt"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <button
            onClick={onClone}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#1E293B] hover:bg-[#243447] text-[#94A3B8] rounded-lg text-xs transition-colors"
            title="Clone Skill"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
