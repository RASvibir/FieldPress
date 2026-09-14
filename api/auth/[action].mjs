// Consolidated auth endpoint — one serverless function handling all auth
// actions, routed by the [action] dynamic segment so URLs are unchanged:
//   POST /api/auth/signup
//   POST /api/auth/login
//   POST /api/auth/logout
//   GET  /api/auth/me
//
// Merged from four separate files (signup.mjs, login.mjs, logout.mjs,
// me.mjs) purely to stay under Vercel's per-plan serverless function cap.
// Each handler below is otherwise unchanged from its original file.

import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import {
  generateToken,
  sessionCookieHeader,
  clearCookieHeader,
  parseCookies,
  isValidEmail,
  isValidCallsign,
  publicAccount,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS
} from "../_lib/auth.mjs";

const sql = neon(process.env.DATABASE_URL);
const SUPER_ADMIN_EMAIL = (process.env.SUPER_ADMIN_EMAIL || "vibir@fieldpress.studio").toLowerCase();

async function handleSignup(req, res) {
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
    const avatarUrl = "/pressie.svg";
    const cleanBureau = typeof bureau === "string" ? bureau.trim().slice(0, 200) : "Midwest Corridor Wire";

    const role = email.toLowerCase() === SUPER_ADMIN_EMAIL ? 'super_admin' : 'correspondent';

    const [account] = await sql`
      INSERT INTO fieldpress_accounts (id, email, password_hash, callsign, name, bureau, avatar_url, role)
      VALUES (${id}, ${email.toLowerCase()}, ${passwordHash}, ${cleanCallsign}, ${cleanName}, ${cleanBureau}, ${avatarUrl}, ${role})
      RETURNING id, email, callsign, name, bureau, avatar_url, role;
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
    console.error("Signup error:", err);
    res.status(500).json({ error: "Signup failed. Please try again." });
  }
}

async function handleLogin(req, res) {
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

async function handleLogout(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const cookies = parseCookies(req);
    const token = cookies[SESSION_COOKIE_NAME];
    if (token) {
      await sql`DELETE FROM fieldpress_sessions WHERE token = ${token};`;
    }
    res.setHeader("Set-Cookie", clearCookieHeader());
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Logout failed." });
  }
}

async function handleMe(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const cookies = parseCookies(req);
    const token = cookies[SESSION_COOKIE_NAME];
    if (!token) {
      res.status(200).json({ account: null });
      return;
    }

    const rows = await sql`
      SELECT a.id, a.email, a.callsign, a.name, a.bureau, a.avatar_url, a.role
      FROM fieldpress_sessions s
      JOIN fieldpress_accounts a ON a.id = s.account_id
      WHERE s.token = ${token} AND s.expires_at > now()
      LIMIT 1;
    `;

    if (rows.length === 0) {
      res.status(200).json({ account: null });
      return;
    }

    res.status(200).json({ account: publicAccount(rows[0]) });
  } catch (err) {
    res.status(200).json({ account: null });
  }
}

const ACTIONS = {
  signup: handleSignup,
  login: handleLogin,
  logout: handleLogout,
  me: handleMe
};

export default async function handler(req, res) {
  const action = req.query?.action;
  const fn = typeof action === "string" ? ACTIONS[action] : undefined;
  if (!fn) {
    res.status(404).json({ error: "Unknown auth action." });
    return;
  }
  return fn(req, res);
}
