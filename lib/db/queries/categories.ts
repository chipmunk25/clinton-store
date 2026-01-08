import { db } from '@/db';
import { categories, products } from '@/db/schema';
import { eq, sql, desc } from 'drizzle-orm';

export async function getAllCategories() {
  const result = await db
    .select({
      id: categories.id,
      name: categories.name,
      description: categories.description,
      isActive: categories.isActive,
      productCount: sql<number>`(
        SELECT COUNT(*) FROM ${products} 
        WHERE ${products.categoryId} = ${categories.id} 
        AND ${products.isActive} = true
      )::int`,
    })
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(categories.name);

  return result;
}