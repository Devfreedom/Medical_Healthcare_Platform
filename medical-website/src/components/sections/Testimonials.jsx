export default function Testimonials() {
  const stories = [
    {
      quote: 'We had amazing emotional support and saved around what we were going to spend on IVF. The only difference was our care team — and now we are pregnant.',
      name: 'Han',
      role: 'Member, Fertility program',
    },
    {
      quote: 'This is by far the easiest access to specialists I have experienced. It feels so safe to know I can talk to someone when I need to.',
      name: 'Sarah',
      role: 'Member, Maternity program',
    },
    {
      quote: 'From second opinions on fertility treatment to newborn care, this has been the constant, trusted companion through a turbulent time.',
      name: 'Mairead',
      role: 'Member, Parenting program',
    },
  ];

  return (
    <section id="stories" className="bg-maven-cream">
      <div className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-maven-clay">Member stories</p>
            <h2 className="mt-3 font-serif text-4xl leading-[1.05] text-maven-pine sm:text-5xl">Trusted by real families</h2>
          </div>
          <a href="#appointment-form" className="inline-flex items-center gap-2 rounded-full border border-maven-pine px-6 py-3 text-sm font-semibold text-maven-pine transition hover:bg-maven-pine hover:text-white">
            Meet our members →
          </a>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {stories.map(({ quote, name, role }) => (
            <figure key={name} className="flex h-full flex-col rounded-[1.75rem] bg-maven-pine p-7 text-white shadow-[0_20px_40px_rgba(6,42,32,0.2)]">
              <div className="font-serif text-5xl leading-none text-maven-butter">“</div>
              <blockquote className="mt-2 flex-1 text-[16px] leading-7 text-white/85">{quote}</blockquote>
              <figcaption className="mt-6 border-t border-white/15 pt-4">
                <div className="font-semibold">{name}</div>
                <div className="text-sm text-white/60">{role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
