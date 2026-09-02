import { useGetDashboard, useListStories, useCreateStory, useDeleteStory, useImportStory } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { FileText, Mic, Camera, Plus, Upload, Trash2, Radio, Archive, Download, BookOpen, LogOut } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { signOut } from "@/lib/session";

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
          className="min-h-[200px] bg-black border-neon/20 text-foreground font-mono"
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
  const queryClient = useQueryClient();

  const { data: dashboard, isLoading: dashLoading } = useGetDashboard();
  const { data: stories, isLoading: storiesLoading } = useListStories({ status: "active" });
  const createMutation = useCreateStory();
  const deleteMutation = useDeleteStory();

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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl text-neon text-glow-pulse tracking-wider">FIELDPRESS</h1>
            <p className="text-muted-foreground text-sm mt-1">DESKTOP EDITOR // POCKET NEWSROOM</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => navigate("/guide")}
              title="User guide"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              GUIDE
            </Button>
            <Button
              variant="ghost"
              className="text-muted-foreground"
              onClick={async () => {
                await signOut();
                navigate("/login");
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              SIGN OUT
            </Button>
            <Button variant="ghost" className="text-muted-foreground" onClick={() => navigate("/")}>
              <Download className="w-4 h-4 mr-2" />
              GET APP
            </Button>
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
                  className="bg-black border-neon/20"
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "STORIES", value: dashboard.totalStories, color: "text-neon" },
              { label: "ACTIVE", value: dashboard.activeStories, color: "text-neon" },
              { label: "ARCHIVED", value: dashboard.archivedStories, color: "text-muted-foreground" },
              { label: "ITEMS", value: dashboard.totalItems, color: "text-neon-yellow" },
              { label: "DRAFTS", value: dashboard.totalDrafts, color: "text-neon-red" },
            ].map((stat) => (
              <Card key={stat.label} className="border-neon/20 bg-card">
                <CardContent className="p-4 text-center">
                  <div className={`text-3xl font-bold ${stat.color} text-glow`}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground tracking-widest mt-1">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Separator className="bg-neon/10" />

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-4 h-4 text-neon-red" />
            <h2 className="text-xl text-neon tracking-wider">ACTIVE STORIES</h2>
          </div>

          {storiesLoading ? (
            <div className="text-muted-foreground text-center py-8">LOADING STORIES...</div>
          ) : !stories?.length ? (
            <Card className="border-neon/10 bg-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                NO ACTIVE STORIES. CREATE ONE OR IMPORT FROM MOBILE.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        {story.items.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-start gap-2 text-sm">
                            {itemIcon(item.type)}
                            <span className="text-muted-foreground truncate text-xs">{item.content}</span>
                          </div>
                        ))}
                        {story.items.length > 3 && (
                          <div className="text-xs text-muted-foreground pl-5">
                            +{story.items.length - 3} more...
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
