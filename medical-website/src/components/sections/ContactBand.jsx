import { useState } from 'react';

const initialState = {
  fullName: '',
  phoneNumber: '',
  reason: 'For businesses',
};

export default function ContactBand() {
  const [form, setForm] = useState(initialState);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    window.alert('Your request has been sent.');
  };

  return (
    <section id="contact-section" className="overflow-hidden bg-maven-pine-dark pb-14 pt-12 text-white">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-maven-butter">Bring benefits into the future</p>
            <h2 className="mt-3 font-serif text-4xl leading-[1.05] text-white sm:text-5xl">
              Book a demo with our team
            </h2>
            <p className="mt-4 max-w-md text-base leading-7 text-white/70">Discover how family health benefits can work for your people — for businesses and employees.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#appointment-form" className="rounded-full bg-maven-clay px-6 py-3 text-sm font-semibold text-white transition hover:bg-maven-clay-dark">For businesses</a>
              <a href="#appointment-form" className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-maven-pine">For employees</a>
            </div>
          </div>
          <div className="rounded-[1.75rem] bg-white p-6 text-maven-pine shadow-[0_24px_60px_rgba(0,0,0,0.25)] sm:p-8">

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
                <label htmlFor="phoneNumber" className="mb-2 block text-sm font-medium">Work email</label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={form.phoneNumber}
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
                Book a demo
              </button>
              <p className="text-center text-xs text-maven-pine/55">We will reply within one business day.</p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
