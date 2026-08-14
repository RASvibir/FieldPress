# FieldPress

Pocket newsroom for indie journalists. Capture in the field, then produce article, social, and podcast drafts with Gemini.

## How to open it

From the repo root:

```bash
pnpm start
```

Then open **http://localhost:3000** in a browser.

That one command builds the desktop editor and starts the API. Same URL serves both.

| What | Where |
| --- | --- |
| Newsroom editor | http://localhost:3000 |
| API health | http://localhost:3000/api/healthz |

Click **NEW STORY**, add notes, then **AI PRODUCE**.

### Field app (phone)

```bash
pnpm dev:mobile
```

Scan the QR code with Expo Go. Set `EXPO_PUBLIC_API_URL` in `.env` to your machine’s LAN IP (not `localhost`) if the phone is a real device, e.g. `http://192.168.1.10:3000`.

## First-time setup

Needs Node 24+ and pnpm. Postgres is already Neon (see `.env`).

```bash
pnpm install
pnpm db:push
```

## Ship

**Web newsroom (Docker):**

```bash
docker build -t fieldpress .
docker run --rm -p 3000:3000 --env-file .env fieldpress
```

Then open http://localhost:3000. Point a host (Fly, Railway, Render) at this image and set `DATABASE_URL` + `GEMINI_API_KEY`.

**iOS / Android:** in `artifacts/fieldpress` run `npx eas-cli login`, then `npx eas-cli init`, then `npx eas-cli build --platform ios` or `android`.
