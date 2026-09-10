import { ArrowRight } from 'lucide-react';
import { steps } from '../../data/steps';

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-maven-paper">
      <div className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div className="lg:sticky lg:top-28">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-maven-clay">Member journey</p>
          <h2 className="mt-3 font-serif text-4xl leading-[1.05] tracking-[-0.02em] text-maven-pine sm:text-5xl">Care that meets you where you are</h2>
          <p className="mt-4 max-w-md text-lg leading-8 text-maven-pine/65">24/7 virtual care, predictive insights, and benefits help — all in one place.</p>
          <a href="#appointment-form" className="mt-7 inline-flex items-center gap-2 rounded-full bg-maven-pine px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-maven-pine-dark">
            Get started <ArrowRight className="h-4 w-4" />
          </a>
          <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-maven-line/70">
            <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=85" alt="Mother and child during a warm care moment" className="h-56 w-full object-cover sm:h-64" />
          </div>
        </div>

        <div className="space-y-4">
          {steps.map(({ id, title, description }, index) => (
            <div key={id} className="flex gap-5 rounded-[1.5rem] border border-maven-line/70 bg-white p-5 shadow-[0_10px_30px_rgba(6,42,32,0.05)] sm:p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-maven-pine font-serif text-lg font-semibold text-white">
                {index + 1}
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold text-maven-pine">{title}</h3>
                <p className="mt-1.5 text-[15px] leading-6 text-maven-pine/65">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}
