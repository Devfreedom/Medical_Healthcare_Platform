import { useEffect, useState } from 'react';

const PROGRAMS = [
  {
    id: 'fertility',
    label: 'Fertility',
    stories: [
      {
        quote:
          'We had amazing emotional support and saved around what we were going to spend on IVF. The only difference was our care team — and now we are pregnant.',
        name: 'Han',
        role: 'Fertility program',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop',
      },
      {
        quote:
          'From the first call we felt held. Second opinions, treatment planning, someone to talk to at 11pm — it all arrived when we needed it most.',
        name: 'Mairead',
        role: 'Fertility program',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&fit=crop',
      },
    ],
  },
  {
    id: 'maternity',
    label: 'Maternity',
    stories: [
      {
        quote:
          'This is by far the easiest access to specialists I have experienced. It feels so safe to know I can talk to someone when I need to.',
        name: 'Sarah',
        role: 'Maternity program',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop',
      },
      {
        quote:
          'My midwife team answered every question before I even thought to ask it. Pregnancy felt shared instead of solo.',
        name: 'Amara',
        role: 'Maternity program',
        avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=160&h=160&fit=crop',
      },
    ],
  },
  {
    id: 'parenting',
    label: 'Parenting',
    stories: [
      {
        quote:
          'From second opinions on fertility treatment to newborn care, this has been the constant, trusted companion through a turbulent time.',
        name: 'Mairead',
        role: 'Parenting program',
        avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=160&h=160&fit=crop',
      },
      {
        quote:
          'Night-one pediatric advice at our kitchen table. It turned our hardest weeks into our most supported ones.',
        name: 'Jordan',
        role: 'Parenting program',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop',
      },
    ],
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

export default function Testimonials() {
  const prefersReduced = usePrefersReducedMotion();
  const [programIndex, setProgramIndex] = useState(0);
  const [storyIndex, setStoryIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const program = PROGRAMS[programIndex];
  const story = program.stories[storyIndex];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    const section = document.getElementById('stories');
    if (section) observer.observe(section);
    return () => observer.disconnect();
  }, [prefersReduced]);

  const selectProgram = (index) => {
    setProgramIndex(index);
    setStoryIndex(0);
  };

  const step = (direction) => {
    const count = program.stories.length;
    setStoryIndex((prev) => (prev + direction + count) % count);
  };

  const fade = (delay) =>
    prefersReduced
      ? { opacity: 1 }
      : {
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition: visible ? `opacity 700ms ease ${delay}ms, transform 700ms ease ${delay}ms` : 'none',
        };

  return (
    <section id="stories" className="bg-maven-cream">
      <div className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          {/* Collage */}
          <div className="relative mx-auto w-full max-w-sm" style={fade(0)}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=1000&fit=crop"
                alt="Care team reviewing a patient chart"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-8 -right-4 hidden w-40 overflow-hidden rounded-[1.5rem] border-4 border-maven-cream shadow-xl sm:block aspect-square">
              <img
                src="https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=400&fit=crop"
                alt="Member holding a newborn"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          {/* Quote panel */}
          <div style={fade(150)}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-maven-clay">Member stories</p>
            <h2 className="mt-3 font-serif text-4xl leading-[1.05] text-maven-pine sm:text-5xl">
              Trusted by real families
            </h2>
            <div className="mt-8 font-serif text-6xl leading-none text-maven-butter">“</div>
            <blockquote className="mt-3 min-h-[7rem] font-serif text-2xl leading-[1.4] text-maven-pine sm:text-[1.75rem]">
              {story.quote}
            </blockquote>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
              {/* Program switcher */}
              <div className="flex flex-wrap items-center gap-2">
                {PROGRAMS.map((p, index) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectProgram(index)}
                    aria-pressed={index === programIndex}
                    className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                      index === programIndex
                        ? 'bg-maven-pine text-white'
                        : 'border border-maven-pine/30 text-maven-pine hover:border-maven-pine'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {/* Pagination */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous member story"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-maven-pine/30 text-maven-pine transition hover:border-maven-pine"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next member story"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-maven-pine/30 text-maven-pine transition hover:border-maven-pine"
                >
                  →
                </button>
                <span className="ml-1 text-sm font-semibold text-maven-pine/60">
                  {storyIndex + 1} / {program.stories.length}
                </span>
              </div>
            </div>
            {/* Member identity */}
            <div className="mt-8 flex items-center gap-4 border-t border-maven-pine/15 pt-6">
              <img
                key={story.avatar}
                src={story.avatar}
                alt={story.name}
                className="h-12 w-12 rounded-full object-cover"
                loading="lazy"
              />
              <div>
                <div className="font-semibold text-maven-pine">{story.name}</div>
                <div className="text-sm text-maven-pine/60">{story.role}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
