import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Link2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";
import {
  buildPressieShareText,
  canNativeShare,
  copyText,
  createPressieSharePayload,
  nativePressieShare,
  pressieFacebookShareUrl,
  pressieXShareUrl,
  type PressieShareItem,
} from "@/lib/distribute";

type PressieShareMenuProps = {
  pressieId: string;
  title: string;
  items: PressieShareItem[];
  isPubliclyShareable: boolean;
};

type ShareFeedback =
  | "copy-fallback"
  | "popup-fallback"
  | null;

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function openExternal(url: string): boolean {
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  return opened !== null;
}

export function PressieShareMenu({
  pressieId,
  title,
  items,
  isPubliclyShareable,
}: PressieShareMenuProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<ShareFeedback>(null);

  const payload = useMemo(
    () =>
      createPressieSharePayload({
        pressieId,
        title,
        items,
      }),
    [items, pressieId, title],
  );

  if (!isPubliclyShareable || !payload) {
    return null;
  }

  const sharePayload = payload;

  function showCopyFallback() {
    setFeedback("copy-fallback");
  }

  function showPopupFallback() {
    setFeedback("popup-fallback");
  }

  async function copyCanonicalLink() {
    try {
      await copyText(sharePayload.url);
      setFeedback(null);
      toast({ title: "Link copied" });
    } catch {
      showCopyFallback();
    }
  }

  async function shareNatively() {
    if (!canNativeShare()) {
      showCopyFallback();
      return;
    }

    try {
      await nativePressieShare(sharePayload);
      setFeedback(null);
      toast({ title: "Share sheet opened" });
    } catch (error) {
      if (isAbortError(error)) {
        return;
      }
      showCopyFallback();
    }
  }

  function openFacebook() {
    if (openExternal(pressieFacebookShareUrl(sharePayload))) {
      toast({ title: "Facebook opened" });
      return;
    }
    showPopupFallback();
  }

  function openX() {
    if (openExternal(pressieXShareUrl(sharePayload))) {
      toast({ title: "X opened — review and post in X" });
      return;
    }
    showPopupFallback();
  }

  async function copyTikTokCaption() {
    try {
      await copyText(buildPressieShareText(sharePayload));
      setFeedback(null);
      toast({
        title: "Caption copied — add media and paste it into TikTok.",
      });
    } catch {
      showCopyFallback();
    }
  }

  async function moreSharingOptions() {
    if (canNativeShare()) {
      await shareNatively();
      return;
    }
    showCopyFallback();
  }

  const trigger = (
    <Button
      type="button"
      variant="outline"
      className="min-h-11 gap-2 border-neon/30 text-neon hover:text-neon"
      aria-label="Share this Pressie"
      onClick={(event) => event.stopPropagation()}
    >
      <Share2 aria-hidden="true" className="h-4 w-4" />
      <span>Share</span>
    </Button>
  );

  const actions = (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="min-h-11 w-full justify-start gap-2"
        onClick={() => void shareNatively()}
      >
        <Share2 aria-hidden="true" className="h-4 w-4" />
        Share…
      </Button>

      <Button
        type="button"
        variant="outline"
        className="min-h-11 w-full justify-start gap-2"
        onClick={() => void copyCanonicalLink()}
      >
        <Link2 aria-hidden="true" className="h-4 w-4" />
        Copy link
      </Button>

      <Button
        type="button"
        variant="outline"
        className="min-h-11 w-full justify-start gap-2"
        disabled
        aria-disabled="true"
      >
        <ExternalLink aria-hidden="true" className="h-4 w-4" />
        Embed — Coming soon
      </Button>

      <div className="border-t border-border pt-2">
        <Button
          type="button"
          variant="ghost"
          className="min-h-11 w-full justify-start"
          onClick={openFacebook}
        >
          Facebook
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="min-h-11 w-full justify-start"
          onClick={openX}
        >
          X
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="min-h-11 w-full justify-start"
          onClick={() => void copyTikTokCaption()}
        >
          TikTok
        </Button>
      </div>

      <div className="border-t border-border pt-2">
        <Button
          type="button"
          variant="ghost"
          className="min-h-11 w-full justify-start"
          onClick={() => void moreSharingOptions()}
        >
          More sharing options
        </Button>
      </div>

      {feedback && (
        <div className="space-y-2 rounded-md border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            {feedback === "popup-fallback"
              ? "Popup blocked — copy the link or text below."
              : "Copy the link below or try again."}
          </p>
          <Input
            readOnly
            value={sharePayload.url}
            aria-label="Canonical Pressie share URL"
            onFocus={(event) => event.currentTarget.select()}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => void copyCanonicalLink()}
            >
              <Copy aria-hidden="true" className="mr-2 h-4 w-4" />
              Retry copy
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="min-h-11"
              onClick={() => {
                setFeedback(null);
                toast({ title: "Link ready to copy" });
              }}
            >
              <Check aria-hidden="true" className="mr-2 h-4 w-4" />
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent
          side="bottom"
          className="max-h-[min(80dvh,42rem)] overflow-y-auto rounded-t-2xl px-4 pt-8 motion-reduce:transition-none"
        >
          <SheetHeader className="pr-10 text-left">
            <SheetTitle>Share Pressie</SheetTitle>
            <SheetDescription>
              Copy or open a destination to review before posting.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">{actions}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-[min(22rem,calc(100vw-2rem))] border-neon/30 bg-terminal"
      >
        <div className="mb-3">
          <p className="text-sm font-semibold">Share Pressie</p>
          <p className="text-xs text-muted-foreground">
            Copy or open a destination to review before posting.
          </p>
        </div>
        {actions}
      </PopoverContent>
    </Popover>
  );
}
