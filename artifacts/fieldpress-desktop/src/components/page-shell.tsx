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
        "min-h-screen bg-background text-foreground px-5 pb-10 pt-[4.75rem] sm:px-8",
        center && "flex items-center justify-center",
        className,
      )}
    >
      {children}
    </div>
  );
}
