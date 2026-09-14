import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { generateToken, sessionCookieHeader, publicAccount, SESSION_TTL_SECONDS } from "../_lib/auth.mjs";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { email, password } = req.body || {};
    if (typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    const rows = await sql`
      SELECT id, email, password_hash, callsign, name, bureau, avatar_url, role
      FROM fieldpress_accounts
      WHERE lower(email) = lower(${email})
      LIMIT 1;
    `;

    // Deliberately generic error for both "no such account" and "wrong
    // password" so a failed login doesn't reveal which emails are registered.
    const genericError = { error: "Incorrect email or password." };

    if (rows.length === 0) {
      res.status(401).json(genericError);
      return;
    }

    const account = rows[0];
    const matches = await bcrypt.compare(password, account.password_hash);
    if (!matches) {
      res.status(401).json(genericError);
      return;
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();
    await sql`
      INSERT INTO fieldpress_sessions (token, account_id, expires_at)
      VALUES (${token}, ${account.id}, ${expiresAt});
    `;

    res.setHeader("Set-Cookie", sessionCookieHeader(token));
    res.status(200).json({ account: publicAccount(account) });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
}
