import { pgTable, uuid, varchar, boolean, integer, timestamp } from 'drizzle-orm/pg-core';

export const settings = pgTable('settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length:  100 }).notNull().unique(),
  value: varchar('value', { length: 500 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Default settings keys
export const SETTINGS_KEYS = {
  STORE_NAME: 'store_name',
  STORE_CURRENCY: 'store_currency',
  LOW_STOCK_ALERT_ENABLED: 'low_stock_alert_enabled',
  LOW_STOCK_CHECK_INTERVAL: 'low_stock_check_interval', // in hours
  EXPIRY_ALERT_DAYS: 'expiry_alert_days', // days before expiry to alert
} as const;

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;