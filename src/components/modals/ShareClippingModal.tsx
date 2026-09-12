import React from "react";
import { X, Share2, Camera, Check } from "lucide-react";
import { Dispatch } from "../../types/dispatch";

interface ShareClippingModalProps {
  shareModalStory: Dispatch | null;
  setShareModalStory: (disp: Dispatch | null) => void;
  setSavedSuccessToast: (msg: string) => void;
  isDark: boolean;
  borderThemeClass: string;
}

export const ShareClippingModal: React.FC<ShareClippingModalProps> = ({
  shareModalStory,
  setShareModalStory,
  setSavedSuccessToast,
  isDark,
  borderThemeClass
}) => {
  if (!shareModalStory) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className={`w-full max-w-lg rounded-xl border-2 shadow-2xl overflow-hidden transition ${
        isDark ? "bg-zinc-900 border-amber-500/50 text-zinc-100" : "bg-white border-amber-500 text-zinc-900"
      }`}>
        <div className={`flex-shrink-0 p-4 border-b flex items-center justify-between font-mono text-xs ${borderThemeClass}`}>
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-amber-500" />
            <span className="font-bold uppercase tracking-wider">Front-Page Wire Clipping & Syndication</span>
          </div>
          <button
            onClick={() => setShareModalStory(null)}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 font-mono">
          <div className={`p-4 rounded-lg border-2 ${
            isDark ? "bg-zinc-950 border-zinc-700" : "bg-zinc-50 border-zinc-300"
          } shadow-lg space-y-3`}>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-[10px] text-zinc-400">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-amber-500 font-black">FP_</span>
                <span>FIELDPRESS SYNDICATED DISPATCH</span>
              </div>
              <span>{shareModalStory.timestamp}</span>
            </div>

            {shareModalStory.imageUrl && (
              <div className="rounded-md overflow-hidden border border-zinc-800 relative aspect-video bg-black shadow-md">
                <img
                  src={shareModalStory.imageUrl}
                  alt={shareModalStory.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-amber-400 text-[9px] font-bold border border-amber-500/40 flex items-center gap-1">
                  <Camera className="h-2.5 w-2.5" /> FRONT-PAGE STILL
                </div>
                {shareModalStory.imageCaption && (
                  <div className="absolute bottom-0 inset-x-0 bg-black/80 p-2 text-[10px] text-zinc-300">
                    {shareModalStory.imageCaption}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold uppercase">
                  {shareModalStory.category}
                </span>
                <span className="text-zinc-400 font-bold">[{shareModalStory.location}]</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-mono leading-snug">
                {shareModalStory.title}
              </h3>
              <p className={`text-xs font-serif leading-relaxed line-clamp-3 ${
                isDark ? "text-zinc-300" : "text-zinc-700"
              }`}>
                {shareModalStory.content}
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
              <span>Byline: {shareModalStory.author} (@{shareModalStory.callsign})</span>
              <span className="text-emerald-400 font-bold">VERIFIED DISPATCH</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                const shareUrl = `${window.location.origin}/#dispatch-${shareModalStory.id}`;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  navigator.clipboard.writeText(shareUrl);
                }
                setSavedSuccessToast("Share URL copied to clipboard.");
                setTimeout(() => setSavedSuccessToast(""), 2500);
              }}
              className="px-3 py-2 rounded border border-zinc-700 hover:bg-zinc-800 transition flex items-center justify-center gap-1.5 cursor-pointer font-bold text-zinc-200"
            >
              <Share2 className="h-3.5 w-3.5 text-amber-400" />
              <span>Copy Web Link</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const shareUrl = `${window.location.origin}/#dispatch-${shareModalStory.id}`;
                const text = `📰 FIELDPRESS DISPATCH: "${shareModalStory.title}"\n📍 [${shareModalStory.location}] By ${shareModalStory.author} (@${shareModalStory.callsign})\n${shareModalStory.imageUrl ? `📷 Still: ${shareModalStory.imageUrl}\n` : ""}${shareUrl}`;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  navigator.clipboard.writeText(text);
                }
                setSavedSuccessToast("Broadcast copy with photo copied.");
                setTimeout(() => setSavedSuccessToast(""), 2500);
              }}
              className="px-3 py-2 rounded bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Copy Broadcast Copy</span>
            </button>
          </div>
        </div>

        <div className={`p-4 border-t flex justify-end font-mono text-xs ${borderThemeClass} ${
          isDark ? "bg-zinc-950/80" : "bg-zinc-50"
        }`}>
          <button
            type="button"
            onClick={() => setShareModalStory(null)}
            className="px-4 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition cursor-pointer font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
