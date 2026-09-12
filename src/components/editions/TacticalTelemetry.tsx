import React from "react";
import { Radio, MapPin, Bookmark, Share2 } from "lucide-react";
import { Dispatch } from "../../types/dispatch";

interface TacticalTelemetryProps {
  dispatches: Dispatch[];
  bookmarks: string[];
  toggleBookmark: (id: string) => void;
  handleShareStory: (disp: Dispatch) => void;
  setSelectedStory: (disp: Dispatch) => void;
  onNavigateToMap: () => void;
  cardThemeClass: string;
  subCardThemeClass: string;
  subTextThemeClass: string;
}

export const TacticalTelemetry: React.FC<TacticalTelemetryProps> = ({
  dispatches,
  bookmarks,
  toggleBookmark,
  handleShareStory,
  setSelectedStory,
  onNavigateToMap,
  cardThemeClass,
  subCardThemeClass,
  subTextThemeClass
}) => {
  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs ${subCardThemeClass}`}>
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
          <span className="font-bold text-emerald-400 uppercase tracking-wider">
            Tactical Beat Scanner & Geolocation Grid
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            {dispatches.length} Nodes Active
          </span>
        </div>
        <button
          onClick={onNavigateToMap}
          className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 transition font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <MapPin className="h-3.5 w-3.5" />
          <span>Launch Full Map Radar →</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
        {dispatches.map((d) => (
          <div
            key={`tactical-${d.id}`}
            className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition hover:border-emerald-500/50 ${cardThemeClass}`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] pb-2 border-b border-zinc-800/80">
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase text-[9px]">
                  {d.category}
                </span>
                <span className={subTextThemeClass}>{d.timestamp}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-zinc-950/60 border border-zinc-800 text-[11px]">
                <div className="flex items-center gap-1.5 text-zinc-300 truncate">
                  <MapPin className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                  <span className="truncate font-bold">{d.location}</span>
                </div>
                {d.coordinates ? (
                  <button
                    type="button"
                    onClick={onNavigateToMap}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold hover:bg-amber-500/30 transition cursor-pointer flex-shrink-0"
                    title="Target on Map Radar"
                  >
                    Target Radar
                  </button>
                ) : (
                  <span className="text-[10px] text-zinc-500">Station Ref</span>
                )}
              </div>

              {d.imageUrl && (
                <div
                  onClick={() => setSelectedStory(d)}
                  className="rounded-lg overflow-hidden border border-zinc-800 aspect-video relative bg-black cursor-pointer group"
                >
                  <img src={d.imageUrl} alt={d.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[9px] text-amber-400 font-bold border border-amber-500/40">
                    RECON EVIDENCE
                  </div>
                </div>
              )}

              <h4
                onClick={() => setSelectedStory(d)}
                className="font-bold text-sm leading-snug hover:text-amber-500 transition cursor-pointer"
              >
                {d.title}
              </h4>
              <p className={`text-[11px] leading-relaxed line-clamp-3 ${subTextThemeClass}`}>
                {d.content}
              </p>
            </div>

            <div className={`pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[10px] ${subTextThemeClass}`}>
              <div>
                <span className="font-bold text-zinc-300">@{d.callsign}</span> • {d.bureau}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleBookmark(d.id)}
                  className="hover:text-amber-400 cursor-pointer transition p-1"
                  title="Bookmark"
                >
                  <Bookmark className={`h-3 w-3 ${bookmarks.includes(d.id) ? "fill-amber-500 text-amber-500" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={() => handleShareStory(d)}
                  className="hover:text-amber-400 cursor-pointer transition p-1"
                  title="Share dateline"
                >
                  <Share2 className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStory(d)}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer transition font-bold text-[9px]"
                >
                  Read
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
