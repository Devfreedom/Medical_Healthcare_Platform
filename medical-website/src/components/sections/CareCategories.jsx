import { useEffect, useRef, useState } from 'react';

const PANELS = [
  {
    id: 'primary',
    eyebrow: 'Primary & family care',
    label: 'Everyday care, coordinated',
    title: 'Primary & Family Care',
    description:
      'One medical home for checkups, chronic care, and same-week visits — with your whole history in one place.',
    dot: '#5EE9E6',
    image:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=80',
    alt: 'Primary care clinician consulting with a patient',
  },
  {
    id: 'womens',
    eyebrow: "Women's health",
    label: 'Fertility to midlife',
    title: "Women's Health",
    description:
      'Fertility, maternity, postpartum and menopause care from one coordinated team that stays with you.',
    dot: '#8EF5D0',
    image:
      'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=1400&q=80',
    alt: 'Mother holding her newborn close in soft daylight',
  },
  {
    id: 'mens',
    eyebrow: "Men's health",
    label: 'Preventive + ongoing',
    title: "Men's Health",
    description:
      'Preventive screenings, heart and metabolic care, sleep and mental health — built around real life.',
    dot: '#8B8CFF',
    image:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=1400&q=80',
    alt: 'Male patient speaking with a doctor in a clinic',
  },
  {
    id: 'pediatric',
    eyebrow: 'Pediatric & specialist care',
    label: 'Kids + specialty referrals',
    title: 'Pediatric & Specialist Care',
    description:
      '24/7 pediatric support plus fast, guided referrals to trusted specialists when you need more.',
    dot: '#FFD84D',
    image:
      'https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&w=1400&q=80',
    alt: 'Pediatric clinician gently examining a young child',
  },
];

const SEQUENCE = ['womens', 'mens', 'pediatric', 'primary'];
const AUTO_MS = 3000;

export default function CareCategories() {
  const [activeId, setActiveId] = useState('womens');
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (pausedRef.current || document.hidden) return;
      setActiveId((prev) => {
        const idx = SEQUENCE.indexOf(prev);
        return SEQUENCE[(idx + 1 + SEQUENCE.length) % SEQUENCE.length];
      });
    }, AUTO_MS);
    return () => clearInterval(timer);
  }, []);

  const activate = (id) => setActiveId(id);

  return (
    <section id="care-categories" aria-label="Northbridge care programs" className="relative overflow-hidden bg-[#0B2E26] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: 'repeating-linear-gradient(115deg, rgba(255,255,255,0.7) 0px, rgba(255,255,255,0.7) 1px, transparent 1px, transparent 26px)' }}
      />
      <div className="relative mx-auto max-w-content px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8EF5D0]/80">Care programs</p>
          <h2 className="mx-auto mt-5 max-w-3xl font-serif text-[clamp(2.25rem,5vw,3.9rem)] font-medium leading-[1.05] tracking-[-0.02em] text-[#FFF9EF]">
            Healthcare designed around <em className="font-light italic">you</em>, your family, and every stage of life.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-[18px] leading-8 text-white/70">
            Four coordinated programs, one care team — Northbridge keeps your whole family connected, from everyday visits to specialty care.
          </p>
        </div>
        <div className="mt-12 hidden gap-4 lg:mt-14 lg:flex" onMouseLeave={() => setPaused(false)}>
          {PANELS.map((panel) => {
            const isActive = panel.id === activeId;
            return (
              <article
                key={panel.id}
                tabIndex={0}
                role="button"
                aria-pressed={isActive}
                aria-label={`${panel.title} panel`}
                onMouseEnter={() => { setPaused(true); activate(panel.id); }}
                onFocus={() => { setPaused(true); activate(panel.id); }}
                onBlur={() => setPaused(false)}
                onClick={() => activate(panel.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(panel.id); } }}
                style={{ flexGrow: isActive ? 55 : 15, flexShrink: 1, flexBasis: 0 }}
                className="group relative h-[520px] cursor-pointer overflow-hidden rounded-3xl outline-none transition-[flex-grow] duration-[600ms] ease-in-out focus-visible:ring-2 focus-visible:ring-[#8EF5D0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B2E26]"
              >
                <img src={panel.image} alt={panel.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#06231e]/95 via-[#06231e]/35 to-[#06231e]/10" />
                <span aria-hidden="true" className="absolute left-5 top-5 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: panel.dot }} />
                <div aria-hidden={isActive} className={`absolute inset-x-0 bottom-0 p-5 transition-opacity duration-300 ${isActive ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
                  <p className="font-serif text-[20px] font-semibold leading-7 text-white">{panel.title}</p>
                  <p className="mt-1 text-[12px] font-medium uppercase tracking-[0.14em] text-white/60">{panel.label}</p>
                </div>
                <div className={`absolute inset-x-0 bottom-0 p-7 transition-all delay-150 duration-500 ${isActive ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/65">{panel.eyebrow}</p>
                  <h3 className="mt-2 font-serif text-3xl font-semibold leading-tight text-white">{panel.title}</h3>
                  <p className="mt-3 max-w-md text-[15px] leading-7 text-white/85">{panel.description}</p>
                  <a href="#contact-section" onClick={(e) => e.stopPropagation()} tabIndex={isActive ? 0 : -1} aria-hidden={!isActive} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#8EF5D0] px-5 py-2.5 text-sm font-semibold text-[#0B2E26] transition hover:bg-white">
                    Learn more <span aria-hidden="true">→</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
        <div className="mt-12 hidden gap-4 sm:grid sm:grid-cols-2 lg:hidden">
          {PANELS.map((panel) => {
            const isActive = panel.id === activeId;
            return (
              <button key={panel.id} type="button" onClick={() => activate(panel.id)} aria-pressed={isActive} className={`relative overflow-hidden rounded-3xl text-left outline-none transition focus-visible:ring-2 focus-visible:ring-[#8EF5D0] ${isActive ? 'ring-2 ring-[#8EF5D0]/70' : 'ring-1 ring-white/10'}`}>
                <div className="relative h-64">
                  <img src={panel.image} alt={panel.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#06231e]/95 via-[#06231e]/40 to-transparent" />
                  <span aria-hidden="true" className="absolute left-4 top-4 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: panel.dot }} />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">{panel.eyebrow}</p>
                    <p className="mt-1 font-serif text-xl font-semibold text-white">{panel.title}</p>
                    {isActive && (<span className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#8EF5D0] px-4 py-2 text-[13px] font-semibold text-[#0B2E26]">Learn more →</span>)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-10 sm:hidden">
          <div className="relative overflow-hidden rounded-3xl">
            {PANELS.map((panel) => {
              const isActive = panel.id === activeId;
              return (
                <div key={panel.id} aria-hidden={!isActive} className={`transition-opacity duration-500 ${isActive ? 'relative opacity-100' : 'pointer-events-none absolute inset-0 opacity-0'}`}>
                  <div className="relative h-[420px] overflow-hidden">
                    <img src={panel.image} alt={isActive ? panel.alt : ''} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#06231e]/95 via-[#06231e]/40 to-transparent" />
                    <span aria-hidden="true" className="absolute left-5 top-5 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: panel.dot }} />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">{panel.eyebrow}</p>
                      <h3 className="mt-2 font-serif text-[26px] font-semibold leading-tight text-white">{panel.title}</h3>
                      <p className="mt-2 text-[14px] leading-6 text-white/80">{panel.description}</p>
                      <span className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#8EF5D0] px-5 py-2.5 text-sm font-semibold text-[#0B2E26]">Learn more →</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex items-center justify-center gap-2.5" role="tablist" aria-label="Care programs">
            {SEQUENCE.map((id) => {
              const isActive = id === activeId;
              const label = PANELS.find((p) => p.id === id).title;
              return (<button key={id} type="button" role="tab" aria-selected={isActive} aria-label={`Show ${label}`} onClick={() => activate(id)} className={`h-2 rounded-full transition-all duration-300 ${isActive ? 'w-8 bg-[#8EF5D0]' : 'w-2 bg-white/25'}`} />);
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
