import { Camera, Mic, PhoneOff } from 'lucide-react';

export default function TelehealthView() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-status-info bg-status-info-bg px-4 py-3 text-sm font-medium text-status-info">
        Your visit starts in 12 minutes.
      </div>

      <div className="rounded-2xl bg-nb-ink p-6 text-white shadow-[0_18px_40px_rgba(19,42,44,0.12)]">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#263d41] to-[#0d1c1d] p-6">
          <div className="flex min-h-[420px] items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-3xl font-semibold text-white">
              AO
            </div>
          </div>

          <div className="absolute bottom-4 right-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-lg font-semibold text-white">
            You
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4">
          <button type="button" className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/15">
            <Mic className="h-5 w-5" />
          </button>
          <button type="button" className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/15">
            <Camera className="h-5 w-5" />
          </button>
          <button type="button" className="flex h-12 w-12 items-center justify-center rounded-full bg-status-danger text-white hover:bg-red-700">
            <PhoneOff className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
