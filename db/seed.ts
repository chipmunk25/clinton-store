import "dotenv/config";

import { db } from "@/db";
import {
  zones,
  chambers,
  shelves,
  categories,
  products,
  users,
  stockLevels,
  settings,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth/password";

export async function seed() {
  console.log("🌱 Starting database seed...");

  /* ===================================================
   * 1. USERS
   * =================================================== */
  console.log("👤 Creating users...");

  await db.insert(users).values([
    {
      email: "desdhi24@gmail.com",
      passwordHash: await hashPassword("Pass123$1"),
      name: "Admin User",
      role: "admin",
      isActive: true,
    },
    {
      email: "clintonadusei023@icloud.com",
      passwordHash: await hashPassword("Pass123$1"),
      name: "Admin User",
      role: "admin",
      isActive: true,
    },
    {
      email: "sales@clintonstore.com",
      passwordHash: await hashPassword("sales123"),
      name: "Sales Person",
      role: "salesperson",
      isActive: true,
    },
  ]);

  console.log("✅ Users created");

  /* ===================================================
   * 2. ZONES
   * =================================================== */
  console.log("📍 Creating zones...");

  const [rightZone, middleZone, leftZone] = await db
    .insert(zones)
    .values([
      { code: "R", name: "Right Section", sortOrder: 1 },
      { code: "M", name: "Middle Section", sortOrder: 2 },
      { code: "L", name: "Left Section", sortOrder: 3 },
    ])
    .returning();

  console.log("✅ Zones created");

  /* ===================================================
   * 3. CHAMBERS (7 PER ZONE)
   * =================================================== */
  console.log("🗄️ Creating chambers...");

  const chamberPositions = [
    "Top",
    "Upper-1",
    "Upper-2",
    "Middle",
    "Lower-1",
    "Lower-2",
    "Bottom",
  ];

  const allChambers = await db
    .insert(chambers)
    .values(
      [rightZone, middleZone, leftZone].flatMap((zone) =>
        chamberPositions.map((position, index) => ({
          zoneId: zone.id,
          chamberNumber: index + 1, // 1 → 7
          name: `${position} Chamber`,
        }))
      )
    )
    .returning();

  console.log("✅ Chambers created");

  /* ===================================================
   * 4. SHELVES (3 PER CHAMBER)
   * =================================================== */
  console.log("📦 Creating shelves...");

  await db.insert(shelves).values(
    allChambers.flatMap((chamber) =>
      [1, 2, 3].map((shelfNumber) => ({
        chamberId: chamber.id,
        shelfNumber,
      }))
    )
  );

  console.log("✅ Shelves created");

  /* ===================================================
   * 5. CATEGORIES (COSMETICS)
   * =================================================== */
  console.log("🧴 Creating categories...");

  const [
    skincare,
    makeup,
    hairCare,
    fragrances,
    bodyCare,
    nailCare,
    beautyTools,
    mensGrooming,
  ] = await db
    .insert(categories)
    .values([
      { name: "Skincare", description: "Cleansers, moisturizers, serums" },
      { name: "Makeup", description: "Foundation, lipstick, mascara" },
      { name: "Hair Care", description: "Shampoo, conditioner, treatments" },
      { name: "Fragrances", description: "Perfumes, body sprays, colognes" },
      { name: "Body Care", description: "Lotions, scrubs, shower gels" },
      { name: "Nail Care", description: "Polish, removers, treatments" },
      { name: "Beauty Tools", description: "Brushes, sponges, applicators" },
      { name: "Men’s Grooming", description: "Beard, shaving, aftershave" },
    ])
    .returning();

  console.log("✅ Categories created");

  /* ===================================================
   * 6. PRODUCTS
   * =================================================== */
  console.log("🛍️ Creating products...");

  const sampleProducts = await db
    .insert(products)
    .values([
      {
        productId: "SKN-001",
        name: "Vitamin C Serum",
        categoryId: skincare.id,
        costPrice: "12.00",
        sellingPrice: "18.00",
        reorderLevel: 15,
      },
      {
        productId: "SKN-002",
        name: "Facial Cleanser",
        categoryId: skincare.id,
        costPrice: "8.00",
        sellingPrice: "13.00",
        reorderLevel: 20,
      },

      {
        productId: "MUP-001",
        name: "Liquid Foundation",
        categoryId: makeup.id,
        costPrice: "15.00",
        sellingPrice: "22.00",
        reorderLevel: 10,
      },
      {
        productId: "MUP-002",
        name: "Matte Lipstick",
        categoryId: makeup.id,
        costPrice: "6.00",
        sellingPrice: "10.00",
        reorderLevel: 25,
      },

      {
        productId: "HRC-001",
        name: "Moisturizing Shampoo",
        categoryId: hairCare.id,
        costPrice: "9.00",
        sellingPrice: "14.00",
        reorderLevel: 18,
      },

      {
        productId: "FRG-001",
        name: "Eau de Parfum 50ml",
        categoryId: fragrances.id,
        costPrice: "25.00",
        sellingPrice: "40.00",
        reorderLevel: 8,
      },

      {
        productId: "BDC-001",
        name: "Shea Body Butter",
        categoryId: bodyCare.id,
        costPrice: "7.00",
        sellingPrice: "12.00",
        reorderLevel: 20,
      },

      {
        productId: "NAL-001",
        name: "Nail Polish Set",
        categoryId: nailCare.id,
        costPrice: "10.00",
        sellingPrice: "16.00",
        reorderLevel: 12,
      },

      {
        productId: "BTL-001",
        name: "Makeup Brush Kit",
        categoryId: beautyTools.id,
        costPrice: "14.00",
        sellingPrice: "22.00",
        reorderLevel: 10,
      },

      {
        productId: "MEN-001",
        name: "Beard Oil",
        categoryId: mensGrooming.id,
        costPrice: "6.50",
        sellingPrice: "11.00",
        reorderLevel: 15,
      },
    ])
    .returning();

  console.log("✅ Products created");

  /* ===================================================
   * 7. STOCK LEVELS
   * =================================================== */
  console.log("📊 Initializing stock levels...");

  const productMap = new Map(sampleProducts.map((p) => [p.productId, p.id]));

  const initialStock = [
    { productId: "SKN-001", quantity: 30 },
    { productId: "SKN-002", quantity: 40 },
    { productId: "MUP-001", quantity: 15 },
    { productId: "MUP-002", quantity: 50 },
    { productId: "HRC-001", quantity: 25 },
    { productId: "FRG-001", quantity: 8 }, // low stock
    { productId: "BDC-001", quantity: 35 },
    { productId: "NAL-001", quantity: 20 },
    { productId: "BTL-001", quantity: 10 },
    { productId: "MEN-001", quantity: 12 },
  ];

  await db.insert(stockLevels).values(
    initialStock
      .map((stock) => {
        const productUUID = productMap.get(stock.productId);
        if (!productUUID) return null;

        return {
          productId: productUUID,
          totalPurchased: stock.quantity,
          totalSold: 0,
          currentStock: stock.quantity,
          lastPurchaseDate: new Date(),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
  );

  console.log("✅ Stock levels initialized");

  // 9. Create Default Settings
  console.log("Creating default settings...");
  // In your seed. ts, update the settings section:

  // 9. Create Default Settings
  console.log("Creating default settings...");
  await db
    .insert(settings)
    .values([
      { key: "store_name", value: "Clinton Store" },
      { key: "store_currency", value: "GHS" }, // Ghana Cedis
      { key: "low_stock_alert_enabled", value: "true" },
      { key: "low_stock_check_interval", value: "24" },
      { key: "expiry_alert_days", value: "7" },
    ])
    .onConflictDoNothing();

  console.log("✅ Default settings created");

  console.log("✅ Default settings created");

  /* ===================================================
   * 8. SUMMARY
   * =================================================== */
  console.log("\n🎉 Seed completed successfully!");
  console.log("📊 Zones: 3 | Chambers: 21 | Shelves: 63");
  console.log("🧴 Categories: 8 | Products:", sampleProducts.length);
  console.log("🔐 Admin: admin@clintonstore.com / admin123");
  console.log("🔐 Sales: sales@clintonstore.com / sales123");
}

/* ===================================================
 * RUN SEED
 * =================================================== */
seed()
  .then(() => {
    console.log("\n✅ Done!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
