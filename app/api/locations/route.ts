import { NextResponse } from 'next/server';
import { db } from '@/db';
import { zones, chambers, shelves } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const result = await db
      .select({
        shelfId: shelves.id,
        shelfNumber: shelves.shelfNumber,
        chamberNumber: chambers.chamberNumber,
        chamberName: chambers.name,
        zoneCode: zones.code,
        zoneName: zones.name,
        zoneSortOrder: zones.sortOrder,
      })
      .from(shelves)
      .innerJoin(chambers, eq(shelves.chamberId, chambers.id))
      .innerJoin(zones, eq(chambers.zoneId, zones.id))
      .where(eq(shelves.isActive, true))
      .orderBy(zones.sortOrder, chambers.chamberNumber, shelves.shelfNumber);

    const locations = result.map((row) => {
      const chamberPadded = String(row.chamberNumber).padStart(2, '0');
      const shelfPadded = String(row.shelfNumber).padStart(2, '0');
      
      return {
        id: row.shelfId,
        code: `${row.zoneCode}-C${chamberPadded}-S${shelfPadded}`,
        label: `${row.zoneName} → ${row.chamberName} → Shelf ${row.shelfNumber}`,
      };
    });

    return NextResponse.json({ locations });
  } catch (error) {
    console.error('Get locations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status:  500 }
    );
  }
}