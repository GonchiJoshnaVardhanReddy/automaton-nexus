import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ShareSkillModal from './ShareSkillModal';
import api from '@/services/api';
import { toast } from 'sonner';

export default function EditSkillPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSkill(id)
      .then(data => {
        if (!data.is_owner) {
          toast.error('You can only edit your own skills');
          navigate(`/skills/${id}`);
          return;
        }
        setSkill(data);
      })
      .catch(() => {
        toast.error('Skill not found');
        navigate('/skills');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading || !skill) {
    return (
      <DashboardLayout title="Edit Skill">
        <div className="max-w-3xl mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-[#1E293B] rounded w-1/2" />
          <div className="h-64 bg-[#1E293B] rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Skill" subtitle={skill.title}>
      {/* Render the modal inline as the full page content */}
      <ShareSkillModal
        initialData={skill}
        onClose={() => navigate(`/skills/${id}`)}
        onSaved={() => navigate(`/skills/${id}`)}
        inline
      />
    </DashboardLayout>
  );
}
