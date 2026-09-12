import React from "react";
import { PlusCircle } from "lucide-react";
import { ClassifiedItem } from "../../types/dispatch";

interface ClassifiedsDeckProps {
  classifiedsList: ClassifiedItem[];
  openPostNoticeModal: () => void;
  setSavedSuccessToast: (msg: string) => void;
  cardThemeClass: string;
  subCardThemeClass: string;
  subTextThemeClass: string;
}

export const ClassifiedsDeck: React.FC<ClassifiedsDeckProps> = ({
  classifiedsList,
  openPostNoticeModal,
  setSavedSuccessToast,
  cardThemeClass,
  subCardThemeClass,
  subTextThemeClass
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className={`p-6 rounded-lg border ${cardThemeClass}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-mono text-lg font-bold">Community Classifieds & Notices</h2>
            <p className={`text-xs font-mono mt-0.5 ${subTextThemeClass}`}>
              Public bulletin board for regional infrastructure notices, co-op equipment, and volunteer requests.
            </p>
          </div>
          <button
            type="button"
            onClick={openPostNoticeModal}
            className="px-3 py-1.5 rounded bg-amber-500 text-zinc-950 font-mono text-xs font-bold hover:bg-amber-400 transition cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Post Notice</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
          {classifiedsList.map((item) => (
            <div key={item.id} className={`p-4 rounded border flex flex-col justify-between ${subCardThemeClass}`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    item.tagColor === "emerald"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : item.tagColor === "cyan"
                      ? "bg-cyan-500/20 text-cyan-400"
                      : item.tagColor === "rose"
                      ? "bg-rose-500/20 text-rose-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}>
                    {item.tag}
                  </span>
                  <span className={`text-[10px] ${subTextThemeClass}`}>{item.timestamp}</span>
                </div>
                <h4 className="font-bold text-sm mt-2">{item.title}</h4>
                <p className={`text-xs mt-1.5 leading-relaxed ${subTextThemeClass}`}>{item.details}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-zinc-800 text-[11px] flex items-center justify-between">
                <span className="text-zinc-400 truncate mr-2">Contact: {item.contact}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                      navigator.clipboard.writeText(item.contact);
                    }
                    setSavedSuccessToast(`Contact coordinate copied: ${item.contact}`);
                    setTimeout(() => setSavedSuccessToast(""), 2500);
                  }}
                  className="text-amber-500 hover:text-amber-400 hover:underline cursor-pointer transition font-bold flex-shrink-0"
                >
                  Copy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
