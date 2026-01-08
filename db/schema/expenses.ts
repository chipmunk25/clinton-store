import { pgTable, uuid, varchar, decimal, date, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

export const expenseCategoryEnum = pgEnum('expense_category', [
  'rent',
  'utilities',
  'salaries',
  'supplies',
  'transport',
  'marketing',
  'maintenance',
  'other'
]);

export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  category: expenseCategoryEnum('category').notNull(),
  description: varchar('description', { length:  500 }).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  expenseDate: date('expense_date').notNull(),
  recordedBy: uuid('recorded_by').notNull().references(() => users.id, { onDelete: 'restrict' }),
  receiptReference: varchar('receipt_reference', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Types
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type ExpenseCategory = typeof expenseCategoryEnum. enumValues[number];