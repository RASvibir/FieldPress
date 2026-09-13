// Seed script: creates a test account for local development
// Usage: node scripts/seed-auth.mjs

import bcrypt from "bcryptjs";
import crypto from "crypto";

async function seed() {
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(process.env.DATABASE_URL);

  const testAccounts = [
    {
      id: `acc-${crypto.randomBytes(8).toString("hex")}`,
      email: "dev@fieldpress.local",
      password: "DevPassword123",
      callsign: "fieldpress_dev",
      name: "FieldPress Dev",
      bureau: "Midwest Corridor Wire",
    },
  ];

  for (const a of testAccounts) {
    const passwordHash = await bcrypt.hash(a.password, 12);
    const avatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(a.callsign)}`;
    try {
      await sql`
        INSERT INTO fieldpress_accounts (id, email, password_hash, callsign, name, bureau, avatar_url)
        VALUES (${a.id}, ${a.email.toLowerCase()}, ${passwordHash}, ${a.callsign}, ${a.name}, ${a.bureau}, ${avatarUrl})
        ON CONFLICT DO NOTHING
      `;
      console.log(`Seeded account: ${a.callsign} / ${a.email} (password: ${a.password})`);
    } catch (err) {
      console.error(`Failed to seed ${a.callsign}:`, err.message);
    }
  }

  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
