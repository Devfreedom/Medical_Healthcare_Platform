import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { api, setSession } from '../../lib/api';

const WORDMARK = 'NORTHBRIDGE';

export default function Login({ onAuthenticated }) {
  const [phase, setPhase] = useState('transition');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Log in · Northbridge Health';
    const timer = setTimeout(() => setPhase('form'), 500);
    return () => clearTimeout(timer);
  }, []);

  const go = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice('');

    const next = {};
    if (!email.trim()) next.email = 'Please enter an email address.';
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Please enter your password.';
    setErrors(next);

    if (Object.keys(next).length) return;

    setLoading(true);

    try {
      const session = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setSession(session.token, session.user);
      onAuthenticated(session);
    } catch (requestError) {
      setNotice(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  if (phase === 'transition') {
    return <div className="min-h-screen bg-[#E8EFED]" aria-hidden="true" />;
  }

  return (
    <div className="relative min-h-screen bg-[#E8EFED]">
      <div className="absolute right-4 top-4 sm:right-6">
        <span className="rounded px-2 py-1 text-[12px] text-[#6B7A77]">🌐 English</span>
      </div>

      <div className="flex min-h-screen justify-center px-4 pb-16 pt-16 sm:pt-[12vh]">
        <div className="w-[370px] max-w-[calc(100vw-32px)] rounded-[8px] border border-[#D9E2DF] bg-white p-[40px] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="text-center">
            <button type="button" onClick={() => go('/')} className="text-[14px] font-semibold uppercase tracking-[0.3em] text-[#0A6B5E]">
              {WORDMARK}
            </button>
            <h1 className="mt-3 text-[22px] font-medium text-[#0A2E28]">Log In</h1>
            <p className="mt-1.5 text-[13px] text-[#6B7A77]">Welcome back!</p>
          </div>

          {notice && <p role="alert" className="mt-4 rounded-[6px] bg-[#FBEDE4] px-3 py-2 text-[12px] text-[#A3352C]">{notice}</p>}

          <form className="mt-8" onSubmit={handleSubmit} noValidate>
            <label htmlFor="login-email" className="block text-[13px] font-medium text-[#0A2E28]">
              Email address<span className="text-[#C0473B]">*</span>
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={errors.email ? 'true' : undefined}
              aria-describedby={errors.email ? 'login-email-error' : undefined}
              className="mt-2 h-[40px] w-full rounded-[6px] border border-[#D9E2DF] px-3 text-[14px] outline-none focus:border-[#0A6B5E] focus:ring-2 focus:ring-[#0A6B5E]/20"
            />
            {errors.email && <p id="login-email-error" className="mt-1.5 text-[12px] text-[#C0473B]">{errors.email}</p>}

            <label htmlFor="login-password" className="mt-6 block text-[13px] font-medium text-[#0A2E28]">
              Password<span className="text-[#C0473B]">*</span>
            </label>
            <div className="relative mt-2">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={errors.password ? 'true' : undefined}
                aria-describedby={errors.password ? 'login-password-error' : undefined}
                className="h-[40px] w-full rounded-[6px] border border-[#D9E2DF] px-3 pr-12 text-[14px] outline-none focus:border-[#0A6B5E] focus:ring-2 focus:ring-[#0A6B5E]/20"
              />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7A77]">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p id="login-password-error" className="mt-1.5 text-[12px] text-[#C0473B]">{errors.password}</p>}

            <button type="button" title="Coming soon" onClick={() => setNotice('Password reset will be connected during the backend/authentication phase.')} className="mt-3 text-left text-[11px] text-[#0A6B5E] underline-offset-2 hover:underline">
              Reset password? (Coming soon)
            </button>

            <button disabled={loading} type="submit" className="mt-6 h-[40px] w-full rounded-[6px] bg-[#0A6B5E] text-[14px] font-medium text-white transition hover:bg-[#095A4F] disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-[12px] text-[#6B7A77]">
            New to Northbridge?{' '}
            <button type="button" onClick={() => go('/register')} className="text-[#0A6B5E] underline-offset-2 hover:underline">
              Create account
            </button>
          </p>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#D9E2DF]" />
            <span className="text-[11px] text-[#6B7A77]">OR</span>
            <div className="h-px flex-1 bg-[#D9E2DF]" />
          </div>

          <div className="space-y-2">
            <button type="button" title="Coming soon — Google sign-in arrives with the backend" onClick={() => setNotice('Google sign-in will be connected during the authentication phase.')} className="flex h-[40px] w-full items-center justify-center rounded-[6px] border border-[#D9E2DF] text-[13px] text-[#0A2E28] hover:bg-[#F4F8F6]">
              Continue with Google (Coming soon)
            </button>
            <button type="button" title="Coming soon — Apple sign-in arrives with the backend" onClick={() => setNotice('Apple sign-in will be connected during the authentication phase.')} className="flex h-[40px] w-full items-center justify-center rounded-[6px] border border-[#D9E2DF] text-[13px] text-[#0A2E28] hover:bg-[#F4F8F6]">
              Continue with Apple (Coming soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
