import { db } from "@/db";
import { sales, products, expenses } from "@/db/schema";
import { sql, and, gte, lte, eq } from "drizzle-orm";

export interface ProfitLossReport {
  period: { start: Date; end: Date };
  revenue: {
    totalSales: number;
    salesCount: number;
  };
  costOfGoodsSold: {
    totalCost: number;
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
  const [salesData] = await db
    .select({
      totalSales: sql<number>`COALESCE(SUM(${sales.totalAmount}:: numeric), 0)`,
      salesCount: sql<number>`COUNT(*):: int`,
    })
    .from(sales)
    .where(and(gte(sales.saleDate, startDate), lte(sales.saleDate, endDate)));

  // Cost of goods sold (COGS)
  // Calculate based on the cost price of products sold
  const [cogsData] = await db
    .select({
      totalCogs: sql<number>`
        COALESCE(SUM(${sales.quantity} * ${products.costPrice}:: numeric), 0)
      `,
    })
    .from(sales)
    .innerJoin(products, eq(sales.productId, products.id))
    .where(and(gte(sales.saleDate, startDate), lte(sales.saleDate, endDate)));

  // Operating expenses by category
  const expenseData = await db
    .select({
      category: expenses.category,
      total: sql<number>`SUM(${expenses.amount}:: numeric)`,
    })
    .from(expenses)
    .where(
      and(
        gte(expenses.expenseDate, startDate.toISOString().split("T")[0]),
        lte(expenses.expenseDate, endDate.toISOString().split("T")[0])
      )
    )
    .groupBy(expenses.category);

  // Build expenses by category object
  const expensesByCategory: Record<string, number> = {};
  let totalExpenses = 0;

  expenseData.forEach((e) => {
    const amount = Number(e.total) || 0;
    expensesByCategory[e.category] = amount;
    totalExpenses += amount;
  });

  // Calculate totals
  const totalSales = Number(salesData?.totalSales ?? 0);
  const totalCogs = Number(cogsData?.totalCogs ?? 0);
  const grossProfit = totalSales - totalCogs;
  const netProfit = grossProfit - totalExpenses;

  // Calculate margins (avoid division by zero)
  const grossMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;
  const netMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

  return {
    period: { start: startDate, end: endDate },
    revenue: {
      totalSales,
      salesCount: Number(salesData?.salesCount ?? 0),
    },
    costOfGoodsSold: {
      totalCost: totalCogs,
    },
    grossProfit,
    grossMargin,
    expenses: {
      byCategory: expensesByCategory,
      total: totalExpenses,
    },
    netProfit,
    netMargin,
  };
}

// Sales report - detailed breakdown
export interface SalesReportData {
  totalSales: number;
  totalQuantity: number;
  averageOrderValue: number;
  salesByDay: {
    date: string;
    total: number;
    count: number;
  }[];
  topProducts: {
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }[];
}

export async function getSalesReport(
  startDate: Date,
  endDate: Date
): Promise<SalesReportData> {
  // Total sales summary
  const [summary] = await db
    .select({
      totalSales: sql<number>`COALESCE(SUM(${sales.totalAmount}::numeric), 0)`,
      totalQuantity: sql<number>`COALESCE(SUM(${sales.quantity}), 0)::int`,
      salesCount: sql<number>`COUNT(*)::int`,
    })
    .from(sales)
    .where(and(gte(sales.saleDate, startDate), lte(sales.saleDate, endDate)));

  // Sales by day
  const salesByDayData = await db
    .select({
      date: sql<string>`DATE(${sales.saleDate}):: text`,
      total: sql<number>`SUM(${sales.totalAmount}::numeric)`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(sales)
    .where(and(gte(sales.saleDate, startDate), lte(sales.saleDate, endDate)))
    .groupBy(sql`DATE(${sales.saleDate})`)
    .orderBy(sql`DATE(${sales.saleDate})`);

  // Top selling products
  const topProductsData = await db
    .select({
      productId: products.productId,
      name: products.name,
      quantity: sql<number>`SUM(${sales.quantity}):: int`,
      revenue: sql<number>`SUM(${sales.totalAmount}::numeric)`,
    })
    .from(sales)
    .innerJoin(products, eq(sales.productId, products.id))
    .where(and(gte(sales.saleDate, startDate), lte(sales.saleDate, endDate)))
    .groupBy(products.productId, products.name)
    .orderBy(sql`SUM(${sales.totalAmount}::numeric) DESC`)
    .limit(10);

  const totalSales = Number(summary?.totalSales ?? 0);
  const salesCount = Number(summary?.salesCount ?? 0);

  return {
    totalSales,
    totalQuantity: Number(summary?.totalQuantity ?? 0),
    averageOrderValue: salesCount > 0 ? totalSales / salesCount : 0,
    salesByDay: salesByDayData.map((d) => ({
      date: d.date,
      total: Number(d.total),
      count: Number(d.count),
    })),
    topProducts: topProductsData.map((p) => ({
      productId: p.productId,
      name: p.name,
      quantity: Number(p.quantity),
      revenue: Number(p.revenue),
    })),
  };
}

// Expenses report
export interface ExpensesReportData {
  totalExpenses: number;
  expensesByCategory: {
    category: string;
    total: number;
    percentage: number;
  }[];
  recentExpenses: {
    id: string;
    category: string;
    description: string;
    amount: number;
    date: string;
  }[];
}

export async function getExpensesReport(
  startDate: Date,
  endDate: Date
): Promise<ExpensesReportData> {
  // Total and by category
  const expensesByCategory = await db
    .select({
      category: expenses.category,
      total: sql<number>`SUM(${expenses.amount}::numeric)`,
    })
    .from(expenses)
    .where(
      and(
        gte(expenses.expenseDate, startDate.toISOString().split("T")[0]),
        lte(expenses.expenseDate, endDate.toISOString().split("T")[0])
      )
    )
    .groupBy(expenses.category)
    .orderBy(sql`SUM(${expenses.amount}::numeric) DESC`);

  // Calculate total
  const totalExpenses = expensesByCategory.reduce(
    (sum, e) => sum + Number(e.total),
    0
  );

  // Recent expenses
  const recentExpenses = await db
    .select({
      id: expenses.id,
      category: expenses.category,
      description: expenses.description,
      amount: expenses.amount,
      date: expenses.expenseDate,
    })
    .from(expenses)
    .where(
      and(
        gte(expenses.expenseDate, startDate.toISOString().split("T")[0]),
        lte(expenses.expenseDate, endDate.toISOString().split("T")[0])
      )
    )
    .orderBy(sql`${expenses.expenseDate} DESC`)
    .limit(20);

  return {
    totalExpenses,
    expensesByCategory: expensesByCategory.map((e) => ({
      category: e.category,
      total: Number(e.total),
      percentage:
        totalExpenses > 0 ? (Number(e.total) / totalExpenses) * 100 : 0,
    })),
    recentExpenses: recentExpenses.map((e) => ({
      id: e.id,
      category: e.category,
      description: e.description,
      amount: Number(e.amount),
      date: e.date,
    })),
  };
}
