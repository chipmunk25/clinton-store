import { db } from '@/db';
import { sales, purchases, expenses, products } from '@/db/schema';
import { sql, and, gte, lte, eq } from 'drizzle-orm';

export interface ProfitLossReport {
  period: { start: Date; end: Date };
  revenue: {
    totalSales: number;
    salesCount: number;
  };
  costOfGoodsSold: {
    totalCost: number;
    purchasesCount: number;
  };
  grossProfit: number;
  grossMargin: number;
  expenses: {
    byCategory: Record<string, number>;
    total: number;
  };
  netProfit: number;
  netMargin: number;
}

export async function getProfitLossReport(
  startDate: Date,
  endDate: Date
): Promise<ProfitLossReport> {
  // Revenue from sales
  const salesData = await db
    .select({
      totalSales: sql<number>`COALESCE(SUM(${sales.totalAmount}), 0)`,
      salesCount: sql<number>`COUNT(*)`,
    })
    .from(sales)
    .where(and(gte(sales.saleDate, startDate), lte(sales.saleDate, endDate)));

  // Cost of goods sold (using FIFO approximation via average cost)
  // For simplicity, we calculate COGS as the cost price of items sold
  const cogsData = await db
    . select({
      totalCogs: sql<number>`
        COALESCE(SUM(${sales.quantity} * ${products.costPrice}), 0)
      `,
      purchasesCount: sql<number>`COUNT(DISTINCT ${sales.id})`,
    })
    .from(sales)
    .innerJoin(products, eq(sales.productId, products.id))
    .where(and(gte(sales.saleDate, startDate), lte(sales.saleDate, endDate)));

  // Operating expenses
  const expenseData = await db
    .select({
      category: expenses.category,
      total: sql<number>`SUM(${expenses.amount})`,
    })
    .from(expenses)
    .where(
      and(
        gte(expenses.expenseDate, startDate. toISOString().split('T')[0]),
        lte(expenses.expenseDate, endDate.toISOString().split('T')[0])
      )
    )
    .groupBy(expenses. category);

  const expensesByCategory = Object.fromEntries(
    expenseData.map((e) => [e.category, Number(e.total)])
  );
  const totalExpenses = expenseData.reduce((sum, e) => sum + Number(e.total), 0);

  const totalSales = Number(salesData[0]?.totalSales ??  0);
  const totalCogs = Number(cogsData[0]?.totalCogs ??  0);
  const grossProfit = totalSales - totalCogs;
  const netProfit = grossProfit - totalExpenses;

  return {
    period: { start:  startDate, end: endDate },
    revenue: {
      totalSales,
      salesCount:  Number(salesData[0]?. salesCount ?? 0),
    },
    costOfGoodsSold: {
      totalCost: totalCogs,
      purchasesCount: Number(cogsData[0]?.purchasesCount ??  0),
    },
    grossProfit,
    grossMargin: totalSales > 0 ? (grossProfit / totalSales) * 100 : 0,
    expenses: {
      byCategory: expensesByCategory,
      total: totalExpenses,
    },
    netProfit,
    netMargin: totalSales > 0 ? (netProfit / totalSales) * 100 : 0,
  };
}