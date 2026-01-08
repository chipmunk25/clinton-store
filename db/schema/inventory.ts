import { pgTable, uuid, decimal, integer, timestamp, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { products } from './products';
import { shelves } from './locations';
import { users } from './users';

// Purchases (Stock In)
export const purchases = pgTable('purchases', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'restrict' }),
  shelfId: uuid('shelf_id').notNull().references(() => shelves.id, { onDelete: 'restrict' }),
  quantity: integer('quantity').notNull(),
  unitCost: decimal('unit_cost', { precision: 12, scale: 2 }).notNull(),
  totalCost: decimal('total_cost', { precision: 12, scale: 2 }).notNull(),
  purchaseDate: timestamp('purchase_date', { withTimezone: true }).notNull().defaultNow(),
  recordedBy: uuid('recorded_by').notNull().references(() => users.id, { onDelete: 'restrict' }),
  notes: varchar('notes', { length:  500 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  productIdx: index('purchase_product_idx').on(table.productId),
  dateIdx: index('purchase_date_idx').on(table.purchaseDate),
  quantityCheck: check('purchase_quantity_positive', sql`${table.quantity} > 0`),
}));

// Sales (Stock Out)
export const sales = pgTable('sales', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'restrict' }),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 12, scale: 2 }).notNull(),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  saleDate: timestamp('sale_date', { withTimezone: true }).notNull().defaultNow(),
  recordedBy: uuid('recorded_by').notNull().references(() => users.id, { onDelete: 'restrict' }),
  notes: varchar('notes', { length: 500 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  productIdx: index('sale_product_idx').on(table.productId),
  dateIdx: index('sale_date_idx').on(table.purchaseDate),
  quantityCheck: check('sale_quantity_positive', sql`${table.quantity} > 0`),
}));

// Materialized stock view - updated via triggers
// This is the source of truth for current stock levels
export const stockLevels = pgTable('stock_levels', {
  productId: uuid('product_id').primaryKey().references(() => products.id, { onDelete: 'cascade' }),
  totalPurchased: integer('total_purchased').notNull().default(0),
  totalSold: integer('total_sold').notNull().default(0),
  currentStock: integer('current_stock').notNull().default(0), // Computed:  purchased - sold
  lastPurchaseDate: timestamp('last_purchase_date', { withTimezone: true }),
  lastSaleDate: timestamp('last_sale_date', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  stockCheck: check('stock_non_negative', sql`${table.currentStock} >= 0`),
  lowStockIdx: index('low_stock_idx').on(table.currentStock),
}));

// Types
export type Purchase = typeof purchases.$inferSelect;
export type NewPurchase = typeof purchases.$inferInsert;
export type Sale = typeof sales.$inferSelect;
export type NewSale = typeof sales.$inferInsert;
export type StockLevel = typeof stockLevels.$inferSelect;