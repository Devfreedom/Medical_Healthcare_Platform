export default function Outcomes() {
  const stats = [
    { value: '27%', label: 'Lower NICU admissions' },
    { value: '40%', label: 'Helped return to work after baby' },
    { value: '30%', label: 'Achieved pregnancy without ART' },
    { value: '21%', label: 'Improved maternal mental health' },
  ];

  return (
    <section className="bg-maven-paper">
      <div className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="rounded-[2rem] border border-maven-line/70 bg-white p-7 shadow-[0_16px_40px_rgba(6,42,32,0.06)] sm:p-10 lg:p-12">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-maven-clay">Outcomes</p>
            <h2 className="mt-3 font-serif text-4xl leading-[1.05] text-maven-pine sm:text-5xl">Lowering costs by improving care</h2>
            <p className="mt-4 text-lg leading-8 text-maven-pine/65">By guiding members through more intuitive paths to health, we reduce costly interventions and improve outcomes.</p>
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(({ value, label }) => (
              <div key={label} className="border-l-2 border-maven-clay/40 pl-5">
                <div className="font-serif text-5xl font-semibold text-maven-pine">{value}</div>
                <p className="mt-2 text-[15px] leading-6 text-maven-pine/65">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
