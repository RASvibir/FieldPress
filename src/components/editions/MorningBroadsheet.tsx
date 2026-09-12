import React from "react";
import { MapPin, Bookmark, Share2, Eye, Camera } from "lucide-react";
import { Dispatch } from "../../types/dispatch";

interface MorningBroadsheetProps {
  dispatches: Dispatch[];
  bookmarks: string[];
  toggleBookmark: (id: string) => void;
  handleShareStory: (disp: Dispatch) => void;
  setSelectedStory: (disp: Dispatch) => void;
  isDark: boolean;
  cardThemeClass: string;
  borderThemeClass: string;
  subTextThemeClass: string;
}

export const MorningBroadsheet: React.FC<MorningBroadsheetProps> = ({
  dispatches,
  bookmarks,
  toggleBookmark,
  handleShareStory,
  setSelectedStory,
  isDark,
  cardThemeClass,
  borderThemeClass,
  subTextThemeClass
}) => {
  const lead = dispatches[0];
  const secondary = dispatches.slice(1);

  return (
    <div className="space-y-8">
      {lead && (
        <article className={`p-6 sm:p-8 rounded-xl border transition ${cardThemeClass}`}>
          {lead.imageUrl && (
            <div
              onClick={() => setSelectedStory(lead)}
              className="mb-6 rounded-xl overflow-hidden border-2 border-amber-500/40 shadow-2xl relative aspect-video sm:aspect-[21/9] max-h-[420px] bg-black cursor-pointer group"
              title="Click to view full-res evidence still"
            >
              <img
                src={lead.imageUrl}
                alt={lead.title}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-103 brightness-95 group-hover:brightness-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-amber-400 font-mono text-[10px] font-bold border border-amber-500/40 uppercase tracking-widest flex items-center gap-1.5 shadow-md">
                  <Camera className="h-3 w-3 text-amber-400" /> Front-Page Lead Evidence • 35mm
                </span>
              </div>
              {lead.coordinates && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-zinc-400 font-mono text-[10px] hidden sm:block border border-zinc-700/60">
                  {lead.coordinates[0]}, {lead.coordinates[1]}
                </div>
              )}
              {lead.imageCaption && (
                <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 font-mono text-xs text-zinc-200 border-t border-zinc-800/80 backdrop-blur-xs flex items-center justify-between">
                  <div>
                    <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">Photo Evidence Still:</span>{" "}
                    <span className="text-zinc-300">{lead.imageCaption}</span>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-amber-400 font-bold opacity-0 group-hover:opacity-100 transition">
                    <Eye className="h-3.5 w-3.5" /> Expand
                  </span>
                </div>
              )}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs mb-3">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 font-bold uppercase tracking-wider text-[10px]">
              {lead.category}
            </span>
            <span className={subTextThemeClass}>•</span>
            <span className="font-bold flex items-center gap-1 text-zinc-400">
              <MapPin className="h-3 w-3 text-amber-500" /> {lead.location}
            </span>
            <span className={subTextThemeClass}>•</span>
            <span className={subTextThemeClass}>{lead.timestamp}</span>
          </div>

          <h2
            onClick={() => setSelectedStory(lead)}
            className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug mb-4 hover:text-amber-500 transition cursor-pointer"
            title="Click to read full dispatch"
          >
            {lead.title}
          </h2>

          <p className={`text-sm sm:text-base leading-relaxed mb-6 font-serif max-w-4xl ${
            isDark ? "text-zinc-300" : "text-zinc-700"
          }`}>
            {lead.content}
          </p>

          <div className={`pt-4 border-t flex items-center justify-between font-mono text-xs ${borderThemeClass} ${subTextThemeClass}`}>
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-300">Byline:</span>
              <span>{lead.author} (@{lead.callsign})</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleBookmark(lead.id)}
                className={`hover:text-amber-500 transition flex items-center gap-1 cursor-pointer ${
                  bookmarks.includes(lead.id) ? "text-amber-500 font-bold" : ""
                }`}
              >
                <Bookmark className={`h-3.5 w-3.5 ${bookmarks.includes(lead.id) ? "fill-amber-500 text-amber-500" : ""}`} />
                <span>{bookmarks.includes(lead.id) ? "Saved" : "Save"}</span>
              </button>
              <button
                onClick={() => handleShareStory(lead)}
                className="hover:text-amber-500 transition flex items-center gap-1 cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5" /> Share
              </button>
              <button
                onClick={() => setSelectedStory(lead)}
                className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20 font-bold transition cursor-pointer flex items-center gap-1"
              >
                <Eye className="h-3.5 w-3.5" /> Read
              </button>
            </div>
          </div>
        </article>
      )}

      {/* Grid of Secondary Dispatches */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {secondary.map((disp) => (
          <article
            key={disp.id}
            className={`p-5 rounded-lg border flex flex-col justify-between transition hover:border-amber-500/50 ${cardThemeClass}`}
          >
            <div>
              {disp.imageUrl && (
                <div
                  onClick={() => setSelectedStory(disp)}
                  className="mb-3 rounded overflow-hidden border border-zinc-800 aspect-video max-h-[140px] bg-black cursor-pointer group"
                >
                  <img src={disp.imageUrl} alt={disp.title} className="w-full h-full object-cover transition group-hover:scale-105" />
                </div>
              )}
              <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                <span className="text-amber-500 font-semibold">{disp.category}</span>
                <span className={subTextThemeClass}>{disp.timestamp}</span>
              </div>
              <h3
                onClick={() => setSelectedStory(disp)}
                className="font-mono text-base font-bold leading-snug mb-2.5 hover:text-amber-500 transition cursor-pointer line-clamp-2"
                title="Click to read full dispatch"
              >
                {disp.title}
              </h3>
              <p className={`text-xs leading-relaxed mb-4 line-clamp-3 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                {disp.content}
              </p>
            </div>
            <div className={`pt-3 border-t flex items-center justify-between text-[11px] font-mono ${borderThemeClass} ${subTextThemeClass}`}>
              <span>{disp.location}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleBookmark(disp.id)}
                  className={`hover:text-amber-500 p-1 rounded transition cursor-pointer ${
                    bookmarks.includes(disp.id) ? "text-amber-500" : ""
                  }`}
                  title="Bookmark dispatch"
                >
                  <Bookmark className={`h-3.5 w-3.5 ${bookmarks.includes(disp.id) ? "fill-amber-500 text-amber-500" : ""}`} />
                </button>
                <button
                  onClick={() => setSelectedStory(disp)}
                  className="hover:text-amber-400 p-1 rounded transition cursor-pointer"
                  title="Read full story"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
