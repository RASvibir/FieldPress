import { useGetStory, useGetDraft, useUpdateDraft, useDeleteDraft, useAddStoryItem } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Save, Trash2, Copy, FileText, Mic, Camera,
  Newspaper, MessageSquare, Podcast, Check, Sparkles, Loader2
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { VisualDesk } from "@/components/visual-desk";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DistributeDialog } from "@/components/distribute-dialog";
import { TrendDeskPanel } from "@/components/trend-desk";
import type { DistributePayload } from "@/lib/distribute";
import { loadTrendDesk } from "@/lib/trend-desk";

const MODE_CONFIG = {
  article: {
    label: "PRESSIE",
    icon: Newspaper,
    color: "text-neon",
    placeholder: "Write the Pressie here…\n\nUse the source material in the sidebar as reference. Lede, evidence from field notes, close.\n\nTip: Copy quotes and observations from the source panel on the left.",
    templateHint: "HEADLINE // BYLINE // DATELINE\n\nLEDE - Hook the reader\n\nBODY - Evidence, quotes, context\n\nNUT GRAF - Why this matters\n\nKICKER - Memorable close",
  },
  social: {
    label: "SOCIAL",
    icon: MessageSquare,
    color: "text-neon-yellow",
    placeholder: "Write your social content here...\n\nFormat options:\n- Twitter/X thread (separate posts with ---)\n- Instagram caption\n- TikTok script\n- LinkedIn post\n\nKeep it punchy. Use your field notes for authentic details.",
    templateHint: "THREAD FORMAT:\nPost 1/N: Hook\n---\nPost 2/N: Key detail\n---\nPost 3/N: Evidence\n---\nPost N/N: CTA\n\nCAPTION FORMAT:\nOpening hook\nBody\nHashtags",
  },
  podcast: {
    label: "PODCAST",
    icon: Podcast,
    color: "text-neon-red",
    placeholder: "Write your podcast script here...\n\nInclude:\n- Cold open / teaser\n- Introduction\n- Segment breaks with timestamps\n- Interview questions (if applicable)\n- Show notes / links\n- Outro",
    templateHint: "[00:00] COLD OPEN\nTeaser quote or hook\n\n[00:30] INTRO\nWelcome, context, what we cover today\n\n[02:00] SEGMENT 1\nMain story\n\n[10:00] SEGMENT 2\nAnalysis / interview\n\n[18:00] OUTRO\nKey takeaways, CTA\n\nSHOW NOTES:\n- Link 1\n- Link 2",
  },
} as const;

export default function EditorPage() {
  const params = useParams<{ storyId: string; draftId: string }>();
  const storyId = params.storyId || "";
  const draftId = params.draftId || "";
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: story } = useGetStory(storyId);
  const { data: draft, isLoading } = useGetDraft(storyId, draftId);
  const updateMutation = useUpdateDraft();
  const deleteMutation = useDeleteDraft();
  const addItemMutation = useAddStoryItem();

  const [visualsOpen, setVisualsOpen] = useState(false);
  const [ideasOpen, setIdeasOpen] = useState(false);
  const [ideasBusy, setIdeasBusy] = useState(false);
  const [ideasError, setIdeasError] = useState<string | null>(null);
  const [ideasNotice, setIdeasNotice] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<Array<{ headline?: string; hook?: string; visual?: string }>>([]);

  async function fetchPressyIdeas() {
    setIdeasOpen(true);
    setIdeasBusy(true);
    setIdeasError(null);
    setIdeasNotice(null);

    const queryTitle = latestTitle.current.trim() || story?.title || "Field Report";
    const queryPrompt = latestContent.current.trim().slice(0, 3000);

    try {
      const res = await fetch("/api/pressy/flow", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: queryTitle, prompt: queryPrompt }),
      });

      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        ideas?: Array<{ headline?: string; hook?: string; visual?: string }>;
        notice?: string;
      };

      if (!res.ok) {
        throw new Error(typeof body.error === "string" ? body.error : "Pressy could not generate ideas right now.");
      }

      setIdeas(Array.isArray(body.ideas) ? body.ideas : []);
      if (body.notice) setIdeasNotice(body.notice);
    } catch (err) {
      setIdeasError(err instanceof Error ? err.message : "Could not fetch Pressy ideas.");
    } finally {
      setIdeasBusy(false);
    }
  }

  function applyIdeaHeadline(headline: string) {
    handleChange("title", headline);
    setIdeasOpen(false);
  }

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(true);
  const [copied, setCopied] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestTitle = useRef(title);
  const latestContent = useRef(content);
  latestTitle.current = title;
  latestContent.current = content;
  const trendDesk = loadTrendDesk(storyId);

  useEffect(() => {
    if (draft) {
      setTitle(draft.title);
      setContent(draft.content);
      setSaved(true);
    }
  }, [draft]);

  const save = useCallback(() => {
    updateMutation.mutate(
      { storyId, draftId, data: { title, content } },
      {
        onSuccess: () => {
          setSaved(true);
          queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
        },
      }
    );
  }, [storyId, draftId, title, content, updateMutation, queryClient]);

  function handleChange(field: "title" | "content", value: string) {
    if (field === "title") setTitle(value);
    else setContent(value);
    setSaved(false);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      updateMutation.mutate(
        { storyId, draftId, data: { title: latestTitle.current, content: latestContent.current } },
        { onSuccess: () => setSaved(true) }
      );
    }, 1500);
  }

  function handleDelete() {
    if (!confirm("DELETE THIS DRAFT? This cannot be undone.")) return;
    deleteMutation.mutate(
      { storyId, draftId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
          navigate(`/story/${storyId}`);
        },
      }
    );
  }

  function handleCopy() {
    const text = `${title}\n\n${content}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function insertText(text: string) {
    setContent((prev) => {
      const updated = prev + (prev ? "\n\n" : "") + text;
      latestContent.current = updated;
      return updated;
    });
    setSaved(false);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      updateMutation.mutate(
        { storyId, draftId, data: { title: latestTitle.current, content: latestContent.current } },
        { onSuccess: () => setSaved(true) }
      );
    }, 1500);
  }

  const itemIcon = (type: string) => {
    switch (type) {
      case "audio": return <Mic className="w-3 h-3 text-neon-red" />;
      case "photo": return <Camera className="w-3 h-3 text-neon-yellow" />;
      default: return <FileText className="w-3 h-3 text-neon" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-neon text-glow-pulse text-xl">LOADING EDITOR...</div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-neon-red text-xl mb-4">DRAFT NOT FOUND</div>
          <Button variant="outline" onClick={() => navigate(`/story/${storyId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            BACK TO STORY
          </Button>
        </div>
      </div>
    );
  }

  const mode = (draft.mode in MODE_CONFIG ? draft.mode : "article") as keyof typeof MODE_CONFIG;
  const config = MODE_CONFIG[mode];
  const ModeIcon = config.icon;
  const distributePayload: DistributePayload = {
    storyId,
    storyTitle: story?.title ?? "FieldPress",
    mode,
    title,
    content,
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col pt-[max(3.25rem,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between gap-2 px-4 py-2 pr-16 border-b border-border bg-card overflow-x-auto">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/story/${storyId}`)}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            BACK
          </Button>
          <Separator orientation="vertical" className="h-5 bg-neon/10" />
          <ModeIcon className={`w-5 h-5 ${config.color}`} />
          <Badge variant="outline" className={`${config.color} border-current text-xs`}>
            {config.label}
          </Badge>
          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
            {story?.title}
          </span>
        </div>
        <div className="flex items-center gap-2 pr-14">
          <span className="text-[10px] text-muted-foreground">
            {saved ? "SAVED" : "UNSAVED"}
          </span>
          <Button variant="ghost" size="sm" onClick={save} disabled={saved}>
            <Save className="w-4 h-4 mr-1" />
            SAVE
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-neon/30 text-neon hover:bg-neon/10"
            onClick={() => void fetchPressyIdeas()}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-neon" />
            IDEAS
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-neon-yellow/30 text-neon-yellow hover:bg-neon-yellow/10"
            onClick={() => setVisualsOpen(true)}
          >
            <Camera className="w-3.5 h-3.5 mr-1" />
            VISUALS
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? <Check className="w-4 h-4 mr-1 text-neon" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? "COPIED" : "COPY"}
          </Button>
          <DistributeDialog payload={distributePayload} compact triggerClassName="text-neon" />
          <Button variant="ghost" size="sm" className="text-neon-red" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="max-h-44 md:max-h-none w-full md:w-72 border-b md:border-b-0 md:border-r border-neon/10 bg-card overflow-y-auto p-3 shrink-0">
          <div className="text-xs text-muted-foreground tracking-widest mb-3">SOURCE MATERIAL</div>
          {!story?.items.length ? (
            <div className="text-xs text-muted-foreground text-center py-4">NO SOURCE ITEMS</div>
          ) : (
            <div className="space-y-1.5">
              {story.items.map((item) => (
                <Card
                  key={item.id}
                  className="border-neon/10 bg-background cursor-pointer hover:border-neon/25 transition-colors group"
                  onClick={() => insertText(item.content)}
                  title="Click to insert into editor"
                >
                  <CardContent className="p-2">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 shrink-0">{itemIcon(item.type)}</div>
                      <div className="min-w-0">
                        <Badge variant="secondary" className="text-[8px] uppercase mb-1">{item.type}</Badge>
                        {item.type === "photo" ? (
                          <img src={item.content} alt="" className="w-full h-28 object-cover rounded border border-neon/20 mb-1" />
                        ) : (
                          <p className="text-[11px] text-muted-foreground line-clamp-3 group-hover:text-foreground transition-colors">
                            {item.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <Separator className="bg-neon/10 my-3" />
          {trendDesk && (
            <>
              <TrendDeskPanel desk={trendDesk} compact onInsert={insertText} />
              <Separator className="bg-neon/10 my-3" />
            </>
          )}
          <div className="text-xs text-muted-foreground tracking-widest mb-2">TEMPLATE</div>
          <pre className="text-[10px] text-muted-foreground/60 whitespace-pre-wrap font-mono leading-relaxed">
            {config.templateHint}
          </pre>
        </div>

        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          <Input
            value={title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder={`${config.label} TITLE...`}
            className="bg-transparent border-none text-2xl text-neon text-glow px-0 mb-3 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/30"
          />
          <Textarea
            value={content}
            onChange={(e) => handleChange("content", e.target.value)}
            placeholder={config.placeholder}
            className="flex-1 bg-transparent border-neon/10 text-foreground/90 resize-none text-base leading-relaxed focus-visible:ring-neon/20 placeholder:text-muted-foreground/20 min-h-0"
          />
          <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
            <span>{content.length} characters // {content.split(/\s+/).filter(Boolean).length} words</span>
            <span>Last saved: {draft.updatedAt ? new Date(draft.updatedAt).toLocaleString() : "never"}</span>
          </div>
        </div>
      </div>

      {/* Pressy Ideas Modal */}
      <Dialog open={ideasOpen} onOpenChange={setIdeasOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-neon/20">
          <DialogHeader>
            <DialogTitle className="text-neon tracking-wider text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neon" /> PRESSY HEADLINE & ANGLE CO-PILOT
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Editable suggestions tailored to your draft. Click an action to apply directly to your story.
            </DialogDescription>
          </DialogHeader>

          {ideasBusy && (
            <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-neon" />
              PRESSY IS BRAINSTORMING HEADLINES & ANGLES…
            </div>
          )}

          {ideasError && (
            <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded">
              {ideasError}
            </div>
          )}

          {ideasNotice && (
            <div className="p-2 text-[11px] bg-neon/5 border border-neon/20 text-neon-yellow rounded">
              {ideasNotice}
            </div>
          )}

          {!ideasBusy && !ideasError && ideas.length === 0 && (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No ideas available yet. Try giving your draft a headline or brief summary first.
            </div>
          )}

          {!ideasBusy && ideas.length > 0 && (
            <div className="space-y-3 mt-2">
              {ideas.map((idea, idx) => (
                <Card key={idx} className="border-neon/10 bg-background/50 hover:border-neon/30 transition-colors">
                  <CardContent className="p-3 space-y-2">
                    {idea.headline && (
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-[9px] uppercase tracking-wider text-neon block mb-0.5">Headline Idea</span>
                          <p className="text-sm font-semibold text-foreground leading-snug">{idea.headline}</p>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="shrink-0 text-xs text-neon border border-neon/20 hover:bg-neon/10"
                          onClick={() => applyIdeaHeadline(idea.headline!)}
                        >
                          Use Title
                        </Button>
                      </div>
                    )}

                    {idea.hook && (
                      <div className="flex items-start justify-between gap-3 pt-1 border-t border-border/40">
                        <div className="min-w-0">
                          <span className="text-[9px] uppercase tracking-wider text-muted-foreground block mb-0.5">Lede / Hook</span>
                          <p className="text-xs text-muted-foreground italic leading-relaxed">{idea.hook}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0 text-xs hover:text-neon"
                          onClick={() => {
                            insertText(idea.hook!);
                            setIdeasOpen(false);
                          }}
                        >
                          Insert Hook
                        </Button>
                      </div>
                    )}

                    {idea.visual && (
                      <div className="pt-1 border-t border-border/40 text-[10px] text-muted-foreground/70">
                        <span className="font-mono text-[9px] uppercase text-neon-yellow">Visual Angle: </span>
                        {idea.visual}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Visual Desk Modal */}
      <Dialog open={visualsOpen} onOpenChange={setVisualsOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-card border-neon/20">
          <DialogHeader>
            <DialogTitle className="text-neon tracking-wider text-sm flex items-center gap-2">
              <Camera className="w-4 h-4 text-neon-yellow" /> PRESSIE VISUAL DESK
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Find archival imagery via Wikimedia or build an editable visual brief. Attached media appears directly in your story source material.
            </DialogDescription>
          </DialogHeader>
          <VisualDesk
            storyId={storyId}
            headline={title || story?.title || ""}
            notes={content || story?.items?.filter((i) => i.type === "note").map((i) => i.content).join("\n") || ""}
            signedIn={true}
            onNeedSignIn={() => navigate(`/login?next=${encodeURIComponent(`/story/${storyId}`)}`)}
            onAttachUrl={async (url) => {
              await addItemMutation.mutateAsync({
                storyId,
                data: { type: "photo", content: url },
              });
              queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
              queryClient.invalidateQueries({ queryKey: [`/api/stories/${storyId}`] });
              setVisualsOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
