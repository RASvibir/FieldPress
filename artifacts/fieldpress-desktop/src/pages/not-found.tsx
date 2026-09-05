import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { PageShell } from "@/components/page-shell";

export default function NotFound() {
  const [, navigate] = useLocation();
  return (
    <PageShell center>
      <div className="text-center">
        <div className="text-6xl text-neon-red text-glow mb-4">404</div>
        <h1 className="text-2xl text-neon mb-2">Page missing</h1>
        <p className="text-muted-foreground mb-6">That URL is not a FieldPress desk.</p>
        <Button variant="outline" onClick={() => navigate("/app")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to the desk
        </Button>
      </div>
    </PageShell>
  );
}
