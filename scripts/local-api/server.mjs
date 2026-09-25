// Lightweight local dev server that reuses FieldPress's real production
// handler code (api/_lib/handlers/*.mjs) without going through Vercel's
// CLI, since `vercel dev` currently hangs in this environment.
//
// This is a compatibility shim only: Express's req/res already look
// enough like Vercel's Node request/response objects (req.query,
// req.cookies, req.body, res.status().json()) that the handlers run
// completely unmodified.
//
// Covers only the six-resource dispatcher (auth, cohorts, messenger,
// admin, notifications, reports) via /api/:resource/:action — the
// standalone media/blob endpoints (upload-avatar, upload-share-card,
// pressyo, dispatches, sync-dispatch, dispatch/:id) are NOT wired up
// here, since they're out of scope for the cohort-requests bug.

import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_DIR = path.resolve(__dirname, "../../api");
const API_ROOT = path.resolve(API_DIR, "_lib/handlers");

const RESOURCES = ["auth", "cohorts", "messenger", "admin", "notifications", "reports"];
const STANDALONE_ENDPOINTS = [
  "pressyo",
  "dispatches",
  "feeds",
  "sync-dispatch",
  "upload-avatar",
  "upload-cover-photo",
  "upload-share-card"
];

const app = express();
app.use(cookieParser());
app.use(express.json({ limit: "8mb" }));
app.use(express.raw({ type: "image/*", limit: "8mb" }));

// Load standalone endpoints (/api/pressyo, /api/dispatches, etc.)
const standaloneHandlers = {};
for (const name of STANDALONE_ENDPOINTS) {
  const mod = await import(path.join(API_DIR, `${name}.mjs`));
  standaloneHandlers[name] = mod.default;
}

// Rewrite /api/dispatches/:id -> /api/dispatches?id=:id (matches vercel.json)
app.all("/api/dispatches/:id", async (req, res) => {
  req.query = { ...req.query, id: req.params.id };
  try {
    await standaloneHandlers["dispatches"](req, res);
  } catch (err) {
    console.error("[local-api] dispatches/:id threw:", err);
    if (!res.headersSent) res.status(500).json({ error: "Internal server error (local dev)." });
  }
});

for (const name of STANDALONE_ENDPOINTS) {
  app.all(`/api/${name}`, async (req, res) => {
    try {
      await standaloneHandlers[name](req, res);
    } catch (err) {
      console.error(`[local-api] ${name} threw:`, err);
      if (!res.headersSent) res.status(500).json({ error: "Internal server error (local dev)." });
    }
  });
}

// Load each consolidated resource handler module once at startup.
const handlers = {};
for (const resource of RESOURCES) {
  const mod = await import(path.join(API_ROOT, `${resource}.mjs`));
  handlers[resource] = mod.default;
}

app.all("/api/:resource/:action?", async (req, res) => {
  const { resource, action } = req.params;
  const fn = handlers[resource];
  if (!fn) {
    res.status(404).json({ error: "Unknown API resource." });
    return;
  }
  // Vercel's dynamic segments land in req.query; replicate that here.
  req.query = { ...req.query, resource, ...(action ? { action } : {}) };
  try {
    await fn(req, res);
  } catch (err) {
    console.error(`[local-api] ${resource}/${action || ""} threw:`, err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error (local dev)." });
    }
  }
});

const PORT = process.env.LOCAL_API_PORT || 4000;
app.listen(PORT, () => {
  console.log(`[local-api] listening on http://localhost:${PORT}`);
  console.log(`[local-api] resources: ${RESOURCES.join(", ")}`);
  console.log(`[local-api] standalone: ${STANDALONE_ENDPOINTS.join(", ")}`);
});
