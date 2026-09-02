import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/page-shell";

export default function ResetPasswordPage() {
  const [, navigate] = useLocation();
  const token =
    typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("token") ?? "";
  const [email, setEmail] = useState("");
  const [resetWord, setResetWord] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          token
            ? { token, password }
            : { email, resetWord, password },
        ),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof body.error === "string" ? body.error : "Reset failed");
        return;
      }
      navigate("/app");
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell center>
      <form onSubmit={submit} className="w-full max-w-md space-y-5 border border-border bg-card p-6">
        <h1 className="text-2xl tracking-[0.14em] text-center">RESET PASSWORD</h1>
        {token ? (
          <p className="text-sm text-muted-foreground">Using the email reset link. Choose a new password (10+ characters).</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Use the desk word you set at signup, plus your email, to set a new password.
          </p>
        )}
        {!token && (
          <>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="bg-card border-neon/20"
            />
            <Input
              value={resetWord}
              required
              minLength={8}
              onChange={(e) => setResetWord(e.target.value)}
              placeholder="Desk word"
              className="bg-card border-neon/20"
            />
          </>
        )}
        <Input
          type="password"
          required
          minLength={10}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password (10+ characters)"
          className="bg-card border-neon/20"
        />
        {error && <p className="text-neon-red text-sm">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "SAVING…" : "SET NEW PASSWORD"}
        </Button>
        <Link href="/login" className="text-xs tracking-widest text-muted-foreground hover:text-neon">
          BACK TO SIGN IN
        </Link>
      </form>
    </PageShell>
  );
}
