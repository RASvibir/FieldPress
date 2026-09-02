import { useEffect, useMemo, useState } from "react";
import { useCreateDraft, useGetStory, useListDrafts, useUpdateDraft } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Save } from "lucide-react";
import { DistributeDialog } from "@/components/distribute-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { PageShell } from "@/components/page-shell";
import { fetchMe } from "@/lib/session";

function joinShow(fields: {
  showTitle: string;
  coldOpen: string;
  rundown: string;
  chapters: string;
  guests: string;
  showNotes: string;
  cta: string;
}) {
  return [
    fields.showTitle && `# ${fields.showTitle}`,
    fields.coldOpen && `## Cold open\n\n${fields.coldOpen}`,
    fields.rundown && `## Rundown\n\n${fields.rundown}`,
    fields.chapters && `## Chapters\n\n${fields.chapters}`,
    fields.guests && `## Guests / tape\n\n${fields.guests}`,
    fields.showNotes && `## Show notes\n\n${fields.showNotes}`,
    fields.cta && `## Close / CTA\n\n${fields.cta}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export default function PodcastDeskPage() {
  const params = useParams<{ storyId: string }>();
  const storyId = params.storyId!;
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { data: story } = useGetStory(storyId);
  const { data: drafts } = useListDrafts(storyId);
  const createDraft = useCreateDraft();
  const updateDraft = useUpdateDraft();
  const episode = drafts?.find((item) => item.mode === "podcast");
  const [rss, setRss] = useState("");

  const [showTitle, setShowTitle] = useState("");
  const [coldOpen, setColdOpen] = useState("");
  const [rundown, setRundown] = useState("");
  const [chapters, setChapters] = useState("[00:00] Cold open\n[01:30] Intro\n[04:00] Scene\n[12:00] Stakes\n[18:00] Outro");
  const [guests, setGuests] = useState("");
  const [showNotes, setShowNotes] = useState("");
  const [cta, setCta] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (story && !showTitle) setShowTitle(story.title);
  }, [story, showTitle]);

  useEffect(() => {
    fetchMe().then((user) => setRss(user?.deskLinks?.podcastRss || user?.deskLinks?.podcastFolder || ""));
  }, []);

  const content = useMemo(
    () => joinShow({ showTitle, coldOpen, rundown, chapters, guests, showNotes, cta }),
    [showTitle, coldOpen, rundown, chapters, guests, showNotes, cta],
  );

  async function save() {
    setStatus(null);
    if (episode) {
      updateDraft.mutate(
        { storyId, draftId: episode.id, data: { title: showTitle || story?.title || "Episode", content } },
        { onSuccess: () => setStatus("Saved — export into your editor or RSS folder when you are ready") },
      );
      return;
    }
    createDraft.mutate(
      { storyId, data: { mode: "podcast", title: showTitle || story?.title || "Episode", content } },
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
                storyTitle: story?.title || showTitle,
                mode: "podcast",
                title: showTitle,
                content,
              }}
              triggerLabel="EXPORT RUNDOWN"
            />
            <Button onClick={() => void save()} disabled={updateDraft.isPending || createDraft.isPending}>
              <Save className="w-4 h-4 mr-1" />
              SAVE
            </Button>
          </div>
        </div>
        <div>
          <h1 className="text-3xl text-neon-red tracking-wider">Podcast studio</h1>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Rundown and show notes. Export when you are ready to cut tape.
          </p>
          {rss && (
            <p className="text-[11px] text-neon mt-2">
              Bookmarked feed/folder: {rss}
            </p>
          )}
        </div>
        <Input value={showTitle} onChange={(e) => setShowTitle(e.target.value)} placeholder="Episode title" className="bg-card border-neon/20 text-xl h-12" />
        <Textarea value={coldOpen} onChange={(e) => setColdOpen(e.target.value)} placeholder="Cold open — 20 seconds of tape or a line the listener cannot skip" className="min-h-[90px] bg-card border-neon/20" />
        <Textarea value={rundown} onChange={(e) => setRundown(e.target.value)} placeholder="Rundown — act 1 / act 2 / act 3 in producer language" className="min-h-[120px] bg-card border-neon/20" />
        <Textarea value={chapters} onChange={(e) => setChapters(e.target.value)} placeholder="Chapter markers" className="min-h-[120px] bg-card border-neon/20 font-mono text-sm" />
        <Textarea value={guests} onChange={(e) => setGuests(e.target.value)} placeholder="Guests, tape IDs, what still needs a release" className="min-h-[90px] bg-card border-neon/20" />
        <Textarea value={showNotes} onChange={(e) => setShowNotes(e.target.value)} placeholder="Show notes and links for the host page" className="min-h-[120px] bg-card border-neon/20" />
        <Textarea value={cta} onChange={(e) => setCta(e.target.value)} placeholder="Outro CTA — subscribe, next episode, where to send tips" className="min-h-[80px] bg-card border-neon/20" />
        {status && <p className="text-xs text-neon">{status}</p>}
      </div>
    </PageShell>
  );
}
