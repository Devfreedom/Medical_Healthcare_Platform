import { useState } from 'react';
import { ArrowRight, CalendarDays, Check, CheckCircle2, LockKeyhole, ShieldCheck } from 'lucide-react';

const initialForm = {
  fullName: '',
  email: '',
  service: '',
  appointmentDate: '',
};

const trustIndicators = [
  { icon: ShieldCheck, label: 'Trusted healthcare professionals' },
  { icon: LockKeyhole, label: 'Secure patient information' },
  { icon: CheckCircle2, label: 'Patient-centered care' },
];

export default function Hero() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
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
    <section className="mx-auto max-w-content px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pb-24 lg:pt-20">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)] lg:items-start lg:gap-12">
        <div className="min-w-0">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-nb-clay sm:text-sm">Healthcare redefined by trust</p>
            <h1 className="mt-5 max-w-2xl font-serif text-[clamp(2.75rem,6vw,4.75rem)] leading-[0.98] tracking-[-0.045em] text-nb-teal">Healthcare, built around you.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-nb-ink/70 sm:text-xl">Connect with trusted healthcare professionals, schedule appointments, and get the care you need—all in one place.</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#appointment-form" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-nb-clay px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(184,92,56,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-nb-clay-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nb-teal">
                Book an Appointment
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#care-categories" className="inline-flex min-h-11 items-center justify-center rounded-full border border-nb-teal px-6 py-3 text-sm font-semibold text-nb-teal transition duration-200 hover:-translate-y-0.5 hover:bg-nb-sand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nb-teal">Find a Doctor</a>
            </div>

            <div className="mt-8 grid gap-3 border-t border-nb-line pt-6 sm:grid-cols-3 sm:gap-5">
              {trustIndicators.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-start gap-2 text-sm leading-5 text-nb-ink/70"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-nb-sage" /><span>{label}</span></div>
              ))}
            </div>
          </div>

          <div className="relative mt-10 overflow-hidden rounded-2xl border border-nb-line bg-nb-sand shadow-[0_18px_40px_rgba(19,42,44,0.08)] sm:mt-12">
            <div className="aspect-[5/4] sm:aspect-[4/3]">
              <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=85" alt="Healthcare professional speaking with a patient in a bright clinic" className="h-full w-full object-cover object-center transition duration-500 hover:scale-[1.02]" />
            </div>
            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2.5 text-sm font-semibold text-nb-teal shadow-lg sm:bottom-6 sm:left-6"><Check className="h-4 w-4 text-nb-sage" />Verified care team</div>
          </div>
        </div>

        <div id="appointment-form" className="rounded-2xl border border-nb-line bg-white p-6 shadow-[0_18px_40px_rgba(19,42,44,0.08)] sm:p-8">
          <div className="mb-7">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-pastel-tan text-pastel-tan-ink"><CalendarDays className="h-5 w-5" /></div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-nb-clay">Start here</p>
            <h2 className="mt-2 font-serif text-3xl leading-tight tracking-[-0.035em] text-nb-teal">Meet with a care team</h2>
            <p className="mt-3 text-sm leading-6 text-nb-ink/65">Start your care journey with a convenient appointment.</p>
          </div>

          <form id="hero-booking-form" onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="hero-full-name" className="mb-2 block text-sm font-medium text-nb-ink">Full name</label>
              <input id="hero-full-name" name="fullName" type="text" value={form.fullName} onChange={handleChange} placeholder="Enter your full name" aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? 'hero-full-name-error' : undefined} className={`w-full rounded-xl border bg-nb-paper px-4 py-3 text-sm text-nb-ink outline-none transition focus:border-nb-teal focus:ring-2 focus:ring-nb-teal/10 ${errors.fullName ? 'border-status-danger' : 'border-nb-line'}`} />
              {errors.fullName && <p id="hero-full-name-error" className="mt-1.5 text-sm text-status-danger">{errors.fullName}</p>}
            </div>
            <div>
              <label htmlFor="hero-email" className="mb-2 block text-sm font-medium text-nb-ink">Email address</label>
              <input id="hero-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'hero-email-error' : undefined} className={`w-full rounded-xl border bg-nb-paper px-4 py-3 text-sm text-nb-ink outline-none transition focus:border-nb-teal focus:ring-2 focus:ring-nb-teal/10 ${errors.email ? 'border-status-danger' : 'border-nb-line'}`} />
              {errors.email && <p id="hero-email-error" className="mt-1.5 text-sm text-status-danger">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="hero-service" className="mb-2 block text-sm font-medium text-nb-ink">Service</label>
              <select id="hero-service" name="service" value={form.service} onChange={handleChange} aria-invalid={Boolean(errors.service)} aria-describedby={errors.service ? 'hero-service-error' : undefined} className={`w-full rounded-xl border bg-nb-paper px-4 py-3 text-sm text-nb-ink outline-none transition focus:border-nb-teal focus:ring-2 focus:ring-nb-teal/10 ${errors.service ? 'border-status-danger' : 'border-nb-line'}`}>
                <option value="">Select a service</option><option value="primary-care">Primary care</option><option value="specialist-care">Specialist care</option><option value="wellness">Wellness and prevention</option><option value="telehealth">Telehealth</option>
              </select>
              {errors.service && <p id="hero-service-error" className="mt-1.5 text-sm text-status-danger">{errors.service}</p>}
            </div>
            <div>
              <label htmlFor="hero-appointment-date" className="mb-2 block text-sm font-medium text-nb-ink">Preferred date</label>
              <input id="hero-appointment-date" name="appointmentDate" type="date" min={new Date().toISOString().slice(0, 10)} value={form.appointmentDate} onChange={handleChange} aria-invalid={Boolean(errors.appointmentDate)} aria-describedby={errors.appointmentDate ? 'hero-date-error' : undefined} className={`w-full rounded-xl border bg-nb-paper px-4 py-3 text-sm text-nb-ink outline-none transition focus:border-nb-teal focus:ring-2 focus:ring-nb-teal/10 ${errors.appointmentDate ? 'border-status-danger' : 'border-nb-line'}`} />
              {errors.appointmentDate && <p id="hero-date-error" className="mt-1.5 text-sm text-status-danger">{errors.appointmentDate}</p>}
            </div>
            <button type="submit" className="min-h-11 w-full rounded-full bg-nb-clay px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-nb-clay-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nb-teal">Book an Appointment</button>
            {submitted && <p role="status" className="rounded-2xl bg-status-ok-bg px-4 py-3 text-sm leading-6 text-status-ok">Appointment request received. Our team will reach out shortly.</p>}
            <p className="text-center text-xs leading-5 text-nb-ink/55">No commitment required. Our team will confirm the best next step.</p>
          </form>
        </div>
      </div>
    </section>
  );
}
