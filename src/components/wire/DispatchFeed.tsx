import React from "react";
import { Search, Bookmark, Share2, FolderLock, ImageIcon, Camera } from "lucide-react";
import { Dispatch } from "../../types/dispatch";
import { AccentColorClasses } from "../../theme/tokens";

interface DispatchFeedProps {
  dispatches: Dispatch[];
  filteredDispatches: Dispatch[];
  pressRoll: Dispatch[];
  wireSearchQuery: string;
  setWireSearchQuery: (query: string) => void;
  wireCategoryFilter: string;
  setWireCategoryFilter: (cat: string) => void;
  bookmarks: string[];
  toggleBookmark: (id: string) => void;
  handleShareStory: (disp: Dispatch) => void;
  setSelectedStory: (disp: Dispatch) => void;
  openCreatePressie: (disp?: Dispatch) => void;
  currentAccent: AccentColorClasses;
  isDark: boolean;
  cardThemeClass: string;
  subCardThemeClass: string;
  inputThemeClass: string;
  subTextThemeClass: string;
}

export const DispatchFeed: React.FC<DispatchFeedProps> = ({
  dispatches,
  filteredDispatches,
  pressRoll,
  wireSearchQuery,
  setWireSearchQuery,
  wireCategoryFilter,
  setWireCategoryFilter,
  bookmarks,
  toggleBookmark,
  handleShareStory,
  setSelectedStory,
  openCreatePressie,
  currentAccent,
  isDark,
  cardThemeClass,
  subCardThemeClass,
  inputThemeClass,
  subTextThemeClass
}) => {
  const photoDispatches = dispatches.filter((d) => Boolean(d.imageUrl));

  return (
    <div className="space-y-4">
      {photoDispatches.length > 0 && (
        <div className={`p-4 rounded-xl border space-y-3 ${cardThemeClass}`}>
          <div className="flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-500">
              <ImageIcon className="h-4 w-4" />
              <span>Visual Evidence Wire • Front-Page Stills</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold uppercase">
                Featured Gallery
              </span>
            </div>
            <span className={`text-[10px] ${subTextThemeClass}`}>
              Click still to open dispatch
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {photoDispatches.slice(0, 4).map((d) => (
              <div
                key={`wire-photo-${d.id}`}
                onClick={() => setSelectedStory(d)}
                className="group relative rounded-lg overflow-hidden border border-zinc-800 bg-black aspect-video cursor-pointer shadow-md hover:border-amber-500/60 transition"
                title={`Read "${d.title}"`}
              >
                <img
                  src={d.imageUrl}
                  alt={d.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition" />
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs font-mono text-[9px] text-amber-400 font-bold border border-amber-500/30">
                  {d.category}
                </div>
                <div className="absolute bottom-1.5 left-2 right-2 font-mono text-[10px] leading-tight">
                  <span className="text-amber-400 font-bold uppercase text-[9px] block">[{d.location}]</span>
                  <span className="text-zinc-200 line-clamp-1 font-semibold">{d.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pressRoll.length > 0 && (
        <div className={`p-4 rounded-lg border flex items-center justify-between ${
          isDark ? "bg-amber-950/20 border-amber-500/40 text-amber-300" : "bg-amber-50 border-amber-300 text-amber-900"
        }`}>
          <div className="flex items-center gap-2.5 font-mono text-xs">
            <FolderLock className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <span>
              You have <strong>{pressRoll.length} staged draft(s)</strong> in your Press Roll queue.
            </span>
          </div>
          <button
            onClick={() => openCreatePressie(pressRoll[0])}
            className="px-3 py-1 rounded bg-amber-500 text-zinc-950 font-mono text-xs font-bold hover:bg-amber-400 transition cursor-pointer shadow-xs"
          >
            Resume Draft in Pressie Builder
          </button>
        </div>
      )}

      <div className={`p-3.5 rounded-lg border flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs ${cardThemeClass}`}>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search className="h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Filter wire dispatches by keyword, reporter, or location..."
            value={wireSearchQuery}
            onChange={(e) => setWireSearchQuery(e.target.value)}
            className={`px-2.5 py-1.5 rounded text-xs w-full sm:w-72 focus:outline-none ${inputThemeClass}`}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {["ALL", "Infrastructure", "Civic Wire", "Transit", "Telecom", "Field Notes", "Field Dispatch"].map((cat) => {
            const isActive = wireCategoryFilter.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setWireCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded text-[11px] transition-all cursor-pointer ${
                  isActive
                    ? `${currentAccent.btn} font-bold shadow-xs`
                    : isDark ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white" : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300 hover:text-zinc-900"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {filteredDispatches.length === 0 ? (
          <div className={`p-8 rounded-lg border text-center font-mono text-xs ${subCardThemeClass} ${subTextThemeClass}`}>
            No dispatches match the active search or category filter.
          </div>
        ) : (
          filteredDispatches.map((d) => (
            <div
              key={d.id}
              onClick={() => setSelectedStory(d)}
              className={`p-4 rounded-lg border transition hover:border-amber-500/50 flex flex-col sm:flex-row sm:items-start justify-between gap-4 cursor-pointer group ${cardThemeClass}`}
            >
              {d.imageUrl && (
                <div className="w-full sm:w-44 h-32 flex-shrink-0 rounded-lg overflow-hidden border border-zinc-800 relative bg-black shadow-sm group-hover:border-amber-500/50 transition">
                  <img
                    src={d.imageUrl}
                    alt={d.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs text-amber-400 text-[9px] font-mono font-bold flex items-center gap-1 border border-amber-500/30">
                    <Camera className="h-2.5 w-2.5" /> Still
                  </div>
                  {d.imageCaption && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/80 p-1 text-[9px] font-mono text-zinc-300 truncate">
                      {d.imageCaption}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 font-bold text-[10px]">
                    {d.category}
                  </span>
                  <span className="text-zinc-400 font-bold">[{d.location}]</span>
                  <span className={subTextThemeClass}>•</span>
                  <span className={subTextThemeClass}>{d.timestamp}</span>
                  {bookmarks.includes(d.id) && (
                    <span className="text-amber-500 text-[10px] font-bold flex items-center gap-0.5">
                      <Bookmark className="h-3 w-3 fill-amber-500" /> Saved
                    </span>
                  )}
                </div>
                <h3 className="font-mono text-base font-bold group-hover:text-amber-500 transition">{d.title}</h3>
                <p className={`text-sm leading-relaxed line-clamp-2 ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                  {d.content}
                </p>
              </div>

              <div className="sm:text-right font-mono text-xs flex-shrink-0 flex sm:flex-col justify-between items-end gap-2">
                <div>
                  <div className="font-bold">{d.author}</div>
                  <div className="text-amber-500 font-semibold">@{d.callsign}</div>
                  <div className={`text-[10px] ${subTextThemeClass}`}>{d.bureau}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(d.id);
                    }}
                    className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 transition cursor-pointer hover:scale-110 active:scale-95"
                    title="Bookmark dispatch"
                  >
                    <Bookmark className={`h-3.5 w-3.5 ${bookmarks.includes(d.id) ? "fill-amber-500 text-amber-500" : ""}`} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareStory(d);
                    }}
                    className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 transition cursor-pointer hover:scale-110 active:scale-95"
                    title="Share link"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
