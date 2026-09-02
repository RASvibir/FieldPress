import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { fetchMe } from "@/lib/session";

export function AuthGate({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchMe().then((user) => {
      if (cancelled) return;
      if (!user) {
        navigate("/login");
        return;
      }
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-background text-muted-foreground flex items-center justify-center tracking-widest">
        CHECKING DESK…
      </div>
    );
  }
  return children;
}
