import React from "react";

export type ExploreTab = "discover" | "search" | "map" | "classifieds";

type Props = {
  tab: ExploreTab;
  onTabChange: (t: ExploreTab) => void;
  isDark: boolean;
  onOpenSearch: () => void;
};

const TABS: { id: ExploreTab; label: string }[] = [
  { id: "discover", label: "Discover" },
  { id: "search", label: "Search" },
  { id: "map", label: "Map" },
  { id: "classifieds", label: "Classifieds" },
];

export const ExploreChrome: React.FC<Props> = ({ tab, onTabChange, isDark, onOpenSearch }) => (
  <div className="pb-4 mb-4 border-b border-zinc-800/30">
    <h1 className="text-xl font-bold mb-2">Explore</h1>
    <div className="flex flex-wrap gap-1">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => {
            onTabChange(t.id);
            if (t.id === "search") onOpenSearch();
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
            tab === t.id
              ? "bg-amber-500 text-zinc-950"
              : isDark
              ? "text-zinc-400 hover:bg-zinc-800"
              : "text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  </div>
);
