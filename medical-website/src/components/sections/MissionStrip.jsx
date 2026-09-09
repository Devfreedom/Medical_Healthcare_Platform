import { ArrowRight, HeartHandshake, ShieldCheck, Stethoscope } from 'lucide-react';

export default function MissionStrip() {
  return (
    <section className="mx-auto max-w-content px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
      <div className="grid items-center gap-10 rounded-3xl border border-nb-line bg-white p-5 shadow-[0_16px_36px_rgba(19,42,44,0.05)] sm:p-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14 lg:p-10">
        <div className="overflow-hidden rounded-2xl bg-nb-sand">
          <div className="aspect-[4/3]">
            <img
              src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=1200&q=85"
              alt="Doctor listening to a patient during a consultation"
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>

        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-nb-clay">Why Northbridge</p>
          <h2 className="mt-4 font-serif text-4xl leading-[1.02] tracking-[-0.04em] text-nb-teal sm:text-5xl">
            More than a platform. A partner in your care.
          </h2>
          <p className="mt-6 text-base leading-7 text-nb-ink/75 sm:text-lg">
            We connect people with thoughtful support, trusted professionals, and modern access to care, helping you move through every health decision with clarity and confidence.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { icon: HeartHandshake, label: 'Care that puts you first' },
              { icon: ShieldCheck, label: 'Trusted professionals' },
              { icon: Stethoscope, label: 'Connected healthcare' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-sm font-medium text-nb-ink/80">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pastel-green text-pastel-green-ink">
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </div>
            ))}
          </div>

          <button type="button" className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full border border-nb-teal px-6 py-3 font-semibold text-nb-teal transition hover:-translate-y-0.5 hover:bg-nb-teal hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nb-teal">
            Explore Our Story
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
