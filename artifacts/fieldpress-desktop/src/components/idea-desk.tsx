import { useState } from "react";
import { Lightbulb, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type IdeaPack = {
  searchQueries: string[];
  spiffs: Array<{ headline: string; visual: string; hook: string }>;
  articleIdeas: string[];
  socialIdeas: string[];
  podcastIdeas: string[];
};

type Props = {
  storyId: string;
  onUseQuery?: (query: string) => void;
};

export function IdeaDesk({ storyId, onUseQuery }: Props) {
  const [pack, setPack] = useState<IdeaPack | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function loadIdeas() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/stories/${storyId}/ideas`, { method: "POST", credentials: "include" });
      const payload = (await res.json().catch(() => null)) as (IdeaPack & { error?: string }) | null;
      if (!res.ok) throw new Error(payload?.error || "Could not load ideas");
      setPack(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load ideas");
    } finally {
      setBusy(false);
    }
  }

  async function copy(label: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1200);
  }

  return (
    <div className="space-y-3">
      <Button variant="outline" className="w-full border-cyan-400/30 text-cyan-300" onClick={() => void loadIdeas()} disabled={busy}>
        <Lightbulb className="w-4 h-4 mr-2" />
        {busy ? "THINKING…" : "GET IDEAS FROM THIS HEADLINE"}
      </Button>
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Ideas only. FieldPress will not write or send a social post, podcast episode, or newsletter for you.
      </p>
      {error && <p className="text-xs text-neon-red">{error}</p>}
      {pack && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xs tracking-wider text-neon-yellow mb-2">PHOTO SEARCH FORKS</h3>
            <div className="flex flex-wrap gap-2">
              {pack.searchQueries.map((query) => (
                <Button key={query} size="sm" variant="outline" onClick={() => onUseQuery?.(query)}>
                  {query}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs tracking-wider text-neon-yellow mb-2">SPIFFS</h3>
            <div className="space-y-2">
              {pack.spiffs.map((spiff, i) => (
                <Card key={`${spiff.headline}-${i}`} className="border-neon/15 bg-card">
                  <CardContent className="p-3 space-y-1">
                    <p className="text-sm text-neon">{spiff.headline}</p>
                    <p className="text-[11px] text-muted-foreground">{spiff.visual}</p>
                    <p className="text-xs">{spiff.hook}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void copy(spiff.headline, `${spiff.headline}\n${spiff.visual}\n${spiff.hook}`)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      {copied === spiff.headline ? "COPIED" : "COPY SPIFF"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          {([
            ["ARTICLE ANGLES", pack.articleIdeas],
            ["SOCIAL ANGLES", pack.socialIdeas],
            ["PODCAST ANGLES", pack.podcastIdeas],
          ] as const).map(([label, items]) => (
            <div key={label}>
              <h3 className="text-xs tracking-wider text-muted-foreground mb-1">{label}</h3>
              <ul className="text-xs space-y-1 list-disc pl-4 text-foreground/80">
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
