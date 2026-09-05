import { useState } from "react";
import { Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { loadHeadlineCache, saveHeadlineCache, type CachedHeadline } from "@/lib/headline-cache";

type Props = {
  storyId: string;
  onUseHeadline?: (text: string) => void;
};

export function HeadlineCache({ storyId, onUseHeadline }: Props) {
  const [rows, setRows] = useState<CachedHeadline[]>(() => loadHeadlineCache(storyId));
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/stories/${storyId}/ideas`, { method: "POST", credentials: "include" });
      const payload = (await res.json().catch(() => null)) as {
        error?: string;
        spiffs?: Array<{ headline?: string }>;
        searchQueries?: string[];
      } | null;
      if (!res.ok) throw new Error(payload?.error || "Could not cache headlines");
      const texts = [
        ...(payload?.spiffs || []).map((item) => item.headline || ""),
        ...(payload?.searchQueries || []),
      ];
      setRows(saveHeadlineCache(storyId, texts));
      setOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not cache headlines");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button variant="outline" className="w-full" onClick={() => void generate()} disabled={busy}>
        <Newspaper className="w-4 h-4 mr-2" />
        {busy ? "CACHING…" : "HEADLINE CACHE"}
      </Button>
      {rows.length > 0 && (
        <Button variant="ghost" size="sm" onClick={() => setOpen((value) => !value)}>
          {open ? "HIDE CACHE" : `SHOW ${rows.length} CACHED HEADLINES`}
        </Button>
      )}
      {error && <p className="text-xs text-neon-red">{error}</p>}
      {open && (
        <Card className="border-neon/15 bg-card">
          <CardContent className="p-3 space-y-2">
            {rows.map((row) => (
              <button
                key={row.text}
                type="button"
                className="block w-full text-left text-sm text-neon hover:text-glow"
                onClick={() => onUseHeadline?.(row.text)}
              >
                {row.text}
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
