import { useState } from "react";
import { Link, useLocation } from "wouter";
import { PageShell } from "@/components/page-shell";
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
  const [ageBand, setAgeBand] = useState<"" | "kids" | "teen" | "adult">("");
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
      if (mode === "register" && !ageBand) {
        setError("Choose under 13, teenager, or over 18. We do not collect birthdays.");
        setBusy(false);
        return;
      }
      const res = await fetch(path, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          displayName: displayName || undefined,
          resetWord: resetWord || undefined,
          ageBand: mode === "register" ? ageBand : undefined,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = typeof body.error === "string" ? body.error : "Could not sign in";
        if (res.status === 409) {
          setMode("login");
          setError("This email already has a desk. Sign in below, or use Reset with desk word.");
          return;
        }
        setError(err);
        return;
      }
      const next = new URLSearchParams(window.location.search).get("next") || "/";
      navigate(next.startsWith("/") ? next : "/");
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell center>
      <form onSubmit={submit} className="w-full max-w-md space-y-5 border border-border bg-card p-6">
        <div className="space-y-1 text-center">
          <h1 className="text-3xl tracking-[0.18em] text-glow-pulse">FIELDPRESS</h1>
          <p className="text-muted-foreground text-sm">
            {mode === "register" ? "Create a desk account" : mode === "forgot" ? "Reset access" : "Sign in with your password or desk word"}
          </p>
        </div>
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="bg-card border-neon/20"
        />
        {mode !== "forgot" && (
          <Input
            type="password"
            required
            minLength={mode === "register" ? 10 : 1}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "register" ? "Password (10+ characters)" : "Password"}
            className="bg-card border-neon/20"
          />
        )}
        {mode === "register" && (
          <>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display name (optional)"
              className="bg-card border-neon/20"
            />
            <Input
              value={resetWord}
              onChange={(e) => setResetWord(e.target.value)}
              placeholder="Desk word (optional, 8+ chars — recovers password)"
              className="bg-card border-neon/20"
            />
            <fieldset className="space-y-2 border border-neon/20 p-3">
              <legend className="px-1 text-xs tracking-widest text-muted-foreground">DESK RATING</legend>
              <p className="text-xs text-muted-foreground leading-relaxed">
                No birthday. Under 13 is G / Kids. Teenager is PG-13. Over 18 has no extra label.
              </p>
              {(
                [
                  ["kids", "Under 13", "G / Kids"],
                  ["teen", "Teenager", "PG-13"],
                  ["adult", "Over 18", ""],
                ] as const
              ).map(([value, label, hint]) => (
                <label key={value} className="flex items-start gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="ageBand"
                    required
                    checked={ageBand === value}
                    onChange={() => setAgeBand(value)}
                    className="mt-1"
                  />
                  <span>
                    <span className="text-neon">{label}</span>
                    {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
                  </span>
                </label>
              ))}
              {ageBand === "kids" && (
                <p className="text-xs text-muted-foreground">A parent or guardian should set up this desk.</p>
              )}
            </fieldset>
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
    </PageShell>
  );
}
