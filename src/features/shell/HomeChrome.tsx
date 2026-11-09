import React from "react";

type Props = {
  isDark: boolean;
  viewMode: "cards" | "list";
  onViewModeChange: (m: "cards" | "list") => void;
  topicFilter: string;
  onTopicFilterChange: (t: string) => void;
  topics: string[];
  subTextClass: string;
};

export const HomeChrome: React.FC<Props> = ({
  isDark,
  viewMode,
  onViewModeChange,
  topicFilter,
  onTopicFilterChange,
  topics,
  subTextClass,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-zinc-800/30">
    <div>
      <h1 className="text-xl font-bold">Home</h1>
      <p className={`text-xs ${subTextClass}`}>Stories from your bureau and the wire</p>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <div className={`flex rounded-lg border overflow-hidden text-xs font-semibold ${isDark ? "border-zinc-700" : "border-zinc-300"}`}>
        <button
          type="button"
          onClick={() => onViewModeChange("cards")}
          className={`px-3 py-1.5 ${viewMode === "cards" ? "bg-amber-500 text-zinc-950" : ""}`}
        >
          Cards
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange("list")}
          className={`px-3 py-1.5 ${viewMode === "list" ? "bg-amber-500 text-zinc-950" : ""}`}
        >
          List
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => onTopicFilterChange("ALL")}
          className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
            topicFilter === "ALL" ? "bg-amber-500/20 border-amber-500/50" : "border-transparent"
          }`}
        >
          All
        </button>
        {topics.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onTopicFilterChange(t)}
            className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
              topicFilter === t ? "bg-amber-500/20 border-amber-500/50" : "border-transparent"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  </div>
);
