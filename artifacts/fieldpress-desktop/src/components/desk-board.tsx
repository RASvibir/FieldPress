import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Tip = { id: string; body: string; fromName: string; createdAt: string };
type Note = { id: string; body: string; fromName: string; createdAt: string };

export function DeskBoard({
  storyId,
  embargoUntil,
  canEdit,
}: {
  storyId: string;
  embargoUntil?: string | null;
  canEdit: boolean;
}) {
  const [tips, setTips] = useState<Tip[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tipBody, setTipBody] = useState("");
  const [tipFrom, setTipFrom] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [embargo, setEmbargo] = useState(embargoUntil ? embargoUntil.slice(0, 16) : "");
  const [status, setStatus] = useState<string | null>(null);
  const [chapters, setChapters] = useState<number>(0);

  useEffect(() => {
    setEmbargo(embargoUntil ? new Date(embargoUntil).toISOString().slice(0, 16) : "");
  }, [embargoUntil]);

  useEffect(() => {
    void Promise.all([
      fetch(`/api/stories/${storyId}/tips`, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/stories/${storyId}/notes`, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/stories/${storyId}/chapters`, { credentials: "include" }).then((r) => (r.ok ? r.json() : { chapters: [] })),
    ]).then(([nextTips, nextNotes, nextChapters]) => {
      setTips(Array.isArray(nextTips) ? nextTips : []);
      setNotes(Array.isArray(nextNotes) ? nextNotes : []);
      setChapters(Array.isArray(nextChapters?.chapters) ? nextChapters.chapters.length : 0);
    });
  }, [storyId]);

  async function sendTip() {
    const body = tipBody.trim();
    if (!body) return;
    const res = await fetch(`/api/stories/${storyId}/tips`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body, fromName: tipFrom.trim() || "Anonymous" }),
    });
    const row = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus(typeof row.error === "string" ? row.error : "Could not send tip");
      return;
    }
    setTips((prev) => [row as Tip, ...prev]);
    setTipBody("");
    setStatus("Tip sent");
  }

  async function sendNote() {
    const body = noteBody.trim();
    if (!body) return;
    const res = await fetch(`/api/stories/${storyId}/notes`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body, fromName: "Desk" }),
    });
    const row = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus(typeof row.error === "string" ? row.error : "Could not save note");
      return;
    }
    setNotes((prev) => [...prev, row as Note]);
    setNoteBody("");
    setStatus("Note saved");
  }

  async function saveEmbargo() {
    const embargoUntil = embargo ? new Date(embargo).toISOString() : null;
    const res = await fetch(`/api/stories/${storyId}/desk`, {
      method: "PATCH",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ embargoUntil }),
    });
    if (!res.ok) {
      setStatus("Could not save embargo");
      return;
    }
    setStatus(embargoUntil ? "Embargo set" : "Embargo cleared");
  }

  return (
    <div className="space-y-4 border border-neon/15 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm tracking-widest text-neon">DESK</h3>
        <a
          className="text-[11px] text-muted-foreground hover:text-neon"
          href={`/api/stories/${storyId}/rss`}
          target="_blank"
          rel="noreferrer"
        >
          Draft RSS{chapters ? ` · ${chapters} chapters` : ""}
        </a>
      </div>
      {canEdit && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="flex-1 text-[11px] text-muted-foreground">
            Embargo until
            <Input
              type="datetime-local"
              value={embargo}
              onChange={(e) => setEmbargo(e.target.value)}
              className="mt-1 bg-card border-border"
            />
          </label>
          <Button variant="outline" size="sm" onClick={() => void saveEmbargo()}>
            SAVE EMBARGO
          </Button>
        </div>
      )}
      <div className="space-y-2">
        <Textarea
          value={tipBody}
          onChange={(e) => setTipBody(e.target.value)}
          placeholder="Send a tip to this file"
          className="min-h-[72px] bg-card border-border text-sm"
        />
        <div className="flex gap-2">
          <Input
            value={tipFrom}
            onChange={(e) => setTipFrom(e.target.value)}
            placeholder="Your name (optional)"
            className="bg-card border-border"
          />
          <Button variant="outline" onClick={() => void sendTip()}>
            TIP
          </Button>
        </div>
        {tips.slice(0, 5).map((tip) => (
          <p key={tip.id} className="text-xs text-muted-foreground whitespace-pre-wrap">
            <span className="text-neon">{tip.fromName || "Anonymous"}:</span> {tip.body}
          </p>
        ))}
      </div>
      {canEdit && (
        <div className="space-y-2">
          <Textarea
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            placeholder="Private desk note"
            className="min-h-[72px] bg-card border-border text-sm"
          />
          <Button variant="outline" onClick={() => void sendNote()}>
            ADD NOTE
          </Button>
          {notes.map((note) => (
            <p key={note.id} className="text-xs whitespace-pre-wrap">
              {note.body}
            </p>
          ))}
        </div>
      )}
      {status && <p className="text-xs text-neon">{status}</p>}
    </div>
  );
}
