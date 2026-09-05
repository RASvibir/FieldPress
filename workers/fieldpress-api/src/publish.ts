export const PLATFORMS = [
  "bluesky",
  "mastodon",
  "wordpress",
  "discord",
  "telegram",
  "webhook",
  "rss",
  "x",
  "threads",
  "facebook",
  "instagram",
  "linkedin",
  "reddit",
] as const;

export type PublishPlatform = (typeof PLATFORMS)[number];
export type PublishLane = "social" | "news" | "podcast";

export type PublishFeed = {
  id: string;
  name: string;
  kind: string;
  hint?: string;
};

export type PublishAccount = {
  id: string;
  platform: PublishPlatform;
  label: string;
  lanes: PublishLane[];
  handle?: string;
  instance?: string;
  secret?: string;
  extra?: string;
  feeds: PublishFeed[];
};

export type PublicPublishAccount = Omit<PublishAccount, "secret" | "extra"> & {
  hasSecret: boolean;
};

export function isPlatform(value: string): value is PublishPlatform {
  return (PLATFORMS as readonly string[]).includes(value);
}

export function maskAccount(account: PublishAccount): PublicPublishAccount {
  const { secret: _s, extra: _e, ...rest } = account;
  return { ...rest, hasSecret: Boolean(account.secret || account.extra) };
}

export function parseAccounts(raw: unknown): PublishAccount[] {
  if (!Array.isArray(raw)) return [];
  const out: PublishAccount[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    if (!isPlatform(String(row.platform || ""))) continue;
    const lanes = Array.isArray(row.lanes)
      ? row.lanes.filter((lane): lane is PublishLane => lane === "social" || lane === "news" || lane === "podcast")
      : (["social", "news", "podcast"] as PublishLane[]);
    const feeds = Array.isArray(row.feeds)
      ? row.feeds
          .map((feed) => {
            const f = feed as Record<string, unknown>;
            return {
              id: String(f.id || "").slice(0, 400),
              name: String(f.name || "Feed").slice(0, 120),
              kind: String(f.kind || "feed").slice(0, 40),
              hint: f.hint ? String(f.hint).slice(0, 200) : undefined,
            };
          })
          .filter((feed) => feed.id)
      : [];
    out.push({
      id: String(row.id || crypto.randomUUID().replace(/-/g, "")).slice(0, 40),
      platform: row.platform as PublishPlatform,
      label: String(row.label || row.platform).slice(0, 80),
      lanes: lanes.length ? lanes : ["social"],
      handle: row.handle ? String(row.handle).slice(0, 320) : undefined,
      instance: row.instance ? String(row.instance).slice(0, 400) : undefined,
      secret: row.secret ? String(row.secret).slice(0, 800) : undefined,
      extra: row.extra ? String(row.extra).slice(0, 800) : undefined,
      feeds,
    });
  }
  return out.slice(0, 40);
}

export function mergeAccounts(existing: PublishAccount[], incoming: PublishAccount[]): PublishAccount[] {
  const byId = new Map(existing.map((item) => [item.id, item]));
  return incoming.map((item) => {
    const prev = byId.get(item.id);
    return {
      ...item,
      secret: item.secret || prev?.secret,
      extra: item.extra || prev?.extra,
      feeds: item.feeds.length ? item.feeds : prev?.feeds || [],
    };
  });
}

function siteOrigin(instance?: string) {
  const raw = (instance || "").trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw.replace(/\/+$/, "");
  return `https://${raw.replace(/\/+$/, "")}`;
}

async function readError(res: Response) {
  const text = await res.text();
  return text.slice(0, 240) || `${res.status}`;
}

export async function verifyAndSync(account: PublishAccount): Promise<{ account: PublishAccount; message: string }> {
  switch (account.platform) {
    case "bluesky": {
      const identifier = account.handle || "";
      const password = account.secret || "";
      if (!identifier || !password) throw new Error("Bluesky needs handle and an app password");
      const res = await fetch("https://bsky.social/xrpc/com.atproto.server.createSession", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      if (!res.ok) throw new Error(`Bluesky sign-in failed: ${await readError(res)}`);
      const body = (await res.json()) as { handle?: string; did?: string };
      account.handle = body.handle || identifier;
      account.feeds = [{ id: "profile", name: `@${account.handle} timeline`, kind: "profile" }];
      return { account, message: `Signed in as @${account.handle}` };
    }
    case "mastodon": {
      const origin = siteOrigin(account.instance);
      const token = account.secret || "";
      if (!origin || !token) throw new Error("Mastodon needs instance and access token");
      const me = await fetch(`${origin}/api/v1/accounts/verify_credentials`, {
        headers: { authorization: `Bearer ${token}` },
      });
      if (!me.ok) throw new Error(`Mastodon sign-in failed: ${await readError(me)}`);
      const profile = (await me.json()) as { acct?: string; username?: string };
      account.handle = profile.acct || profile.username || account.handle;
      const listsRes = await fetch(`${origin}/api/v1/lists`, { headers: { authorization: `Bearer ${token}` } });
      const lists = listsRes.ok ? ((await listsRes.json()) as Array<{ id: string; title: string }>) : [];
      account.feeds = [
        { id: "public", name: "Public timeline", kind: "visibility" },
        { id: "unlisted", name: "Unlisted", kind: "visibility" },
        { id: "private", name: "Followers only", kind: "visibility" },
        ...lists.map((list) => ({ id: `list:${list.id}`, name: list.title, kind: "list" })),
      ];
      return { account, message: `Synced ${account.feeds.length} Mastodon destinations` };
    }
    case "wordpress": {
      const origin = siteOrigin(account.instance);
      const user = account.handle || "";
      const pass = account.secret || "";
      if (!origin || !user || !pass) throw new Error("WordPress needs site URL, username, and application password");
      const auth = `Basic ${btoa(`${user}:${pass}`)}`;
      const me = await fetch(`${origin}/wp-json/wp/v2/users/me`, { headers: { authorization: auth } });
      if (!me.ok) throw new Error(`WordPress sign-in failed: ${await readError(me)}`);
      const cats = await fetch(`${origin}/wp-json/wp/v2/categories?per_page=100`, { headers: { authorization: auth } });
      const categories = cats.ok ? ((await cats.json()) as Array<{ id: number; name: string }>) : [];
      account.feeds = [
        { id: "uncategorized", name: "Uncategorized / front page", kind: "category" },
        ...categories.map((cat) => ({ id: String(cat.id), name: cat.name, kind: "category" })),
      ];
      return { account, message: `Synced ${account.feeds.length} WordPress sections` };
    }
    case "discord": {
      const url = account.secret || "";
      if (!url.includes("discord.com/api/webhooks/")) throw new Error("Paste a Discord channel webhook URL");
      account.feeds = [{ id: "channel", name: account.label || "Discord channel", kind: "channel" }];
      return { account, message: "Discord channel ready" };
    }
    case "telegram": {
      const token = account.secret || "";
      const chat = account.extra || account.handle || "";
      if (!token || !chat) throw new Error("Telegram needs bot token and chat or channel id");
      const res = await fetch(`https://api.telegram.org/bot${token}/getChat?chat_id=${encodeURIComponent(chat)}`);
      if (!res.ok) throw new Error(`Telegram chat check failed: ${await readError(res)}`);
      const body = (await res.json()) as { result?: { title?: string; username?: string; id?: number } };
      const name = body.result?.title || body.result?.username || chat;
      account.feeds = [{ id: chat, name, kind: "chat" }];
      return { account, message: `Telegram destination ${name}` };
    }
    case "rss": {
      const feed = account.instance || account.secret || "";
      if (!feed.startsWith("http")) throw new Error("RSS needs the public feed URL to ping");
      account.feeds = [{ id: feed, name: account.label || "RSS feed", kind: "hub" }];
      return { account, message: "RSS hub ping ready" };
    }
    default: {
      const url = account.secret || "";
      if (!url.startsWith("https://")) throw new Error("This network needs an HTTPS webhook (Zapier, Make, n8n, or the site’s inbound hook)");
      const groups = account.feeds.length
        ? account.feeds
        : [{ id: "default", name: account.label || "Primary feed", kind: "webhook" }];
      account.feeds = groups;
      return { account, message: `${account.platform} webhook saved. Add more group URLs as extra feeds.` };
    }
  }
}

export async function pushToAccount(account: PublishAccount, feedId: string, payload: { title: string; text: string; url?: string; lane: PublishLane }) {
  const title = payload.title.slice(0, 300);
  const text = payload.text.slice(0, 20000);
  const url = payload.url || "";
  const body = [title, text, url].filter(Boolean).join("\n\n");
  const feed = account.feeds.find((item) => item.id === feedId) || account.feeds[0];

  switch (account.platform) {
    case "bluesky": {
      const sessionRes = await fetch("https://bsky.social/xrpc/com.atproto.server.createSession", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ identifier: account.handle, password: account.secret }),
      });
      if (!sessionRes.ok) throw new Error(`Bluesky: ${await readError(sessionRes)}`);
      const session = (await sessionRes.json()) as { did: string; accessJwt: string };
      const post = await fetch("https://bsky.social/xrpc/com.atproto.repo.createRecord", {
        method: "POST",
        headers: { authorization: `Bearer ${session.accessJwt}`, "content-type": "application/json" },
        body: JSON.stringify({
          repo: session.did,
          collection: "app.bsky.feed.post",
          record: { $type: "app.bsky.feed.post", text: body.slice(0, 300), createdAt: new Date().toISOString() },
        }),
      });
      if (!post.ok) throw new Error(`Bluesky post failed: ${await readError(post)}`);
      return "Posted to Bluesky";
    }
    case "mastodon": {
      const origin = siteOrigin(account.instance);
      const visibility = feedId === "unlisted" || feedId === "private" ? feedId : "public";
      const statusRes = await fetch(`${origin}/api/v1/statuses`, {
        method: "POST",
        headers: { authorization: `Bearer ${account.secret}`, "content-type": "application/json" },
        body: JSON.stringify({ status: body.slice(0, 4900), visibility, spoiler_text: title !== text ? title.slice(0, 100) : undefined }),
      });
      if (!statusRes.ok) throw new Error(`Mastodon: ${await readError(statusRes)}`);
      return `Posted to Mastodon (${feed?.name || visibility})`;
    }
    case "wordpress": {
      const origin = siteOrigin(account.instance);
      const auth = `Basic ${btoa(`${account.handle}:${account.secret}`)}`;
      const categories = feed && feed.id !== "uncategorized" && /^\d+$/.test(feed.id) ? [Number(feed.id)] : undefined;
      const post = await fetch(`${origin}/wp-json/wp/v2/posts`, {
        method: "POST",
        headers: { authorization: auth, "content-type": "application/json" },
        body: JSON.stringify({ title, content: text.replace(/\n/g, "<br/>"), status: "publish", categories }),
      });
      if (!post.ok) throw new Error(`WordPress: ${await readError(post)}`);
      return `Filed to WordPress (${feed?.name || "front page"})`;
    }
    case "discord": {
      const post = await fetch(account.secret || "", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: body.slice(0, 2000) }),
      });
      if (!post.ok) throw new Error(`Discord: ${await readError(post)}`);
      return "Pushed to Discord";
    }
    case "telegram": {
      const chat = feed?.id || account.extra || account.handle;
      const post = await fetch(`https://api.telegram.org/bot${account.secret}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: chat, text: body.slice(0, 3900) }),
      });
      if (!post.ok) throw new Error(`Telegram: ${await readError(post)}`);
      return `Pushed to Telegram (${feed?.name || chat})`;
    }
    case "rss": {
      const hub = "https://pubsubhubbub.appspot.com/";
      const feedUrl = feed?.id || account.instance || "";
      const ping = await fetch(hub, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: `hub.mode=publish&hub.url=${encodeURIComponent(feedUrl)}`,
      });
      if (!ping.ok && ping.status !== 204) throw new Error(`RSS ping: ${await readError(ping)}`);
      return "Pinged RSS hub";
    }
    default: {
      const hook = feed?.hint || account.secret || "";
      const post = await fetch(hook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          source: "fieldpress",
          platform: account.platform,
          lane: payload.lane,
          group: feed?.name || feedId,
          title,
          text,
          url,
        }),
      });
      if (!post.ok) throw new Error(`${account.platform} webhook: ${await readError(post)}`);
      return `Pushed to ${account.label} / ${feed?.name || "feed"}`;
    }
  }
}
