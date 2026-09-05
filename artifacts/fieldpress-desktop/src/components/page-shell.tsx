import { cn } from "@/lib/utils";

export function PageShell({
  children,
  className,
  center = false,
}: {
  children: React.ReactNode;
  className?: string;
  center?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-h-screen bg-background text-foreground px-5 pb-[max(2.5rem,calc(env(safe-area-inset-bottom)+5rem))] pt-[max(4.75rem,calc(env(safe-area-inset-top)+3.5rem))] sm:px-8",
        center && "flex items-center justify-center",
        className,
      )}
    >
      {children}
    </div>
  );
}
