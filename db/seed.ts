import { db } from '@/db';
import {
  zones,
  chambers,
  shelves,
  categories,
  products,
  users,
  stockLevels,
} from '@/db/schema';
import { hashPassword } from '@/lib/auth/password';

export async function seed() {
  console.log('🌱 Starting seed.. .');

  // 1. Create Users
  console.log('Creating users...');
  const adminPasswordHash = await hashPassword('admin123');
  const salesPasswordHash = await hashPassword('sales123');

  const [adminUser, salesUser] = await db
    .insert(users)
    .values([
      {
        email: 'admin@clintonstore.com',
        passwordHash: adminPasswordHash,
        name: 'Admin User',
        role: 'admin',
        isActive: true,
      },
      {
        email:  'sales@clintonstore. com',
        passwordHash: salesPasswordHash,
        name: 'Sales Person',
        role: 'salesperson',
        isActive: true,
      },
    ])
    .returning();

  console.log('✅ Users created');

  // 2. Create Zones (Right, Middle, Left)
  console.log('Creating zones...');
  const [rightZone, middleZone, leftZone] = await db
    .insert(zones)
    .values([
      { code: 'R', name: 'Right Section', sortOrder: 1 },
      { code:  'M', name: 'Middle Section', sortOrder: 2 },
      { code: 'L', name: 'Left Section', sortOrder: 3 },
    ])
    .returning();

  console.log('✅ Zones created');

  // 3. Create Chambers (Top to Bottom naming)
  // Chamber positions: 1=Top, 2=Upper, 3=Middle, 4=Lower, 5=Bottom
  console.log('Creating chambers.. .');

  const chamberNames = ['Top', 'Upper', 'Middle', 'Lower', 'Bottom'];

  // Create chambers for each zone
  const allChambers = await db
    .insert(chambers)
    .values([
      // Right Zone Chambers (R-C01 to R-C05)
      ... chamberNames.map((name, index) => ({
        zoneId: rightZone.id,
        chamberNumber: index + 1,
        name:  `${name} Chamber`,
      })),
      // Middle Zone Chambers (M-C01 to M-C05)
      ...chamberNames.map((name, index) => ({
        zoneId: middleZone.id,
        chamberNumber: index + 1,
        name: `${name} Chamber`,
      })),
      // Left Zone Chambers (L-C01 to L-C05)
      ...chamberNames.map((name, index) => ({
        zoneId: leftZone.id,
        chamberNumber: index + 1,
        name: `${name} Chamber`,
      })),
    ])
    .returning();

  console.log('✅ Chambers created');

  // 4. Create Shelves (3 shelves per chamber)
  console.log('Creating shelves.. .');

  const shelfValues = allChambers.flatMap((chamber) =>
    [1, 2, 3]. map((shelfNumber) => ({
      chamberId: chamber.id,
      shelfNumber,
    }))
  );

  await db.insert(shelves).values(shelfValues);

  console.log('✅ Shelves created');

  // 5. Create Categories
  console.log('Creating categories.. .');
  const [beverages, snacks, dairy, bakery, household, personal, canned, frozen] =
    await db
      .insert(categories)
      .values([
        { name: 'Beverages', description: 'Drinks, juices, water, sodas' },
        { name:  'Snacks', description:  'Chips, biscuits, nuts, candies' },
        { name:  'Dairy', description: 'Milk, cheese, yogurt, butter' },
        { name: 'Bakery', description: 'Bread, pastries, cakes' },
        { name: 'Household', description: 'Cleaning supplies, detergents' },
        { name: 'Personal Care', description: 'Soap, shampoo, toothpaste' },
        { name: 'Canned Goods', description: 'Canned foods, preserved items' },
        { name:  'Frozen Foods', description:  'Ice cream, frozen meals' },
      ])
      .returning();

  console.log('✅ Categories created');

  // 6. Create Sample Products
  console.log('Creating products...');
  const sampleProducts = await db
    .insert(products)
    .values([
      // Beverages
      {
        productId: 'BEV-001',
        name: 'Coca Cola 500ml',
        categoryId: beverages.id,
        costPrice: '1.20',
        sellingPrice: '1.80',
        reorderLevel: 20,
      },
      {
        productId: 'BEV-002',
        name: 'Fanta Orange 500ml',
        categoryId: beverages.id,
        costPrice: '1.20',
        sellingPrice: '1.80',
        reorderLevel: 20,
      },
      {
        productId: 'BEV-003',
        name: 'Bottled Water 1L',
        categoryId: beverages.id,
        costPrice: '0.50',
        sellingPrice: '1.00',
        reorderLevel: 50,
      },
      {
        productId:  'BEV-004',
        name: 'Orange Juice 1L',
        categoryId: beverages.id,
        costPrice: '2.50',
        sellingPrice: '3.50',
        reorderLevel: 15,
      },

      // Snacks
      {
        productId: 'SNK-001',
        name:  'Lays Classic Chips',
        categoryId: snacks. id,
        costPrice: '1.50',
        sellingPrice: '2.50',
        reorderLevel: 15,
      },
      {
        productId: 'SNK-002',
        name: 'Oreo Cookies',
        categoryId: snacks.id,
        costPrice: '2.00',
        sellingPrice: '3.00',
        reorderLevel: 10,
      },
      {
        productId: 'SNK-003',
        name: 'Pringles Original',
        categoryId: snacks.id,
        costPrice: '2.20',
        sellingPrice: '3.50',
        reorderLevel: 12,
      },

      // Dairy
      {
        productId: 'DRY-001',
        name:  'Fresh Milk 1L',
        categoryId: dairy.id,
        costPrice: '1.80',
        sellingPrice: '2.50',
        expiryDate: '2026-01-20',
        reorderLevel: 25,
      },
      {
        productId: 'DRY-002',
        name:  'Cheddar Cheese 200g',
        categoryId: dairy.id,
        costPrice: '3.50',
        sellingPrice: '5.00',
        expiryDate: '2026-02-15',
        reorderLevel: 10,
      },
      {
        productId: 'DRY-003',
        name:  'Greek Yogurt 500g',
        categoryId: dairy.id,
        costPrice: '2.80',
        sellingPrice: '4.00',
        expiryDate: '2026-01-25',
        reorderLevel: 15,
      },

      // Bakery
      {
        productId: 'BKY-001',
        name: 'White Bread Loaf',
        categoryId:  bakery.id,
        costPrice: '1.20',
        sellingPrice: '2.00',
        expiryDate: '2026-01-12',
        reorderLevel: 20,
      },
      {
        productId: 'BKY-002',
        name:  'Croissant (Pack of 4)',
        categoryId: bakery.id,
        costPrice: '2.50',
        sellingPrice: '4.00',
        expiryDate: '2026-01-11',
        reorderLevel: 10,
      },

      // Household
      {
        productId: 'HSH-001',
        name: 'Dish Soap 500ml',
        categoryId:  household.id,
        costPrice: '1.80',
        sellingPrice: '2.80',
        reorderLevel: 15,
      },
      {
        productId: 'HSH-002',
        name: 'Laundry Detergent 1kg',
        categoryId: household.id,
        costPrice: '4.50',
        sellingPrice: '6.50',
        reorderLevel: 10,
      },
      {
        productId: 'HSH-003',
        name: 'Toilet Paper (6 rolls)',
        categoryId:  household.id,
        costPrice: '3.00',
        sellingPrice: '4.50',
        reorderLevel: 20,
      },

      // Personal Care
      {
        productId: 'PRC-001',
        name: 'Shampoo 400ml',
        categoryId: personal.id,
        costPrice: '3.50',
        sellingPrice: '5.50',
        reorderLevel: 10,
      },
      {
        productId: 'PRC-002',
        name: 'Toothpaste 100g',
        categoryId: personal.id,
        costPrice: '1.50',
        sellingPrice: '2.50',
        reorderLevel: 15,
      },
      {
        productId: 'PRC-003',
        name: 'Bar Soap (3 pack)',
        categoryId: personal. id,
        costPrice: '2.00',
        sellingPrice: '3.20',
        reorderLevel: 12,
      },

      // Canned Goods
      {
        productId: 'CAN-001',
        name:  'Baked Beans 400g',
        categoryId: canned.id,
        costPrice: '1.20',
        sellingPrice: '2.00',
        reorderLevel: 20,
      },
      {
        productId: 'CAN-002',
        name:  'Tuna in Oil 185g',
        categoryId: canned.id,
        costPrice: '2.00',
        sellingPrice: '3.20',
        reorderLevel: 15,
      },

      // Frozen Foods
      {
        productId: 'FRZ-001',
        name: 'Vanilla Ice Cream 1L',
        categoryId: frozen. id,
        costPrice: '3.50',
        sellingPrice: '5.50',
        reorderLevel: 10,
      },
      {
        productId: 'FRZ-002',
        name:  'Frozen Pizza',
        categoryId: frozen.id,
        costPrice: '4.00',
        sellingPrice: '6.50',
        reorderLevel: 8,
      },
    ])
    .returning();

  console.log('✅ Products created');

  // 7. Initialize Stock Levels (simulate some initial purchases)
  console.log('Initializing stock levels...');

  const initialStock = [
    { productId: 'BEV-001', quantity: 50 },
    { productId:  'BEV-002', quantity: 45 },
    { productId:  'BEV-003', quantity: 100 },
    { productId:  'BEV-004', quantity: 30 },
    { productId:  'SNK-001', quantity: 40 },
    { productId:  'SNK-002', quantity: 25 },
    { productId:  'SNK-003', quantity: 20 },
    { productId:  'DRY-001', quantity: 35 },
    { productId:  'DRY-002', quantity: 15 },
    { productId:  'DRY-003', quantity: 20 },
    { productId:  'BKY-001', quantity: 30 },
    { productId: 'BKY-002', quantity: 12 },
    { productId:  'HSH-001', quantity: 25 },
    { productId:  'HSH-002', quantity: 18 },
    { productId: 'HSH-003', quantity: 40 },
    { productId:  'PRC-001', quantity: 15 },
    { productId:  'PRC-002', quantity: 30 },
    { productId:  'PRC-003', quantity: 20 },
    { productId:  'CAN-001', quantity: 50 },
    { productId:  'CAN-002', quantity: 25 },
    { productId:  'FRZ-001', quantity: 8 },  // Low stock example
    { productId: 'FRZ-002', quantity:  5 },  // Low stock example
  ];

  // Create a map of productId to product UUID
  const productMap = new Map(
    sampleProducts.map((p) => [p.productId, p.id])
  );

  await db.insert(stockLevels).values(
    initialStock.map((stock) => ({
      productId: productMap.get(stock.productId)!,
      totalPurchased: stock.quantity,
      totalSold: 0,
      currentStock: stock.quantity,
      lastPurchaseDate: new Date(),
    }))
  );

  console.log('✅ Stock levels initialized');

  // 8. Summary
  console.log('\n🎉 Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - Users: 2 (admin, salesperson)`);
  console.log(`   - Zones: 3 (Right, Middle, Left)`);
  console.log(`   - Chambers: 15 (5 per zone:  Top → Bottom)`);
  console.log(`   - Shelves: 45 (3 per chamber)`);
  console.log(`   - Categories: 8`);
  console.log(`   - Products: ${sampleProducts.length}`);
  console.log('\n🔐 Login Credentials:');
  console.log('   Admin:        admin@clintonstore.com / admin123');
  console.log('   Salesperson: sales@clintonstore.com / sales123');
  console.log('\n📍 Location Code Format:  [Zone]-C[Chamber]-S[Shelf]');
  console.log('   Example: R-C01-S01 = Right Zone, Top Chamber, Shelf 1');
  console.log('   Example: M-C03-S02 = Middle Zone, Middle Chamber, Shelf 2');
  console.log('   Example: L-C05-S03 = Left Zone, Bottom Chamber, Shelf 3');
}

// Run seed
seed()
  .then(() => {
    console.log('\n✅ Done! ');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });