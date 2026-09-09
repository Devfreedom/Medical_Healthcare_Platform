export default function MissionStrip() {
  return (
    <section className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid items-center gap-8 rounded-[1.5rem] border border-nb-line bg-nb-paper p-5 shadow-[0_12px_30px_rgba(19,42,44,0.04)] md:grid-cols-2 md:p-8">
        <div className="overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-nb-sand to-nb-line p-5">
          <div className="flex min-h-[220px] items-center justify-center rounded-[1rem] border border-nb-line bg-gradient-to-br from-[#F7F4EE] to-[#E5E0D4] text-center text-sm font-medium uppercase tracking-[0.18em] text-nb-teal/80">
            [Photo: clinical team]
          </div>
        </div>

        <div>
          <h2 className="font-serif text-4xl leading-tight tracking-[-0.04em] text-nb-teal sm:text-5xl">
            We are more than just a platform; we are your dedicated health partner.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-nb-ink/75">
            Our team blends clinical expertise with human-centered care, helping you navigate prevention, treatment, and everyday wellbeing with clarity and confidence.
          </p>
          <p className="mt-4 max-w-xl text-base leading-7 text-nb-ink/75">
            We bring thoughtful support, trusted communication, and modern access to care for individuals and families alike.
          </p>

          <button type="button" className="mt-7 rounded-full border border-nb-teal px-6 py-3 font-semibold text-nb-teal transition hover:bg-nb-teal hover:text-white">
            Explore Our Story
          </button>
        </div>
      </div>
    </section>
  );
}
