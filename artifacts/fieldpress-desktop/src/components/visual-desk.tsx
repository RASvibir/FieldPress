import { useEffect, useState } from "react";
import { Copy, Search, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type Hit = {
  id: number | string;
  title: string;
  url: string;
  thumbUrl?: string;
  author?: string;
  license?: string;
  source?: string;
};

type Props = {
  storyId: string;
  headline: string;
  notes: string;
  signedIn: boolean;
  onNeedSignIn: () => void;
  onAttachUrl: (url: string, label: string) => Promise<void> | void;
  onRendered?: (dataUrl: string) => Promise<void> | void;
  seedQuery?: string;
};

const FORMATS = [
  { id: "article_hero", label: "Pressie 16:9" },
  { id: "social_feed", label: "Social 4:5" },
  { id: "podcast_square", label: "Podcast 1:1" },
] as const;

export function VisualDesk({
  storyId,
  headline,
  notes,
  signedIn,
  onNeedSignIn,
  onAttachUrl,
  onRendered,
  seedQuery,
}: Props) {
  const [query, setQuery] = useState(headline);
  const [format, setFormat] = useState<(typeof FORMATS)[number]["id"]>("article_hero");
  const [hits, setHits] = useState<Hit[]>([]);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState<"search" | "prompt" | "render" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function search(nextQuery = query.trim() || headline) {
    if (!nextQuery) return;
    setQuery(nextQuery);
    setBusy("search");
    setError(null);
    try {
      const res = await fetch(`/api/stories/${storyId}/images/search`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: nextQuery }),
      });
      const payload = (await res.json().catch(() => null)) as Hit[] | { error?: string } | null;
      if (!res.ok) throw new Error((payload as { error?: string })?.error || "Image search failed");
      setHits(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image search failed");
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => {
    void search(seedQuery || headline);
    // headline search once per story
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyId, headline]);

  useEffect(() => {
    if (seedQuery) void search(seedQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedQuery]);

  async function makePrompt() {
    setBusy("prompt");
    setError(null);
    try {
      const res = await fetch(`/api/stories/${storyId}/images/generate-prompt`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ format, headline, fieldNotes: notes }),
      });
      const payload = (await res.json().catch(() => null)) as { prompt?: string; error?: string } | null;
      if (!res.ok) throw new Error(payload?.error || "Could not write a photo prompt");
      setPrompt(payload?.prompt || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not write a photo prompt");
    } finally {
      setBusy(null);
    }
  }

  async function renderImage() {
    if (!signedIn) {
      onNeedSignIn();
      return;
    }
    setBusy("render");
    setError(null);
    try {
      const res = await fetch(`/api/stories/${storyId}/images/generate`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ format, headline, fieldNotes: notes, prompt }),
      });
      const payload = (await res.json().catch(() => null)) as { dataUrl?: string; error?: string; prompt?: string } | null;
      if (payload?.prompt) setPrompt(payload.prompt);
      if (!res.ok) throw new Error(payload?.error || "Render failed");
      if (payload?.dataUrl) await onRendered?.(payload.dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Render failed");
    } finally {
      setBusy(null);
    }
  }

  async function copyPrompt() {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <Card className="border-neon-yellow/25 bg-card">
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="text-sm tracking-wider text-neon-yellow">HEADLINE PHOTO SEARCH</h3>
            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
            Public search from this headline (Openverse, Wikimedia, and Google if configured). Nudity in news or art can appear. Porn is blocked.
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search from the headline…"
            className="bg-card border-neon/20"
            onKeyDown={(e) => e.key === "Enter" && void search()}
          />
          <Button variant="outline" onClick={() => void search()} disabled={busy === "search"}>
            <Search className="w-4 h-4 mr-1" />
            {busy === "search" ? "…" : "SEARCH"}
          </Button>
        </div>
        {hits.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {hits.map((hit) => (
              <button
                key={String(hit.id)}
                type="button"
                className="text-left border border-neon/15 hover:border-neon-yellow/50 rounded overflow-hidden bg-card"
                onClick={() => void onAttachUrl(hit.url, hit.title)}
              >
                <img src={hit.thumbUrl || hit.url} alt={hit.title} className="w-full h-24 object-cover" />
                <div className="p-1.5 text-[10px] text-muted-foreground truncate">
                  {hit.source ? `${hit.source} · ` : ""}
                  {hit.title}
                </div>
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {FORMATS.map((item) => (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={format === item.id ? "default" : "outline"}
              onClick={() => setFormat(item.id)}
            >
              {item.label}
            </Button>
          ))}
          <Button variant="outline" onClick={() => void makePrompt()} disabled={busy === "prompt"}>
            <Sparkles className="w-4 h-4 mr-1" />
            {busy === "prompt" ? "WRITING…" : "PHOTO PROMPT"}
          </Button>
          <Button onClick={() => void renderImage()} disabled={busy === "render"}>
            <Wand2 className="w-4 h-4 mr-1" />
            {busy === "render" ? "RENDERING…" : signedIn ? "RENDER PRESSY AI FLOW" : "SIGN IN TO RENDER"}
          </Button>
        </div>
        {prompt && (
          <div className="space-y-2">
            <p className="text-xs text-foreground/80 whitespace-pre-wrap break-words">{prompt}</p>
            <Button variant="ghost" size="sm" onClick={() => void copyPrompt()}>
              <Copy className="w-3 h-3 mr-1" />
              {copied ? "COPIED" : "COPY PROMPT"}
            </Button>
          </div>
        )}
        {error && <p className="text-xs text-neon-red">{error}</p>}
        {!signedIn && (
          <p className="text-[10px] text-muted-foreground pt-2 border-t border-neon/10 leading-relaxed">
            Sign in to unlock more powerful prompt generation, camera capture, and still rendering.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
