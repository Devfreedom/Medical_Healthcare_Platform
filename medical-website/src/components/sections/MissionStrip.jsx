import { ArrowRight, HeartHandshake, ShieldCheck, Stethoscope } from 'lucide-react';

export default function MissionStrip() {
  return (
    <section id="about" className="bg-maven-cream">
      <div className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="grid items-center gap-8 rounded-[2rem] bg-maven-pine p-6 text-white shadow-[0_30px_60px_rgba(6,42,32,0.3)] sm:p-10 lg:grid-cols-2 lg:gap-12 lg:p-12">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-maven-butter">Why Northbridge</p>
          <h2 className="mt-4 font-serif text-4xl leading-[1.05] tracking-[-0.02em] sm:text-5xl">
            The most trusted platform for family health
          </h2>
          <p className="mt-5 text-base leading-7 text-white/75 sm:text-lg">
            24/7 virtual care, predictive insights, and benefits support — all in one place, backed by clinical research.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl">
          <img
            src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=1200&q=85"
            alt="Doctor listening to a patient during a consultation"
            className="h-64 w-full object-cover object-center sm:h-80 lg:h-full lg:min-h-[420px]"
          />
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
