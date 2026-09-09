import { steps } from '../../data/steps';

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-nb-sand to-nb-line p-5">
          <div className="flex min-h-[340px] items-center justify-center rounded-[1.25rem] border border-nb-line bg-gradient-to-br from-[#F7F4EE] to-[#DDE3E3] text-center text-sm font-medium uppercase tracking-[0.18em] text-nb-teal/80">
            [Photo: family consulting with provider]
          </div>
        </div>

        <div>
          <h2 className="font-serif text-4xl leading-tight tracking-[-0.04em] text-nb-teal sm:text-5xl">How It Works</h2>

          <div className="mt-8 space-y-5">
            {steps.map(({ id, title, description }) => (
              <div key={id} className="flex gap-4 rounded-[1.25rem] border border-nb-line bg-nb-paper p-4 shadow-[0_10px_24px_rgba(19,42,44,0.03)]">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-nb-sand text-lg text-nb-teal">
                  {id}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-nb-ink">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-nb-ink/70">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
