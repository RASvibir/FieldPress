import { useEffect, useState } from "react";
import { Copy, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { askLocalDesk } from "@/lib/desk";

type Hit = {
  id: number | string;
  title: string;
  url: string;
  thumbUrl?: string;
  author?: string;
  license?: string;
  source?: string;
};

type Quota = { used: number; remaining: number; limit: number };
type StyleId = "polaroid" | "hd" | "toon" | "fantasy" | "sketch" | "abstract";

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
  { id: "article_hero", label: "16:9" },
  { id: "social_feed", label: "4:5" },
  { id: "podcast_square", label: "1:1" },
] as const;

const STYLES: Array<{ id: StyleId; label: string }> = [
  { id: "polaroid", label: "Polaroid" },
  { id: "hd", label: "HD" },
  { id: "toon", label: "Toons" },
  { id: "fantasy", label: "Fantasy" },
  { id: "sketch", label: "Sketch" },
  { id: "abstract", label: "Abstract" },
];

function scrubCopy(value: string) {
  return value
    .replace(/\bno pornography\b/gi, "")
    .replace(/\bno porn(?:ography)?\b/gi, "")
    .replace(/porn is not allowed[^.]*\./gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+\./g, ".")
    .trim();
}

function friendlyError(value?: string) {
  if (!value) return "That take failed. Try MAKE again.";
  if (/porn|nudity|rating|not allowed/i.test(value)) return "That take failed. Try MAKE again.";
  return value;
}

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
  const [stills, setStills] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [style, setStyle] = useState<StyleId>("hd");
  const [count, setCount] = useState<1 | 2 | 3>(1);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [busy, setBusy] = useState<"search" | "make" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function loadQuota() {
    if (!signedIn) {
      setQuota(null);
      return;
    }
    const res = await fetch("/api/images/quota", { credentials: "include" });
    const body = (await res.json().catch(() => null)) as Quota | null;
    if (res.ok && body && typeof body.remaining === "number") setQuota(body);
  }

  useEffect(() => {
    void loadQuota();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyId, headline]);

  useEffect(() => {
    if (seedQuery) void search(seedQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedQuery]);

  function openMaker() {
    if (!signedIn) {
      onNeedSignIn();
      return;
    }
    setError(null);
    void loadQuota();
    setPickerOpen(true);
  }

  async function runMake() {
    setPickerOpen(false);
    setBusy("make");
    setError(null);
    try {
      let nextPrompt = "";
      const localBrief = await askLocalDesk(
        `Write ONE dense documentary still brief (80–160 words). Style ${style}. Headline: ${headline || "(none)"}. Notes: ${notes || "(none)"}. No celebrities, no logos, no on-image text. Return only the prompt.`,
      );
      if (localBrief?.text) {
        nextPrompt = localBrief.text.trim();
      } else {
        const promptRes = await fetch(`/api/stories/${storyId}/images/generate-prompt`, {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ format, headline, fieldNotes: notes, style }),
        });
        const promptBody = (await promptRes.json().catch(() => null)) as { prompt?: string; error?: string } | null;
        if (!promptRes.ok) throw new Error(friendlyError(promptBody?.error));
        nextPrompt = promptBody?.prompt?.trim() || "";
      }
      if (nextPrompt) setPrompt(scrubCopy(nextPrompt));

      const shots = Math.min(count, quota?.remaining ?? count) as 1 | 2 | 3;
      const res = await fetch(`/api/stories/${storyId}/images/generate`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          format,
          headline,
          fieldNotes: notes,
          prompt: nextPrompt,
          style,
          count: shots,
        }),
      });
      const payload = (await res.json().catch(() => null)) as {
        dataUrl?: string;
        dataUrls?: string[];
        error?: string;
        prompt?: string;
        remaining?: number;
        used?: number;
        limit?: number;
      } | null;
      if (payload?.prompt) setPrompt(scrubCopy(payload.prompt));
      if (typeof payload?.remaining === "number" && typeof payload.used === "number" && typeof payload.limit === "number") {
        setQuota({ remaining: payload.remaining, used: payload.used, limit: payload.limit });
      }
      if (!res.ok) throw new Error(friendlyError(payload?.error));
      const urls = payload?.dataUrls?.filter(Boolean) || (payload?.dataUrl ? [payload.dataUrl] : []);
      if (!urls.length) throw new Error("No stills returned");
      setStills(urls);
      if (onRendered) {
        for (const src of urls) {
          await onRendered(src);
        }
      }
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : undefined));
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

  const left = quota?.remaining;
  const maxShots = left == null ? 3 : Math.min(3, Math.max(0, left));

  return (
    <Card className="border-neon-yellow/25 bg-card">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm tracking-wider text-neon-yellow">VISUALS</h3>
            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
              Search the public web, or MAKE a prompt plus 1–3 stills. {signedIn ? `${left ?? "…"}/13 today.` : "Sign in to MAKE."}
            </p>
          </div>
          <Button size="sm" onClick={openMaker} disabled={busy === "make"}>
            <Sparkles className="w-4 h-4 mr-1" />
            {busy === "make" ? "…" : "MAKE"}
          </Button>
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
            {busy === "search" ? "…" : "FIND"}
          </Button>
        </div>
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
        {stills.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] tracking-widest text-neon-yellow">STILLS — filed on this story</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {stills.map((src, i) => (
                <button
                  key={`${i}-${src.slice(-24)}`}
                  type="button"
                  className="border border-neon-yellow/40 rounded overflow-hidden bg-black"
                  onClick={() => void onRendered?.(src)}
                >
                  <img src={src} alt={`Still ${i + 1}`} className="w-full max-h-64 object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
        {prompt && (
          <div className="space-y-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full min-h-[90px] text-xs bg-card border border-neon/20 rounded-md p-2 text-foreground/90 whitespace-pre-wrap"
            />
            <Button variant="ghost" size="sm" onClick={() => void copyPrompt()}>
              <Copy className="w-3 h-3 mr-1" />
              {copied ? "COPIED" : "COPY"}
            </Button>
          </div>
        )}
        {error && <p className="text-xs text-neon-red">{error}</p>}

        <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
          <DialogContent className="bg-terminal border-neon/30">
            <DialogHeader>
              <DialogTitle className="tracking-widest">MAKE</DialogTitle>
              <DialogDescription>
                Style and shot count, then we write the prompt and render. {left != null ? `${left} left today.` : "13 stills a day."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] tracking-widest text-muted-foreground mb-2">STYLE</p>
                <div className="grid grid-cols-2 gap-2">
                  {STYLES.map((item) => (
                    <Button
                      key={item.id}
                      type="button"
                      variant={style === item.id ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => setStyle(item.id)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] tracking-widest text-muted-foreground mb-2">SHOTS</p>
                <div className="flex gap-2">
                  {([1, 2, 3] as const).map((n) => (
                    <Button
                      key={n}
                      type="button"
                      variant={count === n ? "default" : "outline"}
                      disabled={maxShots > 0 && n > maxShots}
                      onClick={() => setCount(n)}
                    >
                      {n}
                    </Button>
                  ))}
                </div>
              </div>
              <Button className="w-full" onClick={() => void runMake()} disabled={maxShots === 0}>
                GO
              </Button>
              {maxShots === 0 && signedIn && (
                <p className="text-xs text-neon-red">Daily still limit reached. Back tomorrow.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
