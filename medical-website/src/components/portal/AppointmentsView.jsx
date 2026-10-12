import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import StatusBadge from './StatusBadge';

const emptyForm = { reason: 'Follow-up', doctorId: '', visitType: 'video', date: '', slotId: '' };

function displayTime(appointment) {
  if (appointment.scheduledTime) return `${appointment.scheduledTime}`;
  return appointment.time;
}

export default function AppointmentsView() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorsFailed, setDoctorsFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [slotsAttempt, setSlotsAttempt] = useState(0);
  const [tomorrow] = useState(() => new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10));

  useEffect(() => {
    Promise.all([api('/api/appointments'), api('/api/doctors').catch(() => null)])
      .then(([apptResult, doctorResult]) => {
        setAppointments(apptResult.appointments || []);
        if (doctorResult && Array.isArray(doctorResult.doctors)) {
          setDoctors(doctorResult.doctors);
        } else {
          setDoctorsFailed(true);
        }
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  // Load open slots whenever the selected doctor + date are both set.
  // The selected slot resets on either change so a stale time can never book.
  useEffect(() => {
    if (activeTab !== 'book new') return;
    if (!form.doctorId || !form.date) {
      setSlots([]);
      setSlotsError('');
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    setSlotsError('');
    api(`/api/doctors/${form.doctorId}/availability?date=${encodeURIComponent(form.date)}`)
      .then((result) => {
        if (!cancelled) setSlots(result.slots || []);
      })
      .catch((requestError) => {
        if (!cancelled) {
          setSlots([]);
          setSlotsError(requestError.message);
        }
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => { cancelled = true; };
  }, [form.doctorId, form.date, slotsAttempt, activeTab]);

  const setField = (name, value) => {
    setForm((current) => {
      if (name === 'doctorId' || name === 'date') {
        return { ...current, [name]: value, slotId: '' };
      }
      return { ...current, [name]: value };
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (doctorsFailed || (doctors.length === 0 && !loading)) {
      setError('The doctor directory could not be loaded. Please try again before booking.');
      return;
    }
    if (!form.doctorId) {
      setError('Please choose a doctor.');
      return;
    }
    if (!form.date || form.date <= new Date().toISOString().slice(0, 10)) {
      setError('Please choose a future date.');
      return;
    }
    if (slotsError) {
      setError('Availability could not be loaded. Please retry before booking.');
      return;
    }
    if (!form.slotId) {
      setError(slots.length === 0 ? 'No times are available on this date. Please choose another date.' : 'Please choose a time slot.');
      return;
    }

    setSaving(true);
    try {
      const result = await api('/api/appointments', {
        method: 'POST',
        body: JSON.stringify({ reason: form.reason, visitType: form.visitType, slotId: form.slotId }),
      });
      setAppointments((current) => [...current, result.appointment]);
      const booked = result.appointment;
      setMessage(
        `Request saved for ${booked.date}${booked.scheduledTime ? ` at ${booked.scheduledTime}` : ''}. Awaiting confirmation.`,
      );
      setForm(emptyForm);
      setSlots([]);
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
      {!loading && error && activeTab !== 'book new' && <div role="alert" className="rounded-2xl bg-status-danger-bg p-4 text-sm text-status-danger">{error}</div>}
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
                <div className="text-sm text-nb-ink/70"><div>{appointment.date}</div><div>{displayTime(appointment)}</div></div>
                <StatusBadge status={appointment.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'book new' && (
        <div className="rounded-2xl border border-nb-line bg-nb-sand p-5 shadow-[0_12px_24px_rgba(19,42,44,0.04)]">
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium">Reason<select name="reason" value={form.reason} onChange={(e) => setField('reason', e.target.value)} className="mt-2 w-full rounded-full border border-nb-line bg-white px-4 py-3 outline-none focus:border-nb-teal"><option>Follow-up</option><option>Annual wellness</option><option>New concern</option><option>Medication review</option></select></label>
            <label className="text-sm font-medium">Provider
              <select name="doctorId" value={form.doctorId} onChange={(e) => setField('doctorId', e.target.value)} className="mt-2 w-full rounded-full border border-nb-line bg-white px-4 py-3 outline-none focus:border-nb-teal">
                <option value="">{doctors.length > 0 ? 'Select a doctor' : 'Loading doctors…'}</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>{doctor.displayName} · {doctor.specialty}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">Visit type<select name="visitType" value={form.visitType} onChange={(e) => setField('visitType', e.target.value)} className="mt-2 w-full rounded-full border border-nb-line bg-white px-4 py-3 outline-none focus:border-nb-teal"><option value="video">Video</option><option value="in-person">In person</option></select></label>
            <label className="text-sm font-medium">Preferred date (must be after today)<input type="date" name="date" min={tomorrow} value={form.date} onChange={(e) => setField('date', e.target.value)} className="mt-2 w-full rounded-full border border-nb-line bg-white px-4 py-3 outline-none focus:border-nb-teal" /></label>
            <fieldset className="md:col-span-2">
              <legend className="text-sm font-medium">Available times (WAT)</legend>
              {!form.doctorId || !form.date ? (
                <p className="mt-2 text-sm text-nb-ink/60">Select a doctor and a future date to see available 30-minute times.</p>
              ) : slotsLoading ? (
                <p className="mt-2 text-sm text-nb-ink/60">Loading available times…</p>
              ) : slotsError ? (
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <p role="alert" className="text-sm text-red-600">{slotsError}</p>
                  <button type="button" onClick={() => setSlotsAttempt((n) => n + 1)} className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-nb-teal ring-1 ring-nb-line">Retry</button>
                </div>
              ) : slots.length === 0 ? (
                <p className="mt-2 text-sm text-nb-ink/60">No times are available on this date. Please choose another date.</p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Available times">
                  {slots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      role="radio"
                      aria-checked={form.slotId === slot.id}
                      onClick={() => setField('slotId', slot.id)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${form.slotId === slot.id ? 'bg-nb-teal text-white' : 'bg-white text-nb-teal ring-1 ring-nb-line'}`}
                    >
                      {slot.display}
                    </button>
                  ))}
                </div>
              )}
            </fieldset>
            <div className="md:col-span-2">
              <button disabled={saving} type="submit" className="rounded-full bg-nb-clay px-6 py-3 font-semibold text-white disabled:opacity-60">{saving ? 'Saving request…' : 'Request appointment'}</button>
              {activeTab === 'book new' && error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
