import { Home } from 'lucide-react';

export default function PortalSidebar({ navItems, activePage, onSelect }) {
  return (
    <aside className="w-64 shrink-0 bg-nb-teal-dark text-white">
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
                onClick={() => onSelect(id)}
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
          <button type="button" className="flex items-center gap-2 text-sm text-white/75 hover:text-white">
            <Home className="h-4 w-4" />
            Home
          </button>
        </div>
      </div>
    </aside>
  );
}
