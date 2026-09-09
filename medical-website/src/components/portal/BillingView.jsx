import { invoices } from '../../data/invoices';
import StatusBadge from './StatusBadge';

export default function BillingView() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
      <div className="rounded-2xl border border-nb-line bg-white p-5 shadow-[0_12px_24px_rgba(19,42,44,0.04)]">
        <h3 className="mb-4 text-xl font-semibold text-nb-teal">Statements</h3>

        <div className="overflow-hidden rounded-2xl border border-nb-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-nb-sand text-nb-ink/75">
              <tr>
                <th className="px-4 py-3 font-semibold">Visit</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-t border-nb-line bg-white">
                  <td className="px-4 py-3 text-nb-ink">{invoice.visit}</td>
                  <td className="px-4 py-3 text-nb-ink/70">{invoice.date}</td>
                  <td className="px-4 py-3 text-nb-ink/70">{invoice.amount}</td>
                  <td className="px-4 py-3"><StatusBadge status={invoice.status} /></td>
                  <td className="px-4 py-3">
                    <button type="button" className="text-sm font-semibold text-nb-clay">
                      {invoice.status === 'paid' ? 'View' : 'Pay now'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-nb-line bg-white p-5 shadow-[0_12px_24px_rgba(19,42,44,0.04)]">
        <h3 className="mb-4 text-xl font-semibold text-nb-teal">Insurance on file</h3>

        <div className="space-y-4 text-sm">
          <div>
            <div className="text-nb-ink/60">Plan</div>
            <div className="mt-1 font-medium text-nb-ink">BlueShield PPO</div>
          </div>
          <div>
            <div className="text-nb-ink/60">Member ID</div>
            <div className="mt-1 font-medium text-nb-ink">BS-450291</div>
          </div>
          <div>
            <div className="text-nb-ink/60">Group</div>
            <div className="mt-1 font-medium text-nb-ink">NBR-879</div>
          </div>
        </div>

        <button type="button" className="mt-6 rounded-full bg-nb-teal px-5 py-2.5 font-semibold text-white">
          Update insurance
        </button>
      </div>
    </div>
  );
}
