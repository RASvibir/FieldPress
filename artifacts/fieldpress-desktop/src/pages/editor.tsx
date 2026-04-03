import { useGetStory, useGetDraft, useUpdateDraft, useDeleteDraft } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Save, Trash2, Copy, FileText, Mic, Camera,
  Newspaper, MessageSquare, Podcast, Check
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

const MODE_CONFIG = {
  article: {
    label: "ARTICLE",
    icon: Newspaper,
    color: "text-neon",
    placeholder: "Write your publication-ready article here...\n\nUse the source material in the sidebar as reference. Structure your piece with a compelling lede, supporting evidence from your field notes, and a strong closing.\n\nTip: Copy quotes and observations from the source panel on the left.",
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
  const storyId = params.storyId!;
  const draftId = params.draftId!;
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: story } = useGetStory(storyId);
  const { data: draft, isLoading } = useGetDraft(storyId, draftId);
  const updateMutation = useUpdateDraft();
  const deleteMutation = useDeleteDraft();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(true);
  const [copied, setCopied] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestTitle = useRef(title);
  const latestContent = useRef(content);
  latestTitle.current = title;
  latestContent.current = content;

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

  const mode = draft.mode as keyof typeof MODE_CONFIG;
  const config = MODE_CONFIG[mode];
  const ModeIcon = config.icon;

  return (
    <div className="h-screen bg-background flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-neon/10 bg-card">
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
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">
            {saved ? "SAVED" : "UNSAVED"}
          </span>
          <Button variant="ghost" size="sm" onClick={save} disabled={saved}>
            <Save className="w-4 h-4 mr-1" />
            SAVE
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? <Check className="w-4 h-4 mr-1 text-neon" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? "COPIED" : "COPY"}
          </Button>
          <Button variant="ghost" size="sm" className="text-neon-red" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-72 border-r border-neon/10 bg-card overflow-y-auto p-3 shrink-0">
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
                        <p className="text-[11px] text-muted-foreground line-clamp-3 group-hover:text-foreground transition-colors">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <Separator className="bg-neon/10 my-3" />
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
    </div>
  );
}
