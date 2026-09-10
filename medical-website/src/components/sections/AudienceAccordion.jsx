import { useEffect, useRef, useState } from 'react';

const AUDIENCES = [
  {
    id: 'patients',
    title: 'Patients',
    description: 'Everyday care, women\u2019s health and 24/7 virtual visits — built around your life.',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1600&q=80',
    alt: 'Patient consulting with a healthcare professional',
  },
  {
    id: 'families',
    title: 'Families',
    description: 'Coordinated care for parents, children and every stage in between.',
    image: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=1600&q=80',
    alt: 'Family in a warm healthcare moment',
  },
  {
    id: 'caregivers',
    title: 'Caregivers',
    description: 'Support and guidance for those who care for someone else.',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1600&q=80',
    alt: 'Caregiver supporting another person',
  },
  {
    id: 'professionals',
    title: 'Healthcare Professionals',
    description: 'Connected specialties that keep your team and your patients in sync.',
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=1600&q=80',
    alt: 'Clinician interacting with a patient',
  },
  {
    id: 'employers',
    title: 'Employers',
    description: 'Simple benefits support that helps your people get care sooner.',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80',
    alt: 'Professional wellness workplace context',
  },
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

export default function AudienceAccordion() {
  const hasObserver = typeof IntersectionObserver !== 'undefined';
  const reduced = usePrefersReducedMotion();
  const [activeId, setActiveId] = useState('patients');
  const [visible, setVisible] = useState(!hasObserver);
  const [interacting, setInteracting] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!hasObserver) return undefined;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((entry) => setVisible(entry.isIntersecting)),
      { threshold: 0.2 },
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [hasObserver]);

  useEffect(() => {
    if (reduced || !visible || interacting) return undefined;
    let timer = 0;
    const cycle = () => {
      timer = window.setTimeout(() => {
        setActiveId((current) => {
          const index = AUDIENCES.findIndex((a) => a.id === current);
          return AUDIENCES[(index + 1) % AUDIENCES.length].id;
        });
        cycle();
      }, 3000);
    };
    cycle();
    return () => window.clearTimeout(timer);
  }, [reduced, visible, interacting]);

  const active = AUDIENCES.find((a) => a.id === activeId) ?? AUDIENCES[0];

  return (
    <section ref={sectionRef} aria-label="Care for every audience" className="bg-[#0A2E28]">
      <div className="mx-auto max-w-[1180px] px-4 py-20 sm:px-6 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[40%_60%] lg:items-center lg:gap-16">
          <div>
            <h2 className="font-serif text-[34px] leading-[1.08] text-[#FFF9EF] sm:text-[42px] lg:text-[52px]">
              Making healthcare work <em className="italic">for all of us</em>
            </h2>
            <p className="mt-5 max-w-[430px] text-[14px] leading-6 text-white/70 sm:text-[15px]">
              Northbridge is designed to make care easier to access and navigate — for patients, families, caregivers, professionals and the employers who support them.
            </p>

            <ul className="mt-10 border-t border-white/20">
              {AUDIENCES.map((item) => {
                const isActive = item.id === activeId;
                return (
                  <li key={item.id} className="border-b border-white/20">
                    <button
                      type="button"
                      aria-expanded={isActive}
                      onClick={() => { setInteracting(true); setActiveId(item.id); }}
                      onMouseEnter={() => setInteracting(true)}
                      onMouseLeave={() => setInteracting(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setInteracting(true);
                          setActiveId(item.id);
                        }
                      }}
                      className={`flex w-full items-center justify-between gap-4 px-2 py-4 text-left transition-colors duration-300 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-[#8EF5D0] ${isActive ? 'text-[#8EF5D0]' : 'text-white/85'}`}
                    >
                      <span className="flex items-center gap-3">
                        <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full bg-[#8EF5D0] transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                        <span className="font-serif text-[18px] sm:text-[19px]">{item.title}</span>
                      </span>
                      <span aria-hidden="true" className={`text-[20px] font-light transition-transform duration-300 ${isActive ? 'rotate-45 text-[#8EF5D0]' : 'text-white/50'}`}>+</span>
                    </button>
                    <div className="overflow-hidden px-2 transition-all duration-300 ease-out" style={{ maxHeight: isActive ? 80 : 0, opacity: isActive ? 1 : 0 }}>
                      <p className="pb-4 text-[13.5px] leading-5 text-white/65">{item.description}</p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <a
              href="#contact-section"
              onClick={() => setInteracting(true)}
              className="mt-10 inline-flex items-center rounded-[8px] bg-[#8EF5D0] px-5 py-3 text-[14px] font-semibold text-[#0A2E28] transition-transform duration-200 hover:scale-[1.03]"
            >
              Talk to our team
            </a>
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[12px] bg-[#06231E]">
            {AUDIENCES.map((item) => (
              <img
                key={item.id}
                src={item.image}
                alt={item.id === activeId ? item.alt : ''}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ease-in"
                style={{ opacity: item.id === activeId ? 1 : 0 }}
              />
            ))}
            <span className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0A2E28]/70 to-transparent" aria-hidden="true" />
            <p className="absolute bottom-4 left-5 text-[13px] text-white/85">{active.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
