import { pgTable, uuid, varchar, decimal, integer, date, timestamp, boolean, index } from 'drizzle-orm/pg-core';

// Categories - user-manageable
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: varchar('description', { length:  500 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: varchar('product_id', { length:  50 }).notNull().unique(), // User-facing ID (SKU)
  name: varchar('name', { length:  255 }).notNull(),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  costPrice: decimal('cost_price', { precision: 12, scale: 2 }).notNull(),
  sellingPrice: decimal('selling_price', { precision: 12, scale: 2 }).notNull(),
  expiryDate: date('expiry_date'), // Optional
  reorderLevel: integer('reorder_level').notNull().default(5),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  productIdIdx: index('product_id_idx').on(table.productId),
  nameIdx: index('product_name_idx').on(table.name),
  categoryIdx: index('product_category_idx').on(table.categoryId),
}));

// Types
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Category = typeof categories.$inferSelect;