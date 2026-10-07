import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { api, setSession } from '../../lib/api';

function navigate(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.name.trim().length < 2) {
      setError('Enter your full name.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError('Enter a valid email address.');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const result = await api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setSession(result.token, result.user);
      navigate('/portal');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8EFED] px-4 py-14 sm:py-20">
      <div className="mx-auto w-full max-w-[430px] rounded-[8px] border border-[#D9E2DF] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-10">
        <button type="button" onClick={() => navigate('/')} className="text-[14px] font-semibold uppercase tracking-[0.3em] text-[#0A6B5E]">
          NORTHBRIDGE
        </button>

        <h1 className="mt-6 text-[26px] font-medium text-[#0A2E28]">Create your account</h1>
        <p className="mt-2 text-[14px] leading-6 text-[#6B7A77]">
          Save appointments, messages, and profile details in your patient portal.
        </p>

        {error && (
          <p role="alert" className="mt-5 rounded-[6px] bg-[#FBEDE4] px-3 py-2 text-[12px] text-[#A3352C]">
            {error}
          </p>
        )}

        <form className="mt-8 space-y-5" onSubmit={submit}>
          <label className="block text-[13px] font-medium text-[#0A2E28]">
            Full name
            <input
              value={form.name}
              onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))}
              autoComplete="name"
              className="mt-2 h-11 w-full rounded-[6px] border border-[#D9E2DF] px-3 text-[14px] outline-none focus:border-[#0A6B5E] focus:ring-2 focus:ring-[#0A6B5E]/20"
            />
          </label>

          <label className="block text-[13px] font-medium text-[#0A2E28]">
            Email address
            <input
              value={form.email}
              onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))}
              type="email"
              autoComplete="email"
              className="mt-2 h-11 w-full rounded-[6px] border border-[#D9E2DF] px-3 text-[14px] outline-none focus:border-[#0A6B5E] focus:ring-2 focus:ring-[#0A6B5E]/20"
            />
          </label>

          <label className="block text-[13px] font-medium text-[#0A2E28]">
            Password
            <span className="relative mt-2 block">
              <input
                value={form.password}
                onChange={(event) => setForm((value) => ({ ...value, password: event.target.value }))}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className="h-11 w-full rounded-[6px] border border-[#D9E2DF] px-3 pr-12 text-[14px] outline-none focus:border-[#0A6B5E] focus:ring-2 focus:ring-[#0A6B5E]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7A77]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </span>
            <span className="mt-1.5 block text-[11px] font-normal text-[#6B7A77]">Minimum 8 characters.</span>
          </label>

          <button
            disabled={loading}
            type="submit"
            className="h-11 w-full rounded-[6px] bg-[#0A6B5E] text-[14px] font-medium text-white transition hover:bg-[#095A4F] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-[12px] text-[#6B7A77]">
          Already have an account?{' '}
          <button type="button" onClick={() => navigate('/login')} className="text-[#0A6B5E] underline-offset-2 hover:underline">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
