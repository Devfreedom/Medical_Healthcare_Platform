import { useState } from 'react';
import { ArrowRight, CalendarDays, Check, ShieldCheck, Sparkles, Video } from 'lucide-react';

const initialForm = {
  fullName: '',
  email: '',
  service: '',
  appointmentDate: '',
};

const audiencePills = ['For Employers', 'For Health Plans', 'For Individuals'];
const statItems = [
  { value: '30+', label: 'provider specialties' },
  { value: '24/7', label: 'virtual care access' },
  { value: '28M', label: 'lives supported' },
];

export default function Hero() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validateField = (name, values) => {
    const today = new Date().toISOString().slice(0, 10);

    switch (name) {
      case 'fullName':
        return values.fullName.trim() ? '' : 'Please enter your full name.';
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)
          ? ''
          : 'Please enter a valid email address.';
      case 'service':
        return values.service ? '' : 'Please select a service.';
      case 'appointmentDate':
        return values.appointmentDate && values.appointmentDate > today
          ? ''
          : 'Please choose a future appointment date.';
      default:
        return '';
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextForm = { ...form, [name]: value };

    setForm(nextForm);
    setSubmitted(false);

    if (touched[name]) {
      const nextError = validateField(name, nextForm);
      setErrors((prev) => ({ ...prev, [name]: nextError }));
    }
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    const nextForm = { ...form, [name]: value };

    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, nextForm) }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextTouched = {
      fullName: true,
      email: true,
      service: true,
      appointmentDate: true,
    };
    const nextErrors = {};

    Object.keys(nextTouched).forEach((field) => {
      const message = validateField(field, form);
      if (message) nextErrors[field] = message;
    });

    setTouched(nextTouched);
    setErrors(nextErrors);
    setSubmitted(Object.keys(nextErrors).length === 0);
  };

  return (
    <section id="top" className="relative overflow-hidden bg-maven-cream">
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-maven-butter/50 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 top-64 h-80 w-80 rounded-full bg-maven-sage/50 blur-3xl" />
      <div className="relative mx-auto max-w-content px-4 pb-14 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pb-20 lg:pt-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {audiencePills.map((pill) => (
              <span key={pill} className="rounded-full border border-maven-pine/15 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-maven-pine/70">{pill}</span>
            ))}
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl font-serif text-[clamp(2.6rem,6vw,4.6rem)] leading-[1.02] tracking-[-0.03em] text-maven-pine">
            The next generation of care for women and families
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-maven-pine/70">
            Expert, personal, proven care across fertility, maternity, parenting, and menopause — all in one platform.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#appointment-form" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-maven-pine px-7 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(10,60,46,0.3)] transition hover:-translate-y-0.5 hover:bg-maven-pine-dark sm:w-auto">
              Explore platform <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#care-categories" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-maven-clay px-7 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(232,93,63,0.3)] transition hover:-translate-y-0.5 hover:bg-maven-clay-dark sm:w-auto">
              Get care <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-maven-pine/60">
            <ShieldCheck className="h-4 w-4 text-maven-moss" /> Trusted by 2,300+ employers · Free with many plans
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)] lg:items-stretch">
          <div className="relative overflow-hidden rounded-[2rem] border border-maven-pine/10 bg-maven-pine shadow-[0_30px_60px_rgba(6,42,32,0.25)]">
            <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=85" alt="Clinician providing warm, personal care" className="h-[340px] w-full object-cover object-center sm:h-[420px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-maven-pine-dark/70 via-transparent to-transparent" />
            <div className="absolute left-4 right-4 top-4 flex flex-wrap gap-2 sm:left-6 sm:right-auto">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-2 text-xs font-semibold text-maven-pine"><Video className="h-3.5 w-3.5" /> 24/7 virtual visits</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-2 text-xs font-semibold text-maven-pine"><Sparkles className="h-3.5 w-3.5" /> Personal care plan</span>
            </div>
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
              <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl bg-white/95 p-4 backdrop-blur sm:p-5">
                {statItems.map(({ value, label }) => (
                  <div key={label}>
                    <div className="font-serif text-2xl font-semibold text-maven-pine sm:text-3xl">{value}</div>
                    <div className="text-xs font-medium uppercase tracking-[0.12em] text-maven-pine/60">{label}</div>
                  </div>
                ))}
                <div className="flex items-center gap-2 rounded-full bg-maven-sage px-4 py-2.5 text-xs font-semibold text-maven-pine"><Check className="h-4 w-4" /> Verified care team</div>
              </div>
            </div>
          </div>

        <div id="appointment-form" className="rounded-[2rem] border border-maven-line bg-white p-6 shadow-[0_24px_50px_rgba(6,42,32,0.12)] sm:p-8">
          <div className="mb-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-maven-butter text-maven-butter-ink"><CalendarDays className="h-5 w-5" /></div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-maven-clay">Get care</p>
            <h2 className="mt-2 font-serif text-[28px] leading-tight tracking-[-0.02em] text-maven-pine">Book your visit</h2>
            <p className="mt-2 text-sm leading-6 text-maven-pine/65">On-demand virtual care across 30+ specialties.</p>
          </div>

          <form id="hero-booking-form" onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="hero-full-name" className="mb-2 block text-sm font-medium text-nb-ink">Full name</label>
              <input id="hero-full-name" name="fullName" type="text" value={form.fullName} onChange={handleChange} onBlur={handleBlur} placeholder="Enter your full name" aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? 'hero-full-name-error' : undefined} className={`w-full rounded-xl border bg-nb-paper px-4 py-3 text-sm text-nb-ink outline-none transition focus:border-nb-teal focus:ring-2 focus:ring-nb-teal/10 ${errors.fullName ? 'border-status-danger' : 'border-nb-line'}`} />
              {touched.fullName && errors.fullName && <p id="hero-full-name-error" className="mt-1.5 text-sm text-status-danger">{errors.fullName}</p>}
            </div>
            <div>
              <label htmlFor="hero-email" className="mb-2 block text-sm font-medium text-nb-ink">Email address</label>
              <input id="hero-email" name="email" type="email" value={form.email} onChange={handleChange} onBlur={handleBlur} placeholder="you@example.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'hero-email-error' : undefined} className={`w-full rounded-xl border bg-nb-paper px-4 py-3 text-sm text-nb-ink outline-none transition focus:border-nb-teal focus:ring-2 focus:ring-nb-teal/10 ${errors.email ? 'border-status-danger' : 'border-nb-line'}`} />
              {touched.email && errors.email && <p id="hero-email-error" className="mt-1.5 text-sm text-status-danger">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="hero-service" className="mb-2 block text-sm font-medium text-nb-ink">Service</label>
              <select id="hero-service" name="service" value={form.service} onChange={handleChange} onBlur={handleBlur} aria-invalid={Boolean(errors.service)} aria-describedby={errors.service ? 'hero-service-error' : undefined} className={`w-full rounded-xl border bg-nb-paper px-4 py-3 text-sm text-nb-ink outline-none transition focus:border-nb-teal focus:ring-2 focus:ring-nb-teal/10 ${errors.service ? 'border-status-danger' : 'border-nb-line'}`}>
                <option value="">Select a program</option><option value="fertility">Fertility & family building</option><option value="maternity">Maternity & newborn</option><option value="parenting">Parenting & pediatrics</option><option value="menopause">Menopause & midlife</option>
              </select>
              {touched.service && errors.service && <p id="hero-service-error" className="mt-1.5 text-sm text-status-danger">{errors.service}</p>}
            </div>
            <div>
              <label htmlFor="hero-appointment-date" className="mb-2 block text-sm font-medium text-nb-ink">Preferred date</label>
              <input id="hero-appointment-date" name="appointmentDate" type="date" min={new Date().toISOString().slice(0, 10)} value={form.appointmentDate} onChange={handleChange} onBlur={handleBlur} aria-invalid={Boolean(errors.appointmentDate)} aria-describedby={errors.appointmentDate ? 'hero-date-error' : undefined} className={`w-full rounded-xl border bg-nb-paper px-4 py-3 text-sm text-nb-ink outline-none transition focus:border-nb-teal focus:ring-2 focus:ring-nb-teal/10 ${errors.appointmentDate ? 'border-status-danger' : 'border-nb-line'}`} />
              {touched.appointmentDate && errors.appointmentDate && <p id="hero-date-error" className="mt-1.5 text-sm text-status-danger">{errors.appointmentDate}</p>}
            </div>
            <button type="submit" className="min-h-11 w-full rounded-full bg-maven-clay px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-maven-clay-dark">Get care</button>
            {submitted && <p role="status" className="rounded-2xl bg-status-ok-bg px-4 py-3 text-sm leading-6 text-status-ok">Request received. Your care team will reach out shortly.</p>}
            <p className="text-center text-xs leading-5 text-maven-pine/55">Free with many employers + health plans. No commitment required.</p>
          </form>
        </div>
      </div>
      </div>
    </section>
  );
}
