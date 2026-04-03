import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, navigate] = useLocation();
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="text-6xl text-neon-red text-glow mb-4">404</div>
        <h1 className="text-2xl text-neon mb-2">SIGNAL LOST</h1>
        <p className="text-muted-foreground mb-6">The page you are looking for does not exist.</p>
        <Button variant="outline" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          RETURN TO BASE
        </Button>
      </div>
    </div>
  );
}
