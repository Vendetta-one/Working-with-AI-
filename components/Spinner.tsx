'use client';

import { Loader2 } from 'lucide-react';

export default function Spinner({ label }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 text-ink/70"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-9 w-9 animate-spin text-sage-600" aria-hidden="true" />
      {label ? <p className="text-lg font-medium">{label}</p> : null}
      <span className="sr-only">Loading</span>
    </div>
  );
}
