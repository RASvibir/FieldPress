import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PressyMark } from "@/components/pressy-mark";
import { askPressy } from "@/lib/desk";

type Turn = { role: "user" | "pressy"; content: string };

export function PressyBubble() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [turns, setTurns] = useState<Turn[]>([
    {
      role: "pressy",
      content: "Pressy'O here. Prompt me like a desk co-pilot. I’ll help you research breaking angles, facts, or draft a Pressie.",
    },
  ]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [turns, open]);

  async function send() {
    const message = prompt.trim();
    if (!message || busy) return;
    setPrompt("");
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
      {open && (
        <div className="pointer-events-auto w-[min(94vw,28rem)] overflow-hidden rounded-2xl border border-neon/40 bg-terminal shadow-[0_0_24px_rgba(57,255,20,0.18)]">
          <div className="flex items-center justify-between border-b border-neon/20 px-3 py-2">
            <div>
              <div className="flex items-center gap-2">
              <img src="/pressy-o.png" alt="Pressy'O" className="h-6 w-6 object-contain drop-shadow" />
              <p className="text-sm tracking-widest text-neon font-bold">PRESSY'O</p>
            </div>
              <p className="text-[10px] text-muted-foreground">Desk bot · writes help for Pressies</p>
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
            {busy && <p className="text-xs text-muted-foreground">Pressy is typing…</p>}
            {error && <p className="text-xs text-neon-red">{error}</p>}
          </div>
          <div className="flex gap-2 border-t border-neon/20 p-2">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Pressy'O…"
              className="min-h-[52px] resize-none bg-card border-border text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
            />
            <Button className="shrink-0 self-end" onClick={() => void send()} disabled={busy || !prompt.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      <button
        type="button"
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#39ff14] bg-card p-1.5 shadow-[0_0_20px_rgba(57,255,20,0.35)] hover:scale-105 transition-all"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open Pressy'O"
        title="Pressy'O Desk Co-Pilot"
      >
        <img src="/pressy-o.png" alt="Pressy'O" className="h-full w-full object-contain" />
      </button>
    </div>
  );
}
