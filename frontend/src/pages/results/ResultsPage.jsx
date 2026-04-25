import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import DashboardLayout from '@/components/layout/DashboardLayout';

const ResultsPage = () => {
  const [dateRange, setDateRange] = useState('7days');

  const callResults = [
    { id: 1, customer: 'Raj Kumar', phone: '+91 98765 43210', status: 'Confirmed', duration: '2m 34s', date: '2024-01-25' },
    { id: 2, customer: 'Priya Sharma', phone: '+91 87654 32109', status: 'Confirmed', duration: '1m 45s', date: '2024-01-25' },
    { id: 3, customer: 'Amit Patel', phone: '+91 76543 21098', status: 'Rejected', duration: '1m 12s', date: '2024-01-25' },
    { id: 4, customer: 'Sneha Singh', phone: '+91 65432 10987', status: 'Confirmed', duration: '3m 08s', date: '2024-01-24' },
    { id: 5, customer: 'Vikram Joshi', phone: '+91 54321 09876', status: 'No Answer', duration: '—', date: '2024-01-24' },
    { id: 6, customer: 'Anita Reddy', phone: '+91 43210 98765', status: 'Confirmed', duration: '2m 21s', date: '2024-01-24' },
  ];

  const weeklyData = [
    { day: 'Mon', calls: 145, success: 112 },
    { day: 'Tue', calls: 189, success: 156 },
    { day: 'Wed', calls: 167, success: 134 },
    { day: 'Thu', calls: 234, success: 198 },
    { day: 'Fri', calls: 198, success: 167 },
    { day: 'Sat', calls: 87, success: 72 },
    { day: 'Sun', calls: 45, success: 38 },
  ];

  const trendData = [
    { date: '19 Jan', rate: 72 },
    { date: '20 Jan', rate: 75 },
    { date: '21 Jan', rate: 71 },
    { date: '22 Jan', rate: 78 },
    { date: '23 Jan', rate: 82 },
    { date: '24 Jan', rate: 79 },
    { date: '25 Jan', rate: 85 },
  ];

  const stats = [
    { label: 'TOTAL CALLS', value: '1,003', change: '+12%', positive: true, accentColor: '#2563EB' },
    { label: 'CONFIRMED', value: '758', change: '+18%', positive: true, accentColor: '#22C55E' },
    { label: 'REJECTED', value: '156', change: '-5%', positive: false, accentColor: '#EF4444' },
    { label: 'AVG DURATION', value: '2m 12s', change: '+8s', positive: true, accentColor: '#06B6D4' },
  ];

  return (
    <DashboardLayout title="Results & Analytics" subtitle="Campaign performance insights">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-1 p-1 rounded-lg bg-[#0B1F3A] border border-[#1E293B]">
          {['7days', '30days', 'all'].map((range) => (
            <button
              key={range}
              data-testid={`range-${range}`}
              onClick={() => setDateRange(range)}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${
                dateRange === range
                  ? 'bg-[#2563EB] text-white'
                  : 'text-[#64748B] hover:text-white'
              }`}
            >
              {range === '7days' ? '7 Days' : range === '30days' ? '30 Days' : 'All Time'}
            </button>
          ))}
        </div>

        <button
          data-testid="export-btn"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0B1F3A] border border-[#1E293B] text-sm text-[#94A3B8] hover:text-white hover:border-[#334155] transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            data-testid={`result-stat-${stat.label.toLowerCase().replace(' ', '-')}`}
            className="relative bg-[#0B1F3A] border border-[#1E293B] rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 transition-all duration-300"
          >
            <div 
              className="h-[3px] w-full"
              style={{ backgroundColor: stat.accentColor }}
            />
            <div className="p-5">
              <p className="text-[11px] font-semibold tracking-wider text-[#64748B] mb-2">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-white mb-1 tracking-tight">
                {stat.value}
              </p>
              <p className={`text-sm flex items-center gap-1 ${stat.positive ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                {stat.positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {stat.change}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Weekly Performance */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="bg-[#0B1F3A] border border-[#1E293B] rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-5">
            Weekly Performance
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F2847',
                  border: '1px solid #1E293B',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="calls" fill="#2563EB" radius={[4, 4, 0, 0]} name="Total" />
              <Bar dataKey="success" fill="#22C55E" radius={[4, 4, 0, 0]} name="Success" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Success Rate Trend */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-[#0B1F3A] border border-[#1E293B] rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-5">
            Success Rate Trend
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748B" fontSize={11} domain={[60, 100]} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F2847',
                  border: '1px solid #1E293B',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(value) => [`${value}%`, 'Success Rate']}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="#06B6D4"
                strokeWidth={2}
                fill="url(#successGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Results Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
        className="bg-[#0B1F3A] border border-[#1E293B] rounded-2xl overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-[#1E293B]">
          <h3 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">
            Recent Call Results
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E293B]">
                <th className="text-left py-4 px-6 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Customer</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Phone</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Status</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Duration</th>
              </tr>
            </thead>
            <tbody>
              {callResults.map((call) => (
                <tr
                  key={call.id}
                  data-testid={`result-row-${call.id}`}
                  className="border-b border-[#1E293B]/50 last:border-b-0 hover:bg-[#0F2847] transition-colors"
                >
                  <td className="py-4 px-6">
                    <span className="font-medium text-white">{call.customer}</span>
                  </td>
                  <td className="py-4 px-6 text-[#94A3B8] font-mono text-sm">{call.phone}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                      call.status === 'Confirmed'
                        ? 'bg-[#22C55E]/10 text-[#22C55E]'
                        : call.status === 'Rejected'
                        ? 'bg-[#EF4444]/10 text-[#EF4444]'
                        : 'bg-[#64748B]/10 text-[#64748B]'
                    }`}>
                      {call.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[#94A3B8] tabular-nums">{call.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default ResultsPage;
