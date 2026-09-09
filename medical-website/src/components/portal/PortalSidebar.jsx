import { ArrowLeft, Menu, X } from 'lucide-react';

export default function PortalSidebar({ navItems, activePage, onSelect, onBack, isOpen, onToggle }) {
  return (
    <>
      <button
        type="button"
        aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
        onClick={onToggle}
        className="fixed left-4 top-4 z-30 inline-flex h-11 w-11 items-center justify-center rounded-full bg-nb-teal-dark text-white shadow-lg lg:hidden"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={onToggle}
          className="fixed inset-0 z-20 bg-nb-ink/40 lg:hidden"
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-20 w-60 shrink-0 bg-nb-teal-dark text-white transition-transform lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-full flex-col px-4 py-6">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white">
            NH
          </div>
          <div className="text-lg font-semibold tracking-tight text-white">Northbridge</div>
        </div>

        <nav className="space-y-2">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activePage === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  onSelect(id);
                  onToggle();
                }}
                className={`flex w-full items-center gap-3 rounded-full px-3 py-2.5 text-left text-sm font-medium transition ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-4">
          <button type="button" onClick={onBack} className="flex w-full items-center gap-2 rounded-full px-3 py-2 text-left text-sm text-white/75 hover:bg-white/5 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to homepage
          </button>
        </div>
      </div>
      </aside>
    </>
  );
}
