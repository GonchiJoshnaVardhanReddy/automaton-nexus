import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const GetStartedPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await register(formData.name, formData.email, formData.password);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create account');
      toast.error(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    'Create AI voice agents in minutes',
    'Multilingual support (EN, HI, KN, MR)',
    'Real-time campaign analytics',
    'Enterprise-grade security',
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 lg:px-16 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full mx-auto"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-10">
            <img 
              src="https://customer-assets.emergentagent.com/job_3eb1fdca-da4b-4a5d-9b60-309896ef758e/artifacts/8vqfic72_automaton%20logo.png" 
              alt="Automaton Nexus" 
              className="h-10 w-auto"
            />
            <span className="font-semibold text-white text-lg">Automaton Nexus</span>
          </Link>

          <h2 className="text-3xl font-bold text-white mb-2">Create your account</h2>
          <p className="text-[#94A3B8] mb-8">
            Start automating your customer calls with AI voice agents.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">Full Name</label>
              <input
                type="text"
                data-testid="signup-name-input"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">Email Address</label>
              <input
                type="email"
                data-testid="signup-email-input"
                placeholder="john@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  data-testid="signup-password-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field pr-12"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              data-testid="signup-submit-btn"
              disabled={isLoading}
              className="w-full btn-primary py-4"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-[#64748B] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#22D3EE] hover:text-[#2563EB] transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side - Features */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/20 to-[#22D3EE]/10" />
        <div className="absolute inset-0 mesh-grid opacity-30" />
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 flex flex-col justify-center px-16"
        >
          <h3 className="text-2xl font-bold text-white mb-8">
            Everything you need to automate calls
          </h3>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-[#22D3EE]/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-[#22D3EE]" />
                </div>
                <span className="text-[#94A3B8]">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Glow effects */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#2563EB] rounded-full filter blur-[150px] opacity-20" />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-[#22D3EE] rounded-full filter blur-[120px] opacity-15" />
      </div>
    </div>
  );
};

export default GetStartedPage;
