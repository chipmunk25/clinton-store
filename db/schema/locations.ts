import { pgTable, uuid, varchar, integer, timestamp, unique, boolean } from 'drizzle-orm/pg-core';

// Zones - extensible for future zones (R, M, L, etc.)
export const zones = pgTable('zones', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length:  10 }).notNull().unique(), // R, M, L
  name: varchar('name', { length: 100 }).notNull(), // Right, Middle, Left
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Chambers within zones
export const chambers = pgTable('chambers', {
  id: uuid('id').primaryKey().defaultRandom(),
  zoneId: uuid('zone_id').notNull().references(() => zones.id, { onDelete: 'restrict' }),
  chamberNumber: integer('chamber_number').notNull(), // 1, 2, 3... 
  name: varchar('name', { length: 100 }), // Optional friendly name
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  uniqueZoneChamber: unique().on(table.zoneId, table.chamberNumber),
}));

// Shelves within chambers
export const shelves = pgTable('shelves', {
  id: uuid('id').primaryKey().defaultRandom(),
  chamberId: uuid('chamber_id').notNull().references(() => chambers.id, { onDelete: 'restrict' }),
  shelfNumber: integer('shelf_number').notNull(), // 1, 2, 3...
  // Generated location code:  R-C01-S01 (computed in queries/app)
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone:  true }).notNull().defaultNow(),
}, (table) => ({
  uniqueChamberShelf: unique().on(table.chamberId, table. shelfNumber),
}));

// Types
export type Zone = typeof zones.$inferSelect;
export type Chamber = typeof chambers.$inferSelect;
export type Shelf = typeof shelves.$inferSelect;