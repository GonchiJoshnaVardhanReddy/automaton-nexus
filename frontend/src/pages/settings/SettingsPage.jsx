import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Globe,
  Bell,
  Shield,
  CreditCard,
  Save,
  Camera,
  Check
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@company.com',
    phone: '+91 98765 43210',
    company: 'TechCorp Industries',
    timezone: 'Asia/Kolkata',
  });

  const [preferences, setPreferences] = useState({
    language: 'english',
    emailNotifications: true,
    smsNotifications: false,
    weeklyReport: true,
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);
  };

  return (
    <DashboardLayout title="Settings" subtitle="Manage your account preferences">
      <div className="max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-xl bg-white/5 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              data-testid={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-6 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#2563EB] text-white'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Avatar Section */}
            <div className="glass-card rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-6">Profile Picture</h3>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#A855F7] to-[#EC4899] flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">JD</span>
                  </div>
                  <button
                    data-testid="change-avatar-btn"
                    className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[#2563EB] flex items-center justify-center hover:bg-[#1D4ED8] transition-colors"
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                </div>
                <div>
                  <p className="text-white font-medium">Upload a new photo</p>
                  <p className="text-sm text-[#64748B]">JPG, PNG or GIF. Max size 2MB</p>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                    <input
                      type="text"
                      data-testid="profile-name-input"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="input-field pl-12"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                    <input
                      type="email"
                      data-testid="profile-email-input"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="input-field pl-12"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                    <input
                      type="tel"
                      data-testid="profile-phone-input"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="input-field pl-12"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">Company</label>
                  <input
                    type="text"
                    data-testid="profile-company-input"
                    value={profile.company}
                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">Timezone</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                    <select
                      data-testid="profile-timezone-select"
                      value={profile.timezone}
                      onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                      className="input-field pl-12 appearance-none cursor-pointer"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-6">Notification Preferences</h3>
            <div className="space-y-6">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive campaign updates via email' },
                { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Get alerts via SMS' },
                { key: 'weeklyReport', label: 'Weekly Report', desc: 'Receive a weekly performance summary' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="font-medium text-white">{item.label}</p>
                    <p className="text-sm text-[#64748B]">{item.desc}</p>
                  </div>
                  <button
                    data-testid={`toggle-${item.key}`}
                    onClick={() => setPreferences({ ...preferences, [item.key]: !preferences[item.key] })}
                    className={`w-12 h-7 rounded-full transition-colors relative ${
                      preferences[item.key] ? 'bg-[#2563EB]' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                        preferences[item.key] ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Change Password</h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">Current Password</label>
                  <input
                    type="password"
                    data-testid="current-password-input"
                    placeholder="••••••••"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">New Password</label>
                  <input
                    type="password"
                    data-testid="new-password-input"
                    placeholder="••••••••"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    data-testid="confirm-password-input"
                    placeholder="••••••••"
                    className="input-field"
                  />
                </div>
                <button className="btn-secondary mt-4">
                  Update Password
                </button>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Two-Factor Authentication</h3>
              <p className="text-[#94A3B8] mb-4">Add an extra layer of security to your account</p>
              <button
                data-testid="enable-2fa-btn"
                className="btn-primary"
              >
                <Shield className="w-5 h-5" />
                Enable 2FA
              </button>
            </div>
          </motion.div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Current Plan</h3>
                  <p className="text-[#64748B]">Pro Plan - $99/month</p>
                </div>
                <span className="status-success px-4 py-2 rounded-full text-sm font-medium">
                  Active
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-white/5 text-center">
                  <p className="text-2xl font-bold text-white">10,000</p>
                  <p className="text-sm text-[#64748B]">Calls/month</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 text-center">
                  <p className="text-2xl font-bold text-white">5</p>
                  <p className="text-sm text-[#64748B]">Agents</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 text-center">
                  <p className="text-2xl font-bold text-white">24/7</p>
                  <p className="text-sm text-[#64748B]">Support</p>
                </div>
              </div>
              <button className="btn-secondary w-full">
                Upgrade Plan
              </button>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Payment Method</h3>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                <div className="w-12 h-8 rounded bg-gradient-to-r from-[#1A1F71] to-[#232F5F] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">VISA</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">•••• •••• •••• 4242</p>
                  <p className="text-sm text-[#64748B]">Expires 12/25</p>
                </div>
                <button className="text-[#22D3EE] hover:text-[#2563EB] transition-colors text-sm font-medium">
                  Update
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex justify-end mt-8"
        >
          <button
            onClick={handleSave}
            data-testid="save-settings-btn"
            disabled={isSaving}
            className="btn-primary px-8"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </span>
            ) : saved ? (
              <span className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                Saved!
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-5 h-5" />
                Save Changes
              </span>
            )}
          </button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
