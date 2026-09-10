import { useEffect, useState } from 'react';

const heroSlides = [
  {
    src: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=2000&q=80',
    alt: '',
    label: 'NORTHBRIDGE CARE / FAMILY (1/3)',
  },
  {
    src: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=2000&q=80',
    alt: '',
    label: 'NORTHBRIDGE CARE / MATERNITY (2/3)',
  },
  {
    src: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=2000&q=80',
    alt: '',
    label: 'NORTHBRIDGE CARE / EVERY STAGE (3/3)',
  },
];

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
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="top" aria-label="Northbridge hero" className="relative h-[90vh] min-h-[560px] w-full overflow-hidden bg-[#0A2E28]">
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
              transitionDuration: '800ms',
            }}
          />
        ))}
        <div className="absolute inset-0 bg-black/35" />
      </div>

      <div className="absolute inset-0 z-10">
        <div className="relative h-full w-full">
          <div className="absolute left-[8%] top-[28%] z-20 max-w-[560px] pr-6">
            <h1 className="font-serif text-[clamp(2.5rem,5.2vw,64px)] leading-[1.05] text-white">
              Evidence-based women&apos;s and family <em className="italic">healthcare</em>
            </h1>
            <p className="mt-4 text-[16px] leading-6 text-white/80">Expert care across every life stage.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center" style={{ gap: '12px' }}>
              <a
                href="#care-categories"
                className="inline-flex items-center justify-center rounded-[6px] bg-[#7AF0C0] px-5 py-3 text-[14px] font-semibold text-[#0A2E28] transition-all duration-200 hover:scale-105 hover:bg-white"
              >
                Explore platform
              </a>
              <a
                href="#contact-section"
                className="inline-flex items-center justify-center rounded-[6px] border border-[#7AF0C0] bg-transparent px-5 py-3 text-[14px] font-semibold text-[#7AF0C0] transition-all duration-200 hover:scale-105 hover:bg-[#7AF0C0]/10"
              >
                Get care
              </a>
            </div>
          </div>

          <svg
            aria-hidden="true"
            viewBox="0 0 500 100"
            preserveAspectRatio="none"
            className="absolute bottom-10 left-0 hidden h-[100px] w-[500px] max-w-[60vw] sm:block"
          >
            <path
              d="M0 28 C 90 18, 150 44, 250 34 S 410 20, 500 30"
              fill="none"
              stroke="#B8A0D0"
              strokeOpacity="0.6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="8 10"
              className="nb-flow-line"
            />
            <path
              d="M0 48 C 100 38, 170 62, 270 52 S 420 40, 500 50"
              fill="none"
              stroke="#D4B66A"
              strokeOpacity="0.6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="8 10"
              className="nb-flow-line nb-flow-delay-1"
            />
            <path
              d="M0 68 C 110 58, 180 80, 280 70 S 420 60, 500 70"
              fill="none"
              stroke="#5AC8B2"
              strokeOpacity="0.8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="8 10"
              className="nb-flow-line nb-flow-delay-2"
            />
            <path
              d="M0 86 C 120 76, 190 96, 290 88 S 430 78, 500 88"
              fill="none"
              stroke="#0E7C6B"
              strokeOpacity="0.9"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="8 10"
              className="nb-flow-line nb-flow-delay-3"
            />
            <circle cx="498" cy="30" r="4" fill="#B8A0D0" />
            <circle cx="500" cy="50" r="4" fill="#D4B66A" />
            <circle cx="498" cy="70" r="4" fill="#5AC8B2" />
          </svg>

          <p aria-live="polite" className="absolute bottom-10 right-10 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
            {heroSlides[activeSlide].label}
          </p>
        </div>
      </div>
      <style>{`
        .nb-flow-line { animation: nb-flow 7s linear infinite; }
        .nb-flow-delay-1 { animation-delay: -1.75s; }
        .nb-flow-delay-2 { animation-delay: -3.5s; }
        .nb-flow-delay-3 { animation-delay: -5.25s; }
        @keyframes nb-flow { to { stroke-dashoffset: -180; } }
        @media (prefers-reduced-motion: reduce) { .nb-flow-line { animation: none; } }
      `}</style>
    </section>
  );
}
