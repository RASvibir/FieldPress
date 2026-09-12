import React from "react";
import { X, Bookmark, Share2, MapPin } from "lucide-react";
import { Dispatch } from "../../types/dispatch";

interface StoryReaderModalProps {
  selectedStory: Dispatch | null;
  setSelectedStory: (disp: Dispatch | null) => void;
  bookmarks: string[];
  toggleBookmark: (id: string) => void;
  handleShareStory: (disp: Dispatch) => void;
  isDark: boolean;
  borderThemeClass: string;
  subCardThemeClass: string;
  subTextThemeClass: string;
}

export const StoryReaderModal: React.FC<StoryReaderModalProps> = ({
  selectedStory,
  setSelectedStory,
  bookmarks,
  toggleBookmark,
  handleShareStory,
  isDark,
  borderThemeClass,
  subCardThemeClass,
  subTextThemeClass
}) => {
  if (!selectedStory) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl border shadow-2xl overflow-hidden transition ${
        isDark ? "bg-zinc-900 border-zinc-700 text-zinc-100" : "bg-white border-zinc-300 text-zinc-900"
      }`}>
        <div className={`flex-shrink-0 p-4 border-b flex items-center justify-between ${borderThemeClass}`}>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold uppercase">
              {selectedStory.category}
            </span>
            <span className="text-zinc-400">[{selectedStory.location}]</span>
          </div>
          <button
            onClick={() => setSelectedStory(null)}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4 font-mono">
          {selectedStory.imageUrl && (
            <div className="rounded-lg overflow-hidden border border-zinc-800 aspect-video max-h-[300px] bg-black">
              <img src={selectedStory.imageUrl} alt={selectedStory.title} className="w-full h-full object-cover" />
              {selectedStory.imageCaption && (
                <div className="bg-black/80 p-2 text-[11px] text-zinc-300 border-t border-zinc-800">
                  {selectedStory.imageCaption}
                </div>
              )}
            </div>
          )}

          <h2 className="text-xl sm:text-2xl font-black font-mono leading-snug">{selectedStory.title}</h2>
          <div className={`text-xs pb-3 border-b flex items-center justify-between ${borderThemeClass} ${subTextThemeClass}`}>
            <span>By {selectedStory.author} (@{selectedStory.callsign}) • {selectedStory.bureau}</span>
            <span>{selectedStory.timestamp}</span>
          </div>

          <div className="text-sm leading-relaxed font-serif whitespace-pre-wrap pt-2">
            {selectedStory.content}
          </div>

          {selectedStory.coordinates && (
            <div className={`p-3 rounded border text-xs flex items-center gap-2 ${subCardThemeClass}`}>
              <MapPin className="h-4 w-4 text-amber-500" />
              <span>Telemetry Anchor: <strong>{selectedStory.coordinates[0]}, {selectedStory.coordinates[1]}</strong> ({selectedStory.location})</span>
            </div>
          )}
        </div>

        <div className={`flex-shrink-0 p-4 border-t flex items-center justify-between font-mono text-xs ${borderThemeClass} ${
          isDark ? "bg-zinc-950/80" : "bg-zinc-50"
        }`}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleBookmark(selectedStory.id)}
              className={`px-3 py-1.5 rounded border transition flex items-center gap-1 cursor-pointer ${
                bookmarks.includes(selectedStory.id) ? "bg-amber-500 text-zinc-950 font-bold border-amber-500" : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span>{bookmarks.includes(selectedStory.id) ? "Saved" : "Bookmark"}</span>
            </button>
            <button
              type="button"
              onClick={() => handleShareStory(selectedStory)}
              className="px-3 py-1.5 rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition flex items-center gap-1 cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSelectedStory(null)}
            className="px-4 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition cursor-pointer font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
