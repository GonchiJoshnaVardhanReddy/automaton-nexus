import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/services/api';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    total_calls: 0,
    confirmed: 0,
    rejected: 0,
    success_rate: 0,
    avg_duration_seconds: 0,
    active_agents: 0,
    customers_reached: 0,
  });
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, agentsData] = await Promise.all([
        api.getDashboardStats(30),
        api.getAgents(),
      ]);
      setStats(statsData);
      setAgents(agentsData.slice(0, 5)); // Show latest 5 agents
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      label: 'TOTAL CALLS', 
      value: stats.total_calls.toLocaleString(), 
      subtext: `${stats.customers_reached} customers reached`,
      positive: true,
      accentColor: '#2563EB'
    },
    { 
      label: 'CONFIRMED', 
      value: stats.confirmed.toLocaleString(), 
      subtext: `${stats.success_rate.toFixed(1)}% success rate`,
      positive: true,
      accentColor: '#22C55E'
    },
    { 
      label: 'REJECTED', 
      value: stats.rejected.toLocaleString(), 
      subtext: `${(100 - stats.success_rate).toFixed(1)}% of total`,
      positive: false,
      accentColor: '#EF4444'
    },
    { 
      label: 'AVG DURATION', 
      value: formatDuration(stats.avg_duration_seconds), 
      subtext: `${stats.active_agents} active agents`,
      positive: true,
      accentColor: '#06B6D4'
    },
  ];

  const quickActions = [
    {
      title: 'Create Agent',
      description: 'Build a new AI voice agent',
      href: '/agents/create',
    },
    {
      title: 'Start Campaign',
      description: 'Launch a calling campaign',
      href: '/campaigns/setup',
    },
  ];

  const overviewStats = [
    { label: 'Avg. Call Duration', value: formatDuration(stats.avg_duration_seconds) },
    { label: 'Customers Reached', value: stats.customers_reached.toLocaleString() },
    { label: 'Active Agents', value: stats.active_agents.toString() },
  ];

  function formatDuration(seconds) {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  }

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard" subtitle="Welcome back">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            data-testid={`stat-card-${stat.label.toLowerCase().replace(' ', '-')}`}
            className="group relative bg-[#0B1F3A] border border-[#1E293B] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20"
          >
            {/* Top accent line */}
            <div 
              className="h-[3px] w-full"
              style={{ backgroundColor: stat.accentColor }}
            />
            
            <div className="p-6">
              {/* Label */}
              <p className="text-[11px] font-semibold tracking-wider text-[#64748B] mb-3">
                {stat.label}
              </p>
              
              {/* Value */}
              <p className="text-4xl font-bold text-white mb-2 tracking-tight">
                {stat.value}
              </p>
              
              {/* Subtext */}
              <p className="text-sm text-[#64748B]">
                {stat.subtext}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions + Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="lg:col-span-2"
        >
          <h3 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                to={action.href}
                data-testid={`quick-action-${action.title.toLowerCase().replace(' ', '-')}`}
                className="group bg-[#0B1F3A] border border-[#1E293B] rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#334155] hover:shadow-lg hover:shadow-black/20"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-white mb-1 group-hover:text-[#22D3EE] transition-colors">
                      {action.title}
                    </h4>
                    <p className="text-sm text-[#64748B]">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#475569] group-hover:text-[#22D3EE] group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Today's Overview */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-[#0B1F3A] border border-[#1E293B] rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">
            Overview
          </h3>
          <div className="space-y-4">
            {overviewStats.map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-[#1E293B] last:border-0">
                <span className="text-sm text-[#94A3B8]">{item.label}</span>
                <span className="font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Agents Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
        className="bg-[#0B1F3A] border border-[#1E293B] rounded-2xl overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-[#1E293B]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">
              Recent Agents
            </h3>
            <Link
              to="/agents"
              data-testid="view-all-agents"
              className="text-sm text-[#64748B] hover:text-[#22D3EE] transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E293B]">
                <th className="text-left py-4 px-6 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Agent Name</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Language</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Status</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Calls</th>
              </tr>
            </thead>
            <tbody>
              {agents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[#64748B]">
                    No agents yet. <Link to="/agents/create" className="text-[#22D3EE] hover:underline">Create your first agent</Link>
                  </td>
                </tr>
              ) : (
                agents.map((agent) => (
                  <tr
                    key={agent.id}
                    data-testid={`activity-row-${agent.id}`}
                    className="border-b border-[#1E293B]/50 last:border-b-0 hover:bg-[#0F2847] transition-colors"
                  >
                    <td className="py-4 px-6">
                      <Link to={`/agents/${agent.id}/preview`} className="font-medium text-white hover:text-[#22D3EE]">
                        {agent.name}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-[#94A3B8] capitalize">{agent.language}</td>
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
                        {agent.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[#94A3B8]">{agent.total_calls}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default DashboardPage;
