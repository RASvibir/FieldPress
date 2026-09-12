import React from "react";
import { Camera, Share2 } from "lucide-react";
import { Dispatch } from "../../types/dispatch";

interface PhotojournalismGazetteProps {
  dispatches: Dispatch[];
  handleShareStory: (disp: Dispatch) => void;
  setSelectedStory: (disp: Dispatch) => void;
  openCreatePressie: (disp?: Dispatch) => void;
  cardThemeClass: string;
  subCardThemeClass: string;
  borderThemeClass: string;
  subTextThemeClass: string;
}

export const PhotojournalismGazette: React.FC<PhotojournalismGazetteProps> = ({
  dispatches,
  handleShareStory,
  setSelectedStory,
  openCreatePressie,
  cardThemeClass,
  subCardThemeClass,
  borderThemeClass,
  subTextThemeClass
}) => {
  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs ${subCardThemeClass}`}>
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-amber-500" />
          <span className="font-bold text-amber-400 uppercase tracking-wider">
            Photojournalism Gazette • 35mm Documentary Plates
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
            Pulitzer Standard
          </span>
        </div>
        <span className={`text-[10px] ${subTextThemeClass}`}>
          Visual evidence framing for regional beats
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono">
        {dispatches.map((d) => (
          <div
            key={`photo-plate-${d.id}`}
            className={`rounded-xl border overflow-hidden flex flex-col justify-between transition hover:border-amber-500/60 shadow-lg ${cardThemeClass}`}
          >
            <div>
              {d.imageUrl ? (
                <div
                  onClick={() => setSelectedStory(d)}
                  className="relative aspect-video bg-black overflow-hidden cursor-pointer group"
                >
                  <img
                    src={d.imageUrl}
                    alt={d.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-xs text-amber-400 text-[9px] font-bold border border-amber-500/30">
                    35MM DOCUMENTARY • RAW STILL
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 text-white font-mono text-[10px] leading-tight">
                    <span className="text-amber-400 font-bold">[{d.location}]</span> {d.imageCaption || d.title}
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => openCreatePressie(d)}
                  className="p-8 text-center bg-zinc-950/40 border-b border-zinc-800 space-y-2 cursor-pointer hover:bg-zinc-900/60 transition"
                >
                  <Camera className="h-8 w-8 text-zinc-600 mx-auto" />
                  <div className="text-xs text-zinc-400 font-bold">No Evidence Photo Attached</div>
                  <div className="text-[10px] text-amber-500 hover:underline font-bold">Click to attach photo in builder →</div>
                </div>
              )}

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-zinc-500">
                  <span className="uppercase text-amber-500 font-bold">{d.category}</span>
                  <span>{d.timestamp}</span>
                </div>
                <h3
                  onClick={() => setSelectedStory(d)}
                  className="font-bold text-base hover:text-amber-500 transition cursor-pointer leading-snug"
                >
                  {d.title}
                </h3>
                <p className={`text-xs font-serif leading-relaxed line-clamp-3 ${subTextThemeClass}`}>
                  {d.content}
                </p>
              </div>
            </div>

            <div className={`p-3 border-t flex items-center justify-between text-[10px] ${borderThemeClass} ${subTextThemeClass}`}>
              <span>By {d.author} (@{d.callsign})</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleShareStory(d)}
                  className="hover:text-amber-400 cursor-pointer p-1 transition"
                  title="Share Photo Clipping"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStory(d)}
                  className="px-2.5 py-1 rounded bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition cursor-pointer"
                >
                  View Plate
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
