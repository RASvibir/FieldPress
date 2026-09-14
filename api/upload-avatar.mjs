// Accepts a profile avatar image from authenticated user and uploads it
// to Vercel Blob public storage, returning a durable URL for storage in
// the database.

import { put } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";
import { parseCookies, SESSION_COOKIE_NAME } from "./_lib/auth.mjs";

const sql = neon(process.env.DATABASE_URL);

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

  try {
    // Authenticate: check session cookie
    const cookies = parseCookies(req);
    const token = cookies[SESSION_COOKIE_NAME];
    if (!token) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }

    const authRows = await sql`
      SELECT account_id FROM fieldpress_sessions
      WHERE token = ${token} AND expires_at > now()
      LIMIT 1;
    `;
    if (authRows.length === 0) {
      res.status(401).json({ error: "Session expired." });
      return;
    }
    const accountId = authRows[0].account_id;

    // Validate image content-type
    const contentType = req.headers["content-type"] || "";
    if (!contentType.startsWith("image/")) {
      res.status(400).json({ error: "Expected an image/* request body." });
      return;
    }

    // Read and validate image buffer
    const buffer = await readRawBody(req);
    if (buffer.length === 0) {
      res.status(400).json({ error: "Empty image body." });
      return;
    }
    // Avatar images should be < 5MB (typically much smaller)
    if (buffer.length > 5 * 1024 * 1024) {
      res.status(413).json({ error: "Image too large (max 5MB)." });
      return;
    }

    // Determine image format from content-type
    const formatMatch = contentType.match(/\/(jpeg|png|gif|webp)$/);
    const format = formatMatch ? formatMatch[1] : "png";
    const ext = format === "jpeg" ? "jpg" : format;

    // Upload to Vercel Blob
    const blob = await put(
      `avatars/${accountId}.${ext}`,
      buffer,
      {
        access: "public",
        contentType,
        addRandomSuffix: false,
        allowOverwrite: true,
      }
    );

    // Update the account's avatar_url in the database
    await sql`
      UPDATE fieldpress_accounts
      SET avatar_url = ${blob.url}
      WHERE id = ${accountId}
    `;

    res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error("Avatar upload error:", err);
    res.status(500).json({ error: "Upload failed. Please try again." });
  }
}
