import React, { useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";

export type LeadItem = { angle: string; sourceUrl: string; sourceTitle: string };

type WriteAction = {
  id: string;
  label: string;
};

const WRITE_ACTIONS: WriteAction[] = [
  { id: "draft_from_topic", label: "Draft it" },
  { id: "lede_suggest", label: "Ledes" },
  { id: "headlines", label: "Headline" },
  { id: "shorten", label: "Shorten" },
  { id: "punchier", label: "Punchier" },
  { id: "structure_dispatch", label: "Structure" },
  { id: "rewrite_voice", label: "Voice" },
  { id: "grammar_polish", label: "Grammar" },
  { id: "ap_style_polish", label: "AP polish" },
  { id: "attribution_check", label: "Attribution" },
  { id: "factcheck_polish", label: "Clarity check" },
];

type Props = {
  isDark: boolean;
  busy: boolean;
  status: string | null;
  leads: LeadItem[];
  onWriteAction: (actionId: string) => void;
  onFindLeads: () => void;
  onCustomAsk: (text: string) => void;
  onUndo?: () => void;
  canUndo: boolean;
};

export const PostAiTray: React.FC<Props> = ({
  isDark,
  busy,
  status,
  leads,
  onWriteAction,
  onFindLeads,
  onCustomAsk,
  onUndo,
  canUndo,
}) => {
  const [mode, setMode] = useState<"main" | "write">("main");
  const [custom, setCustom] = useState("");

  const card = isDark ? "bg-zinc-900/80 border-zinc-700" : "bg-zinc-50 border-zinc-200";

  return (
    <div className={`rounded-xl border p-3 space-y-3 ${card}`}>
      {mode === "main" ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => setMode("write")}
            className="px-3 py-2 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-300 text-xs font-bold"
          >
            ✨ Help me write
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onFindLeads}
            className="px-3 py-2 rounded-lg border text-xs font-bold hover:bg-zinc-800/30"
          >
            Find leads
          </button>
          {canUndo && onUndo && (
            <button type="button" onClick={onUndo} className="px-2 py-2 text-[10px] font-bold text-zinc-500">
              Undo
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-500">Help me write</span>
            <button type="button" className="text-[10px] text-zinc-500" onClick={() => setMode("main")}>
              Back
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {WRITE_ACTIONS.map((a) => (
              <button
                key={a.id}
                type="button"
                disabled={busy}
                onClick={() => onWriteAction(a.id)}
                className={`px-2 py-1 rounded-md border text-[10px] font-semibold ${
                  isDark ? "border-zinc-700 hover:border-amber-500/40" : "border-zinc-200 hover:border-amber-400"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Ask for a specific edit…"
              className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] border ${
                isDark ? "bg-zinc-950 border-zinc-700" : "bg-white border-zinc-300"
              }`}
            />
            <button
              type="button"
              disabled={busy || !custom.trim()}
              onClick={() => {
                onCustomAsk(custom.trim());
                setCustom("");
              }}
              className="px-2 py-1.5 rounded-lg bg-amber-500 text-zinc-950 text-[10px] font-bold disabled:opacity-40"
            >
              Ask
            </button>
          </div>
        </div>
      )}

      {busy && (
        <p className="text-[11px] text-amber-500 flex items-center gap-1">
          <RefreshCw className="h-3 w-3 animate-spin" /> Working…
        </p>
      )}
      {status && !busy && <p className="text-[11px] text-emerald-600 dark:text-emerald-400">{status}</p>}

      {leads.length > 0 && (
        <ul className="space-y-2 max-h-48 overflow-y-auto text-[11px]">
          {leads.map((lead, i) => (
            <li key={`${lead.sourceUrl}-${i}`} className={`p-2 rounded-lg border ${isDark ? "border-zinc-800" : "border-zinc-200"}`}>
              <p className="font-medium leading-snug">{lead.angle}</p>
              <a
                href={lead.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 dark:text-amber-400 underline mt-1 inline-block"
              >
                {lead.sourceTitle || lead.sourceUrl}
              </a>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[10px] text-zinc-500 flex items-center gap-1">
        <Sparkles className="h-3 w-3 opacity-60" /> Pressy&apos;O — literary & journalism desk
      </p>
    </div>
  );
};
