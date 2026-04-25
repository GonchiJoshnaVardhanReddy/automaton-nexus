import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Edit, Globe, Lock, Plus, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '@/services/api';
import { toast } from 'sonner';

const LANGUAGES = ['English', 'Hindi', 'Kannada', 'Marathi'];
const SUGGESTED_TAGS = ['order-confirmation', 'delivery-update', 'campaign', 'support-agent', 'appointment-reminder', 'payment-reminder', 'feedback', 'multilingual'];

const DEFAULT_MARKDOWN = `---
title: My Agent Prompt
description: Short description of what this agent does
tags: order-confirmation, multilingual
languages: English, Hindi
---

## Agent Instructions

You are a helpful AI voice agent. Your goal is to...

### Greeting
Start with: "Hello, this is [Company Name] calling about..."

### Main Flow
1. Confirm the customer's name
2. State the purpose of the call
3. Ask for confirmation

### Closing
Thank the customer and end the call professionally.
`;

export default function ShareSkillModal({ onClose, onSaved, initialData = null, inline = false }) {
  const isEdit = !!initialData;
  const [form, setForm] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    markdown_content: initialData?.markdown_content || DEFAULT_MARKDOWN,
    tags: initialData?.tags || [],
    languages: initialData?.languages || [],
    visibility: initialData?.visibility || 'public',
  });
  const [tagInput, setTagInput] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const addTag = (tag) => {
    const t = tag.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !form.tags.includes(t)) {
      setForm(f => ({ ...f, tags: [...f.tags, t] }));
    }
    setTagInput('');
  };

  const removeTag = (tag) => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));

  const toggleLanguage = (lang) => {
    setForm(f => ({
      ...f,
      languages: f.languages.includes(lang)
        ? f.languages.filter(l => l !== lang)
        : [...f.languages, lang],
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.description.trim()) { toast.error('Description is required'); return; }
    if (!form.markdown_content.trim()) { toast.error('Prompt content is required'); return; }

    setSaving(true);
    try {
      if (isEdit) {
        await api.updateSkill(initialData.id, form);
        toast.success('Skill updated');
      } else {
        await api.createSkill(form);
        toast.success('Skill shared with the community!');
      }
      onSaved();
    } catch (err) {
      toast.error(err.message || 'Failed to save skill');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {inline ? (
        <InnerContent
          form={form} setForm={setForm} tagInput={tagInput} setTagInput={setTagInput}
          previewMode={previewMode} setPreviewMode={setPreviewMode}
          saving={saving} isEdit={isEdit} onClose={onClose} handleSave={handleSave}
          addTag={addTag} removeTag={removeTag} toggleLanguage={toggleLanguage}
        />
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#0B1F3A] border border-[#1E293B] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
          >
            <InnerContent
              form={form} setForm={setForm} tagInput={tagInput} setTagInput={setTagInput}
              previewMode={previewMode} setPreviewMode={setPreviewMode}
              saving={saving} isEdit={isEdit} onClose={onClose} handleSave={handleSave}
              addTag={addTag} removeTag={removeTag} toggleLanguage={toggleLanguage}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function InnerContent({ form, setForm, tagInput, setTagInput, previewMode, setPreviewMode, saving, isEdit, onClose, handleSave, addTag, removeTag, toggleLanguage }) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B]">
        <h2 className="text-white font-semibold">{isEdit ? 'Edit Skill' : 'Share Your Skill'}</h2>
        <button onClick={onClose} className="text-[#64748B] hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-xs text-[#64748B] mb-1.5 uppercase tracking-wide">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Order Confirmation Agent"
            className="w-full px-4 py-2.5 bg-[#060D18] border border-[#1E293B] rounded-xl text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#3B82F6]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs text-[#64748B] mb-1.5 uppercase tracking-wide">Description *</label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Brief description of what this agent does..."
            rows={2}
            className="w-full px-4 py-2.5 bg-[#060D18] border border-[#1E293B] rounded-xl text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] resize-none"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs text-[#64748B] mb-1.5 uppercase tracking-wide">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-[#8B5CF6]/20 text-[#8B5CF6] rounded-full text-xs">
                #{tag}
                <button onClick={() => removeTag(tag)}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput); } }}
              placeholder="Add tag and press Enter"
              className="flex-1 px-3 py-2 bg-[#060D18] border border-[#1E293B] rounded-lg text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#3B82F6]"
            />
            <button onClick={() => addTag(tagInput)} className="px-3 py-2 bg-[#1E293B] hover:bg-[#243447] text-[#94A3B8] rounded-lg">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_TAGS.filter(t => !form.tags.includes(t)).map(tag => (
              <button key={tag} onClick={() => addTag(tag)}
                className="px-2 py-0.5 bg-[#1E293B] hover:bg-[#243447] text-[#64748B] rounded-full text-xs transition-colors">
                +{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <label className="block text-xs text-[#64748B] mb-1.5 uppercase tracking-wide">Languages</label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                onClick={() => toggleLanguage(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  form.languages.includes(lang)
                    ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                    : 'bg-[#1E293B] text-[#64748B] border border-transparent hover:border-[#1E293B]'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-xs text-[#64748B] mb-1.5 uppercase tracking-wide">Visibility</label>
          <div className="flex gap-3">
            <button
              onClick={() => setForm(f => ({ ...f, visibility: 'public' }))}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors ${
                form.visibility === 'public'
                  ? 'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30'
                  : 'bg-[#1E293B] text-[#64748B] border border-transparent'
              }`}
            >
              <Globe className="w-4 h-4" />Public
            </button>
            <button
              onClick={() => setForm(f => ({ ...f, visibility: 'private' }))}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors ${
                form.visibility === 'private'
                  ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30'
                  : 'bg-[#1E293B] text-[#64748B] border border-transparent'
              }`}
            >
              <Lock className="w-4 h-4" />Private
            </button>
          </div>
        </div>

        {/* Markdown Editor */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-[#64748B] uppercase tracking-wide">Prompt Content (Markdown) *</label>
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
            <div className="min-h-[240px] max-h-[320px] overflow-y-auto px-4 py-3 bg-[#060D18] border border-[#1E293B] rounded-xl prose prose-invert prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.markdown_content}</ReactMarkdown>
            </div>
          ) : (
            <textarea
              value={form.markdown_content}
              onChange={e => setForm(f => ({ ...f, markdown_content: e.target.value }))}
              rows={12}
              spellCheck={false}
              className="w-full px-4 py-3 bg-[#060D18] border border-[#1E293B] rounded-xl text-sm text-white font-mono placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] resize-none"
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#1E293B]">
        <button onClick={onClose} className="px-5 py-2.5 text-sm text-[#94A3B8] hover:text-white transition-colors">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
        >
          {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Share Skill'}
        </button>
      </div>
    </>
  );
}
