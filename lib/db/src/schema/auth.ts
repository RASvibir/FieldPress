import { text, varchar, timestamp, pgTable, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const fieldpressAccounts = pgTable('fieldpress_accounts', {
  id: text('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  callsign: varchar('callsign', { length: 32 }).notNull().unique(),
  name: varchar('name', { length: 200 }).notNull(),
  bureau: varchar('bureau', { length: 200 }).notNull(),
  avatarUrl: text('avatar_url'),
  role: varchar('role', { length: 32 }).notNull().default('correspondent'),
  verifiedLocal: boolean('verified_local').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const fieldpressSessions = pgTable('fieldpress_sessions', {
  token: text('token').primaryKey(),
  accountId: text('account_id')
    .notNull()
    .references(() => fieldpressAccounts.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const fieldpressAccountsRelations = relations(fieldpressAccounts, ({ many }) => ({
  sessions: many(fieldpressSessions),
}));

export const fieldpressSessionsRelations = relations(fieldpressSessions, ({ one }) => ({
  account: one(fieldpressAccounts, {
    fields: [fieldpressSessions.accountId],
    references: [fieldpressAccounts.id],
  }),
}));

export type FieldpressAccount = typeof fieldpressAccounts.$inferSelect;
export type NewFieldpressAccount = typeof fieldpressAccounts.$inferInsert;
export type FieldpressSession = typeof fieldpressSessions.$inferSelect;
