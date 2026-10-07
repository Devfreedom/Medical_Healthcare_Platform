import { Camera, Mic, PhoneOff } from 'lucide-react';

// Telehealth preview only — no real visit is scheduled here. Controls are
// disabled until the backend/video phase.
export default function TelehealthView() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-status-info bg-status-info-bg px-4 py-3 text-sm font-medium text-status-info">
        Telehealth preview. No visit is scheduled — virtual visit scheduling arrives with the backend
        phase. Coming soon.
      </div>

      <div className="rounded-2xl bg-nb-ink p-6 text-white shadow-[0_18px_40px_rgba(19,42,44,0.12)]">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#263d41] to-[#0d1c1d] p-6">
          <div className="flex min-h-[320px] items-center justify-center">
            <p className="px-6 text-center text-sm text-white/70">
              Your video visit will appear here once scheduled.
            </p>
          </div>

          <div className="absolute bottom-4 right-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-lg font-semibold text-white">
            You
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            disabled
            title="Coming soon"
            aria-label="Mute microphone (coming soon)"
            aria-disabled="true"
            className="flex h-12 w-12 cursor-not-allowed items-center justify-center rounded-full bg-white/10 text-white/40"
          >
            <Mic className="h-5 w-5" />
          </button>
          <button
            type="button"
            disabled
            title="Coming soon"
            aria-label="Turn camera off (coming soon)"
            aria-disabled="true"
            className="flex h-12 w-12 cursor-not-allowed items-center justify-center rounded-full bg-white/10 text-white/40"
          >
            <Camera className="h-5 w-5" />
          </button>
          <button
            type="button"
            disabled
            title="Coming soon"
            aria-label="Leave visit (coming soon)"
            aria-disabled="true"
            className="flex h-12 w-12 cursor-not-allowed items-center justify-center rounded-full bg-status-danger/40 text-white/60"
          >
            <PhoneOff className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
