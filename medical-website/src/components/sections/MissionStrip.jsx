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
          <a href="#appointment-form" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-maven-pine transition hover:-translate-y-0.5">
            Explore platform <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="overflow-hidden rounded-3xl">
          <img
            src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=1200&q=85"
            alt="Doctor listening to a patient during a consultation"
            className="h-64 w-full object-cover object-center sm:h-80 lg:h-full lg:min-h-[420px]"
          />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:col-span-2 lg:grid-cols-3">
          {[
            { icon: HeartHandshake, stat: '40+', label: 'peer-reviewed studies' },
            { icon: ShieldCheck, stat: '175+', label: 'countries covered' },
            { icon: Stethoscope, stat: '27%', label: 'lower NICU admissions' },
          ].map(({ icon: Icon, stat, label }) => (
            <div key={label} className="rounded-3xl bg-white/[0.07] p-5 backdrop-blur">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <Icon className="h-5 w-5" />
              </span>
              <div className="mt-4 font-serif text-3xl font-semibold">{stat}</div>
              <p className="mt-1 text-sm text-white/70">{label}</p>
            </div>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}
