import { Link } from "wouter";
import { PressyMark } from "@/components/pressy-mark";

export function FieldPressLogo() {
  return (
    <Link
      href="/"
      aria-label="FieldPress home"
      className="inline-flex min-h-11 items-center gap-2 rounded-md text-neon outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span
        aria-hidden="true"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-current/40 bg-card/90 p-1.5 shadow-sm backdrop-blur-sm sm:h-10 sm:w-10"
      >
        <PressyMark className="h-full w-full" />
      </span>
      <span className="font-mono text-base font-bold uppercase tracking-[0.12em] sm:text-lg">
        FieldPress
      </span>
    </Link>
  );
}
