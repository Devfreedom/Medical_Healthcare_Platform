export default function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-nb-line bg-white p-5 shadow-[0_12px_24px_rgba(19,42,44,0.04)]">
      <div className="text-3xl font-bold tracking-[-0.04em] text-nb-teal">{value}</div>
      <div className="mt-2 text-sm text-nb-ink/70">{label}</div>
    </div>
  );
}
