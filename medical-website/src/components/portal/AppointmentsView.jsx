import { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api';
import StatusBadge from './StatusBadge';

const emptyForm = { reason: 'Follow-up', provider: 'Dr. Amara Odum', visitType: 'video', date: '' };

export default function AppointmentsView() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    api('/api/appointments')
      .then((result) => setAppointments(result.appointments || []))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!form.date || form.date <= new Date().toISOString().slice(0, 10)) {
      setError('Please choose a future date.');
      return;
    }

    setSaving(true);
    try {
      const result = await api('/api/appointments', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setAppointments((current) => [...current, result.appointment]);
      setMessage('Appointment request saved. Our care team will confirm the time.');
      setForm(emptyForm);
      setActiveTab('upcoming');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const upcoming = appointments.filter((appointment) => appointment.status !== 'completed');
  const past = appointments.filter((appointment) => appointment.status === 'completed');

  const list = activeTab === 'past' ? past : upcoming;
  const tomorrow = useMemo(
    () => new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    [],
  );

  return (
    <div className="space-y-6">
      {message && <p role="status" className="rounded-2xl bg-status-ok-bg px-4 py-3 text-sm font-medium text-status-ok">{message}</p>}
      <div className="flex flex-wrap gap-3" role="tablist" aria-label="Appointments views">
        {['upcoming', 'past', 'book new'].map((tab) => (
          <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => { setActiveTab(tab); setMessage(''); setError(''); }} className={`rounded-full px-5 py-2.5 text-sm font-semibold ${activeTab === tab ? 'bg-nb-teal text-white' : 'bg-white text-nb-teal ring-1 ring-nb-line'}`}>
            {tab === 'book new' ? 'Book new' : tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading && <div className="rounded-2xl border border-nb-line bg-white p-8 text-center text-sm text-nb-ink/60">Loading appointments…</div>}
      {!loading && error && <div role="alert" className="rounded-2xl bg-status-danger-bg p-4 text-sm text-status-danger">{error}</div>}
      {!loading && !error && activeTab !== 'book new' && list.length === 0 && (
        <div className="rounded-2xl border border-dashed border-nb-line bg-white p-10 text-center">
          <h3 className="font-semibold text-nb-ink">{activeTab === 'past' ? 'No past appointments' : 'No upcoming appointments'}</h3>
          <p className="mt-2 text-sm text-nb-ink/60">Your appointment requests will appear here once you submit one.</p>
          {activeTab === 'upcoming' && <button type="button" onClick={() => setActiveTab('book new')} className="mt-4 rounded-full bg-nb-clay px-5 py-2.5 text-sm font-semibold text-white">Request an appointment</button>}
        </div>
      )}

      {!loading && activeTab !== 'book new' && list.length > 0 && (
        <div className="space-y-4">
          {list.map((appointment) => (
            <div key={appointment.id} className="flex flex-col gap-3 rounded-2xl border border-nb-line bg-white p-4 shadow-[0_12px_24px_rgba(19,42,44,0.04)] md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-nb-sand font-semibold text-nb-teal">{appointment.provider.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>
                <div>
                  <div className="font-semibold text-nb-ink">{appointment.provider}</div>
                  <div className="text-sm text-nb-ink/65">{appointment.reason} · {appointment.visitType === 'video' ? 'Video' : 'In person'}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-nb-ink/70"><div>{appointment.date}</div><div>{appointment.time}</div></div>
                <StatusBadge status={appointment.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'book new' && (
        <div className="rounded-2xl border border-nb-line bg-nb-sand p-5 shadow-[0_12px_24px_rgba(19,42,44,0.04)]">
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium">Reason<select name="reason" value={form.reason} onChange={(e) => setForm((v) => ({ ...v, reason: e.target.value }))} className="mt-2 w-full rounded-full border border-nb-line bg-white px-4 py-3 outline-none focus:border-nb-teal"><option>Follow-up</option><option>Annual wellness</option><option>New concern</option><option>Medication review</option></select></label>
            <label className="text-sm font-medium">Provider<select name="provider" value={form.provider} onChange={(e) => setForm((v) => ({ ...v, provider: e.target.value }))} className="mt-2 w-full rounded-full border border-nb-line bg-white px-4 py-3 outline-none focus:border-nb-teal"><option>Dr. Amara Odum</option><option>Dr. Marcus Kane</option><option>Dr. Elena Marx</option></select></label>
            <label className="text-sm font-medium">Visit type<select name="visitType" value={form.visitType} onChange={(e) => setForm((v) => ({ ...v, visitType: e.target.value }))} className="mt-2 w-full rounded-full border border-nb-line bg-white px-4 py-3 outline-none focus:border-nb-teal"><option value="video">Video</option><option value="in-person">In person</option></select></label>
            <label className="text-sm font-medium">Preferred date (must be after today)<input type="date" name="date" min={tomorrow} value={form.date} onChange={(e) => setForm((v) => ({ ...v, date: e.target.value }))} className="mt-2 w-full rounded-full border border-nb-line bg-white px-4 py-3 outline-none focus:border-nb-teal" /></label>
            <div className="md:col-span-2">
              <button disabled={saving} type="submit" className="rounded-full bg-nb-clay px-6 py-3 font-semibold text-white disabled:opacity-60">{saving ? 'Saving request…' : 'Request appointment'}</button>
              {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
