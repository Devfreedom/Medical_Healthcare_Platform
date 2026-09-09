const companyLinks = ['About', 'Careers', 'Press'];
const serviceLinks = ['Primary Care', 'Telehealth', 'Specialists'];
const quickLinks = ['Book a Visit', 'Patient Portal', 'FAQ'];

export default function Footer() {
  return (
    <footer className="bg-nb-ink text-white/75">
      <div className="mx-auto max-w-content px-4 pb-8 pt-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 text-2xl font-bold tracking-tight text-white">Northbridge Health</div>
            <p className="max-w-xs text-sm leading-6 text-white/70">
              Compassionate care, modern treatment, and a more personal approach to your healthcare journey.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Company</h3>
            <ul className="space-y-3 text-sm text-white/70">
              {companyLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-white">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Services</h3>
            <ul className="space-y-3 text-sm text-white/70">
              {serviceLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-white">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Quick Links</h3>
            <ul className="space-y-3 text-sm text-white/70">
              {quickLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-white">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-white/60">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>© 2026 Northbridge Health. All rights reserved.</div>
            <div>Not a real medical provider — prototype platform.</div>
          </div>
        </div>

        <div className="mt-6 text-center text-[clamp(2.2rem,7vw,6rem)] font-serif leading-none tracking-[-0.06em] text-white/10">
          Northbridge Health
        </div>
      </div>
    </footer>
  );
}
