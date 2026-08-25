import { useGetStory, useListDrafts, useCreateDraft, useDeleteStory } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText, Mic, Camera, ArrowLeft, Plus,
  Newspaper, MessageSquare, Podcast, Trash2, Cpu
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { DistributeDialog } from "@/components/distribute-dialog";
import { TrendDeskPanel } from "@/components/trend-desk";
import type { DistributePayload } from "@/lib/distribute";
import { deskFromProducePayload, loadTrendDesk, saveTrendDesk, type TrendDesk } from "@/lib/trend-desk";

const MODE_CONFIG = {
  article: { label: "ARTICLE", icon: Newspaper, color: "text-neon" },
  social: { label: "SOCIAL", icon: MessageSquare, color: "text-neon-yellow" },
  podcast: { label: "PODCAST", icon: Podcast, color: "text-neon-red" },
} as const;

export default function StoryDetailPage() {
  const params = useParams<{ storyId: string }>();
  const storyId = params.storyId!;
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: story, isLoading } = useGetStory(storyId);
  const { data: drafts } = useListDrafts(storyId);
  const createDraftMutation = useCreateDraft();
  const deleteMutation = useDeleteStory();
  const [producing, setProducing] = useState(false);
  const [produceError, setProduceError] = useState<string | null>(null);
  const [trendDesk, setTrendDesk] = useState<TrendDesk | null>(() => loadTrendDesk(storyId));

  useEffect(() => {
    setTrendDesk(loadTrendDesk(storyId));
  }, [storyId]);

  async function handleProduce() {
    setProduceError(null);
    setProducing(true);
    try {
      const response = await fetch(`/api/stories/${storyId}/produce`, { method: "POST" });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        summary?: string;
        outline?: string[];
        caption?: string;
        whyNow?: string;
        audience?: string;
        trends?: TrendDesk["trends"];
        trendQuery?: string;
        headlineCount?: number;
      } | null;
      if (!response.ok) {
        throw new Error(payload?.error ?? `Producer failed (${response.status})`);
      }
      if (payload) {
        const desk = deskFromProducePayload(payload);
        setTrendDesk(desk);
        saveTrendDesk(storyId, desk);
      }
      await queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      await queryClient.invalidateQueries({ queryKey: [`/api/stories/${storyId}/drafts`] });
    } catch (err) {
      setProduceError(err instanceof Error ? err.message : "Producer failed");
    } finally {
      setProducing(false);
    }
  }

  function handleNewDraft(mode: "article" | "social" | "podcast") {
    createDraftMutation.mutate(
      { storyId, data: { mode, title: "", content: "" } },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
          navigate(`/story/${storyId}/editor/${data.id}`);
        },
      }
    );
  }

  const packagePayload = useMemo<DistributePayload | null>(() => {
    if (!story) return null;
    const sections = [
      `# ${story.title}`,
      "",
      "## Source notes",
      story.items.length
        ? story.items.map((item) => `- (${item.type}) ${item.content}`).join("\n")
        : "_No field notes._",
    ];
    for (const draft of drafts ?? []) {
      sections.push("", `## ${draft.mode.toUpperCase()}: ${draft.title || "Untitled"}`, "", draft.content || "_Empty draft._");
    }
    return {
      storyTitle: story.title,
      mode: "package",
      title: story.title,
      content: sections.join("\n"),
    };
  }, [story, drafts]);

  function handleDelete() {
    if (!confirm("DELETE THIS STORY AND ALL DRAFTS? This cannot be undone.")) return;
    deleteMutation.mutate(
      { storyId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
          queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
          navigate("/app");
        },
      }
    );
  }

  const itemIcon = (type: string) => {
    switch (type) {
      case "audio": return <Mic className="w-4 h-4 text-neon-red" />;
      case "photo": return <Camera className="w-4 h-4 text-neon-yellow" />;
      default: return <FileText className="w-4 h-4 text-neon" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-neon text-glow-pulse text-xl">LOADING STORY...</div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-neon-red text-xl mb-4">STORY NOT FOUND</div>
          <Button variant="outline" onClick={() => navigate("/app")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            BACK TO DASHBOARD
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/app")}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              BACK
            </Button>
            <div>
              <h1 className="text-3xl text-neon text-glow tracking-wider">{story.title}</h1>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <Badge variant="outline" className="border-neon/30 text-neon text-xs">
                  {story.status.toUpperCase()}
                </Badge>
                <span>{story.items.length} items</span>
                <span>Created {new Date(story.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DistributeDialog payload={packagePayload} triggerLabel="DISTRIBUTE STORY" />
            <Button variant="ghost" className="text-muted-foreground hover:text-neon-red" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-1" />
              DELETE
            </Button>
          </div>
        </div>

        <Separator className="bg-neon/10" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg text-neon tracking-wider mb-3">SOURCE MATERIAL</h2>
            {story.items.length === 0 ? (
              <Card className="border-neon/10">
                <CardContent className="p-6 text-center text-muted-foreground">
                  NO ITEMS. IMPORT FROM MOBILE TO ADD NOTES, AUDIO, AND PHOTOS.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {story.items.map((item) => (
                  <Card key={item.id} className="border-neon/10 bg-card">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{itemIcon(item.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-[10px] uppercase">{item.type}</Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(item.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/80 whitespace-pre-wrap break-words">{item.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg text-neon tracking-wider mb-3">PRODUCTION OUTPUTS</h2>
            <Button
              variant="outline"
              className="w-full mb-3 border-cyan-400/30 text-cyan-300 hover:border-cyan-300/60"
              onClick={handleProduce}
              disabled={producing}
            >
              <Cpu className="w-4 h-4 mr-2" />
              {producing ? "SCANNING TRENDS + PRODUCING..." : "AI PRODUCE"}
            </Button>
            <p className="text-[10px] text-muted-foreground mb-3 leading-relaxed">
              Matches field notes to relatable, national, and global public conversation before drafting article, social, and podcast.
            </p>
            {produceError && (
              <p className="text-xs text-neon-red mb-3">{produceError}</p>
            )}
            {trendDesk && (
              <div className="mb-4">
                <TrendDeskPanel desk={trendDesk} />
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {(["article", "social", "podcast"] as const).map((mode) => {
                const config = MODE_CONFIG[mode];
                const Icon = config.icon;
                return (
                  <Button
                    key={mode}
                    variant="outline"
                    className={`border-neon/20 hover:border-neon/40 ${config.color}`}
                    onClick={() => handleNewDraft(mode)}
                    disabled={createDraftMutation.isPending}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    <Plus className="w-3 h-3 mr-1" />
                    {config.label}
                  </Button>
                );
              })}
            </div>

            {!drafts?.length ? (
              <Card className="border-neon/10">
                <CardContent className="p-6 text-center text-muted-foreground">
                  NO DRAFTS YET. CREATE AN ARTICLE, SOCIAL POST, OR PODCAST SCRIPT.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {drafts.map((draft) => {
                  const config = MODE_CONFIG[draft.mode as keyof typeof MODE_CONFIG];
                  const Icon = config.icon;
                  return (
                    <Card
                      key={draft.id}
                      className="border-neon/10 bg-card cursor-pointer hover:border-neon/30 transition-colors"
                      onClick={() => navigate(`/story/${storyId}/editor/${draft.id}`)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${config.color}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-[10px]">{config.label}</Badge>
                              <span className="text-sm truncate">
                                {draft.title || "Untitled Draft"}
                              </span>
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              Updated {new Date(draft.updatedAt).toLocaleString()}
                            </div>
                          </div>
                          <DistributeDialog
                            compact
                            triggerLabel="SEND"
                            payload={{
                              storyTitle: story.title,
                              mode: draft.mode as "article" | "social" | "podcast",
                              title: draft.title,
                              content: draft.content,
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
