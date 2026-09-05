import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchMe, type SessionUser } from "@/lib/session";

const FIELDS = [
  { key: "twitter", label: "X / Twitter" },
  { key: "facebook", label: "Facebook" },
  { key: "reddit", label: "Reddit" },
  { key: "instagram", label: "Instagram" },
  { key: "bluesky", label: "Bluesky" },
  { key: "youtube", label: "YouTube" },
  { key: "podcastRss", label: "Podcast RSS" },
  { key: "podcastFolder", label: "Podcast folder" },
] as const;

export function DeskConnections() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [links, setLinks] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchMe().then((me) => {
      setUser(me);
      setLinks(me?.deskLinks || {});
    });
  }, []);

  if (!user) return null;

  async function save() {
    setStatus(null);
    const res = await fetch("/api/auth/me", {
      method: "PATCH",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ deskLinks: links }),
    });
    if (!res.ok) {
      setStatus("Could not save links");
      return;
    }
    setStatus("Saved");
  }

  return (
    <div className="space-y-2">
      {FIELDS.map((field) => (
        <Input
          key={field.key}
          value={links[field.key] || ""}
          onChange={(e) => setLinks((current) => ({ ...current, [field.key]: e.target.value }))}
          placeholder={field.label}
          className="bg-card border-border"
        />
      ))}
      <Button variant="outline" className="w-full" onClick={() => void save()}>
        SAVE BOOKMARKS
      </Button>
      {status && <p className="text-xs text-muted-foreground">{status}</p>}
    </div>
  );
}
