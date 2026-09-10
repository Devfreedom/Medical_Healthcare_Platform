import { useEffect, useRef, useState } from 'react';

const STORIES = [
  {
    quote:
      'We had amazing emotional support and saved around what we were going to spend on IVF. The only difference was our care team — and now we are pregnant.',
    name: 'Han',
    role: 'Fertility program',
    img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=75',
  },
  {
    quote:
      'This is by far the easiest access to specialists I’ve experienced. It feels so safe to know I can talk to someone when I need to.',
    name: 'Sarah',
    role: 'Maternity program',
    img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=75',
  },
  {
    quote:
      'From second opinions to straightforward newborn guidance, this has been the constant, trusted companion through a turbulent time.',
    name: 'Mairead',
    role: 'Parenting program',
    img: 'https://images.unsplash.com/photo-1559839734-2f636193ac62?auto=format&fit=crop&w=600&q=75',
  },
];

const TRUST_STRIP = [
  'Clinician-led care',
  'Evidence-guided pathways',
  '24/7 virtual access',
  'Coordinated family teams',
];

const FEATURED_INDEX = 1;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

export default function RealStoriesCTA() {
  const reduced = usePrefersReducedMotion();
  const hasObserver = typeof IntersectionObserver !== 'undefined';
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(!hasObserver);
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!hasObserver) return undefined;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.25 },
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [hasObserver]);

  useEffect(() => {
    if (reduced || !visible) return undefined;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % STORIES.length), 5000);
    return () => window.clearInterval(id);
  }, [reduced, visible]);

  const prev = () => setIndex((i) => (i - 1 + STORIES.length) % STORIES.length);
  const next = () => setIndex((i) => (i + 1) % STORIES.length);

  return (
    <>
      <style>{`
        @keyframes nb-glow-inout { 0%,100% { transform: translate(-50%,-50%) scale(0.95); } 50% { transform: translate(-50%,-50%) scale(1.05); } }
        .nb-glow { animation: nb-glow-inout 4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .nb-glow { animation: none; } }
      `}</style>

      {/* PART 1+2+3 — Real stories editorial container */}
      <section ref={sectionRef} aria-label="Real stories" className="bg-[#0A2E28] px-2 sm:px-[2%]">
        <div className="relative mx-auto max-w-[1180px] overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,#0A2E28_0%,#0D4A3B_100%)] px-6 py-12 sm:px-10 sm:py-16 lg:px-20 lg:py-20">
          <div className="relative z-10 mx-auto max-w-[760px] text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50">Real stories</p>
            <h2 className="mt-3 font-serif text-4xl leading-[1.08] text-white sm:text-5xl">
              Real stories from the people we <em className="italic">serve</em>
            </h2>
            <p className="mx-auto mt-5 max-w-[680px] text-sm leading-6 text-white/70">
              Genuine experiences shared by Northbridge members across our care programs — what it felt like to finally have a team beside them.
            </p>
            <a
              href="#member-stories"
              className="mt-8 inline-flex items-center rounded-[8px] bg-[#8EF5D0] px-6 py-2.5 text-sm font-semibold text-[#0A2E28] transition-transform duration-200 hover:scale-[1.03]"
            >
              Meet our members
            </a>
            <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
              {TRUST_STRIP.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-[13px] font-medium uppercase tracking-[0.18em] text-white/30">{item}</span>
                  <span aria-hidden="true" className="text-white/15">◆</span>
                </li>
              ))}
            </ul>
          </div>

          <div id="member-stories" className="relative z-10 mt-14">
            <div className="relative mx-auto max-w-[760px]">
              <div className="overflow-hidden rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${index * 100}%)` }}
                >
                  {STORIES.map((story, i) => {
                    const featured = i === FEATURED_INDEX;
                    return (
                      <figure key={story.name} className="w-full shrink-0 bg-white md:h-[220px]">
                        <div className="flex h-full flex-col md:flex-row">
                          <div className="relative h-40 w-full shrink-0 md:h-full md:w-[38%]">
                            <img src={story.img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                            {featured && (
                              <span className="absolute left-3 top-3 rounded-full bg-[#8EF5D0] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0A2E28]">
                                Featured
                              </span>
                            )}
                          </div>
                          <figcaption className="flex flex-1 flex-col justify-between gap-4 p-6">
                            <blockquote className="font-serif text-[16px] leading-[1.5] text-[#0A2E28]">{story.quote}</blockquote>
                            <div>
                              <div className="text-[14px] font-bold text-[#0A2E28]">{story.name}</div>
                              <div className="text-[12px] text-[#0A2E28]/60">{story.role}</div>
                            </div>
                          </figcaption>
                        </div>
                      </figure>
                    );
                  })}
                </div>
              </div>
              <div className="mt-5 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous story"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white/80 transition hover:border-white hover:text-white focus-visible:outline-2 focus-visible:outline-[#8EF5D0]"
                >
                  ←
                </button>
                <div className="flex items-center gap-2">
                  {STORIES.map((story, i) => (
                    <button
                      key={story.name}
                      type="button"
                      aria-label={`Go to story ${i + 1}`}
                      onClick={() => setIndex(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-6 bg-[#8EF5D0]' : 'w-1.5 bg-white/25 hover:bg-white/50'}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next story"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white/80 transition hover:border-white hover:text-white focus-visible:outline-2 focus-visible:outline-[#8EF5D0]"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PART 4 — Closing CTA (cream, glow) */}
      <section className="relative overflow-hidden bg-[#FFFBF4]">
        <div
          aria-hidden="true"
          className="nb-glow pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] md:h-[800px] md:w-[800px]"
          style={{
            background: 'radial-gradient(ellipse at center, #C6F5D9 0%, #AEEFFF 45%, transparent 72%)',
            filter: 'blur(40px)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-[700px] px-6 py-24 text-center md:py-32">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0A2E28]/60">Next step</p>
          <h2 className="mt-4 font-serif text-4xl leading-[1.06] text-[#0A2E28] sm:text-5xl">
            Bring your benefits into the <em className="italic">future</em>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-[#0A2E28]/70">
            Explore what a modern, coordinated care experience could look like for your team — and for the families who count on them.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#contact-section"
              className="inline-flex items-center justify-center rounded-[8px] bg-[#0A2E28] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#114232]"
            >
              For organizations
            </a>
            <a
              href="#contact-section"
              className="inline-flex items-center justify-center rounded-[8px] border border-[#0A2E28] px-6 py-2.5 text-sm font-semibold text-[#0A2E28] transition hover:bg-[#0A2E28] hover:text-white"
            >
              For individuals
            </a>
          </div>
        </div>
      </section>
    </>
  );
}