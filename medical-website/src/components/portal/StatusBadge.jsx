const statusStyles = {
  confirmed: 'bg-status-ok-bg text-status-ok',
  pending: 'bg-status-warn-bg text-status-warn',
  urgent: 'bg-status-danger-bg text-status-danger',
  normal: 'bg-status-info-bg text-status-info',
  review: 'bg-status-warn-bg text-status-warn',
  paid: 'bg-status-ok-bg text-status-ok',
  due: 'bg-status-warn-bg text-status-warn',
  upcoming: 'bg-status-info-bg text-status-info',
  video: 'bg-status-info-bg text-status-info',
  'in-person': 'bg-status-ok-bg text-status-ok',
  completed: 'bg-status-ok-bg text-status-ok',
};

const labels = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  urgent: 'Urgent',
  normal: 'Normal',
  review: 'Needs review',
  paid: 'Paid',
  due: 'Due',
  upcoming: 'Upcoming',
  video: 'Video',
  'in-person': 'In person',
  completed: 'Completed',
};

export default function StatusBadge({ status }) {
  const style = statusStyles[status] || 'bg-nb-sand text-nb-teal';
  const label = labels[status] || status;

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}>{label}</span>;
}
