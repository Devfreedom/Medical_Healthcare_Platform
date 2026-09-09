import { useState } from 'react';
import { appointments, pastAppointments } from '../../data/appointments';
import StatusBadge from './StatusBadge';

export default function AppointmentsView() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    reason: 'Follow-up',
    provider: 'Dr. Amara Odum',
    visitType: 'video',
    date: '2026-09-16',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSubmitted(false);
    setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const today = new Date().toISOString().slice(0, 10);
    if (form.date <= today) {
      setSubmitted(false);
      setError('Please choose a future date for your appointment.');
      return;
    }

    setError('');
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        {['upcoming', 'past', 'book new'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              activeTab === tab
                ? 'bg-nb-teal text-white'
                : 'bg-white text-nb-teal ring-1 ring-nb-line'
            }`}
          >
            {tab === 'book new' ? 'Book new' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="flex flex-col gap-3 rounded-2xl border border-nb-line bg-white p-4 shadow-[0_12px_24px_rgba(19,42,44,0.04)] md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-nb-sand font-semibold text-nb-teal">
                  {appointment.provider.split(' ').map((part) => part[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <div className="font-semibold text-nb-ink">{appointment.provider}</div>
                  <div className="text-sm text-nb-ink/65">{appointment.reason}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 md:gap-5">
                <div className="text-sm text-nb-ink/70">
                  <div>{appointment.date}</div>
                  <div>{appointment.time}</div>
                </div>
                <StatusBadge status={appointment.type} />
                <button type="button" className="rounded-full border border-nb-line bg-white px-4 py-2 text-sm font-semibold text-nb-teal">
                  Reschedule
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'past' && (
        <div className="space-y-4">
          {pastAppointments.map((appointment) => (
            <div key={appointment.id} className="flex flex-col gap-3 rounded-2xl border border-nb-line bg-white p-4 shadow-[0_12px_24px_rgba(19,42,44,0.04)] md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-nb-sand font-semibold text-nb-teal">
                  {appointment.provider.split(' ').map((part) => part[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <div className="font-semibold text-nb-ink">{appointment.provider}</div>
                  <div className="text-sm text-nb-ink/65">{appointment.reason}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 md:gap-5">
                <div className="text-sm text-nb-ink/70">
                  <div>{appointment.date}</div>
                  <div>{appointment.time}</div>
                </div>
                <StatusBadge status={appointment.status} />
                <button type="button" className="text-sm font-semibold text-nb-clay">
                  View summary
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'book new' && (
        <div className="rounded-2xl border border-nb-line bg-nb-sand p-5 shadow-[0_12px_24px_rgba(19,42,44,0.04)]">
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="appointment-reason" className="mb-2 block text-sm font-medium text-nb-ink">Reason</label>
              <select id="appointment-reason" name="reason" value={form.reason} onChange={handleChange} className="w-full rounded-full border border-nb-line bg-white px-4 py-3 text-nb-ink outline-none focus:border-nb-teal">
                <option>Follow-up</option>
                <option>Annual wellness</option>
                <option>New concern</option>
                <option>Medication review</option>
              </select>
            </div>
            <div>
              <label htmlFor="appointment-provider" className="mb-2 block text-sm font-medium text-nb-ink">Provider</label>
              <select id="appointment-provider" name="provider" value={form.provider} onChange={handleChange} className="w-full rounded-full border border-nb-line bg-white px-4 py-3 text-nb-ink outline-none focus:border-nb-teal">
                <option>Dr. Amara Odum</option>
                <option>Dr. Marcus Kane</option>
                <option>Dr. Elena Marx</option>
              </select>
            </div>
            <div>
              <label htmlFor="appointment-visit-type" className="mb-2 block text-sm font-medium text-nb-ink">Visit type</label>
              <select id="appointment-visit-type" name="visitType" value={form.visitType} onChange={handleChange} className="w-full rounded-full border border-nb-line bg-white px-4 py-3 text-nb-ink outline-none focus:border-nb-teal">
                <option value="video">Video</option>
                <option value="in-person">In person</option>
              </select>
            </div>
            <div>
              <label htmlFor="appointment-date" className="mb-2 block text-sm font-medium text-nb-ink">Preferred date</label>
              <input id="appointment-date" type="date" name="date" value={form.date} onChange={handleChange} className="w-full rounded-full border border-nb-line bg-white px-4 py-3 text-nb-ink outline-none focus:border-nb-teal" />
            </div>

            <div className="md:col-span-2">
              <button type="submit" className="rounded-full bg-nb-clay px-6 py-3 font-semibold text-white transition hover:bg-nb-clay-dark">
                Request appointment
              </button>
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
              {submitted && (
                <p className="mt-3 rounded-2xl bg-status-ok-bg px-4 py-3 text-sm font-medium text-status-ok">
                  Appointment request received. Our team will confirm shortly.
                </p>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
