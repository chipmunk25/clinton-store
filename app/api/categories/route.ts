import { NextResponse } from 'next/server';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const result = await db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
      })
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(categories. name);

    return NextResponse. json({ categories: result });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status:  500 }
    );
  }
}