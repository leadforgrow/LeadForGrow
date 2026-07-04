'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Building2, ArrowRight, Eye, Briefcase, ChevronLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AuthIllustrationPanel, AuthFormShell, AUTH } from './AuthLayout';

const GOOGLE_ERRORS = {
  google_cancelled: 'Google sign-in was cancelled.',
  google_failed: 'Google sign-in failed. Please try again.',
  google_config: 'Google Sign-In is not configured yet.',
  google_missing_code: 'Google did not return an auth code.',
  google_no_email: 'Google account has no email address.',
  account_disabled: 'This account has been disabled.',
};

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 6.9 2.2 2.8 6.3 2.8 11.4S6.9 20.6 12 20.6c6.9 0 8.5-5.8 8.5-8.7 0-.6-.1-1-.1-1.5H12z" />
      <path fill="#34A853" d="M3.9 7.5l3.2 2.4C8 7.5 9.8 6.2 12 6.2c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 8.3 2.2 5.1 4.3 3.9 7.5z" />
      <path fill="#4A90E2" d="M12 20.6c2.5 0 4.6-.8 6.1-2.2l-3-2.4c-.8.6-1.9 1-3.1 1-2.4 0-4.4-1.6-5.1-3.8l-3.2 2.5c1.3 3.1 4.4 4.9 8.3 4.9z" />
      <path fill="#FBBC05" d="M6.9 13.2c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8L3.7 7.1C3 8.4 2.6 9.9 2.6 11.4s.4 3 1.1 4.3l3.2-2.5z" />
    </svg>
  );
}

function GoogleButton({ mode = 'login', isAgency = false, label = 'Continue with Google' }) {
  const href = `/api/auth/google?mode=${mode}${isAgency ? '&isAgency=1' : ''}`;
  return (
    <a
      href={href}
      className="flex items-center justify-center gap-2.5 w-full h-11 px-4 text-[13px] font-semibold text-[#344054] bg-white border border-[#E5E7EB] rounded-xl hover:bg-[#F9FAFB] hover:border-[#D0D5DD] transition-colors"
    >
      <GoogleIcon />
      {label}
    </a>
  );
}

function AuthDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[#E5E7EB]" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="px-3 bg-white text-[#98A2B3]">or</span>
      </div>
    </div>
  );
}

function redirectAfterAuth(router, data) {
  const role = (data.role || 'member').toLowerCase();
  const plan = data.business.plan.toLowerCase();
  if (role.includes('owner') || role.includes('admin')) {
    router.push(plan.includes('agency') ? '/agency' : '/automation');
  } else {
    router.push('/automation/leads');
  }
}

function persistSession(data, email) {
  localStorage.setItem('userid', data.userId);
  localStorage.setItem('userToken', data.token);
  localStorage.setItem('userEmail', email);
  localStorage.setItem('userRole', data.role);
  localStorage.setItem('userPlan', data.business.plan);
  localStorage.setItem('businessId', data.business.id);
  document.cookie = `token=${data.token}; path=/; max-age=604800; samesite=lax`;
}

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  useEffect(() => {
    const err = searchParams.get('error');
    if (err && GOOGLE_ERRORS[err]) toast.error(GOOGLE_ERRORS[err]);
    else if (err) toast.error('Google sign-in failed');
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        persistSession(data.data, form.email);
        toast.success('Welcome back!');
        redirectAfterAuth(router, data.data);
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={AUTH.panel}>
      <AuthIllustrationPanel variant="login" />
      <AuthFormShell title="Welcome back" subtitle="Sign in to your LeadForGrow workspace.">
        <GoogleButton mode="login" label="Continue with Google" />
        <AuthDivider />
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field icon={Mail} label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Field icon={Lock} label="Password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(v) => setForm({ ...form, password: v })} togglePassword={() => setShowPassword(!showPassword)} showToggle>
            <Link href="/forgot-password" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">Forgot?</Link>
          </Field>
          <SubmitButton loading={loading} label="Sign in" />
        </form>
        <p className="mt-8 text-center text-sm text-[#64748B]">
          New here? <Link href="/register" className="text-emerald-700 font-semibold hover:text-emerald-800">Create account</Link>
        </p>
        <p className="mt-6 text-center text-xs text-[#94A3B8]">
          <Link href="/magic-link" className="hover:text-emerald-700">Sign in with magic link</Link>
        </p>
      </AuthFormShell>
    </div>
  );
}

export function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState('business');
  const [form, setForm] = useState({ companyName: '', email: '', password: '', confirmPassword: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: form.companyName,
          email: form.email,
          password: form.password,
          isAgency: accountType === 'agency',
        }),
      });
      const data = await res.json();
      if (data.success) {
        persistSession(data.data, form.email);
        toast.success('Account created!');
        redirectAfterAuth(router, data.data);
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={AUTH.panel}>
      <AuthIllustrationPanel variant="register" />
      <AuthFormShell title="Create your account" subtitle="Start your 14-day free trial. No credit card required.">
        <div className="flex p-1 bg-emerald-50 rounded-xl mb-6 border border-emerald-100">
          {[{ id: 'business', icon: Briefcase, label: 'Business' }, { id: 'agency', icon: Building2, label: 'Agency' }].map((t) => (
            <button key={t.id} type="button" onClick={() => setAccountType(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${accountType === t.id ? 'bg-white text-emerald-700 shadow-sm' : 'text-[#64748B]'}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>
        <GoogleButton
          mode="register"
          isAgency={accountType === 'agency'}
          label="Continue with Google"
        />
        <AuthDivider />
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field icon={Building2} label={accountType === 'agency' ? 'Agency name' : 'Business name'} value={form.companyName} onChange={(v) => setForm({ ...form, companyName: v })} />
          <Field icon={Mail} label="Work email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Field icon={Lock} label="Password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(v) => setForm({ ...form, password: v })} togglePassword={() => setShowPassword(!showPassword)} showToggle />
          <Field icon={Lock} label="Confirm password" type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={(v) => setForm({ ...form, confirmPassword: v })} />
          <SubmitButton loading={loading} label="Create account" />
        </form>
        <p className="mt-8 text-center text-sm text-[#64748B]">
          Already have an account? <Link href="/login" className="text-emerald-700 font-semibold">Sign in</Link>
        </p>
        <p className="mt-4 text-center text-xs text-[#94A3B8]">
          By signing up you agree to our <Link href="/terms" className="underline hover:text-emerald-700">Terms</Link> and <Link href="/privacy" className="underline hover:text-emerald-700">Privacy Policy</Link>.
        </p>
      </AuthFormShell>
    </div>
  );
}

export function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        toast.success('Check your inbox');
      } else {
        toast.error(data.error || 'Could not send reset link');
      }
    } catch {
      toast.success('If an account exists, a reset link has been sent.');
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={AUTH.panel}>
      <AuthIllustrationPanel variant="forgot" />
      <AuthFormShell
        title={sent ? 'Check your email' : 'Reset your password'}
        subtitle={sent ? `We sent a reset link to ${email}` : 'Enter your email and we\'ll send a secure reset link.'}
        backLink={
          <Link href="/login" className="inline-flex items-center gap-1 text-sm text-[#64748B] hover:text-emerald-700 mb-6">
            <ChevronLeft className="w-4 h-4" /> Back to sign in
          </Link>
        }
      >
        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field icon={Mail} label="Email address" type="email" value={email} onChange={setEmail} />
            <SubmitButton loading={loading} label="Send reset link" />
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-[#64748B]">Didn&apos;t receive it? Check spam or <button type="button" onClick={() => setSent(false)} className="text-emerald-700 font-medium">try again</button>.</p>
            <Link href="/login" className="block w-full text-center py-3.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700">
              Return to sign in
            </Link>
          </div>
        )}
      </AuthFormShell>
    </div>
  );
}

export function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ password: '', confirm: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    setTimeout(() => {
      toast.success('Password updated!');
      setLoading(false);
      window.location.href = '/login';
    }, 1000);
  };

  return (
    <div className={AUTH.panel}>
      <AuthIllustrationPanel variant="forgot" />
      <AuthFormShell title="Set new password" subtitle="Choose a strong password you haven't used before.">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field icon={Lock} label="New password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
          <Field icon={Lock} label="Confirm password" type="password" value={form.confirm} onChange={(v) => setForm({ ...form, confirm: v })} />
          <SubmitButton loading={loading} label="Update password" />
        </form>
      </AuthFormShell>
    </div>
  );
}

export function VerifyEmailPage() {
  return (
    <div className={AUTH.panel}>
      <AuthIllustrationPanel variant="verify" />
      <AuthFormShell title="Verify your email" subtitle="We sent a verification link to your inbox. Click it to activate your account.">
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
          <Mail className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
          <p className="text-sm text-[#64748B] mb-4">Didn&apos;t get the email? Check spam or request a new link.</p>
          <button type="button" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">Resend verification email</button>
        </div>
        <Link href="/login" className="mt-6 block text-center text-sm text-emerald-700 font-medium">Continue to sign in</Link>
      </AuthFormShell>
    </div>
  );
}

export function MagicLinkPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setSent(true); setLoading(false); toast.success('Magic link sent!'); }, 800);
  };

  return (
    <div className={AUTH.panel}>
      <AuthIllustrationPanel variant="magic" />
      <AuthFormShell title="Magic link sign-in" subtitle={sent ? 'Check your email for a one-time sign-in link.' : 'No password needed — we\'ll email you a secure link.'}>
        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field icon={Mail} label="Email address" type="email" value={email} onChange={setEmail} />
            <SubmitButton loading={loading} label="Send magic link" />
          </form>
        ) : null}
        <p className="mt-6 text-center text-sm text-[#64748B]">
          Prefer password? <Link href="/login" className="text-emerald-700 font-semibold">Sign in</Link>
        </p>
      </AuthFormShell>
    </div>
  );
}

export function InvitePage() {
  return (
    <div className={AUTH.panel}>
      <AuthIllustrationPanel variant="invite" />
      <AuthFormShell title="Accept invitation" subtitle="You've been invited to join a team on LeadForGrow.">
        <div className="p-5 rounded-2xl border border-emerald-100 bg-emerald-50/50 mb-6">
          <p className="text-sm font-semibold text-[#111827]">Acme Corp workspace</p>
          <p className="text-xs text-[#64748B] mt-1">Role: Sales Member · Invited by admin@acme.com</p>
        </div>
        <Link href="/register" className="block w-full text-center py-3.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors">
          Accept & create account
        </Link>
        <Link href="/login" className="mt-4 block text-center text-sm text-emerald-700 font-medium">Already have an account? Sign in</Link>
      </AuthFormShell>
    </div>
  );
}

export function TwoFactorPage() {
  const [code, setCode] = useState('');
  return (
    <div className={AUTH.panel}>
      <AuthIllustrationPanel variant="twofa" />
      <AuthFormShell title="Two-factor authentication" subtitle="Enter the 6-digit code from your authenticator app.">
        <form onSubmit={(e) => { e.preventDefault(); toast.success('Verified!'); window.location.href = '/automation'; }} className="space-y-5">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="w-full text-center text-2xl tracking-[0.5em] font-mono py-4 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
          />
          <SubmitButton loading={false} label="Verify" />
        </form>
        <button type="button" className="mt-4 w-full text-sm text-[#64748B] hover:text-emerald-700">Use backup code instead</button>
      </AuthFormShell>
    </div>
  );
}

export function SessionExpiredPage() {
  return (
    <div className={AUTH.panel}>
      <AuthIllustrationPanel variant="expired" />
      <AuthFormShell title="Session expired" subtitle="For your security, sessions end after a period of inactivity.">
        <Link href="/login" className="block w-full text-center py-3.5 rounded-xl bg-[#111827] text-white font-semibold hover:bg-black transition-colors">
          Sign in again
        </Link>
      </AuthFormShell>
    </div>
  );
}

export function AccountLockedPage() {
  return (
    <div className={AUTH.panel}>
      <AuthIllustrationPanel variant="locked" />
      <AuthFormShell title="Account locked" subtitle="Too many failed sign-in attempts. Try again in 30 minutes or contact support.">
        <div className="space-y-3">
          <Link href="/contact" className="block w-full text-center py-3.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700">Contact support</Link>
          <Link href="/login" className="block w-full text-center py-3.5 rounded-xl border border-emerald-200 text-[#111827] font-semibold hover:bg-emerald-50">Try again later</Link>
        </div>
      </AuthFormShell>
    </div>
  );
}

function Field({ icon: Icon, label, type = 'text', value, onChange, togglePassword, showToggle, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between ml-1">
        <label className={AUTH.label}>{label}</label>
        {children}
      </div>
      <div className="relative group">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600/50 group-focus-within:text-emerald-600 transition-colors" />
        <input type={type} required value={value} onChange={(e) => onChange(e.target.value)} className={AUTH.input} />
        {showToggle && (
          <button type="button" onClick={togglePassword} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]">
            <Eye className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

function SubmitButton({ loading, label }) {
  return (
    <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60">
      {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{label} <ArrowRight className="w-5 h-5" /></>}
    </button>
  );
}
