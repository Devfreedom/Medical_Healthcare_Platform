import { useEffect, useState } from 'react';

const heroSlides = [
  {
    src: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=2000&q=80',
    alt: '',
    label: 'NORTHBRIDGE CARE / FAMILY (1/3)',
    vizLabel: 'Care for every stage',
  },
  {
    src: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=2000&q=80',
    alt: '',
    label: 'NORTHBRIDGE CARE / MATERNITY (2/3)',
    vizLabel: 'Support through maternity',
  },
  {
    src: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=2000&q=80',
    alt: '',
    label: 'NORTHBRIDGE CARE / EVERY STAGE (3/3)',
    vizLabel: 'Connected family care',
  },
];

const CYCLE_MS = 7800;

export default function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    heroSlides.forEach((slide) => {
      const img = new Image();
      img.src = slide.src;
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, CYCLE_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="top" aria-label="Northbridge hero" className="w-full bg-[#0A2E28] p-3">
      <div className="relative h-[92svh] min-h-[560px] w-full overflow-hidden rounded-[16px] sm:h-[90vh] sm:rounded-[24px]">
      <div className="absolute inset-0" aria-hidden="true">
        {heroSlides.map((slide, index) => (
          <img
            key={slide.src}
            src={slide.src}
            alt=""
            aria-hidden="true"
            loading={index === 0 ? 'eager' : 'lazy'}
            className="absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out"
            style={{
              opacity: index === activeSlide ? 1 : 0,
              transitionDuration: '600ms',
            }}
          />
        ))}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(10,46,40,0.6) 0%, rgba(10,46,40,0.1) 70%)' }}
        />
      </div>

      <div className="absolute inset-0 z-10">
        <div className="relative h-full w-full">
          <div className="absolute left-[8%] right-6 top-[24%] z-20 max-w-[560px] sm:top-[28%] sm:pr-6">
            <h1 className="font-serif text-[clamp(2.25rem,4.6vw,56px)] font-light leading-[1.05] text-white">
              Evidence-based women&apos;s and family <em className="italic">healthcare</em>
            </h1>
            <p className="mt-4 text-[16px] leading-6 text-white/80">Expert care across every life stage.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center" style={{ gap: '12px' }}>
              <a
                href="#care-categories"
                className="inline-flex items-center justify-center rounded-[6px] bg-[#8EF5D0] px-6 py-2.5 text-[14px] font-medium text-[#0A2E28] transition-all duration-200 hover:scale-[1.03] hover:bg-white"
              >
                Explore platform
              </a>
              <a
                href="#contact-section"
                className="inline-flex items-center justify-center rounded-[6px] border border-[#8EF5D0] bg-transparent px-6 py-2.5 text-[14px] font-medium text-[#8EF5D0] transition-all duration-200 hover:scale-[1.03] hover:bg-[#8EF5D0]/10"
              >
                Get care
              </a>
            </div>
          </div>

          <div key={activeSlide} className="absolute bottom-[24px] left-[24px] h-[80px] w-[90%] max-w-[640px]">
            <svg
              aria-hidden="true"
              viewBox="0 0 640 80"
              preserveAspectRatio="none"
              className="h-full w-full"
            >
              {/* LINE A — purple, idle drift only */}
              <g className="nb-drift-a">
                <path
                  d="M0 18 C 30 12, 60 24, 90 18 S 140 10, 170 16"
                  fill="none"
                  stroke="#C9B6D0"
                  strokeOpacity="0.7"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                />
                <circle cx="170" cy="16" r="2.5" fill="#F9E07A" />
              </g>
              {/* LINE B — gold, idle drift only */}
              <g className="nb-drift-b">
                <path
                  d="M0 38 C 35 32, 70 44, 105 38 S 160 30, 190 36"
                  fill="none"
                  stroke="#D4B07A"
                  strokeOpacity="0.7"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                />
                <circle cx="190" cy="36" r="2.5" fill="#D6C7FF" />
              </g>
              {/* LINE C — main teal, draw / hold / retract */}
              <path
                className="nb-teal-path"
                d="M0 60 Q160 44 320 62 T640 58"
                fill="none"
                stroke="#5AC8B2"
                strokeOpacity="0.9"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeDasharray="700"
              />
              <circle className="nb-teal-dot" cx="588" cy="59" r="3" fill="#00D1FF" />
            </svg>
            {/* Slide-specific label — revealed at peak */}
            <div className="nb-teal-label absolute right-0 top-[38%] flex items-center gap-[6px] rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
              <span aria-hidden="true" className="h-[20px] w-[20px] shrink-0 rounded-full bg-[#FFB84D]" />
              <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.8px] text-white/90">
                {heroSlides[activeSlide].vizLabel}
              </span>
            </div>
          </div>

          <p aria-live="polite" className="absolute bottom-6 right-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 sm:bottom-10 sm:right-10">
            {heroSlides[activeSlide].label}
          </p>
        </div>
      </div>
      <style>{`
        /* Idle drift — 5px left/right, continuous and restrained */
        .nb-drift-a { animation: nb-drift 6s ease-in-out infinite alternate; }
        .nb-drift-b { animation: nb-drift 7.5s ease-in-out -2s infinite alternate; }
        @keyframes nb-drift { from { transform: translateX(-5px); } to { transform: translateX(5px); } }

        /* Teal main line — draw 0-4.4s (peak 92%), hold to 5.6s, retract by 7.5s, reset */
        .nb-teal-path {
          stroke-dashoffset: 700;
          animation: nb-teal-draw 7.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes nb-teal-draw {
          0%    { stroke-dashoffset: 700; }
          30%   { stroke-dashoffset: 490; }  /* ~30% drawn at 2.34s */
          56.4% { stroke-dashoffset: 56; }   /* 92% drawn at 4.4s — PEAK */
          71.8% { stroke-dashoffset: 56; }   /* hold to 5.6s */
          96.2% { stroke-dashoffset: 700; }  /* retracted by 7.5s */
          100%  { stroke-dashoffset: 700; }  /* reset */
        }

        /* Teal endpoint dot — cyan, turns warm orange at peak, shrinks on retract */
        .nb-teal-dot {
          animation: nb-dot-cycle 7.8s linear forwards;
        }
        @keyframes nb-dot-cycle {
          0%     { fill: #00D1FF; r: 3; opacity: 0; }
          4%     { opacity: 1; }
          56.4%  { fill: #00D1FF; r: 3; }
          57%    { fill: #FFB84D; r: 3.5; }  /* peak: warm orange */
          71.8%  { fill: #FFB84D; r: 3.5; }
          96.2%  { fill: #FFB84D; r: 1.5; opacity: 0.6; }  /* retract: shrink */
          100%   { fill: #00D1FF; r: 3; opacity: 0; }
        }

        /* Slide label — fades/slides in at peak, out on retract */
        .nb-teal-label {
          opacity: 0;
          transform: translateX(-10px);
          animation: nb-label-cycle 7.8s ease-out forwards;
        }
        @keyframes nb-label-cycle {
          0%     { opacity: 0; transform: translateX(-10px); }
          56.4%  { opacity: 0; transform: translateX(-10px); }
          60.2%  { opacity: 1; transform: translateX(0); }   /* 300ms reveal */
          71.8%  { opacity: 1; transform: translateX(0); }
          76%    { opacity: 0; transform: translateX(0); }   /* fade out during retract */
          100%   { opacity: 0; transform: translateX(-10px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .nb-drift-a, .nb-drift-b, .nb-teal-path, .nb-teal-dot, .nb-teal-label { animation: none; }
          .nb-teal-path { stroke-dashoffset: 56; }   /* static peak state */
          .nb-teal-dot { fill: #FFB84D; opacity: 1; }
          .nb-teal-label { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      </div>
    </section>
  );
}
