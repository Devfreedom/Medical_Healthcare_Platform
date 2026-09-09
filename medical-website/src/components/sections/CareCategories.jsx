import {
  AlertTriangle,
  BriefcaseMedical,
  HeartPulse,
  Stethoscope,
} from 'lucide-react';
import { categories } from '../../data/categories';

const tintMap = {
  tan: {
    bg: 'bg-pastel-tan',
    text: 'text-pastel-tan-ink',
    icon: Stethoscope,
  },
  pink: {
    bg: 'bg-pastel-pink',
    text: 'text-pastel-pink-ink',
    icon: HeartPulse,
  },
  blue: {
    bg: 'bg-pastel-blue',
    text: 'text-pastel-blue-ink',
    icon: AlertTriangle,
  },
  green: {
    bg: 'bg-pastel-green',
    text: 'text-pastel-green-ink',
    icon: BriefcaseMedical,
  },
};

export default function CareCategories() {
  return (
    <section id="care-categories" className="mx-auto max-w-content px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mb-10 text-center lg:mb-12">
        <h2 className="font-serif text-4xl tracking-[-0.04em] text-nb-teal sm:text-5xl">
          Comprehensive Care for Every Stage of Life
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map(({ id, title, description, tint, icon }) => {
          const palette = tintMap[tint];
          const Icon = palette.icon;

          return (
            <article
              key={id}
              className="group flex h-full flex-col rounded-[1.5rem] border border-nb-line bg-nb-paper p-6 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-nb-teal/50 hover:shadow-[0_16px_30px_rgba(19,42,44,0.06)] focus-within:border-nb-teal/60 focus-within:shadow-[0_16px_30px_rgba(19,42,44,0.06)]"
            >
              <div
                className={`${palette.bg} ${palette.text} mb-6 flex h-14 w-14 items-center justify-center rounded-full transition-colors duration-200 group-hover:scale-[1.03]`}
                aria-hidden="true"
              >
                <Icon className="h-6 w-6" />
              </div>

              <h3 className="mb-3 text-xl font-semibold text-nb-ink">{title}</h3>
              <p className="mb-6 text-sm leading-6 text-nb-ink/70">{description}</p>

              <button
                type="button"
                className="mt-auto inline-flex items-center gap-2 self-start text-sm font-semibold text-nb-clay transition-colors duration-200 hover:text-nb-clay-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nb-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-nb-paper"
                aria-label={`Learn more about ${title}`}
              >
                <span>Learn More</span>
                <span aria-hidden="true">→</span>
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
