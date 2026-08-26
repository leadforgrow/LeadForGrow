'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, KeyRound, Check, X, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { evaluatePassword, PASSWORD_POLICY } from '@/lib/security/passwordPolicy';

/**
 * /rotate-password
 *
 * Landing screen for users whose grandfathered-in weak password tripped the
 * login-time policy check (mustRotatePassword=true). They can't reach the
 * app until they set a new password that satisfies the current policy.
 *
 * Self-contained so it doesn't need the main app shell — if the session
 * has any layout / permission wiring that would otherwise short-circuit
 * during a forced rotation, this stays outside that.
 */
export default function RotatePasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Client-only — safe to read localStorage. We use email as context for
    // the "password shouldn't contain your email prefix" check.
    if (typeof window !== 'undefined') {
      setEmail(localStorage.getItem('userEmail') || '');
    }
  }, []);

  const pwCheck = useMemo(
    () => evaluatePassword(form.next, { email }),
    [form.next, email],
  );
  const passwordsMatch = form.next && form.next === form.confirm;
  const differsFromCurrent = form.next && form.current && form.next !== form.current;
  const canSubmit = form.current && pwCheck.ok && passwordsMatch && differsFromCurrent && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pwCheck.ok) return toast.error(pwCheck.failures[0]?.message || 'New password does not meet requirements');
    if (form.next !== form.confirm) return toast.error("New passwords don't match");
    if (form.next === form.current) return toast.error('New password must be different from your current one');

    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
      const res = await fetch('/api/auth/rotate-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.next }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Password updated. Please sign in again with your new password.');
        // Clear the session — the rotate endpoint revoked refresh tokens, so
        // this session is dead server-side. Force a fresh login to prove the
        // new password works.
        try {
          localStorage.removeItem('userToken');
          localStorage.removeItem('userid');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userPlan');
          localStorage.removeItem('businessId');
          document.cookie = 'token=; path=/; max-age=0; samesite=lax';
        } catch { /* ignore */ }
        router.push('/login');
      } else {
        toast.error(data.error || 'Failed to update password');
      }
    } catch {
      toast.error('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-amber-100 p-7">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <KeyRound className="w-6 h-6" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Update your password</h1>
            <p className="text-sm text-slate-600 mt-1">
              Your current password no longer meets our security requirements. Please choose a stronger one to continue using LeadForGrow.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordField
            label="Current password"
            value={form.current}
            onChange={(v) => setForm({ ...form, current: v })}
            placeholder="Your existing password"
          />

          <div>
            <PasswordField
              label="New password"
              value={form.next}
              onChange={(v) => setForm({ ...form, next: v })}
              placeholder={`At least ${PASSWORD_POLICY.minLength} characters`}
              error={!!(form.next && form.current && !differsFromCurrent)}
            />
            {form.next && <StrengthPanel result={pwCheck} />}
            {form.next && form.current && !differsFromCurrent && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <X className="w-3 h-3" /> New password must be different from your current one
              </p>
            )}
          </div>

          <div>
            <PasswordField
              label="Confirm new password"
              value={form.confirm}
              onChange={(v) => setForm({ ...form, confirm: v })}
              placeholder="Type the new password again"
              error={!!(form.confirm && !passwordsMatch)}
            />
            {form.confirm && !passwordsMatch && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <X className="w-3 h-3" /> Passwords don&apos;t match
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Update password <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <p className="mt-5 text-xs text-slate-500 text-center">
          After updating, you'll be asked to sign in again with your new password. Existing sessions on other devices will be signed out.
        </p>
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange, placeholder, error }) {
  const [show, setShow] = useState(false);
  // Error state overrides the resting + focused emerald ring with red — that
  // way the field itself signals the problem, not just the caption below it.
  const stateClass = error
    ? 'border-red-400 bg-red-50/50 focus:ring-red-400/30 focus:border-red-500'
    : 'border-slate-200 bg-slate-50 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white';
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${error ? 'text-red-400' : 'text-slate-400'}`} />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={!!error}
          className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-colors ${stateClass}`}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={show ? 'Hide password' : 'Show password'}
          title={show ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function StrengthPanel({ result }) {
  const strengthColor = {
    weak: 'bg-red-500',
    fair: 'bg-amber-500',
    strong: 'bg-emerald-500',
    excellent: 'bg-emerald-600',
  }[result.strength];
  const strengthLabel = { weak: 'Weak', fair: 'Fair', strong: 'Strong', excellent: 'Excellent' }[result.strength];
  const strengthTextColor = result.strength === 'weak' ? 'text-red-600'
    : result.strength === 'fair' ? 'text-amber-600' : 'text-emerald-700';

  const items = [
    { ok: result.checks.minLength, label: `At least ${PASSWORD_POLICY.minLength} characters` },
    { ok: result.checks.classesMet, label: `Mix of ${PASSWORD_POLICY.requiredClasses}+: uppercase, lowercase, number, symbol` },
    { ok: result.checks.notCommon, label: 'Not a known breach-list password' },
    { ok: result.checks.notContainingIdentity, label: "Doesn't contain your email or name" },
    { ok: result.checks.notTrivialRepeat, label: 'No trivial patterns (aaaa, 1234…)' },
  ];

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {[1, 2, 3, 4].map((tick) => (
            <div key={tick} className={`h-1.5 flex-1 rounded ${tick <= result.score ? strengthColor : 'bg-slate-200'}`} />
          ))}
        </div>
        <span className={`text-xs font-semibold min-w-[64px] text-right ${strengthTextColor}`}>{strengthLabel}</span>
      </div>
      <ul className="text-[11px] space-y-0.5">
        {items.map((item) => (
          <li key={item.label} className={`flex items-center gap-1.5 ${item.ok ? 'text-emerald-700' : 'text-slate-500'}`}>
            {item.ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-slate-400" />}
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
