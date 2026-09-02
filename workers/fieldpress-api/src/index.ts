import { neon } from "@neondatabase/serverless";

type Env = {
  DATABASE_URL: string;
  AUTH_SECRET?: string;
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
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
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
    select u.id, u.email, u.display_name as "displayName", u.status, s.expires_at as "expiresAt"
    from sessions s
    join users u on u.id = s.user_id
    where s.token_hash = ${tokenHash}
    limit 1
  `;
  const row = rows[0] as
    | { id: string; email: string; displayName: string; status: string; expiresAt: string }
    | undefined;
  if (!row || row.status !== "active" || new Date(row.expiresAt).getTime() < Date.now()) return null;
  return { id: row.id, email: row.email, displayName: row.displayName };
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

async function storyWithItems(sql: Sql, userId: string, storyId: string) {
  const stories = await sql`
    select id, title, status, created_at as "createdAt", updated_at as "updatedAt"
    from stories
    where id = ${storyId} and (owner_id = ${userId} or owner_id is null)
    limit 1
  `;
  const story = stories[0];
  if (!story) return null;
  const items = await sql`
    select id, story_id as "storyId", type, content, created_at as "createdAt"
    from story_items where story_id = ${storyId}
    order by created_at desc
  `;
  return { ...story, items };
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(req) });
    }
    if (!env.DATABASE_URL) return json({ error: "DATABASE_URL missing" }, 500);
    const sql = neon(env.DATABASE_URL);
    const { parts } = pathOf(req);
    const method = req.method.toUpperCase();

    try {
      if (parts[0] === "healthz" && method === "GET") {
        return json({ status: "ok" });
      }

      if (parts[0] === "auth" && parts[1] === "register" && method === "POST") {
        const body = (await req.json()) as { email?: string; password?: string; displayName?: string; resetWord?: string };
        const email = (body.email || "").trim().toLowerCase();
        const password = body.password || "";
        if (!email.includes("@") || password.length < 10) return json({ error: "Invalid email or password" }, 400);
        const existing = await sql`select id from users where email = ${email} limit 1`;
        if (existing.length) return json({ error: "An account with that email already exists" }, 409);
        const userId = id();
        const displayName = (body.displayName || email.split("@")[0] || "Reporter").slice(0, 200);
        await sql`
          insert into users (id, email, display_name, status, password_hash, reset_word_hash)
          values (
            ${userId},
            ${email},
            ${displayName},
            'active',
            ${await hashSecret(password)},
            ${body.resetWord && body.resetWord.length >= 8 ? await hashSecret(body.resetWord) : null}
          )
        `;
        const token = await createSession(sql, userId);
        return json({ user: { id: userId, email, displayName } }, 201, { "set-cookie": cookieHeader(token) });
      }

      if (parts[0] === "auth" && parts[1] === "login" && method === "POST") {
        const body = (await req.json()) as { email?: string; password?: string };
        const email = (body.email || "").trim().toLowerCase();
        const rows = await sql`select id, email, display_name as "displayName", status, password_hash as "passwordHash" from users where email = ${email} limit 1`;
        const user = rows[0] as
          | { id: string; email: string; displayName: string; status: string; passwordHash: string }
          | undefined;
        if (!user?.passwordHash || !(await verifySecret(body.password || "", user.passwordHash))) {
          return json({ error: "Invalid email or password" }, 401);
        }
        if (user.status !== "active") return json({ error: "Account is not active" }, 403);
        const token = await createSession(sql, user.id);
        return json(
          { user: { id: user.id, email: user.email, displayName: user.displayName } },
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
      if (!user) return json({ error: "Sign in required" }, 401);

      if (parts[0] === "dashboard" && method === "GET") {
        const [totals] = (await sql`
          select
            (select count(*)::int from stories where owner_id = ${user.id} or owner_id is null) as "totalStories",
            (select count(*)::int from stories where (owner_id = ${user.id} or owner_id is null) and status = 'active') as "activeStories",
            (select count(*)::int from stories where (owner_id = ${user.id} or owner_id is null) and status = 'archived') as "archivedStories",
            (select count(*)::int from story_items i join stories s on s.id = i.story_id where s.owner_id = ${user.id} or s.owner_id is null) as "totalItems",
            (select count(*)::int from drafts d join stories s on s.id = d.story_id where s.owner_id = ${user.id} or s.owner_id is null) as "totalDrafts"
        `) as Record<string, number>[];
        return json({ ...totals, recentStories: [] });
      }

      if (parts[0] === "stories" && parts.length === 1 && method === "GET") {
        const url = new URL(req.url);
        const status = url.searchParams.get("status");
        const stories = status
          ? await sql`select id, title, status, created_at as "createdAt", updated_at as "updatedAt" from stories where (owner_id = ${user.id} or owner_id is null) and status = ${status} order by updated_at desc`
          : await sql`select id, title, status, created_at as "createdAt", updated_at as "updatedAt" from stories where owner_id = ${user.id} or owner_id is null order by updated_at desc`;
        const result = [];
        for (const s of stories as { id: string }[]) {
          const items = await sql`
            select id, story_id as "storyId", type, content, created_at as "createdAt"
            from story_items where story_id = ${s.id} order by created_at desc
          `;
          result.push({ ...s, items });
        }
        return json(result);
      }

      if (parts[0] === "stories" && parts[1] === "import" && method === "POST") {
        const body = (await req.json()) as { title?: string; items?: { type: string; content: string }[] };
        const storyId = id();
        const title = (body.title || "Imported Story").slice(0, 255);
        await sql`insert into stories (id, owner_id, title, status) values (${storyId}, ${user.id}, ${title}, 'active')`;
        for (const item of body.items || []) {
          await sql`insert into story_items (id, story_id, type, content) values (${id()}, ${storyId}, ${item.type || "note"}, ${item.content || ""})`;
        }
        return json(await storyWithItems(sql, user.id, storyId), 201);
      }

      if (parts[0] === "stories" && parts.length === 1 && method === "POST") {
        const body = (await req.json()) as { id?: string; title?: string; status?: string };
        const storyId = body.id || id();
        await sql`
          insert into stories (id, owner_id, title, status)
          values (${storyId}, ${user.id}, ${(body.title || "Untitled").slice(0, 255)}, ${body.status || "active"})
        `;
        return json(await storyWithItems(sql, user.id, storyId), 201);
      }

      if (parts[0] === "stories" && parts[1] && parts.length === 2 && method === "GET") {
        const story = await storyWithItems(sql, user.id, parts[1]);
        if (!story) return json({ error: "Not found" }, 404);
        return json(story);
      }

      if (parts[0] === "stories" && parts[1] && parts.length === 2 && method === "DELETE") {
        const owned = await sql`select id from stories where id = ${parts[1]} and (owner_id = ${user.id} or owner_id is null) limit 1`;
        if (!owned.length) return json({ error: "Not found" }, 404);
        await sql`delete from stories where id = ${parts[1]}`;
        return empty();
      }

      if (parts[0] === "stories" && parts[2] === "items" && method === "POST") {
        const owned = await sql`select id from stories where id = ${parts[1]} and (owner_id = ${user.id} or owner_id is null) limit 1`;
        if (!owned.length) return json({ error: "Story not found" }, 404);
        const body = (await req.json()) as { id?: string; type?: string; content?: string };
        const itemId = body.id || id();
        await sql`insert into story_items (id, story_id, type, content) values (${itemId}, ${parts[1]}, ${body.type || "note"}, ${body.content || ""})`;
        await sql`update stories set updated_at = now() where id = ${parts[1]}`;
        const item = await sql`select id, story_id as "storyId", type, content, created_at as "createdAt" from story_items where id = ${itemId}`;
        return json(item[0], 201);
      }

      if (parts[0] === "stories" && parts[2] === "items" && method === "DELETE") {
        const owned = await sql`select id from stories where id = ${parts[1]} and (owner_id = ${user.id} or owner_id is null) limit 1`;
        if (!owned.length) return json({ error: "Story not found" }, 404);
        await sql`delete from story_items where id = ${parts[3]} and story_id = ${parts[1]}`;
        return empty();
      }

      if (parts[0] === "stories" && parts[2] === "drafts" && parts.length === 3 && method === "GET") {
        const owned = await sql`select id from stories where id = ${parts[1]} and (owner_id = ${user.id} or owner_id is null) limit 1`;
        if (!owned.length) return json({ error: "Not found" }, 404);
        const drafts = await sql`select * from drafts where story_id = ${parts[1]} order by updated_at desc`;
        return json(drafts);
      }

      if (parts[0] === "stories" && parts[2] === "drafts" && parts.length === 3 && method === "POST") {
        const owned = await sql`select id from stories where id = ${parts[1]} and (owner_id = ${user.id} or owner_id is null) limit 1`;
        if (!owned.length) return json({ error: "Story not found" }, 404);
        const body = (await req.json()) as { mode?: string; title?: string; content?: string };
        const draftId = id();
        await sql`
          insert into drafts (id, story_id, mode, title, content)
          values (${draftId}, ${parts[1]}, ${body.mode || "article"}, ${body.title || ""}, ${body.content || ""})
        `;
        const draft = await sql`select * from drafts where id = ${draftId}`;
        return json(draft[0], 201);
      }

      return json({ error: "Not found" }, 404);
    } catch (err) {
      return json({ error: err instanceof Error ? err.message : "Server error" }, 500);
    }
  },
};
