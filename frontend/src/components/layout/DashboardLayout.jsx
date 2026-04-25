import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Bot,
  Megaphone,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Agents', href: '/agents', icon: Bot },
  { name: 'Campaigns', href: '/campaigns/setup', icon: Megaphone },
  { name: 'Results', href: '/results', icon: BarChart3 },
  { name: 'Community Skills', href: '/skills', icon: BookOpen },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const DashboardLayout = ({ children, title, subtitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';
  const initials = (user?.name || user?.email || 'U')
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('') || 'U';

  return (
    <div className="min-h-screen bg-[#060D18] flex">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col bg-[#0B1F3A] border-r border-[#1E293B]">
          {/* Logo */}
          <div className="h-16 flex items-center px-4 border-b border-[#1E293B] flex-shrink-0">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <img 
                src="https://customer-assets.emergentagent.com/job_3eb1fdca-da4b-4a5d-9b60-309896ef758e/artifacts/8vqfic72_automaton%20logo.png" 
                alt="Automaton Nexus" 
                className="h-9 w-auto"
              />
              <span className="font-semibold text-white text-sm">Automaton Nexus</span>
            </Link>
          </div>

          {/* Navigation - scrollable */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href === '/agents' && location.pathname.startsWith('/agents')) ||
                (item.href === '/campaigns/setup' && location.pathname.startsWith('/campaigns'));
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#2563EB]/10 text-[#2563EB]'
                      : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-[18px] h-[18px]" />
                  <span>{item.name}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto opacity-60" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section - fixed at bottom */}
          <div className="p-3 border-t border-[#1E293B] flex-shrink-0 bg-[#0B1F3A]">
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
                <span className="text-white font-medium text-xs">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{displayName}</p>
                <p className="text-xs text-[#64748B] truncate">{displayEmail}</p>
              </div>
              <button
                onClick={handleLogout}
                data-testid="logout-btn"
                className="p-1.5 rounded-md hover:bg-[#1E293B] transition-colors"
              >
                <LogOut className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="sticky top-0 z-30 h-16 bg-[#060D18]/80 backdrop-blur-xl border-b border-[#1E293B]">
          <div className="flex items-center justify-between px-4 lg:px-6 h-full">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                data-testid="mobile-menu-btn"
                className="lg:hidden p-2 rounded-lg hover:bg-[#1E293B] transition-colors"
              >
                <Menu className="w-5 h-5 text-[#94A3B8]" />
              </button>
              <div>
                <h2 className="font-semibold text-white text-lg">{title}</h2>
                {subtitle && <p className="text-sm text-[#64748B]">{subtitle}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0B1F3A] border border-[#1E293B]">
                <Search className="w-4 h-4 text-[#64748B]" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent border-none outline-none text-sm text-white placeholder:text-[#64748B] w-40"
                />
                <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium text-[#64748B] bg-[#1E293B]">
                  ⌘K
                </kbd>
              </div>

              {/* Notifications */}
              <button
                data-testid="notifications-btn"
                className="relative p-2 rounded-lg hover:bg-[#1E293B] transition-colors"
              >
                <Bell className="w-5 h-5 text-[#64748B]" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444]" />
              </button>

              {/* User avatar (mobile) */}
              <div className="lg:hidden w-8 h-8 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
                <span className="text-white font-medium text-xs">{initials}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
