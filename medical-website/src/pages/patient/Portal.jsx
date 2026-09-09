import { useMemo, useState } from 'react';
import {
  Calendar,
  ClipboardList,
  Home,
  MessageSquare,
  Receipt,
  Settings,
  Video,
} from 'lucide-react';
import PortalSidebar from '../../components/portal/PortalSidebar';
import DashboardView from '../../components/portal/DashboardView';
import AppointmentsView from '../../components/portal/AppointmentsView';
import TelehealthView from '../../components/portal/TelehealthView';
import RecordsView from '../../components/portal/RecordsView';
import MessagesView from '../../components/portal/MessagesView';
import BillingView from '../../components/portal/BillingView';
import ProfileView from '../../components/portal/ProfileView';

const navConfig = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'telehealth', label: 'Telehealth', icon: Video },
  { id: 'records', label: 'Medical Records', icon: ClipboardList },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'billing', label: 'Billing & Insurance', icon: Receipt },
  { id: 'profile', label: 'Profile & Settings', icon: Settings },
];

const pageSubtitles = {
  dashboard: "Here's what's happening with your care.",
  appointments: 'Manage upcoming visits and request a new appointment.',
  telehealth: 'Join your secure virtual visit when your care team is ready.',
  records: 'Review visit history, documents, allergies, and prescriptions.',
  messages: 'Stay connected with your care team.',
  billing: 'Review statements and keep your insurance information current.',
  profile: 'Manage your personal details and notification preferences.',
};

const pageMap = {
  dashboard: DashboardView,
  appointments: AppointmentsView,
  telehealth: TelehealthView,
  records: RecordsView,
  messages: MessagesView,
  billing: BillingView,
  profile: ProfileView,
};

export default function Portal({ onBack }) {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const ActiveView = useMemo(() => pageMap[activePage], [activePage]);

  const activeLabel = navConfig.find((item) => item.id === activePage)?.label || 'Dashboard';

  return (
    <div className="flex min-h-screen bg-nb-paper text-nb-ink">
      <PortalSidebar
        navItems={navConfig}
        activePage={activePage}
        onSelect={setActivePage}
        onBack={onBack}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((open) => !open)}
      />

      <main className="min-w-0 flex-1 bg-nb-paper">
        <div className="mx-auto max-w-7xl px-4 py-6 pt-20 sm:px-6 lg:px-8 lg:pt-6">
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-nb-line pb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-nb-teal/60">Patient portal</p>
              <h1 className="mt-2 font-serif text-4xl tracking-[-0.04em] text-nb-teal">{activeLabel}</h1>
              <p className="mt-2 text-sm text-nb-ink/65">{pageSubtitles[activePage]}</p>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-full border border-nb-line bg-white px-4 py-2 text-sm font-medium text-nb-teal transition hover:bg-nb-sand"
            >
              Back to homepage
            </button>
          </div>

          <ActiveView />
        </div>
      </main>
    </div>
  );
}
