import { useEffect, useRef, useState } from 'react';

const OUTCOMES = [
  {
    id: 'team',
    word: 'One team',
    arc: 0.85,
    color: '#0A2E28',
    text: 'Primary care, women\u2019s health and pediatrics coordinated by a single connected team.',
  },
  {
    id: 'access',
    word: 'Day or night',
    arc: 0.7,
    color: '#0B7A69',
    text: '24/7 virtual access so care fits around work, school and real family life.',
  },
  {
    id: 'plan',
    word: 'Personal',
    arc: 0.75,
    color: '#5AC8B2',
    text: 'Every member gets a care plan built around their stage, history and goals.',
  },
  {
    id: 'support',
    word: 'Ongoing',
    arc: 0.8,
    color: '#3E6E8E',
    text: 'Proactive check-ins and follow-up that continue between and after visits.',
  },
];

const ARC_RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * ARC_RADIUS;

function OutcomeRing({ item, active, reduced }) {
  const target = CIRCUMFERENCE * (1 - item.arc);
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative h-[136px] w-[136px]">
        <svg viewBox="0 0 136 136" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="68" cy="68" r={ARC_RADIUS} fill="none" stroke="#0A2E28" strokeOpacity="0.12" strokeWidth="5" />
          <circle
            cx="68"
            cy="68"
            r={ARC_RADIUS}
            fill="none"
            stroke={item.color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={active || reduced ? target : CIRCUMFERENCE}
            style={{
              transition: active && !reduced ? 'stroke-dashoffset 1200ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
            }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center px-6 font-serif text-[19px] font-semibold leading-tight text-[#0A2E28]">
          {item.word}
        </span>
      </div>
      <p className="mt-4 max-w-[240px] text-[14px] leading-6 text-[#0A2E28]/70">{item.text}</p>
    </div>
  );
}


export default function CinematicOutcomes() {
  const hasObserver = typeof IntersectionObserver !== 'undefined';
  const [reduced, setReduced] = useState(false);
  const [panStarted, setPanStarted] = useState(!hasObserver);
  const [arcsActive, setArcsActive] = useState(!hasObserver);
  const imageRef = useRef(null);
  const outcomesRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!hasObserver) return undefined;
    const observers = [];
    const imageObs = new IntersectionObserver(
      (entries) => entries.forEach((entry) => { if (entry.isIntersecting) setPanStarted(true); }),
      { threshold: 0.4 },
    );
    if (imageRef.current) imageObs.observe(imageRef.current);
    observers.push(imageObs);

    const outcomesObs = new IntersectionObserver(
      (entries) => entries.forEach((entry) => { if (entry.isIntersecting) { setArcsActive(true); outcomesObs.disconnect(); } }),
      { threshold: 0.3 },
    );
    if (outcomesRef.current) outcomesObs.observe(outcomesRef.current);
    observers.push(outcomesObs);

    return () => observers.forEach((obs) => obs.disconnect());
  }, [hasObserver]);

  return (
    <div>
      <section aria-label="Northbridge family care" className="relative w-full overflow-hidden bg-[#06231E]">
        <div ref={imageRef} className="h-[58vh] min-h-[380px] w-full sm:h-[64vh] lg:h-[70vh]">
          <img
            src="https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=2000&q=85"
            alt="Parent and child laughing together at home"
            loading="lazy"
            className="h-full w-full object-cover object-[center_30%] will-change-transform"
            style={{
              transform: panStarted && !reduced ? 'translateY(-3.5%)' : 'translateY(0)',
              transition: 'transform 6000ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
      </section>

      <section ref={outcomesRef} aria-label="Northbridge evidence and outcomes" className="bg-[#FFFBF4]">
        <div className="mx-auto max-w-[1180px] px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:pb-28 lg:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-[34px] leading-[1.06] tracking-[-0.015em] text-[#0A2E28] sm:text-[48px] lg:text-[56px]">
              Better care can lead to <em className="italic">better outcomes.</em>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[14px] leading-6 text-[#0A2E28]/70 sm:text-[15px]">
              By guiding people through more intuitive paths to care, we aim to make healthcare easier to navigate and support better experiences for every family.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-8 lg:mt-16 lg:grid-cols-4 lg:gap-6">
            {OUTCOMES.map((item) => (
              <OutcomeRing key={item.id} item={item} active={arcsActive} reduced={reduced} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
