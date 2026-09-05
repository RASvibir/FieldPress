import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-neon-red">This desk hit a snag.</p>
        <p className="text-sm text-muted-foreground max-w-md">{this.state.error.message}</p>
        <Button variant="outline" onClick={() => { this.setState({ error: null }); window.location.assign("/"); }}>
          Back to the wall
        </Button>
      </div>
    );
  }
}
