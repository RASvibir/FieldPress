import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import {
  generateToken,
  sessionCookieHeader,
  isValidEmail,
  isValidCallsign,
  publicAccount,
  SESSION_TTL_SECONDS
} from "../_lib/auth.mjs";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { email, password, callsign, name, bureau } = req.body || {};

    if (!isValidEmail(email)) {
      res.status(400).json({ error: "Please enter a valid email address." });
      return;
    }
    if (typeof password !== "string" || password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters." });
      return;
    }
    const cleanCallsign = typeof callsign === "string" ? callsign.trim().replace(/^@/, "") : "";
    if (!isValidCallsign(cleanCallsign)) {
      res.status(400).json({ error: "Callsign must be 3-32 characters: letters, numbers, dots, underscores." });
      return;
    }
    const cleanName = typeof name === "string" ? name.trim().slice(0, 200) : "";
    if (!cleanName) {
      res.status(400).json({ error: "Please enter a name." });
      return;
    }

    const existing = await sql`
      SELECT id FROM fieldpress_accounts
      WHERE lower(email) = lower(${email}) OR lower(callsign) = lower(${cleanCallsign})
      LIMIT 1;
    `;
    if (existing.length > 0) {
      res.status(409).json({ error: "An account with that email or callsign already exists." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const id = `acc-${generateToken().slice(0, 16)}`;
    const avatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(cleanCallsign)}`;
    const cleanBureau = typeof bureau === "string" ? bureau.trim().slice(0, 200) : "Midwest Corridor Wire";

    const [account] = await sql`
      INSERT INTO fieldpress_accounts (id, email, password_hash, callsign, name, bureau, avatar_url)
      VALUES (${id}, ${email.toLowerCase()}, ${passwordHash}, ${cleanCallsign}, ${cleanName}, ${cleanBureau}, ${avatarUrl})
      RETURNING id, email, callsign, name, bureau, avatar_url;
    `;

    const token = generateToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();
    await sql`
      INSERT INTO fieldpress_sessions (token, account_id, expires_at)
      VALUES (${token}, ${account.id}, ${expiresAt});
    `;

    res.setHeader("Set-Cookie", sessionCookieHeader(token));
    res.status(201).json({ account: publicAccount(account) });
  } catch (err) {
    res.status(500).json({ error: "Signup failed. Please try again." });
  }
}
