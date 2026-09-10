export default function EditorialIntro() {
  return (
    <section
      aria-labelledby="editorial-intro-heading"
      className="overflow-hidden bg-maven-pine-dark text-maven-paper"
    >
      <div className="mx-auto max-w-content px-4 pb-20 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pb-28 lg:pt-24">
        {/* Eyebrow + index */}
        <div className="flex items-center justify-between gap-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-maven-butter">
            Continuing care
          </p>
          <p aria-hidden="true" className="hidden text-xs font-medium uppercase tracking-[0.24em] text-white/30 sm:block">
            01 — After the hero
          </p>
        </div>

        {/* Asymmetrical editorial grid: ~42% text / ~58% image */}
        <div className="mt-8 grid gap-12 lg:mt-12 lg:grid-cols-[41%_59%] lg:gap-10">
          {/* Text column */}
          <div className="flex flex-col justify-center lg:pb-10 lg:pt-4">
            <h2
              id="editorial-intro-heading"
              className="font-serif text-[clamp(2.6rem,5vw,4.75rem)] font-medium leading-[1.02] tracking-[-0.02em] text-[#FFF9EF]"
            >
              Care that stays
              <br />
              with women,
              <br />
              <em className="font-light italic text-maven-butter">not just visits.</em>
            </h2>
            <p className="mt-6 max-w-md text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
              Northbridge follows your family across fertility, pregnancy, parenting,
              and midlife — one coordinated team, one record, one place to turn.
            </p>

            {/* Restrained supporting points — type + dividers, no cards */}
            <dl className="mt-10 max-w-md">
              {[
                {
                  n: '01',
                  title: 'One team across every stage',
                  desc: 'Fertility, maternity, pediatrics and menopause — connected, not referred away.',
                },
                {
                  n: '02',
                  title: 'Human first, virtual always',
                  desc: 'Real clinicians on call day and night, with in-person care when it matters.',
                },
                {
                  n: '03',
                  title: 'Measured by outcomes',
                  desc: 'Fewer complications, calmer pregnancies, healthier families — not visit counts.',
                },
              ].map((item) => (
                <div key={item.n} className="flex gap-5 border-t border-white/10 py-5 last:border-b">
                  <dt className="shrink-0 font-serif text-sm italic text-maven-clay">{item.n}</dt>
                  <div>
                    <dt className="text-[15px] font-semibold leading-6 text-white">{item.title}</dt>
                    <dd className="mt-1 text-sm leading-6 text-white/60">{item.desc}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          {/* Image column — art-directed, dominant */}
          <figure className="relative lg:-mt-4 lg:pl-6">
            <div className="group relative overflow-hidden rounded-[2rem] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
              <img
                src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=1600&q=80"
                alt="Mother holding her newborn close in soft daylight"
                loading="lazy"
                className="h-[320px] w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03] sm:h-[440px] lg:h-[620px]"
              />
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-maven-pine-dark/30 via-transparent to-transparent" />
            </div>
            {/* Caption with restrained terracotta accent */}
            <figcaption className="mt-5 flex items-start gap-4 lg:pr-8">
              <span aria-hidden="true" className="mt-1.5 h-px w-10 shrink-0 bg-maven-clay" />
              <p className="max-w-md text-sm leading-6 text-white/55">
                Early days, fully supported — a Northbridge midwife checks in at home
                during the first week after birth.
              </p>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
