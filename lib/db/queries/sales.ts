import { db } from '@/db';
import { sales, products, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export interface SaleRecord {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  quantity:  number;
  unitPrice: string;
  totalAmount: string;
  saleDate: Date;
  recordedBy: string;
  recordedByName: string;
  notes:  string | null;
}

export async function getSalesHistory(limit = 50): Promise<SaleRecord[]> {
  const result = await db
    .select({
      id: sales.id,
      productId: sales.productId,
      productCode: products.productId,
      productName: products. name,
      quantity: sales. quantity,
      unitPrice: sales.unitPrice,
      totalAmount: sales.totalAmount,
      saleDate: sales.saleDate,
      recordedBy:  sales.recordedBy,
      recordedByName: users.name,
      notes: sales.notes,
    })
    .from(sales)
    .innerJoin(products, eq(sales.productId, products.id))
    .innerJoin(users, eq(sales.recordedBy, users.id))
    .orderBy(desc(sales.saleDate))
    .limit(limit);

  return result;
}