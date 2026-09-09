export const appointments = [
  {
    id: 1,
    provider: 'Dr. Amara Odum',
    specialty: 'Cardiology',
    reason: 'Follow-up consultation',
    date: '2026-09-10',
    time: '10:30 AM',
    type: 'video',
    status: 'confirmed',
    past: false,
  },
  {
    id: 2,
    provider: 'Dr. Marcus Kane',
    specialty: 'Primary Care',
    reason: 'Annual wellness visit',
    date: '2026-09-14',
    time: '2:00 PM',
    type: 'in-person',
    status: 'pending',
    past: false,
  },
  {
    id: 3,
    provider: 'Dr. Elena Marx',
    specialty: 'Dermatology',
    reason: 'Skin check',
    date: '2026-09-19',
    time: '9:15 AM',
    type: 'video',
    status: 'confirmed',
    past: false,
  },
];

export const pastAppointments = [
  {
    id: 4,
    provider: 'Dr. Amara Odum',
    specialty: 'Cardiology',
    reason: 'Medication review',
    date: '2026-08-20',
    time: '11:00 AM',
    type: 'video',
    status: 'completed',
    past: true,
  },
  {
    id: 5,
    provider: 'Dr. Marcus Kane',
    specialty: 'Primary Care',
    reason: 'Lab follow-up',
    date: '2026-08-11',
    time: '3:45 PM',
    type: 'in-person',
    status: 'completed',
    past: true,
  },
];

export const visitHistory = [
  {
    id: 1,
    date: '2026-08-20',
    provider: 'Dr. Amara Odum',
    note: 'Reviewed blood pressure trends and adjusted care plan.',
  },
  {
    id: 2,
    date: '2026-07-15',
    provider: 'Dr. Marcus Kane',
    note: 'Discussed sleep quality and updated preventive guidance.',
  },
  {
    id: 3,
    date: '2026-06-02',
    provider: 'Dr. Elena Marx',
    note: 'Routine skin assessment; no concerning findings noted.',
  },
];
