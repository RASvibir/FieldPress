import { useEffect, useRef, useState } from "react";
import { Send, X, Copy, Zap, Image as ImageIcon, Check, Radio, ShieldCheck, CornerDownLeft, Flame, Scale, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { askPressy } from "@/lib/desk";

type Turn = { role: "user" | "pressy"; content: string };

function extractHeadlineAndNotes(text: string): { headline: string; notes: string } {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { headline: "", notes: "" };

  let titleIdx = -1;
  let headline = "";

  // 1. Look for explicit title indicators
  for (let i = 0; i < lines.length; i++) {
    const clean = lines[i].replace(/[*#•`_>]/g, "").trim();
    const match = clean.match(/^(?:suggested\s+)?(?:headline|title|breaking)\s*:\s*(.+)/i);
    if (match && match && match.trim().length > 3) {
      headline = match.replace(/^[•\s-]+/, "").trim();
      titleIdx = i;
      break;
    }
  }

  // 2. Fallback: first non-greeting line as title
  if (!headline) {
    for (let i = 0; i < lines.length; i++) {
      const clean = lines[i].replace(/[*#•`_>]/g, "").trim();
      if (!/^(pressy['’]?o? here|here are your|let['’]?s|hello|hi|sure)/i.test(clean) && clean.length > 8) {
        headline = clean.split(".")[0].trim();
        titleIdx = i;
        break;
      }
    }
  }

  // 3. Body is EVERYTHING else from the dispatch
  const bodyLines = lines.filter((_, idx) => idx !== titleIdx && !/^(?:\*\*Suggested Headline:\*\*|###\s*⚡)/i.test(lines[idx]));
  const notes = bodyLines.join("\n\n").replace(/^>\s*/gm, "").trim();

  return {
    headline: headline.slice(0, 100).trim(),
    notes: notes || text.trim(),
  };
}

export function PressyBubble() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [turns, setTurns] = useState<Turn[]>([
    {
      role: "pressy",
      content: "Pressy'O here — newsroom co-pilot. Use the command buttons below to ingest your active desk, verify sources, generate radio scriptlets, or command visuals.",
    },
  ]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncedIdx, setSyncedIdx] = useState<number | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [imgBusyIdx, setImgBusyIdx] = useState<number | null>(null);
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

  function syncToDesk(content: string, idx: number) {
    try {
      const { headline, notes } = extractHeadlineAndNotes(content);
      window.dispatchEvent(
        new CustomEvent("fieldpress:populate-composer", {
          detail: { headline, notes },
        })
      );
      setSyncedIdx(idx);
      setTimeout(() => setSyncedIdx(null), 2500);
    } catch (err) {
      setError("Failed to sync to desk");
    }
  }

  async function syncImageToDesk(content: string, idx: number) {
    setImgBusyIdx(idx);
    try {
      const { headline } = extractHeadlineAndNotes(content);
      const res = await fetch("/api/images/quick", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ topic: headline || content.slice(0, 80) }),
      });
      const data = await res.json().catch(() => null);
      if (data?.url) {
        window.dispatchEvent(
          new CustomEvent("fieldpress:populate-composer", {
            detail: { photo: data.url },
          })
        );
      }
    } catch {
      // fallback
    } finally {
      setImgBusyIdx(null);
    }
  }

  function ingestActiveDesk() {
    const input = document.querySelector('input[placeholder*="Headline"]') as HTMLInputElement | null;
    const textarea = document.querySelector('textarea[placeholder*="Field notes"]') as HTMLTextAreaElement | null;
    const h = input?.value?.trim() || "";
    const b = textarea?.value?.trim() || "";

    if (!h && !b) {
      setTurns((prev) => [
        ...prev,
        {
          role: "pressy",
          content: "Your Dispatch Desk is currently empty! Type a working headline or field notes on the desk on the left, then click [INGEST ACTIVE DESK] and I will audit, fact-check, and expand it into a full dispatch.",
        },
      ]);
      return;
    }

    const command = `Audit, summarize, and punch up this active field dispatch from my desk:
Headline: ${h || "(none)"}
Field Notes: ${b || "(none)"}`;
    void handleSend(command);
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
        <div className="pointer-events-auto w-[min(94vw,31rem)] overflow-hidden rounded-2xl border border-neon/40 bg-terminal shadow-[0_0_24px_rgba(57,255,20,0.18)]">
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

          <div ref={scroller} className="max-h-[min(28rem,55vh)] space-y-3 overflow-y-auto p-3">
            {turns.map((turn, i) => (
              <div key={`${turn.role}-${i}`} className="space-y-1.5">
                <div
                  className={
                    turn.role === "user"
                      ? "ml-8 rounded-lg border border-border bg-card px-3 py-2 text-sm whitespace-pre-wrap break-words"
                      : "mr-2 rounded-lg border border-neon/25 bg-card/80 px-3 py-2 text-sm text-foreground/90 whitespace-pre-wrap break-words"
                  }
                >
                  {turn.content}
                </div>

                {/* EXPANDED ACTION BAR FOR EACH PRESSY DISPATCH */}
                {turn.role === "pressy" && i > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pl-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-[10px] border-neon/30 text-neon hover:bg-neon/10 hover:border-neon gap-1"
                      onClick={() => syncToDesk(turn.content, i)}
                    >
                      {syncedIdx === i ? <Check className="w-3 h-3 text-neon-green" /> : <Zap className="w-3 h-3 text-signal-yellow" />}
                      {syncedIdx === i ? "POPULATED ✓" : "POPULATE DESK"}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-[10px] border-border text-foreground hover:bg-card gap-1"
                      disabled={imgBusyIdx === i}
                      onClick={() => void syncImageToDesk(turn.content, i)}
                    >
                      <ImageIcon className="w-3 h-3 text-neon-blue" />
                      {imgBusyIdx === i ? "ATTACHING…" : "GEN IMAGE"}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-[10px] border-border text-muted-foreground hover:text-foreground gap-1"
                      onClick={() => {
                        const { headline } = extractHeadlineAndNotes(turn.content);
                        void handleSend(`Audit and verify public records for: "${headline || turn.content.slice(0, 60)}"`);
                      }}
                    >
                      <ShieldCheck className="w-3 h-3 text-neon-green" />
                      VERIFY AUDIT
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-[10px] border-border text-muted-foreground hover:text-foreground gap-1"
                      onClick={() => {
                        const { headline } = extractHeadlineAndNotes(turn.content);
                        void handleSend(`Draft a 30-second radio broadcast intro for this story: "${headline || turn.content.slice(0, 60)}"`);
                      }}
                    >
                      <Radio className="w-3 h-3 text-signal-yellow" />
                      RADIO CLIP
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-[10px] text-muted-foreground hover:text-foreground gap-1"
                      onClick={async () => {
                        await navigator.clipboard.writeText(turn.content);
                        setCopiedIdx(i);
                        setTimeout(() => setCopiedIdx(null), 1500);
                      }}
                    >
                      <Copy className="w-3 h-3" />
                      {copiedIdx === i ? "COPIED" : "COPY"}
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {busy && <p className="text-xs text-muted-foreground animate-pulse">Pressy&apos;O is typing…</p>}
            {error && <p className="text-xs text-neon-red">{error}</p>}
          </div>

          {/* QUICK COMMAND DIRECTIVES BAR */}
          <div className="border-t border-neon/15 bg-card/40 px-2.5 py-1.5">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-6 text-[10px] font-mono shrink-0 border-signal-yellow/40 text-signal-yellow hover:bg-signal-yellow/10 gap-1"
                onClick={ingestActiveDesk}
              >
                <CornerDownLeft className="w-3 h-3" />
                INGEST ACTIVE DESK
              </Button>

              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-6 text-[10px] shrink-0 border border-border/50 text-muted-foreground hover:text-foreground gap-1"
                onClick={() => void handleSend("Punch up my headline into 3 high-impact breaking angles under 12 words.")}
              >
                <Flame className="w-3 h-3 text-neon-red" />
                PUNCH UP
              </Button>

              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-6 text-[10px] shrink-0 border border-border/50 text-muted-foreground hover:text-foreground gap-1"
                onClick={() => void handleSend("What is the official defense or counter-perspective on this development?")}
              >
                <Scale className="w-3 h-3 text-neon-blue" />
                COUNTER-ANGLE
              </Button>

              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-6 text-[10px] shrink-0 border border-border/50 text-muted-foreground hover:text-foreground gap-1"
                onClick={() => void handleSend("Draft a 3-part thread formatted for social distribution with hashtags.")}
              >
                <Share2 className="w-3 h-3 text-neon-green" />
                SOCIAL THREAD
              </Button>
            </div>
          </div>

          <div className="flex gap-2 border-t border-neon/20 p-2">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Command Pressy'O (e.g. 'Ingest active desk' or ask breaking questions)…"
              className="min-h-[50px] resize-none bg-card border-border text-sm"
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
