import { useGetDashboard, useListStories, useCreateStory, useDeleteStory, useImportStory } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { FileText, Mic, Camera, Plus, Upload, Trash2, Radio } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { fetchMe } from "@/lib/session";
import { DistributeDialog } from "@/components/distribute-dialog";
import { PageShell } from "@/components/page-shell";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function ImportDialog() {
  const [open, setOpen] = useState(false);
  const [rawText, setRawText] = useState("");
  const queryClient = useQueryClient();
  const importMutation = useImportStory();

  function handleImport() {
    const lines = rawText.trim().split("\n").filter(Boolean);
    if (lines.length === 0) return;

    const title = lines[0].replace(/^#\s*/, "").replace(/^DISPATCH:\s*/i, "").trim() || "Imported Story";
    const items = lines.slice(1).map((line) => ({
      type: "note" as const,
      content: line.replace(/^[-*]\s*/, "").trim(),
    })).filter((i) => i.content.length > 0);

    importMutation.mutate(
      { data: { title, items } },
      {
        onSuccess: () => {
          setOpen(false);
          setRawText("");
          queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
          queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-neon-yellow text-neon-yellow hover:bg-neon-yellow/10">
          <Upload className="w-4 h-4 mr-2" />
          IMPORT
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-terminal border-neon/30">
        <DialogHeader>
          <DialogTitle className="text-neon text-glow">IMPORT FROM MOBILE</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">
          Paste the dispatch text from your mobile app. The first line becomes the title, the rest become notes.
        </p>
        <Textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder={"DISPATCH: Story Title\n- First note from the field\n- Second observation\n- Source quote here"}
          className="min-h-[200px] bg-card border-neon/20 text-foreground font-mono"
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">CANCEL</Button>
          </DialogClose>
          <Button onClick={handleImport} disabled={!rawText.trim() || importMutation.isPending}>
            {importMutation.isPending ? "IMPORTING..." : "IMPORT"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function DashboardPage() {
  const [, navigate] = useLocation();
  const [newTitle, setNewTitle] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const queryClient = useQueryClient();

  const { data: dashboard } = useGetDashboard();
  const { data: stories, isLoading: storiesLoading } = useListStories({ status: "active" });
  const createMutation = useCreateStory();
  const deleteMutation = useDeleteStory();

  useEffect(() => {
    fetchMe().then((user) => setSignedIn(Boolean(user)));
  }, []);

  function handleCreate() {
    if (!newTitle.trim()) return;
    createMutation.mutate(
      { data: { id: generateId(), title: newTitle.trim() } },
      {
        onSuccess: (data) => {
          setCreateOpen(false);
          setNewTitle("");
          queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
          queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
          navigate(`/story/${data.id}`);
        },
      }
    );
  }

  function handleDelete(id: string) {
    if (!confirm("DELETE THIS STORY? This action is permanent.")) return;
    deleteMutation.mutate(
      { storyId: id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
          queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
        },
      }
    );
  }

  const itemIcon = (type: string) => {
    switch (type) {
      case "audio": return <Mic className="w-3 h-3 text-neon-red" />;
      case "photo": return <Camera className="w-3 h-3 text-neon-yellow" />;
      default: return <FileText className="w-3 h-3 text-neon" />;
    }
  };

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl text-neon text-glow-pulse tracking-wider">FIELDPRESS</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {signedIn ? "Signed-in desk" : "Public desk · sign in from Settings to capture photos"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <ImportDialog />
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  NEW STORY
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-terminal border-neon/30">
                <DialogHeader>
                  <DialogTitle className="text-neon text-glow">NEW STORY</DialogTitle>
                </DialogHeader>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Story headline..."
                  className="bg-card border-neon/20"
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">CANCEL</Button>
                  </DialogClose>
                  <Button onClick={handleCreate} disabled={!newTitle.trim()}>CREATE</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {dashboard && (
          <p className="text-xs text-muted-foreground tracking-widest">
            {dashboard.activeStories} active · {dashboard.totalItems} items · {dashboard.totalDrafts} drafts
          </p>
        )}

        <Separator className="bg-border" />

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-4 h-4 text-neon-red" />
            <h2 className="text-xl text-neon tracking-wider">{signedIn ? "Feed" : "Stories"}</h2>
          </div>

          {storiesLoading ? (
            <div className="text-muted-foreground text-center py-8">LOADING STORIES...</div>
          ) : !stories?.length ? (
            <Card className="border-neon/10 bg-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                NO STORIES YET. START ONE OR IMPORT NOTES.
              </CardContent>
            </Card>
          ) : (
            <div className={signedIn ? "max-w-xl mx-auto space-y-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
              {stories.map((story) => (
                <Card
                  key={story.id}
                  className="border-neon/15 bg-card cursor-pointer hover:border-neon/40 transition-colors group"
                  onClick={() => navigate(`/story/${story.id}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg text-neon group-hover:text-glow truncate pr-2">
                        {story.title}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-neon-red shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(story.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span>{story.items.length} item{story.items.length !== 1 ? "s" : ""}</span>
                      <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                    </div>
                    {story.items.length > 0 && (
                      <div className="space-y-1">
                        {story.items.slice(0, signedIn ? 2 : 3).map((item) => (
                          <div key={item.id} className="flex items-start gap-2 text-sm">
                            {itemIcon(item.type)}
                            <span className="text-muted-foreground truncate text-xs">{item.content}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {signedIn && (
                      <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                        <DistributeDialog
                          compact
                          triggerLabel="SHARE"
                          payload={{
                            storyTitle: story.title,
                            mode: "package",
                            title: story.title,
                            content: story.items
                              .filter((item) => item.type === "note")
                              .map((item) => item.content)
                              .join("\n") || story.title,
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
