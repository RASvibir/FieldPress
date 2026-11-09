# imbrgr ↔ FieldPress (cross-product links)

Keep branding light: **favicon + short label** in headers; full handoffs use query params, not banners.

## imbrgr → FieldPress (“Share with FieldPress”)

Use when the user finishes an image in imbrgr studio:

```
{FIELDPRESS_PUBLIC_URL}/?compose=1&image={encodeURIComponent(httpsImageUrl)}&title={optional}&draft={optional}
```

- `image` must be HTTPS on allowed hosts (see `parseComposeImageParam` in FieldPress).
- `draft` optional — when present, FieldPress reopens that draft and attaches the image; toast **Image added**.

Implementation reference: `buildComposeDeepLink()` in `src/lib/composeLinks.ts`.

Suggested UI on imbrgr (mirror FieldPress header link):

- Label: **FieldPress ↗** or **Share with FieldPress**
- Icon: FieldPress `/pressie.svg` or site favicon at ~16px
- `target="_blank"` `rel="noopener noreferrer"`

## FieldPress → imbrgr

| Entry | Behavior |
|-------|----------|
| Header **imbrgr** link | `IMBRGR_URL` (studio home) |
| Compose **Visual** tray | Embedded iframe via `buildImbrgrEmbedUrl({ embed: "1", draftId, prompt })` |
| **Full studio** / handoff | `buildImbrgrCreateImageUrl({ draftId, prompt })` (new tab or navigate) |
| Image prompt | FieldPress **Suggest prompt** (Pressy'o text only) → sent as `prompt` query param |

Return URL from imbrgr should include `from=fieldpress&draft=<id>` on studio links (already supported).

### imbrgr embed mode (recommended in imbrgr repo)

When `embed=1` is present on `/studio`:

- Hide global marketing chrome; keep generate + edit controls.
- Optional `postMessage` to parent on export: `{ type: "imbrgr:compose-image", imageUrl, draftId }` so FieldPress can attach without a full navigation (FieldPress already supports `/?compose=1&image=`).
- Allow framing from FieldPress origins (`fieldpress.studio`, preview hosts).

## Env

| App | Variable |
|-----|----------|
| FieldPress | `VITE_FIELDPRESS_PUBLIC_URL` (optional) |
| FieldPress | `IMBRGR_URL` in `src/config/site.ts` |
