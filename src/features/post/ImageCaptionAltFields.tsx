import React from "react";

type Props = {
  isDark: boolean;
  hasImage: boolean;
  caption: string;
  altText: string;
  onCaptionChange: (v: string) => void;
  onAltTextChange: (v: string) => void;
  onSuggest: () => void;
  suggestBusy: boolean;
  suggestStatus: string | null;
  inputClass: string;
  subCardClass: string;
  subTextClass: string;
};

export const ImageCaptionAltFields: React.FC<Props> = ({
  isDark,
  hasImage,
  caption,
  altText,
  onCaptionChange,
  onAltTextChange,
  onSuggest,
  suggestBusy,
  suggestStatus,
  inputClass,
  subCardClass,
  subTextClass,
}) => {
  if (!hasImage) return null;

  return (
    <div className={`rounded-xl border p-3 space-y-2 ${subCardClass}`}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onSuggest}
          disabled={suggestBusy}
          className={`text-[11px] font-semibold underline-offset-2 hover:underline disabled:opacity-50 ${
            isDark ? "text-sky-400" : "text-sky-700"
          }`}
        >
          {suggestBusy ? "Suggesting…" : "Suggest caption & alt text"}
        </button>
        {suggestStatus && <span className={`text-[10px] ${subTextClass}`}>{suggestStatus}</span>}
      </div>
      <p className={`text-[10px] ${subTextClass}`}>
        Optional. Pressy&apos;o can draft these — you can edit, clear, or leave them blank before posting.
      </p>
      <label className="block text-xs font-bold">
        Caption
        <input
          value={caption}
          onChange={(e) => onCaptionChange(e.target.value)}
          placeholder="Shown with your photo"
          className={`mt-1 w-full rounded-lg px-2 py-1.5 text-xs ${inputClass}`}
        />
      </label>
      <label className="block text-xs font-bold">
        Alt text
        <input
          value={altText}
          onChange={(e) => onAltTextChange(e.target.value)}
          placeholder="Describes the image for screen readers"
          className={`mt-1 w-full rounded-lg px-2 py-1.5 text-xs ${inputClass}`}
        />
      </label>
    </div>
  );
};
