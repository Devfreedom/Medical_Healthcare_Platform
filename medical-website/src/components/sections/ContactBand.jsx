import { useState } from 'react';

const initialState = {
  fullName: '',
  email: '',
  reason: 'For businesses',
};

export default function ContactBand() {
  const [form, setForm] = useState(initialState);
  const [sent, setSent] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // No backend yet — honest local confirmation, not a real submission.
    setSent(true);
  };

  return (
    <section id="contact-section" className="overflow-hidden bg-maven-pine-dark pb-14 pt-12 text-white">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-maven-butter">Talk to our team</p>
            <h2 className="mt-3 font-serif text-4xl leading-[1.05] text-white sm:text-5xl">
              Request information
            </h2>
            <p className="mt-4 max-w-md text-base leading-7 text-white/70">Learn how Northbridge general healthcare can work for your people — for businesses and employees.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/register" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/register'); window.dispatchEvent(new PopStateEvent('popstate')); }} className="rounded-full bg-maven-clay px-6 py-3 text-sm font-semibold text-white transition hover:bg-maven-clay-dark">For businesses</a>
              <a href="/register" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/register'); window.dispatchEvent(new PopStateEvent('popstate')); }} className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-maven-pine">For employees</a>
            </div>
          </div>
          <div className="rounded-[1.75rem] bg-white p-6 text-maven-pine shadow-[0_24px_60px_rgba(0,0,0,0.25)] sm:p-8">

            {sent ? (
              <p role="status" className="rounded-2xl bg-[#F4F8F6] px-4 py-6 text-center text-sm leading-6 text-[#0A2E28]">
                Thanks — your request has been noted in this prototype. Our team contact form
                will be connected during the backend phase.
              </p>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="contactName" className="mb-2 block text-sm font-medium">Full name</label>
                <input
                  id="contactName"
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-maven-line bg-maven-paper px-4 py-3 outline-none transition focus:border-maven-pine"
                  placeholder="Jane Doe"
                  required
                />
              </div>

              <div>
                <label htmlFor="contactEmail" className="mb-2 block text-sm font-medium">Work email</label>
                <input
                  id="contactEmail"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-maven-line bg-maven-paper px-4 py-3 outline-none transition focus:border-maven-pine"
                  placeholder="jane@company.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="reason" className="mb-2 block text-sm font-medium">I am interested as</label>
                <select
                  id="reason"
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-maven-line bg-maven-paper px-4 py-3 outline-none transition focus:border-maven-pine"
                >
                  <option>For businesses</option>
                  <option>For employees</option>
                  <option>For health plans</option>
                  <option>For individuals</option>
                </select>
              </div>

              <button type="submit" className="w-full rounded-full bg-maven-pine px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-maven-pine-dark">
                Request information
              </button>
              <p className="text-center text-xs text-maven-pine/55">Prototype form — connected submission arrives with the backend.</p>
            </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
