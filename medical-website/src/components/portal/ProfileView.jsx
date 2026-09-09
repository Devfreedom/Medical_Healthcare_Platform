export default function ProfileView() {
  return (
    <div className="rounded-2xl border border-nb-line bg-white p-5 shadow-[0_12px_24px_rgba(19,42,44,0.04)]">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-nb-sand font-semibold text-nb-teal">
          JR
        </div>
        <div>
          <div className="text-lg font-semibold text-nb-ink">Jordan Reyes</div>
          <div className="text-sm text-nb-ink/60">Patient profile</div>
        </div>
      </div>

      <form className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-nb-ink">Full name</label>
            <input type="text" defaultValue="Jordan Reyes" className="w-full rounded-full border border-nb-line bg-nb-paper px-4 py-3 outline-none focus:border-nb-teal" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-nb-ink">Date of birth</label>
            <input type="text" defaultValue="04/18/1992" className="w-full rounded-full border border-nb-line bg-nb-paper px-4 py-3 outline-none focus:border-nb-teal" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-nb-ink">Phone</label>
            <input type="text" defaultValue="(415) 555-0142" className="w-full rounded-full border border-nb-line bg-nb-paper px-4 py-3 outline-none focus:border-nb-teal" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-nb-ink">Email</label>
            <input type="email" defaultValue="jordan.reyes@example.com" className="w-full rounded-full border border-nb-line bg-nb-paper px-4 py-3 outline-none focus:border-nb-teal" />
          </div>
        </div>

        <div className="rounded-2xl border border-nb-line bg-nb-paper p-4">
          <h3 className="mb-4 text-lg font-semibold text-nb-teal">Notification preferences</h3>
          <div className="space-y-3 text-sm text-nb-ink/75">
            <label className="flex items-center justify-between gap-3">
              <span>Appointment reminders</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-nb-line" />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span>Test result notices</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-nb-line" />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span>Billing updates</span>
              <input type="checkbox" className="h-4 w-4 rounded border-nb-line" />
            </label>
          </div>
        </div>

        <button type="submit" className="rounded-full bg-nb-teal px-6 py-3 font-semibold text-white">
          Save changes
        </button>
      </form>
    </div>
  );
}
