import { useCallback, useEffect, useRef, useState } from 'react';

const ACCESS_CARDS = [
  {
    id: 'metabolic',
    badge: 'New',
    title: 'Virtual Weight & Metabolic Support',
    label: 'Nutrition \u00B7 Lifestyle \u00B7 Follow-up',
    description:
      'Ongoing metabolic support with clinicians who know your history \u2014 nutrition, habits and steady follow-up in one place.',
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1400&q=80',
    alt: 'Fresh balanced meal supporting metabolic health',
  },
  {
    id: 'hormone',
    badge: 'Care',
    title: "Hormone & Women's Health",
    label: 'Cycles \u00B7 Perimenopause \u00B7 Midlife',
    description:
      'Guidance for cycles, hormonal shifts and midlife changes \u2014 connected to your primary care team when you need more.',
    image:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1400&q=80',
    alt: 'Clinician consulting with a patient',
  },
  {
    id: 'clinic',
    badge: '24/7',
    title: '24/7 Virtual Clinic',
    label: 'Same-day video visits',
    description:
      'Video visits for everyday and urgent needs \u2014 evenings and weekends, from home or on the go.',
    image:
      'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=1400&q=80',
    alt: 'Doctor on a video visit',
  },
];

const SEQUENCE = [
  { active: null, duration: 1000 },
  { active: 'metabolic', duration: 2000 },
  { active: null, duration: 1100 },
  { active: 'hormone', duration: 2000 },
  { active: null, duration: 1000 },
  { active: 'clinic', duration: 2100 },
  { active: null, duration: 1000 },
];

const STACK_ITEMS = [
  { title: 'Nutrition support', meta: 'Plans that fit real life' },
  { title: 'Primary care', meta: 'Your home for everyday care' },
  { title: 'Family care', meta: 'Coordinated across ages' },
];

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

function OrbitVisual({ running }) {
  const groupRef = useRef(null);
  useEffect(() => {
    if (!running) return undefined;
    let start = null;
    let raf = 0;
    const tick = (t) => {
      if (start === null) start = t;
      const s = (t - start) / 1000;
      if (groupRef.current) groupRef.current.style.transform = `rotate(${s * 12}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);
  return (
    <div className="relative mx-auto h-44 w-44" aria-hidden="true">
      <svg viewBox="0 0 200 200" className="h-full w-full">
        <circle cx="100" cy="100" r="78" fill="none" stroke="#0A2E28" strokeOpacity="0.25" strokeDasharray="4 6" />
        <circle cx="100" cy="100" r="56" fill="none" stroke="#0A2E28" strokeOpacity="0.3" strokeDasharray="3 5" />
        <circle cx="100" cy="100" r="34" fill="none" stroke="#0A2E28" strokeOpacity="0.35" />
        <ellipse cx="100" cy="100" rx="78" ry="30" fill="none" stroke="#0A2E28" strokeOpacity="0.25" strokeDasharray="4 6" />
        <g ref={groupRef} style={{ transformOrigin: '100px 100px' }}>
          <circle cx="100" cy="22" r="5" fill="#0A2E28" />
          <circle cx="156" cy="100" r="4" fill="#0B7A69" />
          <circle cx="100" cy="178" r="5" fill="#0B7A69" />
        </g>
        <circle cx="100" cy="100" r="9" fill="#0A2E28" />
        <circle cx="100" cy="100" r="3.5" fill="#8EF5D0" />
      </svg>
      <span className="nb-orbit-chip left-0 top-6">Primary</span>
      <span className="nb-orbit-chip right-0 top-16">Family</span>
      <span className="nb-orbit-chip bottom-4 left-8">Specialty</span>
    </div>
  );
}

export default function DirectAccessBento() {
  const reducedMotion = usePrefersReducedMotion();
  const [activeId, setActiveId] = useState(null);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const sectionRef = useRef(null);
  const timerRef = useRef(null);
  const stepRef = useRef(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((entry) => setVisible(entry.isIntersecting)),
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (reducedMotion || !visible || paused) {
      clearTimer();
      return undefined;
    }
    let cancelled = false;
    const run = () => {
      const step = SEQUENCE[stepRef.current % SEQUENCE.length];
      if (!cancelled) setActiveId(step.active);
      timerRef.current = setTimeout(() => {
        if (cancelled) return;
        stepRef.current = (stepRef.current + 1) % SEQUENCE.length;
        run();
      }, step.duration);
    };
    run();
    return () => {
      cancelled = true;
      clearTimer();
    };
  }, [reducedMotion, visible, paused, clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const animationsLive = visible && !reducedMotion;

  return (
    <div ref={sectionRef}>
      <style>{`.nb-access-card{transition:flex-grow 600ms ease-in-out}.nb-access-reveal{transition:opacity 500ms ease 150ms,transform 500ms ease 150ms}@keyframes nb-stack-cycle{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-8px) scale(1.02)}}@keyframes nb-float-soft{0%,100%{transform:translateY(-4px)}50%{transform:translateY(4px)}}@keyframes nb-arc-sweep{to{transform:rotate(360deg)}}.nb-stack-top{animation:nb-stack-cycle 3.2s ease-in-out infinite}.nb-float-soft{animation:nb-float-soft 4.5s ease-in-out infinite}.nb-arc-spin{animation:nb-arc-sweep 9s linear infinite;transform-origin:center}.nb-orbit-chip{position:absolute;border-radius:999px;background:rgba(10,46,40,.08);border:1px solid rgba(10,46,40,.18);color:#0A2E28;font-size:10px;font-weight:600;padding:3px 8px}@media (prefers-reduced-motion:reduce){.nb-access-card,.nb-access-reveal,.nb-stack-top,.nb-float-soft,.nb-arc-spin{animation:none!important;transition:none!important}}`}</style>
      <section aria-label="Direct access to care" className="bg-[#0A2E28]">
        <div className="mx-auto max-w-[1180px] px-4 pb-14 pt-16 sm:px-6 lg:pb-20 lg:pt-24">
          <p className="mx-auto max-w-xl text-center text-[14px] leading-6 text-white/85">Direct access to everyday services and virtual care \u2014 without the runaround.</p>
          <div className="mt-8 hidden gap-4 lg:flex" role="list" aria-label="Direct access programs">
            {ACCESS_CARDS.map((card) => {
              const isActive = activeId === card.id;
              return (
                <article key={card.id} role="listitem" tabIndex={0} aria-label={card.title}
                  onMouseEnter={() => { setPaused(true); setActiveId(card.id); }}
                  onMouseLeave={() => setPaused(false)}
                  onFocus={() => { setPaused(true); setActiveId(card.id); }}
                  onBlur={() => setPaused(false)}
                  onClick={() => setActiveId(card.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveId(card.id); } }}
                  style={{ flexGrow: isActive ? 1.4 : 1, flexBasis: 0 }}
                  className="nb-access-card relative h-[460px] min-w-0 cursor-pointer overflow-hidden rounded-[20px] outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5D0]">
                  <img src={card.image} alt={card.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" aria-hidden="true" />
                  <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-[#8EF5D0] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#0B2E26]">{card.badge}</span>
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="font-serif text-[22px] leading-tight text-white">{card.title}</h3>
                    <p className="mt-1 text-[12px] text-white/70">{card.label}</p>
                    <div className="nb-access-reveal" style={{ opacity: isActive ? 1 : 0, transform: isActive ? 'translateY(0)' : 'translateY(10px)', pointerEvents: isActive ? 'auto' : 'none' }}>
                      <p className="mt-3 max-w-md text-[15px] leading-6 text-white/90">{card.description}</p>
                      <a href="#contact-section" onClick={(e) => e.stopPropagation()} className="mt-4 inline-flex items-center rounded-[8px] bg-[#8EF5D0] px-4 py-2 text-[13px] font-semibold text-[#0B2E26] transition hover:bg-white">Learn more</a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="mt-8 space-y-4 lg:hidden">
            {ACCESS_CARDS.map((card) => (
              <article key={card.id} className="relative h-72 overflow-hidden rounded-[20px] sm:h-80">
                <img src={card.image} alt={card.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" aria-hidden="true" />
                <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-[#8EF5D0] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#0B2E26]">{card.badge}</span>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-serif text-[20px] leading-tight text-white">{card.title}</h3>
                  <p className="mt-1 text-[12px] text-white/70">{card.label}</p>
                  <p className="mt-2 text-[14px] leading-6 text-white/85">{card.description}</p>
                  <a href="#contact-section" className="mt-3 inline-flex items-center rounded-[8px] bg-[#8EF5D0] px-4 py-2 text-[13px] font-semibold text-[#0B2E26]">Learn more</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section aria-label="Virtual care and connected tools" className="bg-[#FFFBF4]">
        <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
            <h2 className="max-w-xl font-serif text-[32px] leading-[1.08] text-[#0A2E28] sm:text-[42px]">Virtual care, <em className="italic">connected</em> to every part of your health</h2>
            <p className="max-w-[280px] text-[12px] leading-5 text-[#0A2E28]/75 lg:justify-self-end">Video visits, coordinated follow-up and simple digital tools \u2014 designed around women and families.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article className="relative overflow-hidden rounded-[16px] sm:col-span-2 lg:col-span-1 lg:min-h-[420px]">
              <img src="https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80" alt="Family spending time together outdoors" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              <span className="absolute inset-0 bg-gradient-to-t from-[#0A2E28] via-[#0A2E28]/30 to-transparent" aria-hidden="true" />
              <div className="relative flex h-full min-h-[320px] flex-col justify-end p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8EF5D0]">Virtual care network</p>
                <h3 className="mt-2 font-serif text-[26px] leading-tight text-white">One place for family health</h3>
                <p className="mt-2 max-w-sm text-[14px] leading-6 text-white/80">Everyday care, women\u2019s health and pediatrics \u2014 connected through a single Northbridge team.</p>
              </div>
            </article>
            <article className="rounded-[16px] bg-gradient-to-br from-[#0B7A69] to-[#0A2E28] p-6 text-white lg:min-h-[420px]">
              <h3 className="font-serif text-[24px] leading-tight">Connected provider specialties</h3>
              <p className="mt-2 text-[13px] leading-5 text-white/75">Your team coordinates across these areas of care.</p>
              <div className="relative mt-6 space-y-3" aria-hidden="true">
                {STACK_ITEMS.map((item, i) => (
                  <div key={item.title} className={`rounded-[12px] bg-white/[0.12] p-4 ring-1 ring-white/20 backdrop-blur ${i === 0 && animationsLive ? 'nb-stack-top' : ''}`}>
                    <p className="text-[14px] font-semibold">{item.title}</p>
                    <p className="text-[12px] text-white/70">{item.meta}</p>
                  </div>
                ))}
              </div>
            </article>
            <article className="rounded-[16px] bg-gradient-to-br from-[#D9F2F0] to-[#BFE6DD] p-6 text-[#0A2E28] lg:min-h-[420px]">
              <h3 className="font-serif text-[24px] leading-tight">Care that connects</h3>
              <p className="mt-2 text-[13px] leading-5 text-[#0A2E28]/70">Visits, messages and follow-up stay linked.</p>
              <div className="mt-4"><OrbitVisual running={animationsLive} /></div>
            </article>
            <article className="rounded-[16px] bg-[#0A2E28] p-6 text-white lg:min-h-[360px]">
              <h3 className="font-serif text-[24px] leading-tight">Connected, continuous care</h3>
              <p className="mt-2 text-[13px] leading-5 text-white/70">Follow-up that stays with you between visits.</p>
              <div className="mx-auto mt-6 h-36 w-36" aria-hidden="true">
                <svg viewBox="0 0 120 120" className="h-full w-full">
                  <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="3" />
                  <g className={animationsLive ? 'nb-arc-spin' : undefined}>
                    <circle cx="60" cy="60" r="48" fill="none" stroke="#8EF5D0" strokeWidth="4" strokeLinecap="round" strokeDasharray="90 212" />
                    <circle cx="60" cy="12" r="5" fill="#8EF5D0" />
                  </g>
                  <circle cx="60" cy="60" r="30" fill="rgba(255,255,255,0.06)" />
                </svg>
              </div>
            </article>
            <article className="rounded-[16px] bg-[#E8F0EE] p-6 text-[#0A2E28] lg:min-h-[360px]">
              <h3 className="font-serif text-[24px] leading-tight">Guided by clinical evidence</h3>
              <p className="mt-2 text-[13px] leading-5 text-[#0A2E28]/70">Care pathways shaped by medical guidance and reviewed by clinicians.</p>
              <div className="relative mt-6 h-32" aria-hidden="true">
                <div className={`absolute left-2 top-2 w-40 rounded-2xl bg-[#0A2E28] p-4 text-white shadow-lg ${animationsLive ? 'nb-float-soft' : ''}`}>
                  <p className="text-[13px] font-semibold">Coordinated follow-up</p>
                  <p className="mt-1 text-[11px] text-white/70">Messages answered by your team</p>
                </div>
                <div className="absolute bottom-0 right-2 w-44 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-[#0A2E28]/10">
                  <p className="text-[13px] font-semibold">Reviewed guidance</p>
                  <p className="mt-1 text-[11px] text-[#0A2E28]/65">Clear next steps after visits</p>
                </div>
              </div>
            </article>
            <article className="relative overflow-hidden rounded-[16px] lg:min-h-[360px]">
              <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1000&q=80" alt="Clinician using a digital tablet for care" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              <span className="absolute inset-0 bg-gradient-to-t from-[#0A2E28]/90 via-[#0A2E28]/25 to-transparent" aria-hidden="true" />
              <div className="relative flex h-full min-h-[300px] flex-col justify-end p-6">
                <h3 className="font-serif text-[24px] leading-tight text-white">Simple digital experience</h3>
                <p className="mt-2 text-[13px] leading-5 text-white/80">Book, meet and follow up \u2014 from one familiar place.</p>
                <a href="#contact-section" className="mt-4 inline-flex w-fit items-center rounded-[8px] bg-[#8EF5D0] px-4 py-2 text-[13px] font-semibold text-[#0B2E26] transition hover:bg-white">Learn more</a>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
