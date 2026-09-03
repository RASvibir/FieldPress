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
