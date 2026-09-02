import { useGetStory, useListDrafts, useDeleteStory, useAddStoryItem } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText, Mic, Camera, ArrowLeft,
  Newspaper, MessageSquare, Podcast, Trash2
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { DistributeDialog } from "@/components/distribute-dialog";
import type { DistributePayload } from "@/lib/distribute";
import { CaptureBar } from "@/components/capture-bar";
import { VisualDesk } from "@/components/visual-desk";
import { IdeaDesk } from "@/components/idea-desk";
import { HeadlineCache } from "@/components/headline-cache";
import { GenericPostDialog } from "@/components/generic-post";
import { fetchMe } from "@/lib/session";
import { PageShell } from "@/components/page-shell";

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
  const addItemMutation = useAddStoryItem();
  const deleteMutation = useDeleteStory();
  const [signedIn, setSignedIn] = useState(false);
  const [photoQuery, setPhotoQuery] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchMe().then((user) => setSignedIn(Boolean(user)));
  }, []);

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
      <PageShell center>
        <div className="text-neon text-glow-pulse text-xl">Loading story…</div>
      </PageShell>
    );
  }

  if (!story) {
    return (
      <PageShell center>
        <div className="text-center">
          <div className="text-neon-red text-xl mb-4">Story not found</div>
          <Button variant="outline" onClick={() => navigate("/app")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
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
                <Badge variant="outline" className="border-neon/30 text-xs">
                  {(story as { contentRating?: string }).contentRating === "g"
                    ? "G / KIDS"
                    : (story as { contentRating?: string }).contentRating === "mature"
                      ? "18+"
                      : "PG-13"}
                </Badge>
                <span>{story.items.length} items</span>
                <span>Created {new Date(story.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DistributeDialog payload={packagePayload} triggerLabel="SHARE" />
            <Button variant="ghost" className="text-muted-foreground hover:text-neon-red" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-1" />
              DELETE
            </Button>
          </div>
        </div>

        <Separator className="bg-neon/10" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg text-neon tracking-wider mb-3">Field</h2>
            <div className="mb-4">
              <CaptureBar
                signedIn={signedIn}
                busy={addItemMutation.isPending}
                onNeedSignIn={() => navigate(`/login?next=${encodeURIComponent(`/story/${storyId}`)}`)}
                onPhoto={async (dataUrl) => {
                  await addItemMutation.mutateAsync({
                    storyId,
                    data: { type: "photo", content: dataUrl },
                  });
                  queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
                  queryClient.invalidateQueries({ queryKey: [`/api/stories/${storyId}`] });
                }}
              />
            </div>
            <div className="mb-4">
              <VisualDesk
                storyId={storyId}
                headline={story.title}
                notes={story.items.filter((item) => item.type === "note").map((item) => item.content).join("\n")}
                signedIn={signedIn}
                seedQuery={photoQuery}
                onNeedSignIn={() => navigate(`/login?next=${encodeURIComponent(`/story/${storyId}`)}`)}
                onAttachUrl={async (url) => {
                  await addItemMutation.mutateAsync({
                    storyId,
                    data: { type: "photo", content: url },
                  });
                  queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
                  queryClient.invalidateQueries({ queryKey: [`/api/stories/${storyId}`] });
                }}
                onRendered={async (dataUrl) => {
                  await addItemMutation.mutateAsync({
                    storyId,
                    data: { type: "photo", content: dataUrl },
                  });
                  queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
                  queryClient.invalidateQueries({ queryKey: [`/api/stories/${storyId}`] });
                }}
              />
            </div>
            {story.items.length === 0 ? (
              <Card className="border-neon/10">
                <CardContent className="p-6 text-center text-muted-foreground">
                  Add a note, photo, or clip to start this file.
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
                          {item.type === "photo" && (item.content.startsWith("data:image") || item.content.startsWith("http")) ? (
                            <img src={item.content.split("\n").pop()} alt="" className="max-h-48 rounded border border-neon/20" />
                          ) : item.type === "photo" && item.content.includes("http") ? (
                            <img src={item.content.match(/https?:\/\/\S+/)?.[0]} alt="" className="max-h-48 rounded border border-neon/20" />
                          ) : (
                            <p className="text-sm text-foreground/80 whitespace-pre-wrap break-words">{item.content}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg text-neon tracking-wider mb-3">Write</h2>
            <div className="mb-4">
              <IdeaDesk storyId={storyId} onUseQuery={setPhotoQuery} />
            </div>
            <div className="mb-4">
              <HeadlineCache storyId={storyId} />
            </div>
            <div className="mb-4">
              <GenericPostDialog storyId={storyId} />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button
                variant="outline"
                className="border-neon/20 text-neon"
                onClick={() => navigate(`/story/${storyId}/news`)}
              >
                <Newspaper className="w-4 h-4 mr-1" />
                NEWS DESK
              </Button>
              <Button
                variant="outline"
                className="border-neon/20 text-neon-red"
                onClick={() => navigate(`/story/${storyId}/podcast`)}
              >
                <Podcast className="w-4 h-4 mr-1" />
                PODCAST STUDIO
              </Button>
            </div>

            {!drafts?.length ? (
              <Card className="border-neon/10">
                <CardContent className="p-6 text-center text-muted-foreground">
                  Drafts you save show up here.
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
                      onClick={() =>
                        navigate(
                          draft.mode === "article"
                            ? `/story/${storyId}/news`
                            : draft.mode === "podcast"
                              ? `/story/${storyId}/podcast`
                              : `/story/${storyId}/editor/${draft.id}`,
                        )
                      }
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
                            triggerLabel="COPY"
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
    </PageShell>
  );
}
