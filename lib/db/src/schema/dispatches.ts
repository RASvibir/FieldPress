import { text, varchar, boolean, real, timestamp, pgTable } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { fieldpressAccounts } from './auth';

// A dispatch is a published story OR a staged draft ("press roll" entry) —
// distinguished by isPressRoll. Every row is owned by exactly one account;
// nothing here is shared/global state anymore.
export const fieldpressDispatches = pgTable('fieldpress_dispatches', {
  id: text('id').primaryKey(),
  accountId: text('account_id')
    .notNull()
    .references(() => fieldpressAccounts.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 500 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  // Denormalized author display fields — snapshotted at publish time so a
  // dispatch's byline doesn't silently change if the author later edits
  // their name/callsign/bureau. Source of truth for "who can edit this" is
  // always accountId, never these display fields.
  author: varchar('author', { length: 200 }).notNull(),
  callsign: varchar('callsign', { length: 32 }).notNull(),
  bureau: varchar('bureau', { length: 200 }).notNull(),
  location: varchar('location', { length: 200 }),
  latitude: real('latitude'),
  longitude: real('longitude'),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  imageCaption: text('image_caption'),
  isLead: boolean('is_lead').notNull().default(false),
  isPressRoll: boolean('is_press_roll').notNull().default(false),
  editionStyle: varchar('edition_style', { length: 32 }),
  sharingOption: varchar('sharing_option', { length: 16 }).notNull().default('fork'),
  parentDispatchId: text('parent_dispatch_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const fieldpressDispatchesRelations = relations(fieldpressDispatches, ({ one }) => ({
  account: one(fieldpressAccounts, {
    fields: [fieldpressDispatches.accountId],
    references: [fieldpressAccounts.id],
  }),
}));

export type FieldpressDispatch = typeof fieldpressDispatches.$inferSelect;
export type NewFieldpressDispatch = typeof fieldpressDispatches.$inferInsert;
