import { useEffect, useRef, useState } from 'react';

const PRINCIPLES = [
  {
    title: 'One connected care experience',
    description: 'Keep care conversations and next steps connected across your journey.',
  },
  {
    title: 'Human support when you need it',
    description: 'Make it easier to reach the right person without starting over.',
  },
  {
    title: 'Care that evolves with you',
    description: 'Stay connected as your needs, goals, and circumstances change.',
  },
];

const IMAGE_URL =
  'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1400&q=80';

function useReducedMotion() {
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

export default function ContinuingCare() {
  const reduced = useReducedMotion();
  const hasObserver = typeof IntersectionObserver !== 'undefined';
  const sectionRef = useRef(null);
  const [entered, setEntered] = useState(!hasObserver);

  useEffect(() => {
    if (!hasObserver) return undefined;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [hasObserver]);

  const reveal = (delay) =>
    reduced || entered
      ? { opacity: 1, transform: 'translateY(0)' }
      : {
          opacity: 0,
          transform: 'translateY(24px)',
          transition: `opacity 500ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 500ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        };

  return (
    <section
      ref={sectionRef}
      aria-label="Continuing care"
      className="w-full bg-[#0A2E28]"
    >
      <div className="mx-auto max-w-[1180px] px-4 py-20 sm:px-6 sm:py-24 lg:py-32">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
          {/* LEFT — 42% */}
          <div className="lg:w-[42%]">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8EF5D0]"
              style={reveal(0)}
            >
              Continuing care
            </p>
            <h2
              className="mt-4 font-serif text-[36px] leading-[1.05] text-white sm:text-[42px] lg:text-[48px]"
              style={reveal(100)}
            >
              Care that stays with you, <em className="italic">not just visits.</em>
            </h2>
            <p
              className="mt-6 max-w-[500px] text-[14px] leading-7 text-white/70"
              style={reveal(200)}
            >
              Northbridge helps people stay connected to the right care, guidance, and follow-up as their needs change.
            </p>

            <ul className="mt-10">
              {PRINCIPLES.map((item, i) => (
                <li
                  key={item.title}
                  className={`py-4 ${i > 0 ? 'border-t border-white/10' : 'pt-0'}`}
                  style={reveal(300 + i * 100)}
                >
                  <div className="flex items-start gap-4">
                    <span
                      aria-hidden="true"
                      className="mt-[3px] font-serif text-[12px] leading-none text-[#8EF5D0]"
                    >
                      0{i + 1}
                    </span>
                    <div>
                      <h3 className="text-[14px] font-semibold leading-6 text-white">{item.title}</h3>
                      <p className="mt-1 text-[13px] leading-6 text-white/70">{item.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT — 58% */}
          <div className="lg:w-[58%]" style={reveal(200)}>
            <figure className="group">
              <div className="overflow-hidden rounded-[12px]">
                <img
                  src={IMAGE_URL}
                  alt="A clinician speaking with a parent and child during a care conversation"
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                />
              </div>
              <figcaption
                className="mt-3 max-w-[420px] text-[11px] leading-5 text-white/60 transition-opacity duration-300 group-hover:opacity-90"
              >
                A Northbridge care conversation — guidance that continues between and beyond visits.
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}