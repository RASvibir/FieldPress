# FieldPress share-preview routing

## Purpose

Pressie share links use `https://fieldpress.studio/s/<pressie-id>`.

The `fieldpress-api` Cloudflare Worker serves crawler-readable HTML at this path. It provides Open Graph and Twitter metadata for public, active, non-embargoed Pressies, then gives human visitors a short handoff to the canonical FieldPress page at `https://fieldpress.studio/story/<pressie-id>`.

This is preview rendering only. FieldPress social distribution remains an explicit creator-approved compose/copy handoff; this Worker does not publish directly to social platforms.

## Scoped routes

Keep the Cloudflare Worker restricted to these paths, as declared in `workers/fieldpress-api/wrangler.toml`:

```toml
[[routes]]
pattern = "fieldpress.studio/s/*"
zone_name = "fieldpress.studio"

[[routes]]
pattern = "www.fieldpress.studio/s/*"
zone_name = "fieldpress.studio"

[[routes]]
pattern = "app.fieldpress.studio/s/*"
zone_name = "fieldpress.studio"
```

Do not route the rest of the hostname through the Worker. FieldPress continues to be served by Vercel outside `/s/*`.

## Required configuration

The deployed Worker needs a server-only `DATABASE_URL` configured through Cloudflare secrets. It must point to the same live FieldPress database used by the API.

Never place this value in `wrangler.toml`, browser code, source control, screenshots, or logs. The `/s/:id` handler must remain read-only and must not execute schema initialization or migrations.

## Preview validation

From `workers/fieldpress-api`:

```bash
npm ci
npx wrangler deploy --dry-run
```

Deploy first to a preview Worker or workers.dev URL using a preview database secret. Test with a real public, active, non-embargoed Pressie ID:

```bash
curl -sS -D - "https://<preview-worker-url>/s/<pressie-id>" -o /tmp/pressie-share.html
grep -E 'og:title|og:description|og:image|twitter:card|canonical' /tmp/pressie-share.html
```

Confirm the response is 200, all shared URLs are absolute HTTPS URLs, and the Pressie title/excerpt are correct. Confirm missing, private, inactive, and embargoed Pressies return the generic noindex 404 page without exposing private content or implementation errors.

## Production activation

After explicit production approval:

```bash
npx wrangler deploy
```

Verify the scoped live route immediately:

```bash
curl -sS -D - "https://fieldpress.studio/s/<pressie-id>" -o /tmp/fieldpress-share.html
grep -E 'og:title|og:description|og:image|twitter:card|canonical' /tmp/fieldpress-share.html
```

Use each social platform’s card inspector/cache refresh feature after the route is live, because platforms cache link previews independently.

## Caching and rollback

Public previews use:

```text
Cache-Control: public, max-age=300, s-maxage=300
```

Unavailable previews use `Cache-Control: no-store`. Allow five minutes after changing a public Pressie before expecting the edge cache to refresh; third-party social caches can take longer.

To roll back, revert or redeploy the previous Worker version, or remove only the three `/s/*` Worker routes. Do not change FieldPress’s Vercel deployment, primary domains, or unrelated Cloudflare routes.
