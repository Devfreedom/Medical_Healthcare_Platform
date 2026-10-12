import { useEffect, useMemo, useState } from 'react';
import { Calendar, Home, LogOut } from 'lucide-react';
import { api } from '../../lib/api';
import StatusBadge from '../../components/portal/StatusBadge';
import StatCard from '../../components/portal/StatCard';

function appointmentTime(appointment) {
  if (appointment.scheduledTime) return appointment.scheduledTime;
  return appointment.time;
}

export default function DoctorPortal({ user, onLogout, onBack }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [actingId, setActingId] = useState('');
  const [filter, setFilter] = useState('pending');
  const [loadAttempt, setLoadAttempt] = useState(0);

  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState('');
  const [slotsAttempt, setSlotsAttempt] = useState(0);
  const [pubForm, setPubForm] = useState({ date: '', startTime: '', endTime: '' });
  const [publishing, setPublishing] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    setLoadAttempt((attempt) => attempt + 1);
  };

  useEffect(() => {
    let cancelled = false;

    api('/api/doctor/appointments')
      .then((result) => {
        if (!cancelled) setAppointments(result.appointments || []);
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [loadAttempt]);

  useEffect(() => {
    let cancelled = false;
    api('/api/doctor/availability')
      .then((result) => {
        if (!cancelled) setSlots(result.slots || []);
      })
      .catch((requestError) => {
        if (!cancelled) setSlotsError(requestError.message);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => { cancelled = true; };
  }, [slotsAttempt]);

  const pending = useMemo(
    () => appointments.filter((appointment) => appointment.status === 'pending'),
    [appointments],
  );
  const decided = useMemo(
    () => appointments.filter((appointment) => appointment.status !== 'pending'),
    [appointments],
  );
  const list = filter === 'all' ? appointments : filter === 'decided' ? decided : pending;

  const transition = async (id, status) => {
    setActingId(id);
    setError('');
    setNotice('');
    try {
      const result = await api(`/api/doctor/appointments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === id ? result.appointment : appointment,
        ),
      );
      setNotice(`Request ${status}. The patient will see the update on refresh.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setActingId('');
    }
  };

  const publish = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setPublishing(true);
    try {
      const result = await api('/api/doctor/availability', {
        method: 'POST',
        body: JSON.stringify(pubForm),
      });
      setSlots((current) => [...current, ...(result.slots || [])].sort((a, b) => (a.startsAt < b.startsAt ? -1 : 1)));
      setPubForm({ date: '', startTime: '', endTime: '' });
      setNotice(`Published ${(result.slots || []).length} slot(s). Patients can now book them.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPublishing(false);
    }
  };

  const retrySlots = () => {
    setSlotsError('');
    setSlotsLoading(true);
    setSlotsAttempt((n) => n + 1);
  };

  const withdraw = async (id) => {
    setWithdrawingId(id);
    setError('');
    setNotice('');
    try {
      const result = await api(`/api/doctor/availability/${id}/deactivate`, { method: 'PATCH' });
      setSlots((current) => current.map((slot) => (slot.id === id ? result.slot : slot)));
      setNotice('Slot withdrawn. It will no longer appear for booking.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setWithdrawingId('');
    }
  };

  return (
    <div className="min-h-screen bg-nb-paper text-nb-ink">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 border-b border-nb-line pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-nb-teal/60">Doctor portal</p>
            <h1 className="mt-2 font-serif text-4xl tracking-[-0.04em] text-nb-teal">
              Welcome, {user?.name || user?.email}
            </h1>
            <p className="mt-2 text-sm text-nb-ink/65">
              Review appointment requests assigned to you.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-full border border-nb-line bg-white px-4 py-2 text-sm font-medium text-nb-teal hover:bg-nb-sand">
              <Home className="h-4 w-4" />
              Homepage
            </button>
            <button type="button" onClick={onLogout} className="inline-flex items-center gap-2 rounded-full bg-nb-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90">
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>

        {notice && <p role="status" className="mb-4 rounded-2xl bg-status-ok-bg px-4 py-3 text-sm font-medium text-status-ok">{notice}</p>}
        {error && (
          <div role="alert" className="mb-4 rounded-2xl bg-status-danger-bg p-4 text-sm text-status-danger">
            {error}
            <button type="button" onClick={load} className="ml-4 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-nb-teal ring-1 ring-nb-line">
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-nb-line bg-white p-8 text-center text-sm text-nb-ink/60">Loading your requests…</div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard label="Pending requests" value={String(pending.length)} />
              <StatCard label="Decided" value={String(decided.length)} />
              <StatCard label="Total assigned" value={String(appointments.length)} />
            </div>

            <div className="mt-6 flex flex-wrap gap-3" role="tablist" aria-label="Request filters">
              {[
                { id: 'pending', label: 'Pending' },
                { id: 'decided', label: 'Decided' },
                { id: 'all', label: 'All' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold ${filter === tab.id ? 'bg-nb-teal text-white' : 'bg-white text-nb-teal ring-1 ring-nb-line'}`}
                >
                  {tab.label}
                </button>
              ))}
              <button
                type="button"
                onClick={load}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-nb-teal ring-1 ring-nb-line"
              >
                <Calendar className="h-4 w-4" />
                Refresh
              </button>
            </div>

            {list.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-nb-line bg-white p-10 text-center">
                <h3 className="font-semibold text-nb-ink">
                  {filter === 'pending' ? 'No pending requests' : 'Nothing here yet'}
                </h3>
                <p className="mt-2 text-sm text-nb-ink/60">
                  New patient requests assigned to you will appear here.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {list.map((appointment) => (
                  <div key={appointment.id} className="flex flex-col gap-3 rounded-2xl border border-nb-line bg-white p-4 shadow-[0_12px_24px_rgba(19,42,44,0.04)] md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-nb-sand font-semibold text-nb-teal">
                        {(appointment.patientName || '?').split(' ').map((part) => part[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <div className="font-semibold text-nb-ink">{appointment.patientName}</div>
                        <div className="text-sm text-nb-ink/65">
                          {appointment.reason} · {appointment.visitType === 'video' ? 'Video' : 'In person'} · {appointment.date} · {appointmentTime(appointment)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <StatusBadge status={appointment.status} />
                      {appointment.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            disabled={actingId === appointment.id}
                            onClick={() => transition(appointment.id, 'confirmed')}
                            className="rounded-full bg-nb-teal px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                          >
                            {actingId === appointment.id ? 'Saving…' : 'Confirm'}
                          </button>
                          <button
                            type="button"
                            disabled={actingId === appointment.id}
                            onClick={() => transition(appointment.id, 'rejected')}
                            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-status-danger ring-1 ring-nb-line disabled:opacity-60"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <section aria-label="Availability management" className="mt-10 rounded-2xl border border-nb-line bg-white p-5">
          <h2 className="font-serif text-2xl text-nb-teal">Availability (WAT)</h2>
          <p className="mt-1 text-sm text-nb-ink/65">Publish a future date and working window. Consecutive 30-minute slots are generated on :00/:30 boundaries.</p>
          <form onSubmit={publish} className="mt-4 grid gap-3 md:grid-cols-4">
            <label className="text-sm font-medium">Date<input type="date" value={pubForm.date} onChange={(e) => setPubForm((v) => ({ ...v, date: e.target.value }))} className="mt-2 w-full rounded-full border border-nb-line bg-white px-4 py-2.5 outline-none focus:border-nb-teal" /></label>
            <label className="text-sm font-medium">Start (HH:MM)<input type="time" step={1800} value={pubForm.startTime} onChange={(e) => setPubForm((v) => ({ ...v, startTime: e.target.value }))} className="mt-2 w-full rounded-full border border-nb-line bg-white px-4 py-2.5 outline-none focus:border-nb-teal" /></label>
            <label className="text-sm font-medium">End (HH:MM)<input type="time" step={1800} value={pubForm.endTime} onChange={(e) => setPubForm((v) => ({ ...v, endTime: e.target.value }))} className="mt-2 w-full rounded-full border border-nb-line bg-white px-4 py-2.5 outline-none focus:border-nb-teal" /></label>
            <div className="flex items-end">
              <button type="submit" disabled={publishing} className="rounded-full bg-nb-teal px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{publishing ? 'Publishing…' : 'Publish slots'}</button>
            </div>
          </form>
          <div className="mt-5">
            {slotsLoading ? (
              <p className="text-sm text-nb-ink/60">Loading your slots…</p>
            ) : slotsError ? (
              <div className="flex flex-wrap items-center gap-3">
                <p role="alert" className="text-sm text-status-danger">{slotsError}</p>
                <button type="button" onClick={retrySlots} className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-nb-teal ring-1 ring-nb-line">Retry</button>
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-nb-ink/60">No slots published yet.</p>
            ) : (
              <ul className="space-y-2">
                {slots.map((slot) => (
                  <li key={slot.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-nb-line bg-nb-paper px-4 py-2.5 text-sm">
                    <span>{slot.date} · {slot.display}{slot.isActive ? '' : ' · inactive'}</span>
                    {slot.isActive && (
                      <button type="button" disabled={withdrawingId === slot.id} onClick={() => withdraw(slot.id)} className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-status-danger ring-1 ring-nb-line disabled:opacity-60">
                        {withdrawingId === slot.id ? 'Withdrawing…' : 'Withdraw'}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
