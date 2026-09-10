import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const WORDMARK = 'NORTHBRIDGE';

export default function Login() {
  // 'transition' → white fade · 'loader' → logo pulse · 'form' → login card
  const [phase, setPhase] = useState('transition');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');

  useEffect(() => {
    document.title = 'Log in · Northbridge Health';
    const t1 = setTimeout(() => setPhase('loader'), 450); // brief white transition
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (phase !== 'loader') return undefined;
    const t2 = setTimeout(() => setPhase('form'), 1500); // intentional short prototype wait
    return () => clearTimeout(t2);
  }, [phase]);

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = 'Please enter an email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Please enter a password.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setNotice('');
    if (validate()) {
      // No backend auth exists — prototype only, no false success.
      setNotice('Sign-in is not connected yet. This is a Northbridge prototype.');
    }
  };

  const goHome = (e) => {
    e.preventDefault();
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  if (phase === 'transition') {
    return <div className="min-h-screen bg-[#E8EFED]" aria-hidden="true" />;
  }

  if (phase === 'loader') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#E8EFED]">
        <span
          className="select-none text-[26px] font-semibold uppercase tracking-[0.32em] text-[#0A6B5E]"
          style={{ animation: 'nb-login-pulse 1000ms ease-in-out infinite' }}
        >
          {WORDMARK}
        </span>
        <style>{`
          @keyframes nb-login-pulse {
            0%, 100% { transform: scale(0.95); opacity: 0.8; }
            50% { transform: scale(1.05); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#E8EFED]">
      {/* Language control — non-functional prototype selector, top-right */}
      <div className="absolute right-4 top-4 sm:right-6">
        <button
          type="button"
          aria-label="Language selector (coming soon)"
          className="rounded px-2 py-1 text-[12px] text-[#6B7A77] transition hover:text-[#0A2E28] focus-visible:outline-2 focus-visible:outline-[#0A6B5E]"
        >
          🌐 English ∨
        </button>
      </div>

      <div className="flex min-h-screen justify-center px-4 pb-16 pt-16 sm:pt-[12vh]">
        <div className="w-[370px] max-w-[calc(100vw-32px)] min-h-[580px] rounded-[8px] border border-[#D9E2DF] bg-white p-[40px] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="text-center">
            <a
              href="/"
              onClick={goHome}
              className="inline-block text-[14px] font-semibold uppercase tracking-[0.3em] text-[#0A6B5E] focus-visible:outline-2 focus-visible:outline-[#0A6B5E]"
            >
              {WORDMARK}
            </a>
            <h1 className="mt-3 text-[22px] font-medium text-[#0A2E28]">Log In</h1>
            <p className="mt-1.5 text-[13px] text-[#6B7A77]">Welcome back!</p>
          </div>

          {notice && (
            <p role="status" className="mt-4 rounded-[6px] bg-[#F4F8F6] px-3 py-2 text-[12px] text-[#0A6B5E]">
              {notice}
            </p>
          )}

          <form className="mt-8" onSubmit={handleSubmit} noValidate>
            <div className="text-[13px] font-medium text-[#0A2E28]">
              <label htmlFor="login-email" className="block">
                Email address<span className="text-[#C0473B]">*</span>
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="off"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                className="mt-2 h-[40px] w-full rounded-[6px] border border-[#D9E2DF] bg-white px-3 text-[14px] text-[#0A2E28] outline-none transition focus:border-[#0A6B5E] focus:ring-2 focus:ring-[#0A6B5E]/20"
                aria-invalid={errors.email ? 'true' : undefined}
                aria-describedby={errors.email ? 'login-email-error' : undefined}
              />
              {errors.email ? (
                <p id="login-email-error" className="mt-1.5 text-[12px] text-[#C0473B]">
                  {errors.email}
                </p>
              ) : null}
            </div>

            <div className="mt-6 text-[13px] font-medium text-[#0A2E28]">
              <label htmlFor="login-password" className="block">
                Password<span className="text-[#C0473B]">*</span>
              </label>
              <div className="relative mt-2">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className="h-[40px] w-full rounded-[6px] border border-[#D9E2DF] bg-white px-3 pr-12 text-[14px] text-[#0A2E28] outline-none transition focus:border-[#0A6B5E] focus:ring-2 focus:ring-[#0A6B5E]/20"
                  aria-invalid={errors.password ? 'true' : undefined}
                  aria-describedby={errors.password ? 'login-password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-[28px] w-[28px] items-center justify-center rounded text-[#6B7A77] transition hover:text-[#0A2E28] focus-visible:outline-2 focus-visible:outline-[#0A6B5E]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
              {errors.password ? (
                <p id="login-password-error" className="mt-1.5 text-[12px] text-[#C0473B]">
                  {errors.password}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setNotice('Password reset is not available in this prototype yet.')}
              className="mt-3 inline-block text-left text-[11px] text-[#0A6B5E] underline-offset-2 transition hover:underline focus-visible:outline-2 focus-visible:outline-[#0A6B5E]"
            >
              Reset password?
            </button>

            <button
              type="submit"
              className="mt-6 h-[40px] w-full rounded-[6px] bg-[#0A6B5E] text-[14px] font-medium text-white transition hover:bg-[#095A4F] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-[#0A6B5E]"
            >
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-[12px] text-[#6B7A77]">
            New to Northbridge?{' '}
            <button
              type="button"
              onClick={() => setNotice('Account creation is not available in this prototype yet.')}
              className="text-[#0A6B5E] underline-offset-2 transition hover:underline focus-visible:outline-2 focus-visible:outline-[#0A6B5E]"
            >
              Create account
            </button>
          </p>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#D9E2DF]" />
            <span className="text-[11px] text-[#6B7A77]">OR</span>
            <div className="h-px flex-1 bg-[#D9E2DF]" />
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setNotice('Google sign-in is not available in this prototype yet.')}
              className="flex h-[40px] w-full items-center justify-center gap-2 rounded-[6px] border border-[#D9E2DF] bg-white text-[13px] text-[#0A2E28] transition hover:bg-[#F4F8F6] focus-visible:outline-2 focus-visible:outline-[#0A6B5E]"
            >
              <svg aria-hidden="true" viewBox="0 0 18 18" className="h-4 w-4">
                <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92a8.78 8.78 0 0 0 2.68-6.62Z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86a5.4 5.4 0 0 1-5.06-3.7H.94v2.32A9 9 0 0 0 9 18Z" />
                <path fill="#FBBC05" d="M3.94 10.72a5.41 5.41 0 0 1 0-3.44V4.96H.94a9 9 0 0 0 0 8.08l3-2.32Z" />
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59A9 9 0 0 0 .94 4.96l3 2.32A5.4 5.4 0 0 1 9 3.58Z" />
              </svg>
              Continue with Google
            </button>
            <button
              type="button"
              onClick={() => setNotice('Apple sign-in is not available in this prototype yet.')}
              className="flex h-[40px] w-full items-center justify-center gap-2 rounded-[6px] border border-[#D9E2DF] bg-white text-[13px] text-[#0A2E28] transition hover:bg-[#F4F8F6] focus-visible:outline-2 focus-visible:outline-[#0A6B5E]"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-[#0A2E28]">
                <path d="M17.05 12.54c-.03-2.5 2.04-3.7 2.13-3.76-1.16-1.7-2.97-1.93-3.61-1.96-1.54-.16-3 .9-3.78.9-.78 0-1.98-.88-3.26-.86-1.68.03-3.22.98-4.08 2.48-1.74 3.02-.44 7.5 1.25 9.95.83 1.2 1.82 2.55 3.12 2.5 1.25-.05 1.72-.81 3.23-.81 1.5 0 1.93.81 3.25.79 1.34-.03 2.19-1.22 3.01-2.43.95-1.39 1.34-2.74 1.36-2.81-.03-.01-2.6-1-2.62-3.99ZM14.53 5.2c.69-.83 1.15-1.99 1.02-3.14-.99.04-2.18.66-2.89 1.49-.64.74-1.2 1.92-1.05 3.05 1.1.09 2.23-.56 2.92-1.4Z" />
              </svg>
              Continue with Apple
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
