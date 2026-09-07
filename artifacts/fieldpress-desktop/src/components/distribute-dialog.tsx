import { useEffect, useState } from "react";
import { Share2, Download, HardDrive, Copy, Check, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  COMPOSE_TARGETS,
  type ComposeTargetId,
  type DistributePayload,
  buildMarkdown,
  buildPlainText,
  canNativeShare,
  canSaveToDisk,
  composeUrl,
  copyText,
  downloadText,
  filenameFor,
  nativeShare,
  saveToDisk,
} from "@/lib/distribute";
import { fetchMe } from "@/lib/session";

type DistributeDialogProps = {
  payload: DistributePayload | null;
  triggerLabel?: string;
  triggerClassName?: string;
  compact?: boolean;
};

export function DistributeDialog({
  payload,
  triggerLabel = "DISTRIBUTE",
  triggerClassName,
  compact = false,
}: DistributeDialogProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Record<string, string>>({});
  const [chosenCover, setChosenCover] = useState<string | null>(null);

  const activeCover = chosenCover || (payload?.photos && payload.photos.length > 0 ? payload.photos[0] : null);
  const cardTitle = payload?.title?.trim() || payload?.storyTitle?.trim() || "Untitled Pressie";
  const cardExcerpt = payload?.content
    ? payload.content.replace(/^[#*>\s-]+/gm, "").replace(/\n+/g, " ").trim().slice(0, 150)
    : "Verified dispatch from the field on FieldPress.";

  async function selectCover(url: string) {
    setChosenCover(url);
    if (!payload?.storyId) return;
    try {
      await fetch(`/api/stories/${payload.storyId}/cover`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ coverImage: url }),
      });
      setStatus("Social cover photo set!");
      setTimeout(() => setStatus(null), 1800);
    } catch {
      setStatus("Could not set cover photo");
    }
  }

  useEffect(() => {
    if (!open) return;
    fetchMe().then((user) => setBookmarks(user?.deskLinks || {}));
  }, [open]);

  async function run(label: string, action: () => Promise<void> | void) {
    if (!payload) return;
    setStatus(null);
    try {
      await action();
      setStatus(label);
      setTimeout(() => setStatus(null), 1800);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatus(error instanceof Error ? error.message : "Share failed");
    }
  }

  function openCompose(target: ComposeTargetId) {
    if (!payload) return;
    const url = composeUrl(target, payload);
    if (target === "facebook" || target === "instagram") {
      void copyText(buildPlainText(payload));
      setStatus(`Caption copied — paste into ${target === "instagram" ? "Instagram" : "Facebook"} if the share box is empty`);
    }
    if (target === "reddit") {
      setStatus("Reddit opens a text post with your title and body. You still hit Post.");
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={compact ? "ghost" : "outline"}
          size="sm"
          className={triggerClassName ?? "border-neon/30 text-neon"}
          disabled={!payload || !(payload.title.trim() || payload.content.trim())}
          onClick={(event) => event.stopPropagation()}
        >
          <Share2 className="w-4 h-4 mr-1" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-terminal border-neon/30 max-w-lg" onClick={(event) => event.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="tracking-widest">DISTRIBUTE</DialogTitle>
          <DialogDescription>
            Share this Pressie. The Pressy mark travels with the link so people can tell it came from FieldPress.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {payload?.photos && payload.photos.length > 0 && (
            <div>
              <div className="text-[10px] tracking-widest text-muted-foreground mb-2 flex items-center justify-between">
                <span>SOCIAL PREVIEW COVER PHOTO</span>
                <span className="text-[9px] text-neon">Click to choose image</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {payload.photos.map((photo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => void selectCover(photo)}
                    className={`relative shrink-0 rounded overflow-hidden border-2 transition-all ${
                      chosenCover === photo
                        ? "border-neon ring-2 ring-neon/40 scale-105"
                        : "border-border/60 hover:border-border opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={photo} alt="" className="w-16 h-16 object-cover" />
                    {chosenCover === photo && (
                      <span className="absolute bottom-0 inset-x-0 bg-neon text-black text-[8px] font-bold text-center py-0.5">
                        COVER
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* WYSIWYG Social Card Preview */}
          <div className="space-y-1.5">
            <div className="text-[10px] tracking-widest text-muted-foreground flex items-center justify-between">
              <span>LIVE SOCIAL CARD PREVIEW</span>
              <span className="text-[9px] text-neon font-mono">X • Facebook • Threads</span>
            </div>

            <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-sm">
              {activeCover ? (
                <div className="relative w-full aspect-[1.91/1] bg-black/40 overflow-hidden border-b border-border/40">
                  <img
                    src={activeCover}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[9px] font-mono text-signal-yellow border border-signal-yellow/30 font-bold">
                    PRESSIE
                  </div>
                </div>
              ) : (
                <div className="w-full py-6 flex flex-col items-center justify-center bg-muted/20 border-b border-border/40 text-muted-foreground text-xs font-mono">
                  <span>No cover photo selected</span>
                  <span className="text-[10px] text-muted-foreground/60 mt-0.5">Transparent pressie mark will be used</span>
                </div>
              )}

              <div className="p-3 space-y-1 bg-background/50">
                <p className="text-[10px] tracking-wider uppercase text-muted-foreground font-mono">
                  fieldpress.studio
                </p>
                <h4 className="text-sm font-semibold line-clamp-2 text-foreground leading-snug">
                  {cardTitle}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {cardExcerpt}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="text-[10px] tracking-widest text-muted-foreground mb-2">POST</div>
            <div className="grid grid-cols-2 gap-2">
              {canNativeShare() && (
                <Button
                  variant="outline"
                  className="justify-start border-neon/30 text-neon"
                  onClick={() => run("Opened share sheet", () => nativeShare(payload!))}
                >
                  <Send className="w-4 h-4 mr-2" />
                  SHARE SHEET
                </Button>
              )}
              {COMPOSE_TARGETS.map((target) => (
                <Button
                  key={target.id}
                  variant="outline"
                  className={`justify-start border-neon/20 ${target.color}`}
                  onClick={() => openCompose(target.id)}
                >
                  {target.label.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {Object.entries(bookmarks).some(([, value]) => value.trim()) && (
            <div>
              <div className="text-[10px] tracking-widest text-muted-foreground mb-2">YOUR BOOKMARKS</div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(bookmarks)
                  .filter(([, value]) => value.trim())
                  .map(([key, value]) => (
                    <Button
                      key={key}
                      variant="outline"
                      className="justify-start border-neon/20"
                      onClick={() => window.open(value.startsWith("http") ? value : `https://${value}`, "_blank", "noopener,noreferrer")}
                    >
                      {key.toUpperCase()}
                    </Button>
                  ))}
              </div>
            </div>
          )}

          <div>
            <div className="text-[10px] tracking-widest text-muted-foreground mb-2">SAVE TO DRIVE / DISK</div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="justify-start border-neon/20"
                onClick={() =>
                  run("Copied", async () => {
                    await copyText(buildPlainText(payload!));
                  })
                }
              >
                {status === "Copied" ? <Check className="w-4 h-4 mr-2 text-neon" /> : <Copy className="w-4 h-4 mr-2" />}
                COPY TEXT
              </Button>
              <Button
                variant="outline"
                className="justify-start border-neon/20"
                onClick={() =>
                  run("Downloaded markdown", () => {
                    downloadText(filenameFor(payload!, "md"), buildMarkdown(payload!), "text/markdown");
                  })
                }
              >
                <Download className="w-4 h-4 mr-2" />
                MARKDOWN
              </Button>
              <Button
                variant="outline"
                className="justify-start border-neon/20"
                onClick={() =>
                  run("Downloaded text", () => {
                    downloadText(filenameFor(payload!, "txt"), buildPlainText(payload!), "text/plain");
                  })
                }
              >
                <Download className="w-4 h-4 mr-2" />
                TEXT FILE
              </Button>
              <Button
                variant="outline"
                className="justify-start border-neon/20"
                onClick={() =>
                  run(canSaveToDisk() ? "Saved to disk" : "Downloaded markdown", async () => {
                    await saveToDisk(payload!);
                  })
                }
              >
                <HardDrive className="w-4 h-4 mr-2" />
                {canSaveToDisk() ? "SAVE AS…" : "SAVE FILE"}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Save into a Google Drive, Dropbox, or iCloud folder — or use Share sheet and pick the app.
            </p>
          </div>

          {status && <p className="text-xs text-neon">{status}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
