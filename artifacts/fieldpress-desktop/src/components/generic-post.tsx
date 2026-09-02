import { useState } from "react";
import { useCreateDraft } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

export function GenericPostDialog({ storyId }: { storyId: string }) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const createDraft = useCreateDraft();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  function submit() {
    if (!title.trim()) return;
    createDraft.mutate(
      { storyId, data: { mode: "social", title: title.trim(), content: body } },
      {
        onSuccess: (draft) => {
          queryClient.invalidateQueries({ queryKey: [`/api/stories/${storyId}/drafts`] });
          setOpen(false);
          setTitle("");
          setBody("");
          navigate(`/story/${storyId}/editor/${draft.id}`);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full border-neon-yellow/40 text-neon-yellow">
          GENERIC POST WITH TITLE
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-terminal border-neon/30">
        <DialogHeader>
          <DialogTitle className="text-neon">NEW POST</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          Title plus body. Share it when you are ready.
        </p>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          className="bg-card border-neon/20"
        />
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What happened, why it matters, one question still open…"
          className="min-h-[160px] bg-card border-neon/20"
        />
        <DialogFooter>
          <Button onClick={submit} disabled={!title.trim() || createDraft.isPending}>
            {createDraft.isPending ? "SAVING…" : "OPEN POST"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
