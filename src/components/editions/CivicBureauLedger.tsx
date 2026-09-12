import React from "react";
import { Layers, Download, PlusCircle } from "lucide-react";
import { Dispatch, ClassifiedItem } from "../../types/dispatch";

interface CivicBureauLedgerProps {
  dispatches: Dispatch[];
  classifiedsList: ClassifiedItem[];
  setSelectedStory: (disp: Dispatch) => void;
  openPostNoticeModal: () => void;
  exportUserArchives: () => void;
  cardThemeClass: string;
  subCardThemeClass: string;
  subTextThemeClass: string;
}

export const CivicBureauLedger: React.FC<CivicBureauLedgerProps> = ({
  dispatches,
  classifiedsList,
  setSelectedStory,
  openPostNoticeModal,
  exportUserArchives,
  cardThemeClass,
  subCardThemeClass,
  subTextThemeClass
}) => {
  const bureaus = Array.from(new Set(dispatches.map((d) => d.bureau)));

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${subCardThemeClass}`}>
        <div>
          <h3 className="font-bold text-sm flex items-center gap-2 text-amber-400">
            <Layers className="h-4 w-4" />
            <span>Civic Bureau Ledger & Public Records Registry</span>
          </h3>
          <p className={`text-[11px] mt-0.5 ${subTextThemeClass}`}>
            Structured municipal dispatches organized by regional bureau beats and open-data feeds.
          </p>
        </div>
        <button
          type="button"
          onClick={exportUserArchives}
          className="px-3 py-1.5 rounded bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export Bureau Ledger JSON</span>
        </button>
      </div>

      <div className="space-y-4">
        {bureaus.map((bureauName) => {
          const bureauStories = dispatches.filter((d) => d.bureau === bureauName);
          return (
            <div key={bureauName} className={`rounded-xl border overflow-hidden ${cardThemeClass}`}>
              <div className="p-3.5 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between">
                <div className="font-bold text-zinc-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Bureau: {bureauName}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-normal">
                    {bureauStories.length} dispatches
                  </span>
                </div>
                <span className={`text-[10px] ${subTextThemeClass}`}>Authenticated Wire</span>
              </div>

              <div className="divide-y divide-zinc-800/60">
                {bureauStories.map((d) => (
                  <div
                    key={`bureau-${d.id}`}
                    onClick={() => setSelectedStory(d)}
                    className="p-3.5 hover:bg-zinc-800/30 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-amber-500 font-bold">[{d.location}]</span>
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 uppercase text-[9px]">
                          {d.category}
                        </span>
                        <span className={subTextThemeClass}>• {d.timestamp}</span>
                      </div>
                      <h4 className="font-bold text-sm hover:text-amber-500 transition">{d.title}</h4>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-zinc-400 flex-shrink-0">
                      <span>@{d.callsign}</span>
                      <span className="text-emerald-400 text-[10px] font-bold">VERIFIED</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className={`p-5 rounded-xl border space-y-4 ${cardThemeClass}`}>
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="font-bold text-sm flex items-center gap-2">
            <PlusCircle className="h-4 w-4 text-amber-500" />
            <span>Municipal Notices & Community Postings</span>
          </div>
          <button
            type="button"
            onClick={openPostNoticeModal}
            className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 transition text-xs font-bold cursor-pointer"
          >
            + Post Notice
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {classifiedsList.map((item) => (
            <div key={`civic-${item.id}`} className={`p-3 rounded-lg border space-y-1.5 ${subCardThemeClass}`}>
              <div className="flex items-center justify-between text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                  {item.tag}
                </span>
                <span className={subTextThemeClass}>{item.timestamp}</span>
              </div>
              <h5 className="font-bold text-xs line-clamp-1">{item.title}</h5>
              <p className={`text-[11px] line-clamp-2 ${subTextThemeClass}`}>{item.details}</p>
              <div className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-800">
                Contact: {item.contact}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
