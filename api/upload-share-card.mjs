// Accepts the client-generated, edition-styled Pressie card image (PNG) and
// uploads it to Vercel Blob public storage, returning a real, durable URL
// that link-preview crawlers (Facebook, X, Slack, etc.) can actually fetch.
//
// The card itself is rendered client-side onto a <canvas> in
// generatePressieCardBlob() (see App.tsx) — that blob previously only ever
// became a `blob:` object URL, which is unreachable outside the tab that
// created it. This endpoint closes that gap.

import { put } from "@vercel/blob";

export const config = {
  api: {
    bodyParser: false,
  },
};

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const contentType = req.headers["content-type"] || "";
  if (!contentType.startsWith("image/")) {
    res.status(400).json({ error: "Expected an image/* request body." });
    return;
  }

  const dispatchId = req.query?.id;
  if (typeof dispatchId !== "string" || !dispatchId.trim()) {
    res.status(400).json({ error: "Missing dispatch id." });
    return;
  }
  const cleanId = dispatchId.trim().slice(0, 128).replace(/[^a-zA-Z0-9_-]/g, "");
  if (!cleanId) {
    res.status(400).json({ error: "Invalid dispatch id." });
    return;
  }

  try {
    const buffer = await readRawBody(req);

    if (buffer.length === 0) {
      res.status(400).json({ error: "Empty image body." });
      return;
    }
    // Guard against unexpectedly huge uploads (cards are ~1200x675 PNGs,
    // typically well under 1MB; 8MB is a generous ceiling).
    if (buffer.length > 8 * 1024 * 1024) {
      res.status(413).json({ error: "Image too large." });
      return;
    }

    const blob = await put(`share-cards/${cleanId}.png`, buffer, {
      access: "public",
      contentType: "image/png",
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    res.status(200).json({ url: blob.url });
  } catch (err) {
    res.status(500).json({ error: "Upload failed. Please try again." });
  }
}
