import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import MiniCalendar from './MiniCalendar';
import StatCard from './StatCard';
import StatusBadge from './StatusBadge';

export default function DashboardView({ user, onNavigate }) {
  const [appointments, setAppointments] = useState([]);
  const [messageCount, setMessageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    Promise.all([api('/api/appointments'), api('/api/messages')])
      .then(([apptResult, msgResult]) => {
        if (cancelled) return;
        setAppointments(apptResult.appointments || []);
        const threads = msgResult.threads || [];
        setMessageCount(threads.reduce((total, thread) => total + (thread.messages?.length || 0), 0));
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const firstName = user?.name?.split(' ').filter(Boolean)[0] || user?.email || 'there';
  const upcoming = appointments.filter((appointment) => appointment.status !== 'completed');
  const nextAppointment = upcoming[0];

  if (loading) {
    return <div className="rounded-2xl border border-nb-line bg-white p-8 text-center text-sm text-nb-ink/60">Loading your dashboard…</div>;
  }

  if (error) {
    return <div role="alert" className="rounded-2xl bg-status-danger-bg p-4 text-sm text-status-danger">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-4xl tracking-[-0.04em] text-nb-teal">Welcome back, {firstName}</h2>
          <p className="mt-2 text-base text-nb-ink/70">Here&apos;s what&apos;s happening with your care.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Upcoming appointments" value={String(upcoming.length)} />
        <StatCard label="Total appointments" value={String(appointments.length)} />
        <StatCard label="Messages" value={String(messageCount)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-nb-line bg-white p-5 shadow-[0_12px_24px_rgba(19,42,44,0.04)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-nb-teal">Upcoming appointments</h3>
              <button
                type="button"
                onClick={() => onNavigate?.('appointments')}
                className="rounded-full bg-nb-sand px-4 py-2 text-sm font-semibold text-nb-teal"
              >
                View all
              </button>
            </div>

            {!nextAppointment ? (
              <div className="rounded-2xl bg-nb-sand p-6 text-center">
                <p className="font-semibold text-nb-ink">No upcoming appointments</p>
                <p className="mt-1 text-sm text-nb-ink/65">Request one and it will appear here.</p>
                <button
                  type="button"
                  onClick={() => onNavigate?.('appointments')}
                  className="mt-4 rounded-full bg-nb-teal px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Request an appointment
                </button>
              </div>
            ) : (
              <div className="rounded-2xl bg-nb-sand p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white font-semibold text-nb-teal">
                      {nextAppointment.provider.split(' ').map((part) => part[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <div className="font-semibold text-nb-ink">{nextAppointment.provider}</div>
                      <div className="text-sm text-nb-ink/65">{nextAppointment.reason}</div>
                    </div>
                  </div>
                  <StatusBadge status={nextAppointment.status} />
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-nb-ink/75">
                  <span>{nextAppointment.date}</span>
                  <span>{nextAppointment.time}</span>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-nb-line bg-white p-5 shadow-[0_12px_24px_rgba(19,42,44,0.04)]">
            <h3 className="mb-2 text-xl font-semibold text-nb-teal">Results</h3>
            <p className="text-sm text-nb-ink/65">
              Lab results will appear here once connected during the backend phase. Coming soon.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <MiniCalendar appointmentDates={appointments.map((appointment) => appointment.date)} />

          <div className="rounded-2xl border border-nb-line bg-white p-5 shadow-[0_12px_24px_rgba(19,42,44,0.04)]">
            <h3 className="mb-2 text-xl font-semibold text-nb-teal">Messages</h3>
            <p className="text-sm text-nb-ink/65">
              {messageCount === 0
                ? 'No messages yet. Your care team conversation will appear under Messages.'
                : `${messageCount} message${messageCount === 1 ? '' : 's'} in your inbox.`}
            </p>
            <button
              type="button"
              onClick={() => onNavigate?.('messages')}
              className="mt-4 rounded-full bg-nb-sand px-4 py-2 text-sm font-semibold text-nb-teal"
            >
              Open messages
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
