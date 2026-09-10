import { useEffect, useRef, useState } from 'react';

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

export default function Testimonials() {
  const prefersReduced = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  ).current;
  const [programIndex, setProgramIndex] = useState(0);
  const [storyIndex, setStoryIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const program = PROGRAMS[programIndex];
  const story = program.stories[storyIndex];

  useEffect(() => {
    if (prefersReduced) {
      setVisible(true);
      return undefined;
    }
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
