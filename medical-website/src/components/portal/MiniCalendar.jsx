const days = [
  'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
];

const dates = [
  { day: 29, muted: true },
  { day: 30, muted: true },
  { day: 31, muted: true },
  { day: 1 },
  { day: 2 },
  { day: 3 },
  { day: 4 },
  { day: 5 },
  { day: 6 },
  { day: 7 },
  { day: 8 },
  { day: 9 },
  { day: 10, appointment: true },
  { day: 11 },
  { day: 12 },
  { day: 13 },
  { day: 14 },
  { day: 15 },
  { day: 16 },
  { day: 17 },
  { day: 18 },
  { day: 19 },
  { day: 20 },
  { day: 21 },
  { day: 22 },
  { day: 23 },
  { day: 24 },
  { day: 25 },
  { day: 26 },
  { day: 27 },
  { day: 28 },
];

export default function MiniCalendar() {
  return (
    <div className="rounded-2xl border border-nb-line bg-white p-5 shadow-[0_12px_24px_rgba(19,42,44,0.04)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-nb-teal">September 2026</h3>
        <span className="rounded-full bg-nb-sand px-2 py-1 text-xs font-semibold text-nb-teal">Today</span>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs text-nb-ink/60">
        {days.map((day) => (
          <div key={day} className="py-1">{day}</div>
        ))}

        {dates.map(({ day, muted, appointment }, index) => {
          const isToday = day === 10;

          return (
            <div key={`${day}-${index}`} className="flex items-center justify-center py-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  isToday
                    ? 'bg-nb-teal text-white'
                    : appointment
                      ? 'bg-nb-sand text-nb-teal'
                      : muted
                        ? 'text-nb-ink/30'
                        : 'text-nb-ink'
                }`}
              >
                {day}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
