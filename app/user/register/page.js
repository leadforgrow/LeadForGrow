'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Building2, ArrowRight, Eye, EyeOff, CheckCircle2, ChevronLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState('register'); // 'register' | 'login' | 'forgot'
  
  // Handle initial mode from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialMode = params.get('mode');
    if (initialMode && ['login', 'register', 'forgot'].includes(initialMode)) {
      setMode(initialMode);
    }
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Handle mode toggle
  const toggleMode = (newMode) => {
    setMode(newMode);
    setFormData({
      companyName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: formData.companyName,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem('userid', data.data.userId);
        localStorage.setItem('userToken', data.data.token);
        toast.success('Account created successfully!');
        router.push('/website-funnel/dashboard');
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem('userid', data.data.userId);
        localStorage.setItem('userToken', data.data.token);
        toast.success('Logged in successfully!');
        router.push('/website-funnel/dashboard');
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulating forgot password request
    setTimeout(() => {
      toast.success('Reset link sent to your email!');
      setLoading(false);
      setMode('login');
    }, 1500);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white selection:bg-indigo-100">
      
      {/* LEFT PANEL - Hero Image */}
      <div className="hidden lg:block relative overflow-hidden bg-slate-900">
        <img 
          src="/auth-hero.png" 
          alt="LFG Lead Management" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        
        <div className="absolute bottom-12 left-12 right-12 z-10">
          <div className="flex items-center gap-3 mb-6">
            <img src="/image.png" alt="LFG" className="w-12 h-12" />
            <h2 className="text-3xl font-bold text-white tracking-tight">LeadForGrow</h2>
          </div>
          <h3 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
            Managing leads at <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              lightning speed.
            </span>
          </h3>
          <p className="text-lg text-slate-300 max-w-lg mb-8">
            The all-in-one operating system for agencies to capture, track, and close leads without the chaos.
          </p>
          
          <div className="flex flex-wrap gap-6">
            {[
              "Real-time Analytics",
              "Automated Follow-ups",
              "CRM Integration"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Forms */}
      <div className="flex flex-col items-center justify-center p-8 lg:p-12 xl:p-16 relative">
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-3 mb-12">
          <img src="/image.png" alt="LFG" className="w-10 h-10" />
          <h2 className="text-2xl font-bold text-slate-900">LeadForGrow</h2>
        </div>

        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Header */}
          <div className="mb-10">
            {mode === 'forgot' && (
              <button 
                onClick={() => setMode('login')}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-6 group"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Login
              </button>
            )}
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {mode === 'register' ? 'Create an account' : mode === 'login' ? 'Welcome back' : 'Reset password'}
            </h1>
            <p className="text-slate-500">
              {mode === 'register' 
                ? 'Join 500+ agencies scaling with LFG.' 
                : mode === 'login' 
                  ? 'Sign in to access your dashboard.' 
                  : 'Enter your email to receive a reset link.'}
            </p>
          </div>

          {/* Social Login */}
          {mode !== 'forgot' && (
            <div className="mb-8">
              <button className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-medium text-slate-700">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                {mode === 'register' ? 'Sign up with Google' : 'Sign in with Google'}
              </button>
              <div className="relative mt-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-400 font-medium">Or continue with email</span>
                </div>
              </div>
            </div>
          )}

          {/* Forms */}
          <form className="space-y-5" onSubmit={mode === 'register' ? handleRegister : mode === 'login' ? handleLogin : handleForgot}>
            
            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Company Name</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input 
                    type="text"
                    required
                    placeholder="Your Agency Name"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-semibold text-slate-700">Password</label>
                  {mode === 'login' && (
                    <button 
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2 group mt-8"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'register' ? 'Create Account' : mode === 'login' ? 'Sign In' : 'Send Reset Link'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Mode Toggles */}
          <div className="mt-10 text-center">
            {mode === 'register' ? (
              <p className="text-slate-600 font-medium text-sm">
                Already have an account?{' '}
                <button onClick={() => setMode('login')} className="text-indigo-600 hover:text-indigo-700 font-bold ml-1">
                  Sign in
                </button>
              </p>
            ) : mode === 'login' ? (
              <p className="text-slate-600 font-medium text-sm">
                Don't have an account?{' '}
                <button onClick={() => setMode('register')} className="text-indigo-600 hover:text-indigo-700 font-bold ml-1">
                  Join for free
                </button>
              </p>
            ) : null}
          </div>

          {/* Footer Info */}
          <div className="mt-16 text-center lg:absolute lg:bottom-12 lg:left-0 lg:right-0">
            <p className="text-xs text-slate-400 font-medium px-8">
              By continuing, you agree to LeadForGrow's Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
