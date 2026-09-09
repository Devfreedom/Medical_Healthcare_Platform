import { ArrowRight, HeartHandshake, ShieldCheck, Stethoscope } from 'lucide-react';

export default function MissionStrip() {
  return (
    <section className="mx-auto max-w-content px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
      <div className="grid gap-7 rounded-3xl border border-nb-line bg-white p-5 shadow-[0_16px_36px_rgba(19,42,44,0.05)] sm:p-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-x-14 lg:gap-y-6 lg:p-10">
        <div className="order-1 max-w-xl lg:col-start-2 lg:row-start-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-nb-clay">Why Northbridge</p>
          <h2 className="mt-4 font-serif text-4xl leading-[1.02] tracking-[-0.04em] text-nb-teal sm:text-5xl">
            More than a platform. A partner in your care.
          </h2>
          <p className="mt-6 text-base leading-7 text-nb-ink/75 sm:text-lg">
            Healthcare shouldn't feel complicated. Northbridge Health connects you with trusted professionals and personalized care, making it easier to access the support you need at every stage of your journey.
          </p>
        </div>

        <div className="order-2 overflow-hidden rounded-2xl border border-nb-line bg-nb-sand lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <div className="aspect-[4/3] h-full min-h-[250px] lg:aspect-auto">
            <img
              src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=1200&q=85"
              alt="Doctor listening to a patient during a consultation"
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>

        <div className="order-3 grid gap-4 sm:grid-cols-3 lg:col-start-2 lg:row-start-2 lg:grid-cols-1">
          {[
            { icon: HeartHandshake, label: 'Patient-first care', description: 'Designed around your needs and experience.' },
            { icon: ShieldCheck, label: 'Trusted professionals', description: 'Connect with qualified healthcare providers.' },
            { icon: Stethoscope, label: 'Connected care', description: 'Support beyond your appointment.' },
          ].map(({ icon: Icon, label, description }) => (
            <div key={label} className="flex items-start gap-3 text-nb-ink/80">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pastel-green text-pastel-green-ink">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <div className="text-base font-semibold text-nb-teal">{label}</div>
                <p className="mt-0.5 text-sm leading-5 text-nb-ink/65">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <button type="button" className="order-4 inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-nb-teal px-6 py-3 font-semibold text-nb-teal transition hover:-translate-y-0.5 hover:bg-nb-teal hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nb-teal lg:col-start-2 lg:row-start-3">
          Explore Our Story
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
