import { ArrowLeft, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect, useRef } from "react";

export default function AdminManualPage() {
  const [, navigate] = useLocation();
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const previousTitle = document.title;
    let robots = document.querySelector('meta[name="robots"]');
    const created = !robots;
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    const previousRobots = robots.getAttribute("content");
    document.title = "FieldPress operator manual";
    robots.setAttribute("content", "noindex, nofollow, noarchive");
    return () => {
      document.title = previousTitle;
      if (created) robots?.remove();
      else if (previousRobots) robots?.setAttribute("content", previousRobots);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="print:hidden sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b border-neon/20 bg-background/95 px-4 py-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/app")}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          BACK
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => frameRef.current?.contentWindow?.print()}
        >
          <Printer className="w-4 h-4 mr-1" />
          PRINT
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href="/admin-manual.html?download=1">
            <Download className="w-4 h-4 mr-1" />
            DOWNLOAD HTML
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href="/admin-manual.html?download=md">
            DOWNLOAD MD
          </a>
        </Button>
        <span className="text-[10px] text-muted-foreground tracking-widest">
          OPERATOR ONLY
        </span>
      </div>
      <iframe
        ref={frameRef}
        title="FieldPress operator manual"
        src="/admin-manual.html"
        className="w-full border-0 bg-card"
        style={{ minHeight: "calc(100vh - 56px)" }}
      />
    </div>
  );
}
