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
  hashResetToken,
  sessionCookieHeader,
  clearCookieHeader,
  parseCookies,
  isValidEmail,
  isValidCallsign,
  publicAccount,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS
} from "../_lib/auth.mjs";
import { sendMail } from "../_lib/mailer.mjs";

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

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes
const RESET_RATE_LIMIT_MS = 60 * 1000; // 1 request per email per minute

async function handleRequestReset(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  // Always return the same generic response regardless of whether the
  // email exists, to avoid leaking which addresses are registered.
  const genericResponse = { ok: true, message: "If that email is registered, a reset link has been sent." };
  try {
    const { email } = req.body || {};
    if (!isValidEmail(email)) {
      res.status(200).json(genericResponse);
      return;
    }

    const rows = await sql`
      SELECT id, email, name FROM fieldpress_accounts
      WHERE lower(email) = lower(${email})
      LIMIT 1;
    `;
    if (rows.length === 0) {
      res.status(200).json(genericResponse);
      return;
    }
    const account = rows[0];

    const recent = await sql`
      SELECT id FROM fieldpress_password_resets
      WHERE account_id = ${account.id} AND created_at > now() - interval '60 seconds'
      LIMIT 1;
    `;
    if (recent.length > 0) {
      res.status(200).json(genericResponse);
      return;
    }

    const rawToken = generateToken();
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString();

    await sql`
      INSERT INTO fieldpress_password_resets (account_id, token_hash, expires_at)
      VALUES (${account.id}, ${tokenHash}, ${expiresAt});
    `;

    const appUrl = process.env.APP_URL || "https://fieldpress.studio";
    const resetLink = `${appUrl}/?reset_token=${rawToken}`;

    try {
      await sendMail({
        to: account.email,
        subject: "Reset your FieldPress password",
        text: `Hi ${account.name || ""},\n\nSomeone requested a password reset for this FieldPress account. If this was you, use the link below within 30 minutes:\n\n${resetLink}\n\nIf you didn't request this, you can ignore this email.`,
        html: `<p>Hi ${account.name || ""},</p><p>Someone requested a password reset for this FieldPress account. If this was you, click below within 30 minutes:</p><p><a href="${resetLink}">Reset your password</a></p><p>If you didn't request this, you can ignore this email.</p>`
      });
    } catch (mailErr) {
      // Don't leak mail-provider failures to the client - log and still
      // return the generic success response.
      console.error("Password reset email failed to send:", mailErr);
    }

    res.status(200).json(genericResponse);
  } catch (err) {
    console.error("Request-reset error:", err);
    res.status(200).json(genericResponse);
  }
}

async function handleResetPassword(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const { token, password } = req.body || {};
    if (typeof token !== "string" || !token) {
      res.status(400).json({ error: "Missing or invalid reset token." });
      return;
    }
    if (typeof password !== "string" || password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters." });
      return;
    }

    const tokenHash = hashResetToken(token);
    const rows = await sql`
      SELECT id, account_id, expires_at, used_at FROM fieldpress_password_resets
      WHERE token_hash = ${tokenHash}
      LIMIT 1;
    `;
    if (rows.length === 0) {
      res.status(400).json({ error: "This reset link is invalid. Please request a new one." });
      return;
    }
    const resetRow = rows[0];
    if (resetRow.used_at) {
      res.status(400).json({ error: "This reset link has already been used. Please request a new one." });
      return;
    }
    if (new Date(resetRow.expires_at).getTime() < Date.now()) {
      res.status(400).json({ error: "This reset link has expired. Please request a new one." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await sql`
      UPDATE fieldpress_accounts SET password_hash = ${passwordHash}
      WHERE id = ${resetRow.account_id};
    `;
    await sql`
      UPDATE fieldpress_password_resets SET used_at = now()
      WHERE id = ${resetRow.id};
    `;
    // Invalidate all existing sessions for this account so a stolen
    // session cookie doesn't survive a password reset.
    await sql`
      DELETE FROM fieldpress_sessions WHERE account_id = ${resetRow.account_id};
    `;

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Reset-password error:", err);
    res.status(500).json({ error: "Failed to reset password. Please try again." });
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

async function handleUpdateProfile(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
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

    const { name, callsign, bureau } = req.body || {};

    const cleanName = typeof name === "string" ? name.trim().slice(0, 200) : "";
    if (!cleanName) {
      res.status(400).json({ error: "Please enter a name." });
      return;
    }
    const cleanCallsign = typeof callsign === "string" ? callsign.trim().replace(/^@/, "") : "";
    if (!isValidCallsign(cleanCallsign)) {
      res.status(400).json({ error: "Callsign must be 3-32 characters: letters, numbers, dots, underscores." });
      return;
    }
    const cleanBureau = typeof bureau === "string" ? bureau.trim().slice(0, 200) : "Midwest Corridor Wire";

    const conflict = await sql`
      SELECT id FROM fieldpress_accounts
      WHERE lower(callsign) = lower(${cleanCallsign}) AND id != ${accountId}
      LIMIT 1;
    `;
    if (conflict.length > 0) {
      res.status(409).json({ error: "That callsign is already taken." });
      return;
    }

    const [account] = await sql`
      UPDATE fieldpress_accounts
      SET name = ${cleanName}, callsign = ${cleanCallsign}, bureau = ${cleanBureau}
      WHERE id = ${accountId}
      RETURNING id, email, callsign, name, bureau, avatar_url, role;
    `;

    res.status(200).json({ account: publicAccount(account) });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Failed to save profile. Please try again." });
  }
}

const ACTIONS = {
  signup: handleSignup,
  login: handleLogin,
  logout: handleLogout,
  me: handleMe,
  "update-profile": handleUpdateProfile,
  "request-reset": handleRequestReset,
  "reset-password": handleResetPassword
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
