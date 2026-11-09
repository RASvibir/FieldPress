# imbrgr ↔ FieldPress (cross-product links)

Keep branding light: **favicon + short label** in headers; full handoffs use query params / postMessage, not banners.

## imbrgr → FieldPress (“Share with FieldPress”)

When the user finishes an image in imbrgr studio:

### Deep link (top-level / new tab)

```
{FIELDPRESS_PUBLIC_URL}/?compose=1&image={encodeURIComponent(httpsImageUrl)}&title={optional}&draft={optional}
```

- `image` must be HTTPS on allowed hosts (`imbrgr.website`, `imbrgr.vercel.app`, preview `imbrgr-*.vercel.app`) — see `parseComposeImageParam`.
- `draft` optional — when present, FieldPress reopens that draft and attaches the image; toast **Image added**.

Implementation reference: `buildComposeDeepLink()` in FieldPress `src/lib/composeLinks.ts`.

### postMessage (iframe embed)

```json
{ "type": "imbrgr:compose-image", "imageUrl": "https://…", "draftId": "Fp_…", "title": "…" }
```

Posted to the FieldPress origin. FieldPress validates origin + image host via `parseImbrgrComposeMessage`.

Suggested UI on imbrgr:

- Label: **Share with FieldPress**
- Icon: FieldPress favicon optional; avoid large banners
- Prefer postMessage when `window.parent !== window`; else navigate/open compose URL

## FieldPress → imbrgr

| Entry | Behavior |
|-------|----------|
| Header **imbrgr** link | `IMBRGR_URL` (default `https://imbrgr.website`) |
| Compose **Visual** tray | Pressy'o **Suggest prompt** + embedded iframe via `buildImbrgrEmbedUrl` |
| **Apply to studio** / refresh | Reloads iframe with current prompt + draft |
| **Full studio** | `buildImbrgrCreateImageUrl` in a new tab |

### Embed URL

```
{IMBRGR_URL}/studio?tab=generate&embed=1&from=fieldpress&draft=<id>&prompt=<text>
```

imbrgr should honor `embed=1` (minimal chrome + CSP `frame-ancestors` for FieldPress). Spec for imbrgr: `docs/FIELDPRESS-EMBED.md` in the imbrgr repo.

## Env

| App | Variable |
|-----|----------|
| FieldPress | `VITE_FIELDPRESS_PUBLIC_URL` (optional) |
| FieldPress | `VITE_IMBRGR_URL` (optional; default `https://imbrgr.website`) |
| imbrgr | `NEXT_PUBLIC_SITE_URL` for absolute media file URLs |
