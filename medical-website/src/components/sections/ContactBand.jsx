import { useState } from 'react';

const initialState = {
  fullName: '',
  phoneNumber: '',
  reason: 'General inquiry',
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
    <section className="mt-8 overflow-hidden bg-nb-teal-dark pb-14 pt-10 text-white">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <div className="grid items-end gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.75rem] bg-nb-teal-dark p-4 sm:p-6">
            <h2 className="font-serif text-4xl leading-tight tracking-[-0.04em] text-white sm:text-5xl">
              Get In Touch With Us Today
            </h2>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <div>
                <label htmlFor="contactName" className="mb-2 block text-sm text-white/80">Full Name</label>
                <input
                  id="contactName"
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-white/40"
                  placeholder="Jane Doe"
                  required
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="mb-2 block text-sm text-white/80">Phone Number</label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-white/40"
                  placeholder="(555) 123-4567"
                  required
                />
              </div>

              <div>
                <label htmlFor="reason" className="mb-2 block text-sm text-white/80">Reason</label>
                <select
                  id="reason"
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/40"
                >
                  <option className="text-nb-ink">General inquiry</option>
                  <option className="text-nb-ink">Primary care</option>
                  <option className="text-nb-ink">Specialist visit</option>
                  <option className="text-nb-ink">Emergency support</option>
                </select>
              </div>

              <button type="submit" className="rounded-full bg-nb-clay px-6 py-3 font-semibold text-white transition hover:bg-nb-clay-dark">
                Submit Request
              </button>
            </form>
          </div>

          <div className="-mt-12 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-nb-sand to-nb-line p-4 shadow-[0_24px_60px_rgba(9,19,20,0.2)]">
            <div className="flex min-h-[280px] items-center justify-center rounded-[1.15rem] border border-white/40 bg-gradient-to-br from-[#F4F0E7] to-[#C5D7D5] text-center text-sm font-medium uppercase tracking-[0.18em] text-nb-teal/80">
              [Photo: nurse with clipboard]
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
