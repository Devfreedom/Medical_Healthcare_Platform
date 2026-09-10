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
    <section id="care-categories" className="bg-maven-paper">
      <div className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mb-10 max-w-3xl lg:mb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-maven-clay">Programs</p>
        <h2 className="mt-3 font-serif text-4xl leading-[1.05] tracking-[-0.02em] text-maven-pine sm:text-5xl">
          Healthcare designed for every stage of family life
        </h2>
        <p className="mt-4 text-lg leading-8 text-maven-pine/65">Personal, proven programs — free with many employers and health plans.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map(({ id, title, description, tint }) => {
          const palette = tintMap[tint];
          const Icon = palette.icon;

          return (
            <article
              key={id}
              className="group flex h-full flex-col rounded-[1.75rem] border border-maven-line/70 bg-white p-6 text-left shadow-[0_10px_30px_rgba(6,42,32,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(6,42,32,0.1)]"
            >
              <div
                className={`${palette.bg} ${palette.text} mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105`}
                aria-hidden="true"
              >
                <Icon className="h-6 w-6" />
              </div>

              <h3 className="mb-2.5 font-serif text-[22px] font-semibold leading-snug text-maven-pine">{title}</h3>
              <p className="mb-6 text-[15px] leading-6 text-maven-pine/65">{description}</p>

              <button
                type="button"
                className="mt-auto inline-flex items-center gap-2 self-start rounded-full bg-maven-pine/[0.06] px-4 py-2 text-sm font-semibold text-maven-pine transition hover:bg-maven-pine hover:text-white"
                aria-label={`Learn more about ${title}`}
              >
                <span>Learn more</span>
                <span aria-hidden="true">→</span>
              </button>
            </article>
          );
        })}
      </div>
      </div>
    </section>
  );
}
