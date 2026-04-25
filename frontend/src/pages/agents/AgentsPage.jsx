import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  Trash2,
  Edit,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/services/api';
import { toast } from 'sonner';

const AgentsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const data = await api.getAgents();
      setAgents(data);
    } catch (error) {
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (agentId) => {
    try {
      await api.activateAgent(agentId);
      toast.success('Agent activated');
      loadAgents();
    } catch (error) {
      toast.error('Failed to activate agent');
    }
  };

  const handlePause = async (agentId) => {
    try {
      await api.pauseAgent(agentId);
      toast.success('Agent paused');
      loadAgents();
    } catch (error) {
      toast.error('Failed to pause agent');
    }
  };

  const handleDelete = async (agentId) => {
    if (!window.confirm('Are you sure you want to delete this agent?')) return;
    
    try {
      await api.deleteAgent(agentId);
      toast.success('Agent deleted');
      loadAgents();
    } catch (error) {
      toast.error('Failed to delete agent');
    }
  };

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || agent.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <DashboardLayout title="Agents" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Agents" subtitle="Manage your AI voice agents">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 max-w-md flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0B1F3A] border border-[#1E293B]">
            <Search className="w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              data-testid="agents-search-input"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-white placeholder:text-[#64748B] w-full"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <select
              data-testid="agents-filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none px-4 py-2.5 pr-10 rounded-lg bg-[#0B1F3A] border border-[#1E293B] text-sm text-white outline-none focus:border-[#2563EB] cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
          </div>
        </div>

        {/* Create Agent Button */}
        <Link
          to="/agents/create"
          data-testid="create-agent-btn"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Agent
        </Link>
      </div>

      {/* Agents Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[#0B1F3A] border border-[#1E293B] rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E293B]">
                <th className="text-left py-4 px-6 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Agent Name</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Language</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Use Case</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Status</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Calls</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Success Rate</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <p className="text-[#64748B] mb-4">No agents found</p>
                    <Link
                      to="/agents/create"
                      className="text-[#2563EB] hover:text-[#22D3EE] transition-colors font-medium"
                    >
                      Create your first agent →
                    </Link>
                  </td>
                </tr>
              ) : (
                filteredAgents.map((agent, index) => (
                  <motion.tr
                    key={agent.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    data-testid={`agent-card-${agent.id}`}
                    className="border-b border-[#1E293B]/50 last:border-b-0 hover:bg-[#0F2847] transition-colors"
                  >
                    <td className="py-4 px-6">
                      <Link 
                        to={`/agents/${agent.id}/preview`}
                        className="font-medium text-white hover:text-[#22D3EE] transition-colors"
                      >
                        {agent.name}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-[#94A3B8] capitalize">{agent.language}</td>
                    <td className="py-4 px-6 text-[#94A3B8] capitalize">{agent.use_case.replace('_', ' ')}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                          agent.status === 'active'
                            ? 'bg-[#22C55E]/10 text-[#22C55E]'
                            : agent.status === 'paused'
                            ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
                            : 'bg-[#64748B]/10 text-[#64748B]'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                          agent.status === 'active'
                            ? 'bg-[#22C55E]'
                            : agent.status === 'paused'
                            ? 'bg-[#F59E0B]'
                            : 'bg-[#64748B]'
                        }`} />
                        {agent.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-white tabular-nums">{agent.total_calls.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-[80px] h-1.5 rounded-full bg-[#1E293B] overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-[#22C55E]"
                            style={{ width: `${agent.success_rate}%` }}
                          />
                        </div>
                        <span className="text-sm text-white tabular-nums">{agent.success_rate.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-1">
                        {agent.status === 'active' ? (
                          <button
                            onClick={() => handlePause(agent.id)}
                            data-testid={`agent-pause-${agent.id}`}
                            className="p-2 rounded-md text-[#F59E0B] hover:bg-[#F59E0B]/10 transition-colors"
                            title="Pause"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(agent.id)}
                            data-testid={`agent-play-${agent.id}`}
                            className="p-2 rounded-md text-[#22C55E] hover:bg-[#22C55E]/10 transition-colors"
                            title="Start"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        <Link
                          to={`/agents/${agent.id}/preview`}
                          data-testid={`agent-edit-${agent.id}`}
                          className="p-2 rounded-md text-[#64748B] hover:text-[#22D3EE] hover:bg-[#22D3EE]/10 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(agent.id)}
                          data-testid={`agent-delete-${agent.id}`}
                          className="p-2 rounded-md text-[#64748B] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default AgentsPage;
