import { appointments } from '../../data/appointments';
import { careTeam } from '../../data/careTeam';
import { labResults } from '../../data/labResults';
import MiniCalendar from './MiniCalendar';
import StatCard from './StatCard';
import StatusBadge from './StatusBadge';

export default function DashboardView() {
  const nextAppointment = appointments[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-4xl tracking-[-0.04em] text-nb-teal">Welcome back, Jordan</h2>
          <p className="mt-2 text-base text-nb-ink/70">Here's what's happening with your care.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Upcoming appointment" value="1" />
        <StatCard label="Prescriptions to refill" value="2" />
        <StatCard label="Unread messages" value="3" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-nb-line bg-white p-5 shadow-[0_12px_24px_rgba(19,42,44,0.04)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-nb-teal">Upcoming appointments</h3>
              <button type="button" className="rounded-full bg-nb-sand px-4 py-2 text-sm font-semibold text-nb-teal">View all</button>
            </div>

            <div className="rounded-2xl bg-nb-sand p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white font-semibold text-nb-teal">
                    {nextAppointment.provider.split(' ').map((part) => part[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-nb-ink">{nextAppointment.provider}</div>
                    <div className="text-sm text-nb-ink/65">{nextAppointment.specialty}</div>
                  </div>
                </div>
                <StatusBadge status={nextAppointment.type} />
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-nb-ink/75">
                <span>{nextAppointment.date}</span>
                <span>{nextAppointment.time}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-nb-line bg-white p-5 shadow-[0_12px_24px_rgba(19,42,44,0.04)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-nb-teal">Recent results</h3>
              <button type="button" className="text-sm font-semibold text-nb-clay">See all</button>
            </div>

            <div className="space-y-3">
              {labResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between rounded-2xl bg-nb-paper p-3">
                  <div>
                    <div className="font-medium text-nb-ink">{result.name}</div>
                    <div className="text-sm text-nb-ink/60">{result.date}</div>
                  </div>
                  <StatusBadge status={result.status} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <MiniCalendar />

          <div className="rounded-2xl border border-nb-line bg-white p-5 shadow-[0_12px_24px_rgba(19,42,44,0.04)]">
            <h3 className="mb-4 text-xl font-semibold text-nb-teal">Care team</h3>
            <div className="space-y-3">
              {careTeam.map((member) => (
                <div key={member.id} className="flex items-center gap-3 rounded-2xl bg-nb-paper p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-nb-sand font-semibold text-nb-teal">
                    {member.initials}
                  </div>
                  <div>
                    <div className="font-medium text-nb-ink">{member.name}</div>
                    <div className="text-sm text-nb-ink/65">{member.specialty}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
