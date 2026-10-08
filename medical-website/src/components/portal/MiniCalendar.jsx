const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Dynamic month view: always shows the current month with the real today
// highlighted. Appointment dates (YYYY-MM-DD) are highlighted when provided;
// otherwise it is a plain calendar with no fabricated markers.
export default function MiniCalendar({ appointmentDates = [] }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const monthLabel = now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const marked = new Set(appointmentDates);
  const cells = [];

  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push({ key: `pad-${i}`, day: null });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({ key: iso, day, isToday: day === today, hasAppointment: marked.has(iso) });
  }

  return (
    <div className="rounded-2xl border border-nb-line bg-white p-5 shadow-[0_12px_24px_rgba(19,42,44,0.04)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-nb-teal">{monthLabel}</h3>
        <span className="rounded-full bg-nb-sand px-2 py-1 text-xs font-semibold text-nb-teal">Today</span>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs text-nb-ink/60">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1">{day}</div>
        ))}

        {cells.map((cell) => {
          if (cell.day === null) {
            return <div key={cell.key} className="py-2" aria-hidden="true" />;
          }

          return (
            <div key={cell.key} className="flex items-center justify-center py-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  cell.isToday
                    ? 'bg-nb-teal text-white'
                    : cell.hasAppointment
                      ? 'bg-nb-sand text-nb-teal'
                      : 'text-nb-ink'
                }`}
              >
                {cell.day}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
