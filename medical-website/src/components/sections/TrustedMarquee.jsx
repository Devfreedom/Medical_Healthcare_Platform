const TRUST_ITEMS = [
  'Evidence-guided care',
  'Clinician-reviewed',
  '24/7 virtual access',
  '30+ specialties',
  'Coordinated teams',
  'Personal care plans',
  'Ongoing support',
  'Private & secure',
];

export default function TrustedMarquee() {
  return (
    <section aria-label="Trusted by" className="bg-[#0A2E28] py-14 sm:py-16">
      <style>{`
        @keyframes nb-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .nb-marquee-track { animation: nb-marquee 30s linear infinite; }
        .nb-marquee-mask { mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent); }
        @media (prefers-reduced-motion: reduce) { .nb-marquee-track { animation: none; } }
      `}</style>

      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-white/45">
        <span aria-hidden="true">◆ </span>Trusted by<span aria-hidden="true"> ◆</span>
      </p>

      <div className="nb-marquee-mask mt-10 w-full overflow-hidden" role="marquee" aria-live="off">
        <div className="nb-marquee-track flex w-max">
          {[0, 1].map((group) => (
            <ul key={group} aria-hidden={group === 1} className="flex shrink-0 items-center">
              {TRUST_ITEMS.map((item) => (
                <li key={`${group}-${item}`} className="mx-6 flex shrink-0 items-center gap-6 sm:mx-10">
                  <span className="text-[13px] uppercase tracking-[0.22em] text-white/60 sm:text-[14px]">{item}</span>
                  <span aria-hidden="true" className="text-[8px] text-white/30">◆</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
