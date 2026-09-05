import { useEffect, useRef, useState } from "react";
import { INKS, type InkId, getInk, parseInk } from "@/lib/ink";
import { cn } from "@/lib/utils";

type Counts = Partial<Record<InkId, number>>;

type InkPadProps = {
  value?: string | null;
  counts?: Counts;
  onPick?: (ink: InkId) => void;
  disabled?: boolean;
  compact?: boolean;
  mode?: "tray" | "picker";
};

const LONG_PRESS_MS = 450;
const MOVE_CANCEL_PX = 12;

export function InkPad({
  value,
  counts,
  onPick,
  disabled,
  compact,
  mode = "tray",
}: InkPadProps) {
  const current = parseInk(value);
  const [open, setOpen] = useState(mode === "picker");
  const rootRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const longPressOpened = useRef(false);

  const primary = getInk("cool")!;

  useEffect(() => {
    if (mode === "picker") setOpen(true);
  }, [mode]);

  useEffect(() => {
    if (!open || mode !== "tray") return;

    function onPointerDown(event: PointerEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mode, open]);

  function clearLongPress() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    pointerStart.current = null;
  }

  function choose(ink: InkId) {
    if (disabled) return;
    onPick?.(ink);
    if (mode === "tray") setOpen(false);
  }

  function toggleCool() {
    if (disabled) return;
    onPick?.("cool");
  }

  function startLongPress(event: React.PointerEvent<HTMLButtonElement>) {
    if (mode !== "tray" || event.pointerType === "mouse" || disabled) return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
    longPressOpened.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressOpened.current = true;
      setOpen(true);
      navigator.vibrate?.(12);
    }, LONG_PRESS_MS);
  }

  function moveLongPress(event: React.PointerEvent<HTMLButtonElement>) {
    if (!pointerStart.current) return;
    const moved = Math.hypot(event.clientX - pointerStart.current.x, event.clientY - pointerStart.current.y);
    if (moved > MOVE_CANCEL_PX) clearLongPress();
  }

  function endLongPress() {
    clearLongPress();
  }

  function onPrimaryClick() {
    if (longPressOpened.current) {
      longPressOpened.current = false;
      return;
    }
    toggleCool();
  }

  function onPrimaryKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
    }
  }

  const selected = getInk(current);

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative inline-flex max-w-full flex-wrap items-center gap-2",
        compact && "gap-1.5",
      )}
      onClick={(event) => event.stopPropagation()}
      onMouseEnter={() => mode === "tray" && setOpen(true)}
      onMouseLeave={() => mode === "tray" && setOpen(false)}
      onBlur={(event) => {
        if (mode === "tray" && !rootRef.current?.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      {mode === "tray" && (
        <button
          type="button"
          disabled={disabled}
          aria-label="React Cool"
          aria-pressed={current === "cool"}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={onPrimaryClick}
          onFocus={() => setOpen(true)}
          onKeyDown={onPrimaryKeyDown}
          onPointerDown={startLongPress}
          onPointerMove={moveLongPress}
          onPointerUp={endLongPress}
          onPointerCancel={endLongPress}
          className={cn(
            "inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-full border px-3 text-sm font-semibold",
            "touch-manipulation select-none transition-colors",
            current === "cool"
              ? "border-neon bg-neon/10 text-neon"
              : "border-border bg-card text-foreground hover:border-neon/50 hover:text-neon",
            disabled && "cursor-not-allowed opacity-60",
          )}
        >
          <span aria-hidden="true" className="text-lg leading-none">{primary.emoji}</span>
          {!compact && <span>Cool</span>}
          {(counts?.cool || 0) > 0 && <span className="tabular-nums text-xs opacity-80">{counts?.cool}</span>}
        </button>
      )}

      {open && (
        <div
          role={mode === "tray" ? "dialog" : "radiogroup"}
          aria-label={mode === "tray" ? "Choose a Pressie reaction" : "Choose how this Pressie hits"}
          className={cn(
            "z-30 flex max-w-[calc(100vw-2rem)] flex-wrap gap-1.5 rounded-2xl border border-border bg-card p-2 shadow-lg",
            mode === "tray" && "absolute bottom-full left-0 pb-2",
            compact && "gap-1 p-1.5",
          )}
        >
          {INKS.map((ink) => {
            const n = counts?.[ink.id] || 0;
            const isSelected = current === ink.id;
            return (
              <button
                key={ink.id}
                type="button"
                role={mode === "tray" ? undefined : "radio"}
                disabled={disabled}
                aria-label={`${ink.label}${n ? `, ${n} reactions` : ""}`}
                aria-pressed={mode === "tray" ? isSelected : undefined}
                aria-checked={mode === "picker" ? isSelected : undefined}
                title={ink.hint}
                onClick={() => choose(ink.id)}
                className={cn(
                  "flex min-h-11 min-w-11 flex-col items-center justify-center rounded-xl border px-2 py-1",
                  "touch-manipulation transition-colors",
                  isSelected
                    ? "border-neon bg-neon/10 text-neon"
                    : "border-transparent text-foreground hover:border-neon/40 hover:bg-muted",
                  disabled && "cursor-not-allowed opacity-60",
                )}
              >
                <span aria-hidden="true" className="text-xl leading-none">{ink.emoji}</span>
                <span className="mt-1 text-[10px] font-medium leading-none">{ink.label}</span>
                {n > 0 && <span className="mt-0.5 text-[10px] tabular-nums opacity-75">{n}</span>}
              </button>
            );
          })}
        </div>
      )}

      {mode === "tray" && selected && current !== "cool" && !compact && (
        <span className="text-xs text-muted-foreground">
          {selected.emoji} {selected.label}
        </span>
      )}
    </div>
  );
}
