'use client';

import { useCallback, useRef, useState } from 'react';
import { UploadCloud, Loader2, AlertCircle, Leaf } from 'lucide-react';
import type { ImageData } from '@/lib/types';

interface UploadViewProps {
  onImageSelected: (image: ImageData) => void;
  isBusy: boolean;
  error: string | null;
}

const MAX_BYTES = 12 * 1024 * 1024; // 12 MB

export default function UploadView({ onImageSelected, isBusy, error }: UploadViewProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file?: File) => {
      setLocalError(null);
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        setLocalError('That does not look like an image. Please choose a JPG or PNG photo.');
        return;
      }
      if (file.size > MAX_BYTES) {
        setLocalError('That photo is a little too large. Please use one under 12 MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const [meta, base64] = dataUrl.split(',');
        const mimeMatch = meta.match(/data:(.*);base64/);
        const mimeType = mimeMatch ? mimeMatch[1] : file.type;
        onImageSelected({ mimeType, data: base64, dataUrl, name: file.name });
      };
      reader.onerror = () => setLocalError('We could not read that file. Please try another photo.');
      reader.readAsDataURL(file);
    },
    [onImageSelected]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (isBusy) return;
    handleFile(e.dataTransfer.files?.[0]);
  };

  const shownError = localError ?? error;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-5 py-10 text-center">
      <div className="mb-6 flex items-center gap-3 text-sage-700">
        <Leaf className="h-8 w-8" aria-hidden="true" />
        <h1 className="text-4xl font-semibold tracking-tight">MemoryLane</h1>
      </div>

      <p className="mb-8 max-w-xl text-xl text-ink/70">
        A calm space to revisit the moments that matter. Share an old photograph to begin a
        gentle reminiscence session.
      </p>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        disabled={isBusy}
        className={`relative flex w-full flex-col items-center justify-center gap-4 rounded-3xl border-4 border-dashed px-6 py-16 transition-colors ${
          dragActive
            ? 'border-sage-600 bg-sage-100'
            : 'border-paleblue-200 bg-white/60 hover:bg-white'
        } ${isBusy ? 'cursor-wait opacity-70' : 'cursor-pointer'}`}
        aria-label="Upload an old photograph to begin"
      >
        {isBusy ? (
          <>
            <Loader2 className="h-14 w-14 animate-spin text-sage-600" aria-hidden="true" />
            <p className="text-xl font-medium text-ink">Looking at your photo…</p>
          </>
        ) : (
          <>
            <UploadCloud className="h-16 w-16 text-sage-600" aria-hidden="true" />
            <p className="text-2xl font-semibold text-ink">Drop a photo here</p>
            <p className="text-lg text-ink/60">or tap to choose from your device</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </button>

      {shownError ? (
        <div
          role="alert"
          className="mt-6 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-lg text-red-700"
        >
          <AlertCircle className="h-6 w-6 shrink-0" aria-hidden="true" />
          <span>{shownError}</span>
        </div>
      ) : null}
    </div>
  );
}
