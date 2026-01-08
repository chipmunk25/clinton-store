import { db } from '@/db';
import { zones, chambers, shelves } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function getLocationsSummary() {
  // Get all zones with their chambers
  const zonesData = await db
    .select({
      id: zones.id,
      code: zones.code,
      name: zones.name,
      sortOrder: zones.sortOrder,
    })
    .from(zones)
    .where(eq(zones.isActive, true))
    .orderBy(zones.sortOrder);

  // Get chambers for each zone
  const chambersData = await db
    .select({
      id: chambers.id,
      zoneId: chambers.zoneId,
      chamberNumber: chambers.chamberNumber,
      name: chambers.name,
      shelfCount: sql<number>`(
        SELECT COUNT(*) FROM ${shelves}
        WHERE ${shelves.chamberId} = ${chambers.id}
        AND ${shelves.isActive} = true
      )::int`,
    })
    .from(chambers)
    .where(eq(chambers.isActive, true))
    .orderBy(chambers.chamberNumber);

  // Count totals
  const [zoneCounts] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(zones)
    .where(eq(zones.isActive, true));

  const [chamberCounts] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(chambers)
    .where(eq(chambers.isActive, true));

  const [shelfCounts] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(shelves)
    .where(eq(shelves.isActive, true));

  // Organize data
  const zonesWithChambers = zonesData.map((zone) => ({
    ...zone,
    chambers: chambersData.filter((c) => c.zoneId === zone.id),
  }));

  return {
    summary: {
      zones: zoneCounts?. count || 0,
      chambers: chamberCounts?.count || 0,
      shelves:  shelfCounts?.count || 0,
    },
    zones: zonesWithChambers,
  };
}