import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  Pause,
  StopCircle,
  ArrowRight,
  PhoneCall,
  PhoneMissed
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/services/api';
import { toast } from 'sonner';

const LiveCampaignPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef(null);

  useEffect(() => {
    if (id) {
      loadCampaign();
      connectWebSocket();
    } else {
      // If no ID, load the most recent campaign
      loadLatestCampaign();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [id]);

  const loadLatestCampaign = async () => {
    try {
      const campaigns = await api.getCampaigns();
      if (campaigns.length > 0) {
        const latest = campaigns[0];
        navigate(`/campaigns/${latest.id}/live`, { replace: true });
      } else {
        toast.error('No campaigns found');
        navigate('/campaigns/setup');
      }
    } catch (error) {
      toast.error('Failed to load campaigns');
      navigate('/campaigns/setup');
    }
  };

  const loadCampaign = async () => {
    try {
      const [campaignData, callsData] = await Promise.all([
        api.getCampaign(id),
        api.getCampaignCalls(id),
      ]);
      setCampaign(campaignData);
      setCalls(callsData);
    } catch (error) {
      toast.error('Failed to load campaign');
      navigate('/campaigns/setup');
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    wsRef.current = api.connectWebSocket((message) => {
      if (message.type === 'call_update' && message.data.campaign_id === id) {
        // Update call in list
        setCalls(prev => {
          const index = prev.findIndex(c => c.id === message.data.call_id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              status: message.data.status,
              duration_seconds: message.data.duration,
            };
            return updated;
          }
          return prev;
        });
      } else if (message.type === 'campaign_update' && message.data.campaign_id === id) {
        // Update campaign stats
        setCampaign(prev => ({
          ...prev,
          ...message.data.stats,
          status: message.data.status,
        }));
      }
    });

    // Subscribe to campaign updates
    if (wsRef.current) {
      wsRef.current.onopen = () => {
        wsRef.current.send(JSON.stringify({
          action: 'subscribe',
          campaign_id: id,
        }));
      };
    }
  };

  const handlePause = async () => {
    try {
      await api.pauseCampaign(id);
      toast.success('Campaign paused');
      loadCampaign();
    } catch (error) {
      toast.error('Failed to pause campaign');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'calling':
        return <PhoneCall className="w-4 h-4 text-[#22D3EE] animate-pulse" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-[#10B981]" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-[#EF4444]" />;
      case 'no_answer':
      case 'failed':
        return <PhoneMissed className="w-4 h-4 text-[#EF4444]" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-[#64748B]" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      calling: 'bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30',
      confirmed: 'bg-[#22C55E]/10 text-[#22C55E]',
      rejected: 'bg-[#EF4444]/10 text-[#EF4444]',
      no_answer: 'bg-[#EF4444]/10 text-[#EF4444]',
      failed: 'bg-[#EF4444]/10 text-[#EF4444]',
      pending: 'bg-[#64748B]/10 text-[#64748B]',
    };
    return styles[status] || '';
  };

  if (loading) {
    return (
      <DashboardLayout title="Live Campaign" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!campaign) return null;

  const progress = campaign.total_calls > 0 
    ? Math.round((campaign.completed_calls / campaign.total_calls) * 100) 
    : 0;

  const stats = [
    { label: 'In Progress', value: campaign.total_calls - campaign.completed_calls, color: '#22D3EE', animate: true },
    { label: 'Confirmed', value: campaign.confirmed_calls, color: '#22C55E' },
    { label: 'Rejected', value: campaign.rejected_calls, color: '#EF4444' },
    { label: 'Failed', value: campaign.failed_calls, color: '#64748B' },
  ];

  return (
    <DashboardLayout title="Live Campaign" subtitle="Real-time calling progress">
      <div className="max-w-6xl mx-auto">
        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[#0B1F3A] border border-[#1E293B] rounded-2xl p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${
                  campaign.status === 'running' ? 'bg-[#10B981] animate-pulse' : 'bg-[#64748B]'
                }`} />
                <span className="font-semibold text-white capitalize">{campaign.status}</span>
              </div>
              
              {/* Progress Bar */}
              <div className="h-4 rounded-full bg-[#1E293B] overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-[#2563EB] to-[#22D3EE]"
                />
              </div>
              <p className="text-sm text-[#64748B]">
                {campaign.completed_calls} of {campaign.total_calls} calls completed ({progress}%)
              </p>
            </div>

            <div className="flex gap-3">
              {campaign.status === 'running' && (
                <button
                  onClick={handlePause}
                  data-testid="pause-campaign-btn"
                  className="btn-secondary"
                >
                  <Pause className="w-5 h-5" />
                  Pause
                </button>
              )}
              <button
                onClick={() => navigate('/results')}
                data-testid="view-results-btn"
                className="btn-primary"
              >
                View Results
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              data-testid={`stat-${stat.label.toLowerCase().replace(' ', '-')}`}
              className="bg-[#0B1F3A] border border-[#1E293B] rounded-2xl p-5"
            >
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-[#64748B]">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Call Log Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-[#0B1F3A] border border-[#1E293B] rounded-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-[#1E293B]">
            <h3 className="text-lg font-semibold text-white">Call Log</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1E293B]">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Phone Number</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Customer</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Duration</th>
                </tr>
              </thead>
              <tbody>
                {calls.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#64748B]">
                      No calls yet
                    </td>
                  </tr>
                ) : (
                  calls.map((call) => (
                    <motion.tr
                      key={call.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      data-testid={`call-row-${call.id}`}
                      className="border-b border-[#1E293B]/50 last:border-b-0 hover:bg-[#0F2847] transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#2563EB]/20 flex items-center justify-center">
                            <Phone className="w-4 h-4 text-[#2563EB]" />
                          </div>
                          <span className="font-mono text-white">{call.phone_number}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[#94A3B8]">{call.customer_name || '—'}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(call.status)}`}>
                          {getStatusIcon(call.status)}
                          {call.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-[#94A3B8]">
                        {call.duration_seconds > 0 ? `${Math.floor(call.duration_seconds / 60)}m ${call.duration_seconds % 60}s` : '—'}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default LiveCampaignPage;
