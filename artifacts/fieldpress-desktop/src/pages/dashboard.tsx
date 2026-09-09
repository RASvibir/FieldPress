import { NewsstandCard, NewsstandKioskRack } from '../components/NewsstandKiosk';
import { MobileBottomRail } from '../components/MobileBottomRail';

import { FieldyCommunications } from '../components/FieldyCommunications';
import { BeatBounties } from '../components/BeatBounties';
import { ForkPolicySelector, ForkPolicy } from '../components/PressieOwnershipBadge';
import { ShareDispatchModal } from '../components/ShareDispatchModal';
import { AnonymousFieldyToggle } from '../components/AnonymousFieldyToggle';
import { useGetDashboard, useListStories, useCreateStory, useDeleteStory, useImportStory } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Mic, Camera, Plus, Upload, Trash2, Newspaper, Search, Sparkles, GitFork } from 'lucide-react';
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { fetchMe } from "@/lib/session";
import { PageShell } from "@/components/page-shell";
import { PressyMark } from "@/components/pressy-mark";
import { InkPad } from "@/components/ink-pad";
import { PressieShareMenu } from "@/components/pressie-share-menu";
import { PressieMedia } from "@/components/pressie-media";
import { CaptureBar } from "@/components/capture-bar";
import { extractImageSrc } from "@/lib/item-media";
import { INKS, type InkId, inkLabel } from "@/lib/ink";
import { askPressy } from "@/lib/desk";

type Tab = "wall" | "feed" | "search" | 'wire' | 'bounties' | 'profile';

type StoryCard = {
  id: string;
  title: string;
  createdAt: string;
  status: "draft" | "active" | "embargoed" | "published" | "archived";
  visibility?: "public" | "private";
  ownerId?: string | null;
  lane?: string;
  pulse?: string;
  inkCounts?: Partial<Record<InkId, number>>;
  myInk?: string | null;
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
  const me = { name: 'ras.ip', email: 'ras.ip@fieldpress.studio' };
  const [, navigate] = useLocation();
  const [newTitle, setNewTitle] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [articleOpen, setArticleOpen] = useState(false);
  const [articleTitle, setArticleTitle] = useState("");
  const [feedOpen, setFeedOpen] = useState(false);
  const [feedTitle, setFeedTitle] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  function forkStoryToDesk(targetStory: StoryCard) {
    const authorTag = (targetStory as any).isAnonymous ? "Anonymous Fieldy" : `@${(targetStory as any).author || "Field Reporter"}`;
    const copyText = targetStory.items
      .filter((it) => it.type === "note" || it.type === "text")
      .map((it) => it.content)
      .join("\n\n");
    const photos = targetStory.items
      .map((it) => extractImageSrc(it.content, it.type))
      .filter((src): src is string => Boolean(src));

    setTab("feed");
    setFeedTitle("");
    setFeedBody(`> 🍴 Forked from ${authorTag}'s dispatch on "${targetStory.title}":\n\n${copyText || targetStory.title}\n\n--- Local Fieldy Corroboration & Update:\n`);
    if (photos[0]) setFeedPhoto(photos[0]);
    setSyncedNotice("Forked to your desk! Enter your title to post ✓");
    setTimeout(() => setSyncedNotice(null), 3500);
    setTimeout(() => {
      const el = document.querySelector('input[placeholder*="Headline"]');
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      (el as HTMLInputElement)?.focus();
    }, 100);
  }
  const [syncedNotice, setSyncedNotice] = useState<string | null>(null);

  useEffect(() => {
    const handleSync = (e: any) => {
      const { headline, notes, photo } = e.detail || {};
      setTab("feed");
      if (headline) setFeedTitle(headline);
      if (notes) setFeedBody(notes);
      if (photo) setFeedPhoto(photo);
      setSyncedNotice("Synced to Desk ✓");
      setTimeout(() => setSyncedNotice(null), 3000);
      setTimeout(() => {
        const el = document.querySelector('input[placeholder*="Headline"]');
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        (el as HTMLInputElement)?.focus();
      }, 80);
    };
    window.addEventListener("fieldpress:populate-composer", handleSync);
    return () => window.removeEventListener("fieldpress:populate-composer", handleSync);
  }, []);
  const [feedBody, setFeedBody] = useState("");
  const [feedPulse, setFeedPulse] = useState<InkId>("cool");
  const [signedIn, setSignedIn] = useState(false);
  const [tab, setTab] = useState<Tab>("feed");
  const [query, setQuery] = useState("");
  const [postError, setPostError] = useState<string | null>(null);
  const [pressyNotice, setPressyNotice] = useState<string | null>(null);
  const [flowBusy, setFlowBusy] = useState(false);
  const [pressyPrompt, setPressyPrompt] = useState("");
  const [pressyBusy, setPressyBusy] = useState(false);
  const [pressyReply, setPressyReply] = useState<string | null>(null);
  const [feedPhoto, setFeedPhoto] = useState<string | null>(null);
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
  const pressieRiver = [...feedStories, ...wallStories];
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
      const body = await askPressy(message);
      setPressyReply(body.reply);
    } catch (err) {
      setPostError(err instanceof Error ? err.message : "Pressy could not answer");
    } finally {
      setPressyBusy(false);
    }
  }

  async function renderPressyFlow(targetTitle?: string) {
    const rawTitle = (targetTitle ?? newTitle).trim();
    if (!rawTitle) return;

    setPostError(null);
    setPressyNotice(null);
    setFlowBusy(true);

    try {
      const res = await fetch("/api/pressy/flow", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: rawTitle }),
      });

      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        ideas?: Array<{ headline?: string; hook?: string; visual?: string }>;
        notice?: string;
      };

      if (!res.ok) {
        setPostError(
          typeof body.error === "string"
            ? body.error
            : "Pressy could not generate ideas. Please try again.",
        );
        return;
      }

      const firstIdea = body.ideas?.[0];
      const suggestedTitle = firstIdea?.headline?.trim();

      if (suggestedTitle) {
        if (targetTitle !== undefined) {
          setFeedTitle(suggestedTitle);
        } else {
          setNewTitle(suggestedTitle);
        }
      }

      const notice = firstIdea?.hook
        ? `Pressy suggestion: ${firstIdea.hook}`
        : body.notice || "Pressy generated suggestions. Review headline and post.";
      setPressyNotice(notice);
    } catch (error) {
      setPostError(
        error instanceof Error
          ? error.message
          : "Pressy could not generate ideas. Please try again.",
      );
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
      body: JSON.stringify({ id: generateId(), title: articleTitle.trim(), lane: "feed" }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setPostError(typeof body.error === "string" ? body.error : "Could not start Pressie");
      return;
    }
    setArticleOpen(false);
    setArticleTitle("");
    refresh();
    setTab("feed");
    navigate(`/story/${body.id}/news`);
  }

  async function stampInk(storyId: string, ink: InkId) {
    if (!signedIn) {
      navigate("/login?next=%2F");
      return;
    }
    const res = await fetch(`/api/stories/${storyId}/ink`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ink }),
    });
    if (res.ok) refresh();
  }

  async function postToFeed() {
    if (!feedTitle.trim()) return;
    setPostError(null);
    setPressyNotice(null);
    if (!signedIn) {
      navigate("/login?next=%2F");
      return;
    }
    const res = await fetch("/api/stories", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: generateId(),
        title: feedTitle.trim(),
        lane: "feed",
        note: feedBody.trim(),
        pulse: feedPulse,
        photo: feedPhoto || undefined,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setPostError(typeof body.error === "string" ? body.error : "Could not post Pressie");
      return;
    }
    setFeedOpen(false);
    setFeedTitle("");
    setFeedBody("");
    setFeedPulse("cool");
    setFeedPhoto(null);
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
            {layout === "feed" ? "No Pressies yet. Post one — that’s the feed." : "No headlines yet."}
          </CardContent>
        </Card>
      );
    }
    return (
      <div className={layout === "feed" ? "max-w-5xl mx-auto space-y-6" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
        {list.map((story) => {
          const photos = story.items
            .map((item) => extractImageSrc(item.content, item.type))
            .filter((src): src is string => Boolean(src));
          const copy = story.items.filter((item) => !extractImageSrc(item.content, item.type));
          return layout === "feed" ? (
            <NewsstandCard
              key={story.id}
              story={story as any}
              onFork={(s) => forkStoryToDesk(s)}
              onStampInk={(id, ink) => void stampInk(id, ink as any)}
            />
          ) : (
            <Card
              key={story.id}
              className="border-border bg-card cursor-pointer hover:border-primary/50 transition-colors group overflow-hidden"
              onClick={() => navigate(`/story/${story.id}`)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-neon group-hover:text-glow leading-snug">
                  {story.title}
                </CardTitle>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span>{story.createdAt ? new Date(story.createdAt).toLocaleDateString() : 'Today'}</span>
                  <span>•</span>
                  <span>@{(story as any).author || 'Fieldy'}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-border">
                  <span>⚡ {(story.inkCounts as any)?.['signal'] || 0} Signals</span>
                  <span className="text-neon font-mono text-[11px]">View Dispatch →</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  const tabs: { id: Tab; label: string; Icon: typeof Newspaper }[] = [
    { id: "feed", label: "🗞️ The Newsstand", Icon: Newspaper },
    { id: "wall", label: "Headline wall", Icon: Newspaper },
    { id: "search", label: "Search", Icon: Search },
  ];

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* LOCKED STICKY HEADER BAR (Anti-collision, responsive) */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/40 py-2.5 -mx-4 px-4 sm:-mx-6 sm:px-6 mb-4 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
          <div className="min-w-0">
            <h1 className="text-3xl sm:text-4xl text-neon text-glow-pulse tracking-wider truncate">FIELDPRESS</h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 truncate">
              The Pressie feed is the desk · Headlines on the wall ·{" "}
              <button type="button" className="underline hover:text-neon" onClick={() => navigate("/launch")}>
                Install
              </button>
              <button
                type="button"
                onClick={() => setTab('wire')}
                className={`px-3 py-1.5 text-xs font-bold rounded ${
                  tab === 'wire' ? 'bg-cyan-900/60 text-cyan-200 border border-cyan-700' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                📡 Fieldy Wire
              </button>
              <button
                type="button"
                onClick={() => setTab('bounties')}
                className={`px-3 py-1.5 text-xs font-bold rounded ${
                  tab === 'bounties' ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-700' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                🎯 Beat Bounties
              </button>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
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
                  <PressyMark className="h-4 w-4 mr-2" />POST PRESSIE TO NEWSSTAND</Button>
              </DialogTrigger>
              <DialogContent className="bg-terminal border-border">
                <DialogHeader>
                  <DialogTitle>Share a Pressie</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  {signedIn
                    ? "A Pressie is a share post with copy and a photo. React how it hits — Cool, Love, LOL, Whoa, Iconic, Same, or Mad."
                    : "Sign in to post a Pressie. Anyone can read them."}
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
                <div className="space-y-2">
                  <p className="text-[10px] tracking-widest text-muted-foreground">PHOTO</p>
                  {feedPhoto ? (
                    <div className="space-y-2">
                      <img src={feedPhoto} alt="" className="w-full max-h-48 object-cover rounded border border-border" />
                      <Button type="button" variant="ghost" size="sm" onClick={() => setFeedPhoto(null)}>
                        REMOVE PHOTO
                      </Button>
                    </div>
                  ) : (
                    <CaptureBar
                      signedIn={signedIn}
                      onNeedSignIn={() => navigate("/login?next=%2F")}
                      onPhoto={(dataUrl) => setFeedPhoto(dataUrl)}
                    />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] tracking-widest text-muted-foreground">HOW IT HITS</p>
                  <InkPad value={feedPulse} onPick={setFeedPulse} mode="picker" />
                  <p className="text-xs text-muted-foreground">
                    {INKS.find((ink) => ink.id === feedPulse)?.hint}
                  </p>
                </div>
                {postError && <p className="text-sm text-neon-red">{postError}</p>}
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">CANCEL</Button>
                  </DialogClose>
                  <Button onClick={() => void postToFeed()} disabled={!feedTitle.trim()}>
                    {signedIn ? "POST PRESSIE TO NEWSSTAND" : "SIGN IN TO POST"}
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
            {feedStories.length} Pressies · {wallStories.length} on the wall
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
        ) : tab === "feed" ? (
          <div className="space-y-6">
            {/* Newsstand Kiosk Desktop Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-6">
              <div className="lg:col-span-8 space-y-6">
            <Card className="border-border bg-card shadow-sm">
              <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <PressyMark className="h-5 w-5 text-signal-yellow" />
                    <span className="font-mono text-xs font-semibold tracking-wider uppercase text-foreground">
                      Dispatch Desk • Quick Pressie
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {signedIn ? "Connected" : "Guest (Sign in to post)"}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={feedTitle}
                      onChange={(e) => setFeedTitle(e.target.value)}
                      placeholder="Headline or breaking hook…"
                      className="bg-background border-border flex-1 font-medium"
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && void postToFeed()}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void renderPressyFlow(feedTitle)}
                      disabled={!feedTitle.trim() || flowBusy}
                      className="shrink-0 gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-signal-yellow" />
                      {flowBusy ? "POLISHING…" : "POLISH"}
                    </Button>
                  </div>

                  <Textarea
                    value={feedBody}
                    onChange={(e) => setFeedBody(e.target.value)}
                    placeholder="Field notes, verified details, voices from the ground…"
                    className="min-h-[85px] bg-background border-border text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <p className="text-[10px] tracking-widest text-muted-foreground uppercase font-mono">
                      Visual Evidence
                    </p>
                    {feedPhoto ? (
                      <div className="relative rounded border border-border overflow-hidden bg-background">
                        <img src={feedPhoto} alt="Dispatch attachment" className="w-full max-h-36 object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-7 px-2 text-xs"
                          onClick={() => setFeedPhoto(null)}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <CaptureBar
                        signedIn={signedIn}
                        onNeedSignIn={() => navigate("/login?next=%2F")}
                        onPhoto={(dataUrl) => setFeedPhoto(dataUrl)}
                      />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setIsAnonymous((v) => !v)}
                      className={
                        isAnonymous
                          ? "h-6 text-[10px] border-signal-yellow text-signal-yellow bg-signal-yellow/10 font-mono gap-1"
                          : "h-6 text-[10px] border-border text-muted-foreground hover:text-foreground font-mono gap-1"
                      }
                    >
                      {isAnonymous ? "🎭 Filing as: Anonymous Fieldy" : `🟢 Filing as: @${me?.name || me?.email?.split("@")[0] || "Fieldy"}`}
                    </Button>
                      <p className="text-[10px] tracking-widest text-muted-foreground uppercase font-mono">
                        How It Hits (Pulse)
                      </p>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {INKS.find((ink) => ink.id === feedPulse)?.hint}
                      </span>
                    </div>
                    <InkPad value={feedPulse} onPick={setFeedPulse} mode="picker" />
                  </div>
                </div>

                {pressyNotice && (
                  <div className="p-2.5 rounded bg-signal-yellow/10 border border-signal-yellow/30 text-xs text-signal-yellow font-mono">
                    {pressyNotice}
                  </div>
                )}
                {postError && (
                  <div className="p-2.5 rounded bg-neon-red/10 border border-neon-red/30 text-xs text-neon-red font-mono">
                    {postError}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <p className="text-[11px] text-muted-foreground">
                    Posts instantly to the live river.
                  </p>
                  <Button
                    onClick={() => void postToFeed()}
                    disabled={!feedTitle.trim()}
                    className="font-semibold tracking-wide"
                  >
                    <PressyMark className="h-4 w-4 mr-1.5" />
                    {signedIn ? "POST PRESSIE TO NEWSSTAND" : "SIGN IN TO POST"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {renderGrid(pressieRiver, "feed")}
          </div>
                      </div>
              
            </div>
          ) : tab === "wall" ? (
          renderGrid(wallStories, "wall")
        ) : (
          renderGrid(searched, "feed")
        )}
      
      {/* Mobile Bottom Navigation Rail */}
      <MobileBottomRail currentTab={tab} onSelectTab={setTab} />
</div>
    </PageShell>
  );
}
