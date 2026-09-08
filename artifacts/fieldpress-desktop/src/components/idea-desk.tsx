import { useState } from "react";
import { Lightbulb, Copy, FileText, Check } from "lucide-react";
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
  onDraftCreated?: () => void;
};

export function IdeaDesk({ storyId, onUseQuery, onDraftCreated }: Props) {
  const [pack, setPack] = useState<IdeaPack | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [drafting, setDrafting] = useState<string | null>(null);
  const [drafted, setDrafted] = useState<string | null>(null);

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

  async function createFullDraft(spiff: { headline: string; visual: string; hook: string }) {
    setDrafting(spiff.headline);
    setError(null);

    const fullContent = `# ${spiff.headline}

> **Lede & Hook:** ${spiff.hook}

## Ground Overview & Key Developments
Active field reporting confirms developing circumstances regarding ${spiff.headline}. Direct observations, timelines, and verified statements are being assembled as the situation unfolds.

## Visual Scene & Evidence Brief
- **Scene Framing:** ${spiff.visual}
- **Context:** High-contrast documentary still focused on location, active subjects, and public impact.
- **Attribution:** Verified FieldPress Bureau Dispatch.

## Verification & Follow-Up Checklist
- [ ] Confirm chronology against municipal and emergency agency records.
- [ ] Interview local witnesses and affected community members on scene.
- [ ] Verify photographic evidence and primary source logs before publication.
`;

    try {
      const res = await fetch(`/api/stories/${storyId}/drafts`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode: "article",
          title: spiff.headline,
          content: fullContent,
        }),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "Could not create story draft");
      }

      setDrafted(spiff.headline);
      onDraftCreated?.();
      setTimeout(() => setDrafted(null), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create draft");
    } finally {
      setDrafting(null);
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={loadIdeas} disabled={busy} className="w-full">
        <Lightbulb className="w-4 h-4 mr-2" />
        {busy ? "THINKING…" : "GET IDEAS FROM THIS HEADLINE"}
      </Button>
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Spiffs generate newsroom angles. Click &quot;DRAFT FULL STORY&quot; to expand any Spiff into an editable story draft.
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
                    <p className="text-sm text-neon font-medium">{spiff.headline}</p>
                    <p className="text-[11px] text-muted-foreground">{spiff.visual}</p>
                    <p className="text-xs text-foreground/90">{spiff.hook}</p>
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void copy(spiff.headline, `${spiff.headline}\n${spiff.visual}\n${spiff.hook}`)}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        {copied === spiff.headline ? "COPIED" : "COPY SPIFF"}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="border-neon/30 text-neon hover:bg-neon/10 hover:border-neon text-xs"
                        disabled={drafting === spiff.headline}
                        onClick={() => void createFullDraft(spiff)}
                      >
                        {drafted === spiff.headline ? (
                          <>
                            <Check className="w-3 h-3 mr-1 text-neon-green" />
                            DRAFT CREATED ✓
                          </>
                        ) : (
                          <>
                            <FileText className="w-3 h-3 mr-1" />
                            {drafting === spiff.headline ? "DRAFTING…" : "DRAFT FULL STORY"}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          {([
            ["PRESSIE ANGLES", pack.articleIdeas],
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
