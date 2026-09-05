import { useState } from "react";
import { ImageOff } from "lucide-react";
import { PressyMark } from "@/components/pressy-mark";

type PressieMediaVariant = "feed" | "wall" | "detail" | "thumbnail";

type PressieMediaProps = {
  src: string;
  alt: string;
  variant?: PressieMediaVariant;
  badge?: boolean;
  className?: string;
};

const variantClasses: Record<PressieMediaVariant, string> = {
  feed: "aspect-[4/5]",
  wall: "aspect-video rounded",
  detail: "aspect-[4/5] max-h-[32rem] rounded",
  thumbnail: "aspect-square rounded",
};

export function PressieMedia({
  src,
  alt,
  variant = "feed",
  badge = variant !== "thumbnail",
  className = "",
}: PressieMediaProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`relative overflow-hidden border border-border bg-muted ${variantClasses[variant]} ${className}`}
    >
      {failed ? (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center text-muted-foreground"
          role="img"
          aria-label={`Image unavailable: ${alt}`}
        >
          <ImageOff className="h-6 w-6" aria-hidden="true" />
          <span className="text-xs">Image unavailable</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}

      {badge && (
        <span
          aria-hidden="true"
          className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-md border border-[#39ff14]/50 bg-black/75 p-1.5 text-[#39ff14] shadow-sm backdrop-blur-sm sm:left-4 sm:top-4 sm:h-10 sm:w-10"
        >
          <PressyMark className="h-full w-full" />
        </span>
      )}
    </div>
  );
}
