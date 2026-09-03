import { ArrowLeft, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useRef } from "react";

export default function UserManualPage() {
  const [, navigate] = useLocation();
  const frameRef = useRef<HTMLIFrameElement>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="print:hidden sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b border-border bg-background/95 px-4 py-3 pr-16">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          HOME
        </Button>
        <Button variant="ghost" size="sm" onClick={() => navigate("/app")}>
          NEWSROOM
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
          <a href="/user-manual.html?download=1">
            <Download className="w-4 h-4 mr-1" />
            DOWNLOAD
          </a>
        </Button>
      </div>
      <iframe
        ref={frameRef}
        title="FieldPress user guide"
        src="/user-manual.html"
        className="w-full border-0 bg-card"
        style={{ minHeight: "calc(100vh - 56px)" }}
      />
    </div>
  );
}
