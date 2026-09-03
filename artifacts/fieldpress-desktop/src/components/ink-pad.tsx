import { INKS, type InkId, parseInk } from "@/lib/ink";
import { cn } from "@/lib/utils";

type Counts = Partial<Record<InkId, number>>;

export function InkPad({
  value,
  counts,
  onPick,
  disabled,
  compact,
}: {
  value?: string | null;
  counts?: Counts;
  onPick?: (ink: InkId) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const current = parseInk(value);
  return (
    <div className={cn("flex flex-wrap gap-1.5", compact && "gap-1")} onClick={(e) => e.stopPropagation()}>
      {INKS.map((ink) => {
        const n = counts?.[ink.id] || 0;
        const selected = current === ink.id;
        return (
          <button
            key={ink.id}
            type="button"
            disabled={disabled}
            title={ink.hint}
            onClick={() => onPick?.(ink.id)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
              selected ? "border-neon text-neon bg-neon/10" : "border-border text-foreground/80 hover:border-neon/40 hover:text-neon",
              disabled && "opacity-60 cursor-default",
            )}
          >
            {ink.label}
            {n > 0 ? <span className="ml-1 tabular-nums opacity-80">{n}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
