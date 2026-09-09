import { categories } from '../../data/categories';

const tintMap = {
  tan: {
    bg: 'bg-pastel-tan',
    text: 'text-pastel-tan-ink',
    icon: '✚',
  },
  pink: {
    bg: 'bg-pastel-pink',
    text: 'text-pastel-pink-ink',
    icon: '♥',
  },
  blue: {
    bg: 'bg-pastel-blue',
    text: 'text-pastel-blue-ink',
    icon: '⚑',
  },
  green: {
    bg: 'bg-pastel-green',
    text: 'text-pastel-green-ink',
    icon: '✓',
  },
};

export default function CareCategories() {
  return (
    <section id="care-categories" className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="font-serif text-4xl tracking-[-0.04em] text-nb-teal sm:text-5xl">
          Comprehensive Care for Every Stage of Life
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map(({ id, title, description, tint }) => {
          const palette = tintMap[tint];

          return (
            <article key={id} className="rounded-[1.5rem] border border-nb-line bg-nb-paper p-6 shadow-[0_16px_30px_rgba(19,42,44,0.04)]">
              <div className={`${palette.bg} ${palette.text} mb-5 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold`}>
                {palette.icon}
              </div>
              <h3 className="mb-3 text-xl font-semibold text-nb-ink">{title}</h3>
              <p className="mb-5 text-sm leading-6 text-nb-ink/70">{description}</p>
              <a href="#" className="inline-flex items-center text-sm font-semibold text-nb-clay transition hover:text-nb-clay-dark">
                Learn More
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}
