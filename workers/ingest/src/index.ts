// FieldPress Cloudflare Edge Ingest Worker (Workers + D1 + R2)

export interface Env {
  DB: D1Database;
  MEDIA_BUCKET?: R2Bucket;
  AUTH_SECRET?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "*";

    const corsHeaders = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Badge-ID",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === "/api/health") {
      return new Response(JSON.stringify({ status: "online", timestamp: new Date().toISOString() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (url.pathname === "/api/dispatches" && request.method === "GET") {
      try {
        const { results } = await env.DB.prepare(
          "SELECT * FROM dispatches ORDER BY created_at DESC LIMIT 50"
        ).all();
        return new Response(JSON.stringify({ dispatches: results }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    if (url.pathname === "/api/dispatches" && request.method === "POST") {
      try {
        const payload = await request.json() as any;

        if (!payload.title || !payload.content || !payload.byline?.badgeId) {
          return new Response(JSON.stringify({ error: "Missing required fields: title, content, or byline.badgeId" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        const id = payload.id || `disp-${Date.now()}`;
        const lat = payload.telemetry?.coordinates?.[1] || null;
        const lon = payload.telemetry?.coordinates?.[0] || null;

        await env.DB.prepare(`
          INSERT INTO dispatches (
            id, title, category, author, callsign, bureau, badge_id, location, latitude, longitude,
            content, image_url, image_caption, editorial_status, signature
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          id,
          payload.title,
          payload.category || "Field Dispatch",
          payload.byline.name,
          payload.byline.callsign,
          payload.byline.bureau,
          payload.byline.badgeId,
          payload.telemetry?.location || "Field Beat",
          lat,
          lon,
          payload.content,
          payload.imageUrl || null,
          payload.imageCaption || null,
          payload.status || "staged",
          payload.signature || null
        ).run();

        return new Response(JSON.stringify({ success: true, id, status: payload.status || "staged" }), {
          status: 201,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    return new Response(JSON.stringify({ error: "Endpoint not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};
