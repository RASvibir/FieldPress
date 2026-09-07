import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageShell } from "@/components/page-shell";
import { PressyMark } from "@/components/pressy-mark";
import { Users, CheckCircle, ArrowRight, ShieldCheck, LogIn } from "lucide-react";

type DeskPreview = {
  desk: {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
  };
  memberCount: number;
  isMember: boolean;
  myRole: string | null;
  signedIn: boolean;
};

export default function JoinPage() {
  const [, params] = useRoute("/join/:code");
  const [, navigate] = useLocation();
  const code = params?.code;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<DeskPreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    fetch(`/api/desks/${encodeURIComponent(code)}`, { credentials: "include" })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || "Bureau not found");
        setData(body);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [code]);

  async function handleJoin() {
    if (!code) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/desks/join/${encodeURIComponent(code)}`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
      });
      const body = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          navigate(`/login?next=${encodeURIComponent(`/join/${code}`)}`);
          return;
        }
        throw new Error(body.error || "Could not join bureau");
      }
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell>
      <div className="max-w-md mx-auto py-12 px-4 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-full bg-signal-yellow/10 border border-signal-yellow/30 mb-2">
            <PressyMark className="w-8 h-8 text-signal-yellow" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Bureau Invitation</h1>
          <p className="text-sm text-muted-foreground">
            Collaborative FieldPress Newsroom Desk
          </p>
        </div>

        {loading ? (
          <Card className="border-border bg-card">
            <CardContent className="p-8 text-center text-muted-foreground font-mono text-sm">
              Connecting to bureau dispatch…
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-neon-red/40 bg-card">
            <CardContent className="p-6 text-center space-y-4">
              <p className="text-sm text-neon-red font-mono">{error}</p>
              <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                Return to Newsroom
              </Button>
            </CardContent>
          </Card>
        ) : data ? (
          <Card className="border-border bg-card shadow-lg">
            <CardHeader className="text-center pb-3">
              <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-signal-yellow uppercase tracking-widest mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Desk</span>
              </div>
              <CardTitle className="text-xl font-bold">{data.desk.name}</CardTitle>
              <CardDescription className="flex items-center justify-center gap-2 pt-1 font-mono text-xs">
                <Users className="w-3.5 h-3.5" />
                <span>{data.memberCount} active {data.memberCount === 1 ? "reporter" : "reporters"}</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              <div className="p-3 rounded bg-muted/40 border border-border text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">You are invited as a Fieldy Reporter</p>
                <p>Collaborate on stories, dispatch field notes, and share evidence dossiers across this bureau.</p>
              </div>

              {data.isMember ? (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 p-2.5 rounded bg-neon/10 border border-neon/30 text-xs text-neon font-mono">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>You are an active {data.myRole || "member"} on this desk.</span>
                  </div>
                  <Button className="w-full font-semibold" onClick={() => navigate("/")}>
                    OPEN NEWSROOM <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              ) : data.signedIn ? (
                <Button
                  className="w-full font-semibold"
                  onClick={handleJoin}
                  disabled={submitting}
                >
                  <PressyMark className="w-4 h-4 mr-2" />
                  {submitting ? "JOINING…" : "JOIN BUREAU AS REPORTER"}
                </Button>
              ) : (
                <Button
                  className="w-full font-semibold"
                  onClick={() => navigate(`/login?next=${encodeURIComponent(`/join/${code}`)}`)}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  SIGN IN TO JOIN BUREAU
                </Button>
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </PageShell>
  );
}
