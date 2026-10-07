import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function ProfileView({ onProfileSaved }) {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api('/api/profile')
      .then((result) => setForm(result.profile))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const result = await api('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      setForm(result.profile);
      setMessage('Your profile has been saved.');
      onProfileSaved?.({
        id: result.profile.id,
        name: result.profile.name,
        email: result.profile.email,
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="rounded-2xl border border-nb-line bg-white p-8 text-center text-sm text-nb-ink/60">Loading your profile…</div>;
  if (error || !form) return <div role="alert" className="rounded-2xl bg-status-danger-bg p-4 text-sm text-status-danger">{error || 'Profile unavailable.'}</div>;

  const initials = form.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="rounded-2xl border border-nb-line bg-white p-5 shadow-[0_12px_24px_rgba(19,42,44,0.04)]">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-nb-sand font-semibold text-nb-teal">{initials}</div>
        <div><div className="text-lg font-semibold text-nb-ink">{form.name}</div><div className="text-sm text-nb-ink/60">Patient profile</div></div>
      </div>

      <form className="space-y-6" onSubmit={save}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium">Full name<input value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))} className="mt-2 w-full rounded-full border border-nb-line bg-nb-paper px-4 py-3 outline-none focus:border-nb-teal" /></label>
          <label className="text-sm font-medium">Date of birth<input type="date" value={form.dateOfBirth || ''} onChange={(e) => setForm((v) => ({ ...v, dateOfBirth: e.target.value }))} className="mt-2 w-full rounded-full border border-nb-line bg-nb-paper px-4 py-3 outline-none focus:border-nb-teal" /></label>
          <label className="text-sm font-medium">Phone<input value={form.phone || ''} onChange={(e) => setForm((v) => ({ ...v, phone: e.target.value }))} className="mt-2 w-full rounded-full border border-nb-line bg-nb-paper px-4 py-3 outline-none focus:border-nb-teal" /></label>
          <label className="text-sm font-medium">Email<input value={form.email} disabled className="mt-2 w-full cursor-not-allowed rounded-full border border-nb-line bg-nb-sand px-4 py-3 text-nb-ink/60" /></label>
        </div>

        <div className="rounded-2xl border border-nb-line bg-nb-paper p-4">
          <h3 className="mb-4 text-lg font-semibold text-nb-teal">Notification preferences</h3>
          {Object.entries({ appointments: 'Appointment reminders', results: 'Test result notices', billing: 'Billing updates' }).map(([key, label]) => (
            <label key={key} className="flex items-center justify-between gap-3 py-1.5 text-sm text-nb-ink/75">
              <span>{label}</span>
              <input type="checkbox" checked={Boolean(form.notifications?.[key])} onChange={(e) => setForm((v) => ({ ...v, notifications: { ...v.notifications, [key]: e.target.checked } }))} className="h-4 w-4 rounded border-nb-line" />
            </label>
          ))}
        </div>

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {message && <p role="status" className="rounded-2xl bg-status-ok-bg px-4 py-3 text-sm font-medium text-status-ok">{message}</p>}
        <button disabled={saving} type="submit" className="rounded-full bg-nb-teal px-6 py-3 font-semibold text-white disabled:opacity-60">{saving ? 'Saving…' : 'Save changes'}</button>
      </form>
    </div>
  );
}
