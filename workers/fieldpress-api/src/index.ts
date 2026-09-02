import { neon } from "@neondatabase/serverless";

type Env = {
  DATABASE_URL: string;
  AUTH_SECRET?: string;
  GEMINI_API_KEY?: string;
  GOOGLE_CSE_ID?: string;
  GOOGLE_CSE_KEY?: string;
};

const COOKIE = "fp_session";

const ALLOW_ORIGINS = new Set([
  "https://fieldpress.studio",
  "https://www.fieldpress.studio",
  "https://app.fieldpress.studio",
  "https://api.fieldpress.studio",
]);

function corsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get("origin") || "";
  const allow = ALLOW_ORIGINS.has(origin) ? origin : "https://fieldpress.studio";
  return {
    "access-control-allow-origin": allow,
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": "content-type, x-fieldpress-age",
    "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    vary: "Origin",
  };
}

function json(data: unknown, status = 200, extra: HeadersInit = {}, req?: Request) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      ...(req ? corsHeaders(req) : {}),
      ...extra,
    },
  });
}

function empty(status = 204) {
  return new Response(null, { status });
}

function id(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

async function sha256(value: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashSecret(value: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = [...salt].map((b) => b.toString(16).padStart(2, "0")).join("");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(value), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
    key,
    256,
  );
  const hex = [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${saltHex}:${hex}`;
}

async function verifySecret(value: string, stored: string): Promise<boolean> {
  const [saltHex, hex] = stored.split(":");
  if (!saltHex || !hex) return false;
  if (stored.includes(":") && saltHex.length === 32) {
    const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((h) => parseInt(h, 16)));
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(value), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
      key,
      256,
    );
    const got = [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, "0")).join("");
    return got === hex;
  }
  return false;
}

function cookieHeader(token: string): string {
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${14 * 24 * 60 * 60}`;
}

function readCookie(req: Request, name: string): string | null {
  const raw = req.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return rest.join("=");
  }
  return null;
}

function pathOf(req: Request): { pathname: string; parts: string[] } {
  const url = new URL(req.url);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    let stripped = pathname.replace(/^\/api/, "") || "/";
    if (stripped === "/health" || stripped === "/healthz") {
      stripped = "/healthz";
    }
    const parts = stripped.split("/").filter(Boolean);
  return { pathname: stripped, parts };
}

type Sql = ReturnType<typeof neon>;

async function userFromSession(sql: Sql, req: Request) {
  const token = readCookie(req, COOKIE);
  if (!token) return null;
  const tokenHash = await sha256(token);
  const rows = await sql`
    select u.id, u.email, u.display_name as "displayName", u.status, s.expires_at as "expiresAt",
      coalesce(u.desk_links, '{}'::jsonb) as "deskLinks",
      coalesce(u.age_band, 'teen') as "ageBand",
      coalesce(u.role, 'user') as role
    from sessions s
    join users u on u.id = s.user_id
    where s.token_hash = ${tokenHash}
    limit 1
  `;
  const row = rows[0] as
    | { id: string; email: string; displayName: string; status: string; expiresAt: string; deskLinks?: unknown; ageBand?: string; role?: string }
    | undefined;
  if (!row || new Date(row.expiresAt).getTime() < Date.now()) return null;
  if (row.status !== "active" && row.status !== "superadmin") return null;
  return {
    id: row.id,
    email: row.email,
    displayName: row.displayName,
    deskLinks: row.deskLinks || {},
    ageBand: row.ageBand || "teen",
    role: row.role === "superadmin" || row.status === "superadmin" ? "superadmin" : "user",
  };
}

async function createSession(sql: Sql, userId: string) {
  const token = id() + id();
  const tokenHash = await sha256(token);
  const expires = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
  await sql`
    insert into sessions (id, user_id, token_hash, expires_at)
    values (${id()}, ${userId}, ${tokenHash}, ${expires})
  `;
  return token;
}

const PORN_RE =
  /\b(xxx|porn|porno|pornography|pornhub|xvideos|onlyfans|sex tape|explicit sex|csam|child\s*porn|child\s*sexual)\b/i;

function looksPorn(...parts: string[]): boolean {
  return PORN_RE.test(parts.join(" "));
}

const PORN_BLOCK = "Porn is not allowed. News, art, and documentary work that includes nudity is fine for adult desks.";

const PG13_RE =
  /\b(shooting|murder|killed|killing|war|bomb|assault|suicide|terror|drugs?|gunfire|massacre)\b/i;
const MATURE_RE =
  /\b(graphic violence|gore|torture|sexual assault|erotic|nude|nudity|explicit)\b/i;

function contentRating(text: string): "g" | "pg13" | "mature" {
  if (MATURE_RE.test(text)) return "mature";
  if (PG13_RE.test(text)) return "pg13";
  return "g";
}

function canSeeRating(rating: string | undefined, ageBand: string, isOwner: boolean) {
  if (isOwner) return true;
  const band = ageBand === "kids" || ageBand === "adult" ? ageBand : "teen";
  const level = rating === "mature" || rating === "g" || rating === "pg13" ? rating : "pg13";
  if (band === "kids") return level === "g";
  if (band === "teen") return level === "g" || level === "pg13";
  return true;
}

function parseAgeBand(value: unknown): "kids" | "teen" | "adult" | null {
  const raw = String(value || "").toLowerCase().replace(/[\s_+-]/g, "");
  if (raw === "kids" || raw === "under13" || raw === "g" || raw === "child") return "kids";
  if (raw === "teen" || raw === "teenager" || raw === "pg13") return "teen";
  if (raw === "adult" || raw === "over18" || raw === "18") return "adult";
  return null;
}

let schemaReady = false;
async function ensureAgeSchema(sql: Sql) {
  if (schemaReady) return;
  try {
    await sql`alter table users add column if not exists age_band text not null default 'teen'`;
    await sql`alter table users add column if not exists role text not null default 'user'`;
    await sql`alter table stories add column if not exists content_rating text not null default 'pg13'`;
    schemaReady = true;
  } catch {
    schemaReady = true;
  }
}

type StoryRow = {
  id: string;
  title: string;
  status: string;
  ownerId?: string | null;
  visibility?: string;
  nsfw?: number;
  contentRating?: string;
  embargoUntil?: string | null;
  deskChecks?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

function embargoOpen(story: { embargoUntil?: string | null; ownerId?: string | null }, userId: string | null) {
  if (!story.embargoUntil) return true;
  if (new Date(story.embargoUntil).getTime() <= Date.now()) return true;
  return Boolean(userId && story.ownerId === userId);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch] || ch));
}

function parseChapters(text: string) {
  const chapters: Array<{ start: number; startTime: number; title: string }> = [];
  for (const line of text.split("\n")) {
    const match = line.match(/\[(\d+):(\d{2})(?:\.(\d+))?\]\s*(.*)/);
    if (!match) continue;
    const start = Number(match[1]) * 60 + Number(match[2]);
    chapters.push({ start, startTime: start, title: (match[4] || "Chapter").trim() });
  }
  return chapters;
}

function canAccessStory(story: StoryRow, userId: string | null): boolean {
  const visibility = story.visibility || "public";
  const owner = story.ownerId ?? null;
  if (visibility === "private") return Boolean(userId && owner === userId);
  return true;
}

async function storyWithItems(sql: Sql, userId: string | null, storyId: string, ageBand: string) {
  const stories = await sql`
    select id, title, status, owner_id as "ownerId",
      coalesce(visibility, 'public') as visibility,
      coalesce(nsfw, 0) as nsfw,
      coalesce(content_rating, 'pg13') as "contentRating",
      embargo_until as "embargoUntil",
      coalesce(desk_checks, '{}'::jsonb) as "deskChecks",
      created_at as "createdAt", updated_at as "updatedAt"
    from stories
    where id = ${storyId}
    limit 1
  `;
  const story = stories[0] as StoryRow | undefined;
  if (!story || !canAccessStory(story, userId)) return null;
  const isOwner = Boolean(userId && story.ownerId === userId);
  if (!canSeeRating(story.contentRating, ageBand, isOwner)) return null;
  const items = await sql`
    select id, story_id as "storyId", type, content, created_at as "createdAt"
    from story_items where story_id = ${storyId}
    order by created_at desc
  `;
  return { ...story, items };
}

function localProduce(title: string, notes: string[]) {
  const body = notes.length ? notes.map((n, i) => `${i + 1}. ${n}`).join("\n") : "No field notes yet. Add notes, then run the producer again.";
  return {
    summary: notes[0] || `${title}: field package started from the public desk.`,
    outline: ["What we know", "What still needs checking", "Why it matters now"],
    caption: title,
    whyNow: "Filed in public. Sign in only if you need a private copy.",
    audience: "General readers",
    trends: [] as unknown[],
    drafts: [
      { mode: "article" as const, title: `${title} — Field Report`, content: `# ${title}\n\n${body}` },
      { mode: "social" as const, title: `${title} — Social`, content: body },
      { mode: "podcast" as const, title: `${title} — Dispatch`, content: `Cold open.\n\n${body}\n\nOutro.` },
    ],
    usedFallback: true,
  };
}

async function geminiProduce(apiKey: string, title: string, notes: string[]) {
  const prompt = `You are FieldPress. Turn field notes into JSON with keys: summary, outline (string array), caption, whyNow, audience, articleTitle, article, socialTitle, social, podcastTitle, podcast. Do not invent facts. Title: ${title}\nNotes:\n${notes.join("\n") || "(none)"}`;
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", maxOutputTokens: 4096, temperature: 0.5 },
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`Gemini ${response.status}`);
  const payload = (await response.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = payload.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  const parsed = JSON.parse(text) as Record<string, unknown>;
  const outline = Array.isArray(parsed.outline) ? parsed.outline.filter((x): x is string => typeof x === "string") : [];
  return {
    summary: String(parsed.summary || ""),
    outline,
    caption: String(parsed.caption || title),
    whyNow: String(parsed.whyNow || ""),
    audience: String(parsed.audience || ""),
    trends: [],
    drafts: [
      { mode: "article" as const, title: String(parsed.articleTitle || `${title} — Field Report`), content: String(parsed.article || "") },
      { mode: "social" as const, title: String(parsed.socialTitle || `${title} — Social`), content: String(parsed.social || "") },
      { mode: "podcast" as const, title: String(parsed.podcastTitle || `${title} — Dispatch`), content: String(parsed.podcast || "") },
    ],
    usedFallback: false,
  };
}

async function searchCommons(query: string) {
  const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}&gsrlimit=10&prop=imageinfo&iiprop=url|extmetadata|size&format=json&origin=*`;
  const response = await fetch(wikiUrl);
  if (!response.ok) throw new Error(`Wikimedia ${response.status}`);
  const data = (await response.json()) as {
    query?: { pages?: Record<string, { pageid: number; title: string; imageinfo?: Array<{ url?: string; extmetadata?: Record<string, { value?: string }> }> }> };
  };
  return Object.values(data.query?.pages || {}).map((page) => {
    const info = page.imageinfo?.[0] || {};
    const meta = info.extmetadata || {};
    return {
      id: page.pageid,
      title: (page.title || "").replace(/^File:/, ""),
      url: info.url || "",
      thumbUrl: info.url || "",
      author: meta.Artist?.value || "Unknown",
      license: meta.LicenseShortName?.value || "Public Domain / CC",
    };
  });
}

function photoPrompt(format: string, headline: string, fieldNotes: string) {
  const map: Record<string, string> = {
    article_hero: "16:9",
    social_feed: "4:5",
    podcast_square: "1:1",
  };
  const ar = map[format] || "16:9";
  const prompt = `${headline ? headline + ". " : ""}${fieldNotes ? fieldNotes + ". " : ""}Cinematic editorial photojournalism, documentary style, natural light --ar ${ar}`.trim();
  return { format, headline, prompt, aspectRatio: ar, tier: "prompt" as const };
}

type ImageHit = {
  id: string | number;
  title: string;
  url: string;
  thumbUrl: string;
  author: string;
  license: string;
  source: string;
};

async function searchOpenverse(query: string): Promise<ImageHit[]> {
  const response = await fetch(
    `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=8&mature=false`,
    { headers: { accept: "application/json" } },
  );
  if (!response.ok) return [];
  const data = (await response.json()) as {
    results?: Array<{ id: string; title?: string; url?: string; thumbnail?: string; creator?: string; license?: string }>;
  };
  return (data.results || []).map((item) => ({
    id: `ov-${item.id}`,
    title: item.title || query,
    url: item.url || item.thumbnail || "",
    thumbUrl: item.thumbnail || item.url || "",
    author: item.creator || "Unknown",
    license: item.license || "CC",
    source: "openverse",
  }));
}

async function searchGoogleCse(query: string, env: Env): Promise<ImageHit[]> {
  if (!env.GOOGLE_CSE_ID || !env.GOOGLE_CSE_KEY) return [];
  const url = `https://www.googleapis.com/customsearch/v1?searchType=image&safe=active&num=6&q=${encodeURIComponent(query)}&cx=${encodeURIComponent(env.GOOGLE_CSE_ID)}&key=${encodeURIComponent(env.GOOGLE_CSE_KEY)}`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = (await response.json()) as {
    items?: Array<{ title?: string; link?: string; image?: { thumbnailLink?: string }; displayLink?: string }>;
  };
  return (data.items || []).map((item, i) => ({
    id: `g-${i}-${item.link}`,
    title: item.title || query,
    url: item.link || "",
    thumbUrl: item.image?.thumbnailLink || item.link || "",
    author: item.displayLink || "Google",
    license: "Check source site",
    source: "google",
  }));
}

async function searchImages(query: string, env: Env): Promise<ImageHit[]> {
  const [wiki, openverse, google] = await Promise.all([
    searchCommons(query).catch(() => []),
    searchOpenverse(query).catch(() => []),
    searchGoogleCse(query, env).catch(() => []),
  ]);
  const wikiHits: ImageHit[] = wiki.map((hit) => ({ ...hit, source: "wikimedia" }));
  const merged = [...google, ...openverse, ...wikiHits].filter((hit) => hit.url && !looksPorn(hit.title));
  const seen = new Set<string>();
  return merged.filter((hit) => {
    if (seen.has(hit.url)) return false;
    seen.add(hit.url);
    return true;
  }).slice(0, 18);
}

function localIdeas(title: string, notes: string[]) {
  const stub = notes[0] || "Add a field note if you have one.";
  return {
    searchQueries: [title, `${title} news photo`, `${title} documentary still`],
    spiffs: [
      { headline: title, visual: "Tight documentary still, one human detail in frame.", hook: stub },
      { headline: `${title}: what still needs checking`, visual: "Empty podium / waiting room energy.", hook: "Idea only. Verify before you publish." },
      { headline: `Why ${title} matters tonight`, visual: "Clock, streetlight, notebook.", hook: "A why-now line, not a finished post." },
    ],
    articleIdeas: ["Lead with the scene you actually saw.", "List what is confirmed vs still unknown.", "Name who is affected in plain language."],
    socialIdeas: ["One sentence + one photo question.", "A thread outline: scene, stake, unanswered question.", "Do not auto-post. Copy if you want it."],
    podcastIdeas: ["Cold open: one sound or quote from the notes.", "Two segments: what happened / what it means.", "Export later into a real audio studio — this is an outline, not a show."],
    automates: false,
  };
}

async function geminiIdeas(apiKey: string, title: string, notes: string[]) {
  const prompt = `You are a newsroom idea editor, not a publisher. Do not write finished posts or scripts ready to ship. Return JSON keys: searchQueries (string[3]), spiffs (array of {headline, visual, hook}), articleIdeas (string[3]), socialIdeas (string[3]), podcastIdeas (string[3]). Headline: ${title}\nNotes:\n${notes.join("\n") || "(none)"}`;
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", maxOutputTokens: 2048, temperature: 0.4 },
    }),
    signal: AbortSignal.timeout(18000),
  });
  if (!response.ok) throw new Error(`Gemini ${response.status}`);
  const payload = (await response.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = payload.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  const parsed = JSON.parse(text) as Record<string, unknown>;
  const strings = (value: unknown) => (Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : []);
  const spiffs = Array.isArray(parsed.spiffs)
    ? parsed.spiffs.slice(0, 4).map((item) => {
        const row = item as { headline?: string; visual?: string; hook?: string };
        return { headline: String(row.headline || title), visual: String(row.visual || ""), hook: String(row.hook || "") };
      })
    : localIdeas(title, notes).spiffs;
  return {
    searchQueries: strings(parsed.searchQueries).slice(0, 6),
    spiffs,
    articleIdeas: strings(parsed.articleIdeas).slice(0, 5),
    socialIdeas: strings(parsed.socialIdeas).slice(0, 5),
    podcastIdeas: strings(parsed.podcastIdeas).slice(0, 5),
    automates: false,
  };
}

async function geminiRenderImage(apiKey: string, prompt: string, ageBand: string): Promise<string> {
  const ratingLine =
    ageBand === "kids"
      ? "G / Kids rated only. No violence, no sexual content, no nudity."
      : ageBand === "teen"
        ? "PG-13. Mild intensity only. No pornography. No nudity."
        : "Do not generate pornography or XXX sexual content. Documentary or artistic nudity is allowed.";
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent", {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `Editorial still. ${ratingLine} No logos, no celebrities. ${prompt}` }] }],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
    }),
    signal: AbortSignal.timeout(28000),
  });
  if (!response.ok) throw new Error(`Gemini image ${response.status}`);
  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { mimeType?: string; data?: string } }> } }>;
  };
  const part = payload.candidates?.[0]?.content?.parts?.find((item) => item.inlineData?.data);
  if (!part?.inlineData?.data) throw new Error("No image returned");
  return `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(req) });
    }
    if (!env.DATABASE_URL) return json({ error: "DATABASE_URL missing" }, 500);
    const sql = neon(env.DATABASE_URL);
    await ensureAgeSchema(sql);
    const { parts } = pathOf(req);
    const method = req.method.toUpperCase();

    try {
      if (parts[0] === "healthz" && method === "GET") {
        return json({ status: "ok" });
      }

      if (parts[0] === "s" && parts[1] && method === "GET") {
        const rows = await sql`
          select id, title, coalesce(visibility, 'public') as visibility, embargo_until as "embargoUntil"
          from stories where id = ${parts[1]} limit 1
        `;
        const story = rows[0] as { id: string; title: string; visibility: string; embargoUntil: string | null } | undefined;
        if (!story || story.visibility === "private") {
          return new Response("Not found", { status: 404, headers: { "content-type": "text/plain" } });
        }
        if (story.embargoUntil && new Date(story.embargoUntil).getTime() > Date.now()) {
          return new Response("Embargoed", { status: 403, headers: { "content-type": "text/plain" } });
        }
        const origin = "https://fieldpress.studio";
        const share = `${origin}/s/${story.id}`;
        const open = `${origin}/story/${story.id}`;
        const title = escapeHtml(story.title);
        const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"/>
<title>${title} — FieldPress</title>
<meta property="og:type" content="article"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="Field assignment on FieldPress. Copy this link for the desk."/>
<meta property="og:url" content="${share}"/>
<meta property="og:image" content="${origin}/icon-192.png"/>
<meta name="twitter:card" content="summary"/>
<link rel="canonical" href="${open}"/>
<meta http-equiv="refresh" content="0;url=${open}"/>
</head><body style="background:#000;color:#39ff14;font-family:sans-serif;padding:2rem">
<p>Assignment: <a href="${open}" style="color:#39ff14">${title}</a></p>
</body></html>`;
        return new Response(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=120" } });
      }

      if (parts[0] === "auth" && parts[1] === "register" && method === "POST") {
        const body = (await req.json()) as { email?: string; password?: string; displayName?: string; resetWord?: string; ageBand?: string };
        const email = (body.email || "").trim().toLowerCase();
        const password = body.password || "";
        const ageBand = parseAgeBand(body.ageBand);
        if (!email.includes("@") || password.length < 10) return json({ error: "Invalid email or password" }, 400);
        if (!ageBand) return json({ error: "Choose under 13, teenager, or over 18. We do not collect birthdays." }, 400);
        const existing = await sql`select id from users where email = ${email} limit 1`;
        if (existing.length) {
          return json({ error: "This email already has a desk. Sign in, or reset with your desk word." }, 409);
        }
        const userId = id();
        const displayName = (body.displayName || email.split("@")[0] || "Reporter").slice(0, 200);
        await sql`
          insert into users (id, email, display_name, status, password_hash, reset_word_hash, age_band)
          values (
            ${userId},
            ${email},
            ${displayName},
            'active',
            ${await hashSecret(password)},
            ${body.resetWord && body.resetWord.length >= 8 ? await hashSecret(body.resetWord) : null},
            ${ageBand}
          )
        `;
        const token = await createSession(sql, userId);
        return json({ user: { id: userId, email, displayName, ageBand } }, 201, { "set-cookie": cookieHeader(token) });
      }

      if (parts[0] === "auth" && parts[1] === "login" && method === "POST") {
        const body = (await req.json()) as { email?: string; password?: string };
        const email = (body.email || "").trim().toLowerCase();
        const rows = await sql`select id, email, display_name as "displayName", status, password_hash as "passwordHash", reset_word_hash as "resetWordHash", coalesce(age_band, 'teen') as "ageBand", coalesce(role, 'user') as role from users where email = ${email} limit 1`;
        const user = rows[0] as
          | { id: string; email: string; displayName: string; status: string; passwordHash: string; resetWordHash?: string | null; ageBand?: string; role?: string }
          | undefined;
        const password = body.password || "";
        const passwordOk = user?.passwordHash ? await verifySecret(password, user.passwordHash) : false;
        const deskWordOk = user?.resetWordHash ? await verifySecret(password, user.resetWordHash) : false;
        if (!user || (!passwordOk && !deskWordOk)) {
          return json({ error: "Invalid email or password" }, 401);
        }
        if (user.status !== "active" && user.status !== "superadmin") return json({ error: "Account is not active" }, 403);
        const token = await createSession(sql, user.id);
        return json(
          {
            user: {
              id: user.id,
              email: user.email,
              displayName: user.displayName,
              ageBand: user.ageBand || "teen",
              role: user.role === "superadmin" || user.status === "superadmin" ? "superadmin" : "user",
            },
          },
          200,
          { "set-cookie": cookieHeader(token) },
        );
      }

      if (parts[0] === "auth" && parts[1] === "logout" && method === "POST") {
        const token = readCookie(req, COOKIE);
        if (token) {
          const tokenHash = await sha256(token);
          await sql`delete from sessions where token_hash = ${tokenHash}`;
        }
        return new Response(null, {
          status: 204,
          headers: { "set-cookie": `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure` },
        });
      }

      if (parts[0] === "auth" && parts[1] === "me" && method === "GET") {
        const user = await userFromSession(sql, req);
        if (!user) return json({ error: "Sign in required" }, 401);
        return json({ user });
      }

      if (parts[0] === "auth" && parts[1] === "me" && method === "PATCH") {
        const user = await userFromSession(sql, req);
        if (!user) return json({ error: "Sign in required" }, 401);
        const body = (await req.json()) as { deskLinks?: Record<string, string> };
        const links = {
          twitter: String(body.deskLinks?.twitter || "").slice(0, 400),
          facebook: String(body.deskLinks?.facebook || "").slice(0, 400),
          reddit: String(body.deskLinks?.reddit || "").slice(0, 400),
          instagram: String(body.deskLinks?.instagram || "").slice(0, 400),
          bluesky: String(body.deskLinks?.bluesky || "").slice(0, 400),
          youtube: String(body.deskLinks?.youtube || "").slice(0, 400),
          podcastRss: String(body.deskLinks?.podcastRss || "").slice(0, 400),
          podcastFolder: String(body.deskLinks?.podcastFolder || "").slice(0, 800),
        };
        await sql`update users set desk_links = ${JSON.stringify(links)}::jsonb where id = ${user.id}`;
        return json({ user: { ...user, deskLinks: links } });
      }

      if (parts[0] === "auth" && parts[1] === "forgot-password" && method === "POST") {
        return json({ ok: true });
      }

      if (parts[0] === "auth" && parts[1] === "reset-password" && method === "POST") {
        const body = (await req.json()) as { email?: string; resetWord?: string; password?: string; token?: string };
        if (!body.password || body.password.length < 10) return json({ error: "Password too short" }, 400);
        if (body.email && body.resetWord) {
          const email = body.email.trim().toLowerCase();
          const rows = await sql`select id, reset_word_hash as "resetWordHash" from users where email = ${email} limit 1`;
          const user = rows[0] as { id: string; resetWordHash: string | null } | undefined;
          if (!user?.resetWordHash || !(await verifySecret(body.resetWord, user.resetWordHash))) {
            return json({ error: "Email or desk word did not match" }, 401);
          }
          await sql`update users set password_hash = ${await hashSecret(body.password)} where id = ${user.id}`;
          await sql`delete from sessions where user_id = ${user.id}`;
          const token = await createSession(sql, user.id);
          return json({ ok: true }, 200, { "set-cookie": cookieHeader(token) });
        }
        return json({ error: "Use desk word reset, or set RESEND later for email links" }, 400);
      }

      const user = await userFromSession(sql, req);
      const ageBand = parseAgeBand(user?.ageBand) || "teen";
      const userId = user?.id ?? null;

      if (parts[0] === "dashboard" && method === "GET") {
        const [totals] = (await sql`
          select
            (select count(*)::int from stories where coalesce(visibility, 'public') <> 'private' or owner_id = ${userId}) as "totalStories",
            (select count(*)::int from stories where (coalesce(visibility, 'public') <> 'private' or owner_id = ${userId}) and status = 'active') as "activeStories",
            (select count(*)::int from stories where (coalesce(visibility, 'public') <> 'private' or owner_id = ${userId}) and status = 'archived') as "archivedStories",
            (select count(*)::int from story_items i join stories s on s.id = i.story_id where coalesce(s.visibility, 'public') <> 'private' or s.owner_id = ${userId}) as "totalItems",
            (select count(*)::int from drafts d join stories s on s.id = d.story_id where coalesce(s.visibility, 'public') <> 'private' or s.owner_id = ${userId}) as "totalDrafts"
        `) as Record<string, number>[];
        return json({ ...totals, recentStories: [] });
      }

      if (parts[0] === "stories" && parts.length === 1 && method === "GET") {
        const url = new URL(req.url);
        const status = url.searchParams.get("status");
        const stories = status
          ? await sql`
              select id, title, status, owner_id as "ownerId", coalesce(visibility, 'public') as visibility, coalesce(nsfw, 0) as nsfw,
                embargo_until as "embargoUntil", created_at as "createdAt", updated_at as "updatedAt"
              from stories
              where (coalesce(visibility, 'public') <> 'private' or owner_id = ${userId}) and status = ${status}
              order by updated_at desc
            `
          : await sql`
              select id, title, status, owner_id as "ownerId", coalesce(visibility, 'public') as visibility, coalesce(nsfw, 0) as nsfw,
                embargo_until as "embargoUntil", created_at as "createdAt", updated_at as "updatedAt"
              from stories
              where coalesce(visibility, 'public') <> 'private' or owner_id = ${userId}
              order by updated_at desc
            `;
        const result = [];
        for (const s of stories as StoryRow[]) {
          const packed = await storyWithItems(sql, userId, s.id, ageBand);
          if (packed && embargoOpen(packed as StoryRow, userId)) result.push(packed);
        }
        return json(result);
      }

      if (parts[0] === "stories" && parts[1] === "import" && method === "POST") {
        const body = (await req.json()) as { title?: string; items?: { type: string; content: string }[] };
        const storyId = id();
        const title = (body.title || "Imported Story").slice(0, 255);
        const blob = [title, ...(body.items || []).map((i) => i.content)].join(" ");
        if (looksPorn(blob)) return json({ error: PORN_BLOCK }, 400);
        await sql`
          insert into stories (id, owner_id, title, status, visibility, nsfw, content_rating)
          values (${storyId}, ${userId}, ${title}, 'active', 'public', 0, ${contentRating(blob)})
        `;
        for (const item of body.items || []) {
          await sql`insert into story_items (id, story_id, type, content) values (${id()}, ${storyId}, ${item.type || "note"}, ${item.content || ""})`;
        }
        return json(await storyWithItems(sql, userId, storyId, ageBand), 201);
      }

      if (parts[0] === "stories" && parts.length === 1 && method === "POST") {
        const body = (await req.json()) as { id?: string; title?: string; status?: string; private?: boolean };
        if (body.private && !userId) return json({ error: "Sign in required to keep a story private" }, 401);
        const storyId = body.id || id();
        const title = (body.title || "Untitled").slice(0, 255);
        if (looksPorn(title)) return json({ error: PORN_BLOCK }, 400);
        const visibility = body.private ? "private" : "public";
        const owner = body.private ? userId : userId;
        await sql`
          insert into stories (id, owner_id, title, status, visibility, nsfw, content_rating)
          values (${storyId}, ${owner}, ${title}, ${body.status || "active"}, ${visibility}, 0, ${contentRating(title)})
        `;
        return json(await storyWithItems(sql, userId, storyId, ageBand), 201);
      }

      if ((parts[0] === "stories" && parts[1] && parts[2] === "produce" && method === "POST") || (parts[0] === "stories" && parts[1] && parts[2] === "ideas" && method === "POST")) {
        const story = await storyWithItems(sql, userId, parts[1], ageBand);
        if (!story) return json({ error: "Story not found" }, 404);
        const notes = ((story as { items: Array<{ type: string; content: string }> }).items || [])
          .filter((item) => item.type === "note" || item.type === "text")
          .map((item) => item.content);
        let ideas = localIdeas(story.title, notes);
        if (env.GEMINI_API_KEY) {
          try {
            ideas = await geminiIdeas(env.GEMINI_API_KEY, story.title, notes);
          } catch {
            ideas = localIdeas(story.title, notes);
          }
        }
        return json({
          ...ideas,
          summary: ideas.spiffs[0]?.hook || story.title,
          caption: ideas.spiffs[0]?.headline || story.title,
          drafts: [],
          automates: false,
        });
      }

      if (parts[0] === "stories" && parts[1] && parts[2] === "images" && parts[3] === "search" && method === "POST") {
        const body = (await req.json()) as { query?: string };
        const query = (body.query || "").trim();
        if (!query) return json({ error: "Query is required" }, 400);
        if (looksPorn(query)) return json({ error: PORN_BLOCK }, 400);
        if (!canSeeRating(contentRating(query), ageBand, false)) {
          return json({ error: "That search is outside this desk’s rating." }, 403);
        }
        return json(await searchImages(query, env));
      }

      if (parts[0] === "stories" && parts[1] && parts[2] === "images" && parts[3] === "generate" && method === "POST") {
        if (!userId) return json({ error: "Sign in required for image rendering" }, 401);
        if (!env.GEMINI_API_KEY) return json({ error: "Image rendering is not configured" }, 503);
        const body = (await req.json()) as { prompt?: string; format?: string; headline?: string; fieldNotes?: string };
        const built = photoPrompt(body.format || "article_hero", body.headline || "", body.fieldNotes || "");
        const prompt = (body.prompt || built.prompt).slice(0, 1200);
        if (looksPorn(prompt, body.headline || "", body.fieldNotes || "")) return json({ error: PORN_BLOCK }, 400);
        if (!canSeeRating(contentRating(prompt), ageBand, false)) {
          return json({ error: "That render is outside this desk’s rating." }, 403);
        }
        try {
          const dataUrl = await geminiRenderImage(env.GEMINI_API_KEY, prompt, ageBand);
          return json({ dataUrl, prompt, tier: "registered" });
        } catch (err) {
          return json({ error: err instanceof Error ? err.message : "Render failed", prompt, tier: "registered" }, 502);
        }
      }

      if (parts[0] === "stories" && parts[1] && parts[2] === "images" && parts[3] === "generate-prompt" && method === "POST") {
        const body = (await req.json()) as { format?: string; headline?: string; fieldNotes?: string };
        if (looksPorn(body.headline || "", body.fieldNotes || "")) return json({ error: PORN_BLOCK }, 400);
        if (!canSeeRating(contentRating(`${body.headline || ""} ${body.fieldNotes || ""}`), ageBand, false)) {
          return json({ error: "That prompt is outside this desk’s rating." }, 403);
        }
        return json(photoPrompt(body.format || "article_hero", body.headline || "", body.fieldNotes || ""));
      }

      if (parts[0] === "stories" && parts[1] && parts.length === 2 && method === "GET") {
        const story = await storyWithItems(sql, userId, parts[1], ageBand);
        if (!story) return json({ error: "Not found" }, 404);
        if (!embargoOpen(story as StoryRow, userId)) return json({ error: "Embargoed" }, 403);
        return json(story);
      }

      if (parts[0] === "stories" && parts[1] && parts.length === 2 && method === "DELETE") {
        const rows = await sql`select owner_id as "ownerId" from stories where id = ${parts[1]} limit 1`;
        const row = rows[0] as { ownerId: string | null } | undefined;
        if (!row) return json({ error: "Not found" }, 404);
        if (row.ownerId && row.ownerId !== userId) return json({ error: "Only the owner can delete this story" }, 403);
        await sql`delete from stories where id = ${parts[1]}`;
        return empty();
      }

      if (parts[0] === "stories" && parts[2] === "items" && method === "POST") {
        const story = await storyWithItems(sql, userId, parts[1], ageBand);
        if (!story) return json({ error: "Story not found" }, 404);
        const body = (await req.json()) as { id?: string; type?: string; content?: string };
        const itemType = body.type || "note";
        if (itemType === "audio" && !userId) {
          return json({ error: "Sign in required to capture audio from this device" }, 401);
        }
        if (itemType === "photo" && (body.content || "").startsWith("data:") && !userId) {
          return json({ error: "Sign in required to capture photos from this device" }, 401);
        }
        if (looksPorn(body.content || "")) return json({ error: PORN_BLOCK }, 400);
        const itemId = body.id || id();
        await sql`insert into story_items (id, story_id, type, content) values (${itemId}, ${parts[1]}, ${itemType}, ${body.content || ""})`;
        await sql`update stories set updated_at = now() where id = ${parts[1]}`;
        const item = await sql`select id, story_id as "storyId", type, content, created_at as "createdAt" from story_items where id = ${itemId}`;
        return json(item[0], 201);
      }

      if (parts[0] === "stories" && parts[2] === "items" && method === "DELETE") {
        const story = await storyWithItems(sql, userId, parts[1], ageBand);
        if (!story) return json({ error: "Story not found" }, 404);
        await sql`delete from story_items where id = ${parts[3]} and story_id = ${parts[1]}`;
        return empty();
      }

      if (parts[0] === "stories" && parts[2] === "drafts" && parts.length === 3 && method === "GET") {
        const story = await storyWithItems(sql, userId, parts[1], ageBand);
        if (!story) return json({ error: "Not found" }, 404);
        const drafts = await sql`select * from drafts where story_id = ${parts[1]} order by updated_at desc`;
        return json(drafts);
      }

      if (parts[0] === "stories" && parts[2] === "drafts" && parts.length === 3 && method === "POST") {
        const story = await storyWithItems(sql, userId, parts[1], ageBand);
        if (!story) return json({ error: "Story not found" }, 404);
        const body = (await req.json()) as { mode?: string; title?: string; content?: string };
        const draftId = id();
        await sql`
          insert into drafts (id, story_id, mode, title, content)
          values (${draftId}, ${parts[1]}, ${body.mode || "article"}, ${body.title || ""}, ${body.content || ""})
        `;
        const draft = await sql`select * from drafts where id = ${draftId}`;
        return json(draft[0], 201);
      }

      if (parts[0] === "stories" && parts[2] === "desk" && method === "PATCH") {
        const story = await storyWithItems(sql, userId, parts[1], ageBand);
        if (!story) return json({ error: "Story not found" }, 404);
        const body = (await req.json()) as { embargoUntil?: string | null; deskChecks?: Record<string, unknown> };
        const embargo = body.embargoUntil ? body.embargoUntil : null;
        const checks = JSON.stringify(body.deskChecks || {});
        await sql`update stories set embargo_until = ${embargo}, desk_checks = ${checks}::jsonb, updated_at = now() where id = ${parts[1]}`;
        return json(await storyWithItems(sql, userId, parts[1], ageBand));
      }

      if (parts[0] === "stories" && parts[2] === "tips" && method === "GET") {
        const story = await storyWithItems(sql, userId, parts[1], ageBand);
        if (!story) return json({ error: "Story not found" }, 404);
        const rows = await sql`select id, story_id as "storyId", body, from_name as "fromName", created_at as "createdAt" from desk_tips where story_id = ${parts[1]} order by created_at desc`;
        return json(rows);
      }

      if (parts[0] === "stories" && parts[2] === "tips" && method === "POST") {
        const story = await storyWithItems(sql, userId, parts[1], ageBand);
        if (!story) return json({ error: "Story not found" }, 404);
        const body = (await req.json()) as { body?: string; fromName?: string };
        const text = (body.body || "").trim();
        if (!text) return json({ error: "Tip is empty" }, 400);
        if (looksPorn(text)) return json({ error: PORN_BLOCK }, 400);
        const tipId = id();
        await sql`insert into desk_tips (id, story_id, body, from_name) values (${tipId}, ${parts[1]}, ${text.slice(0, 4000)}, ${(body.fromName || "Anonymous").slice(0, 200)})`;
        const rows = await sql`select id, story_id as "storyId", body, from_name as "fromName", created_at as "createdAt" from desk_tips where id = ${tipId}`;
        return json(rows[0], 201);
      }

      if (parts[0] === "tips" && parts.length === 1 && method === "GET") {
        const rows = await sql`
          select t.id, t.story_id as "storyId", s.title as "storyTitle", t.body, t.from_name as "fromName", t.created_at as "createdAt"
          from desk_tips t left join stories s on s.id = t.story_id
          order by t.created_at desc limit 80
        `;
        return json(rows);
      }

      if (parts[0] === "stories" && parts[2] === "notes" && method === "GET") {
        const story = await storyWithItems(sql, userId, parts[1], ageBand);
        if (!story) return json({ error: "Story not found" }, 404);
        const rows = await sql`select id, story_id as "storyId", body, from_name as "fromName", created_at as "createdAt" from desk_notes where story_id = ${parts[1]} order by created_at asc`;
        return json(rows);
      }

      if (parts[0] === "stories" && parts[2] === "notes" && method === "POST") {
        const story = await storyWithItems(sql, userId, parts[1], ageBand);
        if (!story) return json({ error: "Story not found" }, 404);
        const body = (await req.json()) as { body?: string; fromName?: string };
        const text = (body.body || "").trim();
        if (!text) return json({ error: "Note is empty" }, 400);
        const noteId = id();
        await sql`insert into desk_notes (id, story_id, body, from_name) values (${noteId}, ${parts[1]}, ${text.slice(0, 4000)}, ${(body.fromName || "Desk").slice(0, 200)})`;
        const rows = await sql`select id, story_id as "storyId", body, from_name as "fromName", created_at as "createdAt" from desk_notes where id = ${noteId}`;
        return json(rows[0], 201);
      }

      if (parts[0] === "stories" && parts[2] === "rss" && method === "GET") {
        const story = await storyWithItems(sql, userId, parts[1], ageBand);
        if (!story || !embargoOpen(story as StoryRow, userId)) return json({ error: "Not found" }, 404);
        const drafts = await sql`select mode, title, content, updated_at as "updatedAt" from drafts where story_id = ${parts[1]} order by updated_at desc`;
        const origin = "https://fieldpress.studio";
        const items = (drafts as Array<{ mode: string; title: string; content: string; updatedAt: string }>)
          .map((draft) => {
            const title = escapeHtml(draft.title || `${story.title} ${draft.mode}`);
            const desc = escapeHtml(draft.content.slice(0, 2000));
            return `<item><title>${title}</title><link>${origin}/story/${parts[1]}</link><guid>${origin}/story/${parts[1]}/${draft.mode}</guid><pubDate>${new Date(draft.updatedAt).toUTCString()}</pubDate><description><![CDATA[${desc}]]></description></item>`;
          })
          .join("");
        const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeHtml(story.title)} — FieldPress drafts</title><link>${origin}/s/${parts[1]}</link><description>Draft items for the assignment desk. Not a published feed.</description>${items}</channel></rss>`;
        return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
      }

      if (parts[0] === "stories" && parts[2] === "chapters" && method === "GET") {
        const story = await storyWithItems(sql, userId, parts[1], ageBand);
        if (!story) return json({ error: "Story not found" }, 404);
        const drafts = await sql`select content from drafts where story_id = ${parts[1]} and mode = 'podcast' order by updated_at desc limit 1`;
        const content = (drafts[0] as { content?: string } | undefined)?.content || "";
        const chapters = parseChapters(content);
        return json({
          version: "1.0.0",
          title: story.title,
          chapters,
          vendors: { descript: chapters, riverside: chapters.map((c) => ({ start: c.start, title: c.title })) },
        });
      }

      return json({ error: "Not found" }, 404);
    } catch (err) {
      return json({ error: err instanceof Error ? err.message : "Server error" }, 500);
    }
  },
};
