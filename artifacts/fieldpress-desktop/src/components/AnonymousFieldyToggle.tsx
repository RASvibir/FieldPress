import React from 'react';

export interface AnonymousModeProps {
  isAnonymous: boolean;
  onChange: (isAnonymous: boolean) => void;
  currentUserHandle: string;
}

export const AnonymousFieldyToggle: React.FC<AnonymousModeProps> = ({
  isAnonymous,
  onChange,
  currentUserHandle,
}) => {
  return (
    <div className="p-2.5 rounded border border-border bg-card font-mono text-xs mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-base">{isAnonymous ? '🎭' : '🟢'}</span>
          <div>
            <div className="font-bold text-foreground">
              {isAnonymous ? 'Anonymous Fieldy Shield Active' : `Filing as @${currentUserHandle}`}
            </div>
            <div className="text-[10px] text-zinc-500 leading-tight">
              {isAnonymous
                ? 'Identity masked. Signed with ephemeral hash. EXIF metadata auto-stripped.'
                : 'Dispatch will build public portfolio equity and Signal Score.'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onChange(!isAnonymous)}
          className={`px-2.5 py-1 rounded text-[11px] font-bold border transition ${
            isAnonymous
              ? 'bg-purple-950/80 border-purple-600 text-purple-200'
              : 'bg-muted border-border text-muted-foreground hover:text-zinc-200'
          }`}
        >
          {isAnonymous ? 'Masked 🔒' : 'Mask Identity'}
        </button>
      </div>
    </div>
  );
};

/**
 * Client-side canvas helper to scrub GPS and device metadata from scene photos.
 */
export async function sanitizePhotoEvidence(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context failed'));

      // Re-drawing to canvas strips EXIF/GPS tags completely
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error('Sanitization blob conversion failed'));
      }, 'image/jpeg', 0.92);
    };
    img.onerror = err => reject(err);
  });
}

export default AnonymousFieldyToggle;
