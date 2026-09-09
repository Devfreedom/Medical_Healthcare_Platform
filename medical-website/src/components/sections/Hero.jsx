import { useState } from 'react';

const initialForm = {
  fullName: '',
  email: '',
  appointmentDate: '',
};

export default function Hero() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setSubmitted(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    const today = new Date().toISOString().slice(0, 10);

    if (!form.fullName.trim()) nextErrors.fullName = 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (!form.service) nextErrors.service = 'Please select a service.';
    if (!form.appointmentDate || form.appointmentDate <= today) {
      nextErrors.appointmentDate = 'Please choose a future appointment date.';
    }

    setErrors(nextErrors);
    setSubmitted(Object.keys(nextErrors).length === 0);
  };

  return (
    <section className="mx-auto max-w-content px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="grid items-stretch gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-nb-sand via-nb-line to-nb-paper shadow-[0_24px_60px_rgba(19,42,44,0.08)]">
          <div className="relative flex min-h-[420px] items-end justify-between p-6 sm:p-8 lg:min-h-[520px]">
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/50 via-black/15 to-transparent">
              <span className="text-center text-sm font-medium uppercase tracking-[0.18em] text-white/80">
                [Photo: physician with patient and family]
              </span>
            </div>

            <div className="absolute left-6 top-6 max-w-[70%] rounded-xl bg-black/20 px-4 py-3 backdrop-blur-sm sm:left-8 sm:top-8">
              <h1 className="font-serif text-4xl leading-none tracking-[-0.04em] text-nb-paper sm:text-5xl lg:text-[4rem]">
                <span className="block">Healthcare</span>
                <span className="block">Redefined</span>
                <span className="block">by Trust</span>
              </h1>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <div className="max-w-md rounded-xl bg-gradient-to-t from-black/60 to-transparent p-3 sm:p-4">
                <p className="text-sm leading-6 text-white/90 sm:text-base">
                  Compassionate care backed by experienced physicians, advanced diagnostics, and modern treatment plans for every stage of life.
                </p>
              </div>
            </div>

            <div className="absolute bottom-6 right-6 z-10 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-nb-teal shadow-lg">
              <span className="mr-2 inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              24/7 Support
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] bg-nb-teal-dark p-6 text-white shadow-[0_24px_60px_rgba(10,43,44,0.12)] sm:p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/65">Book a visit</p>
            <h2 className="mt-3 font-serif text-3xl leading-none tracking-[-0.04em] text-white">Meet with a care team</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm text-white/80">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={handleChange}
                className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-white/40"
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm text-white/80">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-white/40"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="appointmentDate" className="mb-2 block text-sm text-white/80">
                Appointment Date
              </label>
              <input
                id="appointmentDate"
                name="appointmentDate"
                type="date"
                value={form.appointmentDate}
                onChange={handleChange}
                className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/40"
                required
              />
            </div>

            <button type="submit" className="w-full rounded-full bg-nb-clay px-6 py-3 font-semibold text-white transition hover:bg-nb-clay-dark">
              Book Appointment
            </button>

            {submitted && (
              <p className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                Appointment request received. Our team will reach out shortly.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
