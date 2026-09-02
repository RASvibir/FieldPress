import { useGetDashboard, useListStories, useCreateStory, useDeleteStory, useImportStory } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Mic, Camera, Plus, Upload, Trash2, Newspaper, Rss, Search, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { fetchMe } from "@/lib/session";
import { PageShell } from "@/components/page-shell";

type Lane = "wall" | "feed";
type Tab = "wall" | "feed" | "search";

type StoryCard = {
  id: string;
  title: string;
  createdAt: string;
  lane?: string;
  items: Array<{ id: string; type: string; content: string }>;
};

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
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          IMPORT
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-terminal border-border">
        <DialogHeader>
          <DialogTitle>Import notes</DialogTitle>
        </DialogHeader>
        <Textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder={"Headline\n- First note\n- Second observation"}
          className="min-h-[200px] bg-card border-border"
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
  const [articleOpen, setArticleOpen] = useState(false);
  const [articleTitle, setArticleTitle] = useState("");
  const [feedOpen, setFeedOpen] = useState(false);
  const [feedTitle, setFeedTitle] = useState("");
  const [feedBody, setFeedBody] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [tab, setTab] = useState<Tab>("wall");
  const [query, setQuery] = useState("");
  const [postError, setPostError] = useState<string | null>(null);
  const [flowBusy, setFlowBusy] = useState(false);
  const [pressyPrompt, setPressyPrompt] = useState("");
  const [pressyBusy, setPressyBusy] = useState(false);
  const [pressyReply, setPressyReply] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: dashboard } = useGetDashboard();
  const { data: stories, isLoading: storiesLoading, isError, error } = useListStories({ status: "active" });
  const createMutation = useCreateStory();
  const deleteMutation = useDeleteStory();

  useEffect(() => {
    fetchMe().then((user) => setSignedIn(Boolean(user)));
  }, []);

  const allStories = (stories || []) as StoryCard[];
  const wallStories = allStories.filter((story) => (story.lane || "wall") !== "feed");
  const feedStories = allStories.filter((story) => story.lane === "feed");
  const needle = query.trim().toLowerCase();
  const searched = useMemo(() => {
    if (!needle) return allStories;
    return allStories.filter((story) => {
      const blob = [story.title, ...story.items.map((item) => item.content)].join(" ").toLowerCase();
      return blob.includes(needle);
    });
  }, [allStories, needle]);

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
  }

  async function askPressyFromBar() {
    const message = pressyPrompt.trim();
    if (!message) return;
    setPressyBusy(true);
    setPostError(null);
    try {
      const res = await fetch("/api/pressy", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPostError(typeof body.error === "string" ? body.error : "Pressy could not answer");
        return;
      }
      setPressyReply(typeof body.reply === "string" ? body.reply : "");
    } finally {
      setPressyBusy(false);
    }
  }

  async function renderPressyFlow() {
    if (!newTitle.trim()) return;
    setPostError(null);
    setFlowBusy(true);
    try {
      const res = await fetch("/api/pressy/flow", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPostError(typeof body.error === "string" ? body.error : "Pressy could not render a flow");
        return;
      }
      setCreateOpen(false);
      setNewTitle("");
      refresh();
      const id = body.story?.id;
      if (id) navigate(`/story/${id}/news`);
    } finally {
      setFlowBusy(false);
    }
  }

  function handleCreate() {
    if (!newTitle.trim()) return;
    createMutation.mutate(
      { data: { id: generateId(), title: newTitle.trim() } },
      {
        onSuccess: (data) => {
          setCreateOpen(false);
          setNewTitle("");
          refresh();
          navigate(`/story/${data.id}`);
        },
      },
    );
  }

  async function createArticle() {
    if (!articleTitle.trim()) return;
    setPostError(null);
    const res = await fetch("/api/stories", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: generateId(), title: articleTitle.trim(), lane: "wall" }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setPostError(typeof body.error === "string" ? body.error : "Could not start Pressie");
      return;
    }
    setArticleOpen(false);
    setArticleTitle("");
    refresh();
    navigate(`/story/${body.id}/news`);
  }

  async function postToFeed() {
    if (!feedTitle.trim()) return;
    setPostError(null);
    if (!signedIn) {
      navigate("/login?next=%2F");
      return;
    }
    const res = await fetch("/api/stories", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: generateId(), title: feedTitle.trim(), lane: "feed", note: feedBody.trim() }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setPostError(typeof body.error === "string" ? body.error : "Could not post");
      return;
    }
    setFeedOpen(false);
    setFeedTitle("");
    setFeedBody("");
    setTab("feed");
    refresh();
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    deleteMutation.mutate({ storyId: id }, { onSuccess: refresh });
  }

  const itemIcon = (type: string) => {
    switch (type) {
      case "audio": return <Mic className="w-3 h-3 text-neon-red" />;
      case "photo": return <Camera className="w-3 h-3 text-neon-yellow" />;
      default: return <FileText className="w-3 h-3 text-neon" />;
    }
  };

  function renderGrid(list: StoryCard[], layout: "wall" | "feed") {
    if (!list.length) {
      return (
        <Card className="border-border bg-card">
          <CardContent className="p-8 text-center text-muted-foreground">
            {layout === "feed" ? "No feed posts yet." : "No headlines yet."}
          </CardContent>
        </Card>
      );
    }
    return (
      <div className={layout === "feed" ? "max-w-xl mx-auto space-y-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
        {list.map((story) => (
          <Card
            key={story.id}
            className="border-border bg-card cursor-pointer hover:border-primary/50 transition-colors group"
            onClick={() => navigate(story.lane === "feed" ? `/story/${story.id}` : `/story/${story.id}`)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg text-neon group-hover:text-glow pr-2 leading-snug">
                  {story.title}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-neon-red shrink-0 opacity-0 group-hover:opacity-100"
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
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                {story.lane === "feed" ? <span>Feed</span> : <span>Wall</span>}
              </div>
              {story.items.slice(0, layout === "feed" ? 4 : 2).map((item) => (
                <div key={item.id} className="flex items-start gap-2 text-sm mb-1">
                  {itemIcon(item.type)}
                  <span className={`text-muted-foreground ${layout === "feed" ? "whitespace-pre-wrap" : "truncate"} text-xs`}>
                    {item.content.startsWith("data:") ? "Photo" : item.content}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const tabs: { id: Tab; label: string; Icon: typeof Newspaper }[] = [
    { id: "wall", label: "Headline wall", Icon: Newspaper },
    { id: "feed", label: "Feed", Icon: Rss },
    { id: "search", label: "Search", Icon: Search },
  ];

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl text-neon text-glow-pulse tracking-wider">FIELDPRESS</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Headlines on the wall. Posts on the feed. Write Pressies from here.
              {" · "}
              <button type="button" className="underline hover:text-neon" onClick={() => navigate("/launch")}>
                Install
              </button>
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <ImportDialog />
            <Dialog open={articleOpen} onOpenChange={setArticleOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Newspaper className="w-4 h-4 mr-2" />
                  NEW PRESSIE
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-terminal border-border">
                <DialogHeader>
                  <DialogTitle>New Pressie</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">Opens the Pressie desk: lede, nut graf, voices, kicker. Pressy is the bot; this is the written piece.</p>
                <Input
                  value={articleTitle}
                  onChange={(e) => setArticleTitle(e.target.value)}
                  placeholder="Headline"
                  className="bg-card border-border"
                  onKeyDown={(e) => e.key === "Enter" && void createArticle()}
                />
                {postError && <p className="text-sm text-neon-red">{postError}</p>}
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">CANCEL</Button>
                  </DialogClose>
                  <Button onClick={() => void createArticle()} disabled={!articleTitle.trim()}>OPEN PRESSIE DESK</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={feedOpen} onOpenChange={setFeedOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Rss className="w-4 h-4 mr-2" />
                  POST TO FEED
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-terminal border-border">
                <DialogHeader>
                  <DialogTitle>Post to feed</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  {signedIn ? "Public post on the FieldPress feed." : "Sign in to post. Anyone can read the feed."}
                </p>
                <Input
                  value={feedTitle}
                  onChange={(e) => setFeedTitle(e.target.value)}
                  placeholder="Headline"
                  className="bg-card border-border"
                />
                <Textarea
                  value={feedBody}
                  onChange={(e) => setFeedBody(e.target.value)}
                  placeholder="What happened — confirmed, short, fit for the desk rating"
                  className="min-h-[140px] bg-card border-border"
                />
                {postError && <p className="text-sm text-neon-red">{postError}</p>}
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">CANCEL</Button>
                  </DialogClose>
                  <Button onClick={() => void postToFeed()} disabled={!feedTitle.trim()}>
                    {signedIn ? "POST" : "SIGN IN TO POST"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  NEW FILE
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-terminal border-border">
                <DialogHeader>
                  <DialogTitle>New field file</DialogTitle>
                </DialogHeader>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Headline"
                  className="bg-card border-border"
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
                {postError && <p className="text-sm text-neon-red">{postError}</p>}
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <DialogClose asChild>
                    <Button variant="ghost">CANCEL</Button>
                  </DialogClose>
                  <Button variant="outline" onClick={() => void renderPressyFlow()} disabled={!newTitle.trim() || flowBusy}>
                    {flowBusy ? "PRESSY…" : "RENDER PRESSY AI FLOW"}
                  </Button>
                  <Button onClick={handleCreate} disabled={!newTitle.trim()}>CREATE</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {dashboard && (
          <p className="text-xs text-muted-foreground tracking-widest">
            {wallStories.length} on the wall · {feedStories.length} in the feed
          </p>
        )}

        <div className="flex gap-2 items-end max-w-2xl">
          <div className="flex-1 space-y-1">
            <label className="text-[10px] tracking-widest text-muted-foreground">PRESSY</label>
            <Input
              value={pressyPrompt}
              onChange={(e) => setPressyPrompt(e.target.value)}
              placeholder="Ask Pressy — headline help, lede, photo prompt…"
              className="bg-card border-border"
              onKeyDown={(e) => e.key === "Enter" && void askPressyFromBar()}
            />
          </div>
          <Button onClick={() => void askPressyFromBar()} disabled={pressyBusy || !pressyPrompt.trim()}>
            <Sparkles className="w-4 h-4 mr-1" />
            {pressyBusy ? "PRESSY…" : "PRESSY"}
          </Button>
        </div>
        {pressyReply && (
          <Card className="border-neon/25 bg-card max-w-2xl">
            <CardContent className="p-4 text-sm whitespace-pre-wrap">{pressyReply}</CardContent>
          </Card>
        )}

        <div className="flex flex-wrap gap-2 border-b border-border pb-2">
          {tabs.map(({ id, label, Icon }) => (
            <Button
              key={id}
              variant={tab === id ? "default" : "ghost"}
              size="sm"
              onClick={() => setTab(id)}
            >
              <Icon className="w-4 h-4 mr-1" />
              {label}
            </Button>
          ))}
        </div>

        {tab === "search" && (
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search headlines and posts"
            className="bg-card border-border max-w-xl"
          />
        )}

        {storiesLoading ? (
          <div className="text-muted-foreground text-center py-8">Loading…</div>
        ) : isError ? (
          <Card className="border-border bg-card">
            <CardContent className="p-8 text-center text-muted-foreground">
              {error instanceof Error ? error.message : "Could not load the wall."}
            </CardContent>
          </Card>
        ) : tab === "wall" ? (
          renderGrid(wallStories, "wall")
        ) : tab === "feed" ? (
          renderGrid(feedStories, "feed")
        ) : (
          renderGrid(searched, searched.some((s) => s.lane === "feed") && !searched.some((s) => s.lane !== "feed") ? "feed" : "wall")
        )}
      </div>
    </PageShell>
  );
}
