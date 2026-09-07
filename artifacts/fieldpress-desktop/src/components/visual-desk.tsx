import { useEffect, useState } from "react";
import { Copy, ImagePlus, Search, Sparkles } from "lucide-react";
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

type Hit = {
  id: number | string;
  title: string;
  url: string;
  thumbUrl?: string;
  author?: string;
  license?: string;
  source?: string;
};

type FormatId = "article_hero" | "social_feed" | "podcast_square";
type DirectionId =
  | "documentary_still"
  | "editorial_illustration"
  | "archival_poster"
  | "collage"
  | "zine_texture"
  | "quiet_portrait"
  | "abstract_signal";

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

const FORMATS: Array<{ id: FormatId; label: string; detail: string }> = [
  { id: "social_feed", label: "4:5 Feed", detail: "Primary Pressie image" },
  { id: "article_hero", label: "16:9 Hero", detail: "Editorial header" },
  { id: "podcast_square", label: "1:1 Square", detail: "Podcast or cover" },
];

const DIRECTIONS: Array<{ id: DirectionId; label: string; detail: string }> = [
  { id: "documentary_still", label: "Documentary still", detail: "Observed, grounded, human" },
  { id: "editorial_illustration", label: "Editorial illustration", detail: "Interpretive, clear, original" },
  { id: "archival_poster", label: "Archival-poster treatment", detail: "Printed history, material texture" },
  { id: "collage", label: "Collage", detail: "Layered source fragments" },
  { id: "zine_texture", label: "Zine texture", detail: "Photocopied, raw, handmade" },
  { id: "quiet_portrait", label: "Quiet portrait", detail: "Intimate and considered" },
  { id: "abstract_signal", label: "Abstract signal", detail: "Mood, motion, pattern" },
];

const WORKER_STYLE_BY_DIRECTION: Record<DirectionId, "polaroid" | "hd" | "toon" | "fantasy" | "sketch" | "abstract"> = {
  documentary_still: "hd",
  editorial_illustration: "toon",
  archival_poster: "polaroid",
  collage: "abstract",
  zine_texture: "sketch",
  quiet_portrait: "hd",
  abstract_signal: "abstract",
};

type BriefResponse = {
  prompt?: string;
  source?: "ai" | "fallback";
  error?: string;
};

type RenderResponse = {
  dataUrl?: string;
  dataUrls?: string[];
  prompt?: string;
  remaining?: number;
  used?: number;
  limit?: number;
  error?: string;
};

function friendlyError(value?: string) {
  if (!value) return "Pressy could not complete that request. Try again.";
  if (/sign in|authentication/i.test(value)) return "Sign in to use Pressy Visuals.";
  if (/not found|access/i.test(value)) return "This Pressie is not available for visual work.";
  if (/limit|quota/i.test(value)) return "Today's visual limit has been reached. Try again later.";
  if (/rate-limited|wikimedia|upstream_rate_limited/i.test(value)) {
    return "Archival image search is temporarily rate-limited by Wikimedia. Please wait a moment and try again.";
  }
  if (/unavailable|not configured|provider/i.test(value)) {
    return "Visual rendering is not available on this FieldPress desk yet.";
  }
  return "Pressy could not complete that request. Try again.";
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
  const [format, setFormat] = useState<FormatId>("social_feed");
  const [direction, setDirection] = useState<DirectionId>("documentary_still");
  const [hits, setHits] = useState<Hit[]>([]);
  const [brief, setBrief] = useState("");
  const [stills, setStills] = useState<string[]>([]);
  const [makerOpen, setMakerOpen] = useState(false);
  const [busy, setBusy] = useState<"search" | "brief" | "render" | "attach" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function search(nextQuery = query.trim() || headline) {
    if (!nextQuery.trim()) return;

    setQuery(nextQuery);
    setBusy("search");
    setError(null);
    setNotice(null);

    try {
      const res = await fetch(`/api/stories/${storyId}/images/search`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: nextQuery }),
      });
      const payload = (await res.json().catch(() => null)) as Hit[] | { error?: string } | null;
      if (!res.ok) throw new Error((payload as { error?: string } | null)?.error);
      setHits(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : undefined));
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => {
    void search(seedQuery || headline);
  }, [storyId]);

  useEffect(() => {
    if (seedQuery) void search(seedQuery);
  }, [seedQuery]);

  function openMaker() {
    if (!signedIn) {
      onNeedSignIn();
      return;
    }
    setError(null);
    setNotice(null);
    setMakerOpen(true);
  }

  async function generateBrief() {
    if (!signedIn) {
      onNeedSignIn();
      return;
    }

    setBusy("brief");
    setError(null);
    setNotice(null);

    try {
      const res = await fetch(`/api/stories/${storyId}/images/generate-prompt`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          format,
          headline,
          fieldNotes: notes,
          style: WORKER_STYLE_BY_DIRECTION[direction],
        }),
      });
      const payload = (await res.json().catch(() => null)) as BriefResponse | null;
      if (!res.ok) throw new Error(payload?.error);
      const nextBrief = payload?.prompt?.trim();
      if (!nextBrief) throw new Error("No brief returned");
      setBrief(nextBrief);
      setNotice(
        payload?.source === "fallback"
          ? "Pressy made a local editorial brief. Edit it before rendering."
          : "Pressy made an editable visual brief.",
      );
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : undefined));
    } finally {
      setBusy(null);
    }
  }

  async function renderVisual() {
    if (!signedIn) {
      onNeedSignIn();
      return;
    }
    if (!brief.trim()) {
      setError("Generate or write a visual brief before rendering.");
      return;
    }

    setBusy("render");
    setError(null);
    setNotice(null);

    try {
      const res = await fetch(`/api/stories/${storyId}/images/generate`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          format,
          headline,
          fieldNotes: notes,
          prompt: brief.trim(),
          style: WORKER_STYLE_BY_DIRECTION[direction],
          count: 1,
        }),
      });
      const payload = (await res.json().catch(() => null)) as RenderResponse | null;
      if (!res.ok) throw new Error(payload?.error);
      const urls = payload?.dataUrls?.filter(Boolean) || (payload?.dataUrl ? [payload.dataUrl] : []);
      if (!urls.length) throw new Error("No visual returned");
      setStills(urls);
      setNotice("Visual ready for review. It is not attached or published.");
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : undefined));
    } finally {
      setBusy(null);
    }
  }

  async function attachRendered(src: string) {
    if (!onRendered) return;

    setBusy("attach");
    setError(null);
    setNotice(null);

    try {
      await onRendered(src);
      setNotice("Visual attached to this private Pressie workspace. Add or edit alt text before publication.");
    } catch {
      setError("That visual could not be attached. Try again.");
    } finally {
      setBusy(null);
    }
  }

  async function copyBrief() {
    if (!brief) return;

    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setError("Could not copy the visual brief.");
    }
  }

  const renderingUnavailable = true;

  return (
    <Card className="border-neon-yellow/25 bg-card">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm tracking-wider text-neon-yellow">PRESSY VISUALS</h3>
            <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
              Find source imagery or build an editable visual brief. Generated visuals stay private until you choose to attach them.
              {renderingUnavailable
                ? " Visual rendering is not configured on this FieldPress desk yet."
                : signedIn
                  ? " Sign in to make a brief."
                  : " Sign in to make a brief."}
            </p>
          </div>
          <Button type="button" size="sm" onClick={openMaker} disabled={busy === "brief" || busy === "render"}>
            <Sparkles className="mr-1 h-4 w-4" />
            {busy === "brief" || busy === "render" ? "WORKING…" : "PRESSY"}
          </Button>
        </div>

        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search source imagery from the headline…"
            className="min-w-0 bg-card border-neon/20"
            onKeyDown={(event) => event.key === "Enter" && void search()}
          />
          <Button type="button" variant="outline" onClick={() => void search()} disabled={busy === "search"}>
            <Search className="mr-1 h-4 w-4" />
            {busy === "search" ? "…" : "FIND"}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2" aria-label="Visual format">
          {FORMATS.map((item) => (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={format === item.id ? "default" : "outline"}
              onClick={() => setFormat(item.id)}
              title={item.detail}
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
                className="overflow-hidden rounded border border-neon/15 bg-card text-left transition-colors hover:border-neon-yellow/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-yellow"
                onClick={() => void onAttachUrl(hit.url, hit.title)}
                aria-label={`Attach source image: ${hit.title}`}
              >
                <img src={hit.thumbUrl || hit.url} alt="" className="h-24 w-full object-cover" />
                <div className="truncate p-1.5 text-[10px] text-muted-foreground">
                  {hit.source ? `${hit.source} · ` : ""}
                  {hit.title}
                </div>
              </button>
            ))}
          </div>
        )}

        {stills.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] tracking-widest text-neon-yellow">PRESSY VISUALS — REVIEW BEFORE ATTACHING</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {stills.map((src, index) => (
                <div key={`${index}-${src.slice(-24)}`} className="overflow-hidden rounded border border-neon-yellow/40 bg-black">
                  <img src={src} alt={`Pressy-generated visual candidate ${index + 1}`} className="max-h-80 w-full object-cover" />
                  <div className="flex items-center justify-between gap-2 p-2">
                    <span className="text-[10px] text-muted-foreground">AI-generated visual</span>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => void attachRendered(src)}
                      disabled={busy === "attach" || !onRendered}
                    >
                      <ImagePlus className="mr-1 h-4 w-4" />
                      {busy === "attach" ? "ATTACHING…" : "ATTACH"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {notice && <p className="text-xs text-neon">{notice}</p>}
        {error && <p className="text-xs text-neon-red" role="alert">{error}</p>}

        <Dialog open={makerOpen} onOpenChange={setMakerOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto bg-terminal border-neon/30">
            <DialogHeader>
              <DialogTitle className="tracking-widest">PRESSY VISUALS</DialogTitle>
              <DialogDescription>
                Build a visual brief first. You keep control of the wording, rendering, attachment, and publication.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <p className="mb-2 text-[10px] tracking-widest text-muted-foreground">EDITORIAL DIRECTION</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {DIRECTIONS.map((item) => (
                    <Button
                      key={item.id}
                      type="button"
                      variant={direction === item.id ? "default" : "outline"}
                      className="min-h-11 justify-start whitespace-normal text-left"
                      onClick={() => setDirection(item.id)}
                      title={item.detail}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] tracking-widest text-muted-foreground">OUTPUT</p>
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
              </div>

              <Button
                type="button"
                className="w-full"
                onClick={() => void generateBrief()}
                disabled={busy === "brief"}
              >
                <Sparkles className="mr-1 h-4 w-4" />
                {busy === "brief" ? "WRITING BRIEF…" : brief ? "REGENERATE BRIEF" : "GENERATE BRIEF"}
              </Button>

              {brief && (
                <div className="space-y-2">
                  <label htmlFor="pressy-visual-brief" className="text-[10px] tracking-widest text-muted-foreground">
                    EDITABLE VISUAL BRIEF
                  </label>
                  <textarea
                    id="pressy-visual-brief"
                    value={brief}
                    onChange={(event) => setBrief(event.target.value)}
                    className="min-h-32 w-full rounded-md border border-neon/20 bg-card p-2 text-xs text-foreground/90"
                    maxLength={1200}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => void copyBrief()}>
                      <Copy className="mr-1 h-3 w-3" />
                      {copied ? "COPIED" : "COPY BRIEF"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => void renderVisual()}
                      disabled={busy === "render" || renderingUnavailable}
                    >
                      <ImagePlus className="mr-1 h-4 w-4" />
                      {busy === "render" ? "RENDERING…" : "RENDER VISUAL"}
                    </Button>
                  </div>
                  {renderingUnavailable && (
                    <p className="text-xs text-muted-foreground">
                      Image rendering is not configured on this FieldPress desk. Copy the brief for now.
                    </p>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
