import { FileText, ShieldAlert, Pill } from 'lucide-react';
import { visitHistory } from '../../data/appointments';
import { documents } from '../../data/documents';

export default function RecordsView() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-2xl border border-nb-line bg-white p-5 shadow-[0_12px_24px_rgba(19,42,44,0.04)]">
        <h3 className="mb-5 text-xl font-semibold text-nb-teal">Visit history</h3>

        <div className="space-y-4">
          {visitHistory.map((visit) => (
            <div key={visit.id} className="flex gap-4 rounded-2xl bg-nb-paper p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-nb-sand text-nb-teal">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm text-nb-ink/60">{visit.date}</div>
                <div className="font-semibold text-nb-ink">{visit.provider}</div>
                <div className="mt-1 text-sm text-nb-ink/70">{visit.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-nb-line bg-white p-5 shadow-[0_12px_24px_rgba(19,42,44,0.04)]">
          <h3 className="mb-4 text-xl font-semibold text-nb-teal">Documents & results</h3>
          <div className="space-y-3">
            {documents.map((document) => (
              <div key={document.id} className="flex items-center gap-3 rounded-2xl bg-nb-paper p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-nb-sand text-nb-teal">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-nb-ink">{document.label}</div>
                  <div className="text-sm text-nb-ink/60">{document.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-nb-line bg-white p-5 shadow-[0_12px_24px_rgba(19,42,44,0.04)]">
          <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-nb-teal">
            <ShieldAlert className="h-5 w-5" />
            Allergies
          </div>
          <div className="text-sm text-nb-ink/70">Penicillin — rash in 2019.</div>
        </div>

        <div className="rounded-2xl border border-nb-line bg-white p-5 shadow-[0_12px_24px_rgba(19,42,44,0.04)]">
          <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-nb-teal">
            <Pill className="h-5 w-5" />
            Active prescriptions
          </div>
          <div className="text-sm text-nb-ink/70">Lisinopril 10mg — once daily</div>
        </div>
      </div>
    </div>
  );
}
