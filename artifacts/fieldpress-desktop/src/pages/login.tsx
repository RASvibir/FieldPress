import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Mode = "login" | "register" | "forgot";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [resetWord, setResetWord] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === "forgot") {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const body = await res.json();
        setMessage(
          body.resetUrl
            ? `Dev reset link: ${body.resetUrl}`
            : "If that email is on file, we sent a reset link. You can also use your desk word on the reset page.",
        );
        return;
      }
      const path = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const res = await fetch(path, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          displayName: displayName || undefined,
          resetWord: resetWord || undefined,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof body.error === "string" ? body.error : "Could not sign in");
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
    <div className="min-h-screen bg-background text-neon flex items-center justify-center p-5">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 border border-neon/25 bg-card p-6">
        <div className="space-y-1 text-center">
          <h1 className="text-3xl tracking-[0.18em] text-glow-pulse">FIELDPRESS</h1>
          <p className="text-muted-foreground text-sm">
            {mode === "register" ? "Create a desk account" : mode === "forgot" ? "Reset access" : "Sign in to the newsroom"}
          </p>
        </div>
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="bg-black border-neon/20"
        />
        {mode !== "forgot" && (
          <Input
            type="password"
            required
            minLength={mode === "register" ? 10 : 1}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "register" ? "Password (10+ characters)" : "Password"}
            className="bg-black border-neon/20"
          />
        )}
        {mode === "register" && (
          <>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display name (optional)"
              className="bg-black border-neon/20"
            />
            <Input
              value={resetWord}
              onChange={(e) => setResetWord(e.target.value)}
              placeholder="Desk word (optional, 8+ chars — recovers password)"
              className="bg-black border-neon/20"
            />
            <p className="text-xs text-muted-foreground">
              The desk word is a private recovery passphrase. Store it offline. You can also reset via email link.
            </p>
          </>
        )}
        {error && <p className="text-neon-red text-sm">{error}</p>}
        {message && <p className="text-neon-yellow text-sm break-all">{message}</p>}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy
            ? "WORKING…"
            : mode === "register"
              ? "CREATE ACCOUNT"
              : mode === "forgot"
                ? "SEND RESET LINK"
                : "SIGN IN"}
        </Button>
        <div className="flex flex-col gap-2 text-xs tracking-widest text-muted-foreground">
          {mode !== "login" && (
            <button type="button" className="text-left hover:text-neon" onClick={() => setMode("login")}>
              BACK TO SIGN IN
            </button>
          )}
          {mode === "login" && (
            <>
              <button type="button" className="text-left hover:text-neon" onClick={() => setMode("register")}>
                CREATE ACCOUNT
              </button>
              <button type="button" className="text-left hover:text-neon" onClick={() => setMode("forgot")}>
                FORGOT PASSWORD / SEND LINK
              </button>
              <Link href="/reset-password" className="hover:text-neon">
                RESET WITH DESK WORD
              </Link>
            </>
          )}
          <Link href="/" className="hover:text-neon">
            HOME
          </Link>
        </div>
      </form>
    </div>
  );
}
