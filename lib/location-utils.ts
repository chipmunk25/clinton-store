import { db } from '@/db';
import { zones, chambers, shelves } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Generates location code like R-C01-S01
 */
export function generateLocationCode(
  zoneCode: string,
  chamberNumber: number,
  shelfNumber: number
): string {
  const chamber = String(chamberNumber).padStart(2, '0');
  const shelf = String(shelfNumber).padStart(2, '0');
  return `${zoneCode}-C${chamber}-S${shelf}`;
}

/**
 * Parses location code back to components
 */
export function parseLocationCode(locationCode: string): {
  zoneCode: string;
  chamberNumber: number;
  shelfNumber: number;
} | null {
  const match = locationCode.match(/^([RML])-C(\d{2})-S(\d{2})$/);
  if (!match) return null;

  return {
    zoneCode: match[1],
    chamberNumber: parseInt(match[2], 10),
    shelfNumber: parseInt(match[3], 10),
  };
}

/**
 * Get chamber position name from number
 */
export function getChamberPositionName(chamberNumber: number): string {
  const positions:  Record<number, string> = {
    1: 'Top',
    2: 'Upper',
    3: 'Middle',
    4: 'Lower',
    5: 'Bottom',
  };
  return positions[chamberNumber] || `Position ${chamberNumber}`;
}

/**
 * Get all locations as flat list for dropdowns
 */
export async function getAllLocations() {
  const result = await db
    .select({
      shelfId: shelves.id,
      zoneCode: zones.code,
      zoneName: zones.name,
      chamberNumber: chambers.chamberNumber,
      chamberName: chambers.name,
      shelfNumber: shelves.shelfNumber,
    })
    .from(shelves)
    .innerJoin(chambers, eq(shelves.chamberId, chambers.id))
    .innerJoin(zones, eq(chambers.zoneId, zones. id))
    .orderBy(zones.sortOrder, chambers.chamberNumber, shelves.shelfNumber);

  return result.map((row) => ({
    id: row.shelfId,
    code: generateLocationCode(row.zoneCode, row.chamberNumber, row.shelfNumber),
    label: `${row.zoneName} → ${row.chamberName} → Shelf ${row.shelfNumber}`,
    zoneCode: row.zoneCode,
    chamberNumber: row.chamberNumber,
    shelfNumber: row.shelfNumber,
  }));
}