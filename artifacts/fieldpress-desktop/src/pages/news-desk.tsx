import { useEffect, useMemo, useState } from "react";
import { useCreateDraft, useGetStory, useListDrafts, useUpdateDraft } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import { DistributeDialog } from "@/components/distribute-dialog";
import { PageShell } from "@/components/page-shell";

function joinArticle(fields: {
  headline: string;
  deck: string;
  dateline: string;
  lede: string;
  nutGraf: string;
  body: string;
  quotes: string;
  kicker: string;
}) {
  return [
    fields.headline && `# ${fields.headline}`,
    fields.deck && `*${fields.deck}*`,
    fields.dateline && `**${fields.dateline}**`,
    fields.lede,
    fields.nutGraf && `## Why it matters\n\n${fields.nutGraf}`,
    fields.body && `## The story\n\n${fields.body}`,
    fields.quotes && `## Voices\n\n${fields.quotes}`,
    fields.kicker && `## Close\n\n${fields.kicker}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export default function NewsDeskPage() {
  const params = useParams<{ storyId: string }>();
  const storyId = params.storyId!;
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { data: story } = useGetStory(storyId);
  const { data: drafts } = useListDrafts(storyId);
  const createDraft = useCreateDraft();
  const updateDraft = useUpdateDraft();
  const article = drafts?.find((item) => item.mode === "article");

  const [headline, setHeadline] = useState("");
  const [deck, setDeck] = useState("");
  const [dateline, setDateline] = useState("");
  const [lede, setLede] = useState("");
  const [nutGraf, setNutGraf] = useState("");
  const [body, setBody] = useState("");
  const [quotes, setQuotes] = useState("");
  const [kicker, setKicker] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (story && !headline) setHeadline(story.title);
  }, [story, headline]);

  const content = useMemo(
    () => joinArticle({ headline, deck, dateline, lede, nutGraf, body, quotes, kicker }),
    [headline, deck, dateline, lede, nutGraf, body, quotes, kicker],
  );

  async function save() {
    setStatus(null);
    if (article) {
      updateDraft.mutate(
        { storyId, draftId: article.id, data: { title: headline || story?.title || "Pressie", content } },
        { onSuccess: () => setStatus("Saved") },
      );
      return;
    }
    createDraft.mutate(
      { storyId, data: { mode: "article", title: headline || story?.title || "Pressie", content } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [`/api/stories/${storyId}/drafts`] });
          setStatus("Saved");
        },
      },
    );
  }

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(`/story/${storyId}`)}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            BACK
          </Button>
          <div className="flex gap-2">
            <DistributeDialog
              payload={{
                storyTitle: story?.title || headline,
                mode: "article",
                title: headline,
                content,
              }}
              triggerLabel="SHARE PRESSIE"
            />
            <Button onClick={() => void save()} disabled={updateDraft.isPending || createDraft.isPending}>
              <Save className="w-4 h-4 mr-1" />
              SAVE
            </Button>
          </div>
        </div>
        <div>
          <h1 className="text-3xl text-neon tracking-wider">Pressie desk</h1>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Write a Pressie: lede, nut graf, voices, kicker. Pressy is the bot if you need a prompt.
          </p>
        </div>
        <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Headline" className="bg-card border-neon/20 text-xl h-12" />
        <Input value={deck} onChange={(e) => setDeck(e.target.value)} placeholder="Deck — one-line sell" className="bg-card border-neon/20" />
        <Input value={dateline} onChange={(e) => setDateline(e.target.value)} placeholder="Dateline · CITY — Day" className="bg-card border-neon/20" />
        <Textarea value={lede} onChange={(e) => setLede(e.target.value)} placeholder="Lede — the scene in two or three sentences" className="min-h-[100px] bg-card border-neon/20" />
        <Textarea value={nutGraf} onChange={(e) => setNutGraf(e.target.value)} placeholder="Nut graf — why a stranger should care now" className="min-h-[90px] bg-card border-neon/20" />
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Body — confirmed facts, chronology, what still needs checking" className="min-h-[180px] bg-card border-neon/20" />
        <Textarea value={quotes} onChange={(e) => setQuotes(e.target.value)} placeholder="Voices — attributed quotes only" className="min-h-[90px] bg-card border-neon/20" />
        <Textarea value={kicker} onChange={(e) => setKicker(e.target.value)} placeholder="Kicker — last image or unanswered question" className="min-h-[80px] bg-card border-neon/20" />
        {status && <p className="text-xs text-neon">{status}</p>}
      </div>
    </PageShell>
  );
}
