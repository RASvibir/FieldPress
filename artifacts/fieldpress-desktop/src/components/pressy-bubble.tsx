import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { askPressy } from "@/lib/desk";

type Turn = { role: "user" | "pressy"; content: string };

const QUICK_GUIDES = [
  { label: "⚡ Draft from Spiffs", query: "How do I create story drafts from Spiffs?" },
  { label: "📸 Generate & Attach Photos", query: "How do I produce and attach photos in FieldPress?" },
  { label: "🗞️ Quick Pressie (<15s)", query: "How do I post a Quick Pressie in under 15 seconds?" },
  { label: "🏢 Bureau Desks & Invites", query: "How do collaborative bureau desks and /join/:code work?" },
];

export function PressyBubble() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [turns, setTurns] = useState<Turn[]>([
    {
      role: "pressy",
      content: "Pressy'O here — your newsroom desk co-pilot. Ask me for breaking headline angles, field ledes, verification checks, or in-app guidance on publishing, Spiffs, and visuals.",
    },
  ]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [turns, open]);

  async function handleSend(customText?: string) {
    const message = (customText ?? prompt).trim();
    if (!message || busy) return;
    if (!customText) setPrompt("");
    setError(null);
    const history = [...turns, { role: "user" as const, content: message }];
    setTurns(history);
    setBusy(true);
    try {
      const body = await askPressy(
        message,
        history.slice(0, -1).map((turn) => ({ role: turn.role, content: turn.content })),
      );
      setTurns((prev) => [...prev, { role: "pressy", content: body.reply || "…" }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pressy could not answer");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pointer-events-none fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] z-[9990] flex flex-col items-start gap-3 sm:left-auto sm:right-[max(1rem,env(safe-area-inset-right))] sm:items-end">
      {/* 3X HOVER MAGNIFICATION MODAL */}
      {hovered && !open && (
        <div className="pointer-events-none animate-in fade-in zoom-in-95 duration-150 flex flex-col items-center rounded-2xl border-2 border-[#39ff14]/70 bg-card/95 p-4 shadow-[0_0_35px_rgba(57,255,20,0.4)] backdrop-blur-md">
          <div className="relative flex h-36 w-36 items-center justify-center rounded-xl bg-black/60 p-2 border border-[#39ff14]/30">
            <img
              src="/pressy-o.png"
              alt="Pressy'O Crest Magnified"
              className="h-32 w-32 object-contain drop-shadow-[0_0_15px_rgba(57,255,20,0.6)]"
            />
          </div>
          <div className="mt-2 text-center">
            <p className="text-xs font-bold tracking-widest text-[#39ff14]">PRESSY&apos;O HERALD</p>
            <p className="text-[10px] text-muted-foreground">Click to open desk co-pilot</p>
          </div>
        </div>
      )}

      {/* CHAT COPILOT MODAL */}
      {open && (
        <div className="pointer-events-auto w-[min(94vw,28rem)] overflow-hidden rounded-2xl border border-neon/40 bg-terminal shadow-[0_0_24px_rgba(57,255,20,0.18)]">
          <div className="flex items-center justify-between border-b border-neon/20 px-3 py-2">
            <div>
              <div className="flex items-center gap-2">
                <img src="/pressy-o.png" alt="Pressy'O" className="h-6 w-6 object-contain drop-shadow" />
                <p className="text-sm tracking-widest text-neon font-bold">PRESSY&apos;O</p>
              </div>
              <p className="text-[10px] text-muted-foreground">Desk bot · editorial &amp; in-app newsroom copilot</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)} aria-label="Close Pressy">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div ref={scroller} className="max-h-[min(28rem,55vh)] space-y-2 overflow-y-auto p-3">
            {turns.map((turn, i) => (
              <div
                key={`${turn.role}-${i}`}
                className={
                  turn.role === "user"
                    ? "ml-8 rounded-lg border border-border bg-card px-3 py-2 text-sm whitespace-pre-wrap break-words"
                    : "mr-4 rounded-lg border border-neon/25 bg-card/80 px-3 py-2 text-sm text-foreground/90 whitespace-pre-wrap break-words"
                }
              >
                {turn.content}
              </div>
            ))}

            {/* QUICK IN-APP GUIDANCE CHIPS */}
            {turns.length <= 2 && (
              <div className="pt-2">
                <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-1.5">
                  Quick In-App Guides:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_GUIDES.map((g) => (
                    <button
                      key={g.label}
                      type="button"
                      disabled={busy}
                      onClick={() => void handleSend(g.query)}
                      className="rounded-md border border-neon/20 bg-card/90 px-2 py-1 text-[11px] text-neon hover:border-neon hover:bg-neon/10 transition-colors text-left"
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {busy && <p className="text-xs text-muted-foreground animate-pulse">Pressy is typing…</p>}
            {error && <p className="text-xs text-neon-red">{error}</p>}
          </div>

          <div className="flex gap-2 border-t border-neon/20 p-2">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Pressy'O for headlines or how to use any feature…"
              className="min-h-[52px] resize-none bg-card border-border text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
            />
            <Button className="shrink-0 self-end" onClick={() => void handleSend()} disabled={busy || !prompt.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* FLOATING TRIGGER BUTTON */}
      <button
        type="button"
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#39ff14] bg-card p-1.5 shadow-[0_0_20px_rgba(57,255,20,0.35)] hover:scale-105 hover:shadow-[0_0_30px_rgba(57,255,20,0.55)] transition-all"
        onClick={() => {
          setOpen((v) => !v);
          setHovered(false);
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Open Pressy'O"
        title="Pressy'O Desk Co-Pilot"
      >
        <img src="/pressy-o.png" alt="Pressy'O" className="h-full w-full object-contain" />
      </button>
    </div>
  );
}
