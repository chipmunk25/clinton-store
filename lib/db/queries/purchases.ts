import { db } from '@/db';
import { purchases, products, users, shelves, chambers, zones } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export interface PurchaseRecord {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitCost: string;
  totalCost: string;
  purchaseDate: Date;
  locationCode: string;
  recordedBy: string;
  recordedByName: string;
  notes: string | null;
}

export async function getPurchaseHistory(limit = 50): Promise<PurchaseRecord[]> {
  const result = await db
    .select({
      id: purchases.id,
      productId: purchases. productId,
      productCode:  products.productId,
      productName: products.name,
      quantity: purchases.quantity,
      unitCost: purchases.unitCost,
      totalCost:  purchases.totalCost,
      purchaseDate: purchases.purchaseDate,
      shelfId: purchases.shelfId,
      zoneCode: zones.code,
      chamberNumber: chambers.chamberNumber,
      shelfNumber: shelves.shelfNumber,
      recordedBy: purchases.recordedBy,
      recordedByName: users.name,
      notes: purchases.notes,
    })
    .from(purchases)
    .innerJoin(products, eq(purchases.productId, products.id))
    .innerJoin(users, eq(purchases.recordedBy, users.id))
    .innerJoin(shelves, eq(purchases.shelfId, shelves. id))
    .innerJoin(chambers, eq(shelves. chamberId, chambers.id))
    .innerJoin(zones, eq(chambers.zoneId, zones.id))
    .orderBy(desc(purchases.purchaseDate))
    .limit(limit);

  return result.map((r) => {
    const chamberPadded = String(r.chamberNumber).padStart(2, '0');
    const shelfPadded = String(r.shelfNumber).padStart(2, '0');
    
    return {
      id: r.id,
      productId: r.productId,
      productCode: r.productCode,
      productName: r. productName,
      quantity: r.quantity,
      unitCost: r.unitCost,
      totalCost: r.totalCost,
      purchaseDate: r.purchaseDate,
      locationCode: `${r.zoneCode}-C${chamberPadded}-S${shelfPadded}`,
      recordedBy: r. recordedBy,
      recordedByName: r.recordedByName,
      notes: r. notes,
    };
  });
}