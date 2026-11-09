import React, { useState } from "react";
import { Link2, MapPin, Menu, SlidersHorizontal, Sparkles } from "lucide-react";

export type ComposerDetailTray = "location" | "link" | "more" | "advanced";

type Props = {
  isDark: boolean;
  activeTray: string | null;
  advancedPinned: boolean;
  onOpenTray: (tray: ComposerDetailTray) => void;
};

const ITEMS: { id: ComposerDetailTray; label: string; icon: React.ReactNode }[] = [
  { id: "location", label: "Location", icon: <MapPin className="h-3.5 w-3.5" /> },
  { id: "link", label: "Source link", icon: <Link2 className="h-3.5 w-3.5" /> },
  { id: "more", label: "Look, topic & sharing", icon: <Sparkles className="h-3.5 w-3.5" /> },
  { id: "advanced", label: "Advanced editing", icon: <SlidersHorizontal className="h-3.5 w-3.5" /> },
];

export const ComposerDetailMenu: React.FC<Props> = ({ isDark, activeTray, advancedPinned, onOpenTray }) => {
  const [open, setOpen] = useState(false);
  const busy =
    activeTray === "location" ||
    activeTray === "link" ||
    activeTray === "more" ||
    activeTray === "advanced" ||
    advancedPinned;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1 ${
          busy
            ? "border-amber-500/50 bg-amber-500/10"
            : isDark
            ? "border-zinc-700 hover:bg-zinc-800"
            : "border-zinc-200 hover:bg-zinc-100"
        }`}
        title="More post options"
        aria-expanded={open}
      >
        <Menu className="h-3.5 w-3.5" />
        Details
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} aria-hidden />
          <div
            className={`absolute left-0 mt-1 z-30 w-52 rounded-lg border shadow-lg py-1 text-xs ${
              isDark ? "bg-zinc-900 border-zinc-700" : "bg-white border-zinc-200"
            }`}
          >
            {ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-amber-500/10"
                onClick={() => {
                  onOpenTray(item.id);
                  setOpen(false);
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
