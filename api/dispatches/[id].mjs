// GET    /api/dispatches/:id  -> a single dispatch (public if published, owner-only if press-roll)
// PUT    /api/dispatches/:id  -> update a dispatch (owner only)
// DELETE /api/dispatches/:id  -> delete a dispatch (owner only)

import { neon } from "@neondatabase/serverless";
import { getAuthenticatedAccount } from "../_lib/auth.mjs";

const sql = neon(process.env.DATABASE_URL);

function toClientShape(row) {
  return {
    id: row.id,
    accountId: row.account_id,
    title: row.title,
    category: row.category,
    author: row.author,
    callsign: row.callsign,
    bureau: row.bureau,
    location: row.location || undefined,
    coordinates: row.latitude != null && row.longitude != null ? [row.longitude, row.latitude] : undefined,
    content: row.content,
    imageUrl: row.image_url || undefined,
    imageCaption: row.image_caption || undefined,
    isLead: row.is_lead,
    isPressRoll: row.is_press_roll,
    editionStyle: row.edition_style || undefined,
    sharingOption: row.sharing_option,
    parentDispatchId: row.parent_dispatch_id || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export default async function handler(req, res) {
  const { id } = req.query || {};
  if (typeof id !== "string" || !id.trim()) {
    res.status(400).json({ error: "Missing dispatch id." });
    return;
  }

  if (req.method === "GET") {
    try {
      const [row] = await sql`SELECT * FROM fieldpress_dispatches WHERE id = ${id} LIMIT 1;`;
      if (!row) {
        res.status(404).json({ error: "Dispatch not found." });
        return;
      }
      if (row.is_press_roll) {
        const caller = await getAuthenticatedAccount(req);
        if (!caller || caller.id !== row.account_id) {
          res.status(404).json({ error: "Dispatch not found." });
          return;
        }
      }
      res.status(200).json({ dispatch: toClientShape(row) });
    } catch (err) {
      console.error("Dispatch fetch error:", err);
      res.status(500).json({ error: "Failed to load dispatch." });
    }
    return;
  }

  if (req.method === "PUT") {
    try {
      const caller = await getAuthenticatedAccount(req);
      if (!caller) {
        res.status(401).json({ error: "Not authenticated." });
        return;
      }
      const {
        title, category, content, location, coordinates,
        imageUrl, imageCaption, isLead, isPressRoll, editionStyle, sharingOption
      } = req.body || {};

      const validSharing = new Set(["fork", "colab", "none"]);
      const lat = Array.isArray(coordinates) && typeof coordinates[1] === "number" ? coordinates[1] : null;
      const lng = Array.isArray(coordinates) && typeof coordinates[0] === "number" ? coordinates[0] : null;

      const [row] = await sql`
        UPDATE fieldpress_dispatches SET
          title = COALESCE(${typeof title === "string" ? title.trim().slice(0, 500) : null}, title),
          category = COALESCE(${typeof category === "string" ? category.trim().slice(0, 100) : null}, category),
          location = ${location ?? null},
          latitude = ${lat},
          longitude = ${lng},
          content = COALESCE(${typeof content === "string" ? content.trim() : null}, content),
          image_url = ${imageUrl ?? null},
          image_caption = ${imageCaption ?? null},
          is_lead = COALESCE(${typeof isLead === "boolean" ? isLead : null}, is_lead),
          is_press_roll = COALESCE(${typeof isPressRoll === "boolean" ? isPressRoll : null}, is_press_roll),
          edition_style = ${editionStyle ?? null},
          sharing_option = COALESCE(${validSharing.has(sharingOption) ? sharingOption : null}, sharing_option),
          updated_at = now()
        WHERE id = ${id} AND account_id = ${caller.id}
        RETURNING *;
      `;

      if (!row) {
        res.status(403).json({ error: "You don't own this dispatch, or it doesn't exist." });
        return;
      }
      res.status(200).json({ dispatch: toClientShape(row) });
    } catch (err) {
      console.error("Dispatch update error:", err);
      res.status(500).json({ error: "Failed to update dispatch." });
    }
    return;
  }

  if (req.method === "DELETE") {
    try {
      const caller = await getAuthenticatedAccount(req);
      if (!caller) {
        res.status(401).json({ error: "Not authenticated." });
        return;
      }
      const [row] = await sql`
        DELETE FROM fieldpress_dispatches
        WHERE id = ${id} AND account_id = ${caller.id}
        RETURNING id;
      `;
      if (!row) {
        res.status(403).json({ error: "You don't own this dispatch, or it doesn't exist." });
        return;
      }
      res.status(200).json({ success: true });
    } catch (err) {
      console.error("Dispatch delete error:", err);
      res.status(500).json({ error: "Failed to delete dispatch." });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
